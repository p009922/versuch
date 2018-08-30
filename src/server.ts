// Mock-Server ....

import { Request, Response } from 'express';
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const config = require('./configurations/config');

// config parameter:
const PORT = process.env.PORT; // || config.port  || 443;
let SECURIRTY_AUTH = config.auth || process.env.auth || true;
// As stated in Azure docs there are two opened ports for web apps: 80 and 443. By default Azure will set a port to environment variable process.env.PORT, 

const app = express();
app.use(express.static('public'));  // for static html sites

import { AddressInfo } from 'net';

import { loadData } from './csv-loader';
let data = loadData('data/');

// set secret
app.set('Secret', config.secret);

// cors
app.use(cors({ credentials: true, origin: 'http://localhost:8080' }));

// use morgan to log requests to the console
app.use(morgan('dev'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json());

const ProtectedRoutes = express.Router();
app.use('/api', ProtectedRoutes);
// app.use(express.static(path.join(__dirname)));

// the following is just for testing purposes:
/**
 * init = reset data of testing...
 * init?false =  reeset data of testing and switch off security
 *
 * @section test
 * @type post
 * @url /test/init
 */
app.post('/test/init', (req: Request, res: Response) => {
    console.info("resetting all testing data...");
    // setting defaults:
    console.info("auth is set to " + req.query.auth);
    if (req.query.auth === false) {
        console.info("Switch off security...");
        SECURIRTY_AUTH = false;
    }
    data = loadData('data/');
    const response = {
        status: "ok",
        security_auth: SECURIRTY_AUTH,
        test_data_reloaded: true
    };
    res.status(200).json(response);
});

// TODO :
// maintenance REST-API:
//    - reset data
//    - security on/off (vai WITHOUT_TOKEN)
ProtectedRoutes.use((req: Request, res: Response, next: any) => {

    if (!SECURIRTY_AUTH) {
        console.info("security auth switched off for testing-purposes (change by re-initialization)");
        return next();
    }

    // check header or url parameters or post parameters for token
    const token = req.headers['access-token'];

    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, app.get('Secret'), (err: any, decoded: any) => {
            if (err) {
                console.error("error verifying token: ", err);
                return res.status(401).json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                // TODO: ...
                // if (decoded.exp <= Date.now()) {
                //    res.status(400).json({ success: false, message: 'Access token has expired.' });
                // }

                // if everything is good, save to request for use in other routes
                // req.decoded = decoded;
                next();
            }
        });

    } else {
        // if there is no token
        // return an error
        return res.status(403).send({
            message: 'No token provided.'
        });
    }
});

/**
 * request to authenticate with test-users...
 *
 * - any test-user will be accepted, if mail format, but the password needs to be "123"
 * - if password is NOT "123" access will be defined
 *
 * @section authentication
 * @type post
 * @url /authenticate
 */
app.post('/authenticate', (req: Request, res: Response) => {
    console.info("login username: ", req.body.username);
    console.info("login password: ", req.body.password);
    if ((req.body.username as string).includes("@")) {
        if (req.body.password === "123") {
            // if eveything is okey let's create our token
            const payload = {
                check: true
            };
            const token = jwt.sign(payload, app.get('Secret'), {
                expiresIn: 1440 // expires in 24 hours
            });
            console.info("new token (expiring in 24 hours: ", token);
            // return the informations to the client
            const response = {
                access_token: token,
                token_type: "bearer",
                expires_in: 1440,
                refresh_token: token,
                scope: "adverts-write read"
            };
            res.status(200).json(response);
            // console.info("Result Body", res.get);
        } else {  // wrong password:
            console.info("login failed, because password was not 123: ", req.body.password);
            res.status(401).json({ message: "Authentication failed. Wrong password (test=123)." });
        }
    } else {  // wrong username:
        console.info("login failed, because uername is not an email: ", req.body.username);
        res.status(401).json({ message: "Authentication faild. Wrong username (use email format)." });
    }
});

/**
 * Gets the status of the server and authentication
 * Use this to check also the authentication status
 *
 * @section authentication
 * @type get
 * @url /api/authenticationstatus
 */
ProtectedRoutes.get('/status', (req: Request, res: Response) => {
    const response = {
        status: "ok",
        security_auth: SECURIRTY_AUTH
    };
    res.status(200).json(response);
});

/**
 * request to logout (invalidate JWT token)...
 *
 * @section authentication
 * @type post
 * @url /logout
 */
app.post('/logout', (req: Request, res: Response) => {
    // check header or url parameters or post parameters for token
    const token = req.headers['access-token'];

    // decode token
    if (token) {
        console.info("invalidating token: ", token);
        // TODO:  jwt.refresh_token();  // TODO invalided token
    } else {
        // if there is no token
        // return an error
        return res.status(403).send({
            message: 'Token not passed to invalidate.'
        });
    }
});

/**
 * Get a list of all approval-workflow items
 *
 * secured (put a valid 'access-token' in your Headers request section)
 *
 * @section approvals
 * @type get
 * @url /api/approvals
 */
ProtectedRoutes.get('/approvals', (req: Request, res: Response) => {
    res.json(data.workflows);
});

/**
 * Get details for a certain approval-workflow item
 * Identification done via the 'id' (which is the unique reference-id of the specific approval).
 *
 * secured (put a valid 'access-token' in your Headers request section)
 *
 * @section approvals
 * @type get
 * @url /api/approvals/:id
 * @param {string} id a description ( required da kein Gleichheitszeichen {string=}
 *
 */
ProtectedRoutes.get('/approvals/:id', (req: Request, res: Response) => {
    for (const item of data.workflowsdetails) {
        if (item.id === req.params.id) {
            res.json(item);
            return;
        }
    }
    console.info("request of id not found:", req.params.id);
    res.status(404).json({ message: "No such data found with this id." });
    // res.json(data.workflowsdetails[req.params.id]);
});

/**
 * Approve a certain approval-workflow item
 * Identification done via the 'id' (which is the unique reference-id of the specific approval).
 *
 * secured (put a valid 'access-token' in your Headers request section)
 *
 * @section approvals
 * @type post
 * @url /api/approvals/:id/approve
 * @param {string} id a description ( required da kein Gleichheitszeichen {string=}
 *
 */
ProtectedRoutes.post('/approvals/:id/approve', (req: Request, res: Response) => {
    for (const item of data.workflows) {
        if (item.id === req.params.id) {
            console.info("request of id changed to status approved:", item);
            item.status = "APPROVED";
        }
    }
    for (const item of data.workflowsdetails) {
        if (item.id === req.params.id) {
            console.info("request of id changed to status approved:", item);
            item.status = "APPROVED";
            res.json(item);
            return;
        }
    }
    console.info("request of id not found:", req.params.id);
    res.status(404).json({ message: "No such data found with this id." });
});

/**
 * Reject a certain approval-workflow item
 * Identification done via the 'id' (which is the unique reference-id of the specific approval).
 *
 * secured (put a valid 'access-token' in your Headers request section)
 *
 * @section approvals
 * @type post
 * @url /api/approvals/:id/reject
 * @param {string} id a description ( required da kein Gleichheitszeichen {string=}
 *
 */
ProtectedRoutes.post('/approvals/:id/reject', (req: Request, res: Response) => {
    for (const item of data.workflows) {
        if (item.id === req.params.id) {
            console.info("request of id changed to status rejected:", item);
            item.status = "REJECTED";
        }
    }
    for (const item of data.workflowsdetails) {
        if (item.id === req.params.id) {
            console.info("request of id changed to status rejected:", item);
            item.status = "REJECTED";
            res.json(item);
            return;
        }
    }
    console.info("request of id not found:", req.params.id);
    res.status(404).json({ message: "No such data found with this id." });
});

// SERVER:  starting...
const server = app.listen(PORT, () => {
    console.log("Security switched on/off - status: ", SECURIRTY_AUTH);
    console.log("Server started on port", (server.address() as AddressInfo).port);
});

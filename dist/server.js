"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const config = require('./configurations/config');
const PORT = config.port || process.env.port || 3000;
let SECURIRTY_AUTH = config.auth || process.env.auth || true;
const app = express();
app.use(express.static('public'));
const csv_loader_1 = require("./csv-loader");
let data = csv_loader_1.loadData('data/');
app.set('Secret', config.secret);
app.use(cors({ credentials: true, origin: 'http://localhost:8080' }));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const ProtectedRoutes = express.Router();
app.use('/api', ProtectedRoutes);
app.post('/test/init', (req, res) => {
    console.info("resetting all testing data...");
    console.info("auth is set to " + req.query.auth);
    if (req.query.auth === false) {
        console.info("Switch off security...");
        SECURIRTY_AUTH = false;
    }
    data = csv_loader_1.loadData('data/');
    const response = {
        status: "ok",
        security_auth: SECURIRTY_AUTH,
        test_data_reloaded: true
    };
    res.status(200).json(response);
});
ProtectedRoutes.use((req, res, next) => {
    if (!SECURIRTY_AUTH) {
        console.info("security auth switched off for testing-purposes (change by re-initialization)");
        return next();
    }
    const token = req.headers['access-token'];
    if (token) {
        jwt.verify(token, app.get('Secret'), (err, decoded) => {
            if (err) {
                console.error("error verifying token: ", err);
                return res.status(401).json({ success: false, message: 'Failed to authenticate token.' });
            }
            else {
                next();
            }
        });
    }
    else {
        return res.status(403).send({
            message: 'No token provided.'
        });
    }
});
app.post('/authenticate', (req, res) => {
    console.info("login username: ", req.body.username);
    console.info("login password: ", req.body.password);
    if (req.body.username.includes("@")) {
        if (req.body.password === "123") {
            const payload = {
                check: true
            };
            const token = jwt.sign(payload, app.get('Secret'), {
                expiresIn: 1440
            });
            console.info("new token (expiring in 24 hours: ", token);
            const response = {
                access_token: token,
                token_type: "bearer",
                expires_in: 1440,
                refresh_token: token,
                scope: "adverts-write read"
            };
            res.status(200).json(response);
        }
        else {
            console.info("login failed, because password was not 123: ", req.body.password);
            res.status(401).json({ message: "Authentication failed. Wrong password (test=123)." });
        }
    }
    else {
        console.info("login failed, because uername is not an email: ", req.body.username);
        res.status(401).json({ message: "Authentication faild. Wrong username (use email format)." });
    }
});
ProtectedRoutes.get('/status', (req, res) => {
    const response = {
        status: "ok",
        security_auth: SECURIRTY_AUTH
    };
    res.status(200).json(response);
});
app.post('/logout', (req, res) => {
    const token = req.headers['access-token'];
    if (token) {
        console.info("invalidating token: ", token);
    }
    else {
        return res.status(403).send({
            message: 'Token not passed to invalidate.'
        });
    }
});
ProtectedRoutes.get('/approvals', (req, res) => {
    res.json(data.workflows);
});
ProtectedRoutes.get('/approvals/:id', (req, res) => {
    for (const item of data.workflowsdetails) {
        if (item.id === req.params.id) {
            res.json(item);
            return;
        }
    }
    console.info("request of id not found:", req.params.id);
    res.status(404).json({ message: "No such data found with this id." });
});
ProtectedRoutes.post('/approvals/:id/approve', (req, res) => {
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
ProtectedRoutes.post('/approvals/:id/reject', (req, res) => {
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
const server = app.listen(PORT, () => {
    console.log("Security switched on/off - status: ", SECURIRTY_AUTH);
    console.log("Server started on port", server.address().port);
});
//# sourceMappingURL=server.js.map
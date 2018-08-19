/**
 * Mock-Server ....
 * @section README !
 */

import * as express from 'express';
import { AddressInfo } from 'net';

import { loadData } from './csv-loader';
const path = require('path');

const app = express();
const data = loadData('data/');

app.use((req, res, next) => {
    if (req.method !== "OPTIONS") {
        console.info("Incoming request", req.method + ' ' + req.url);
    }
    res.setHeader('Access-Control-Allow-Origin', 'http://0.0.0.0:8080');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', "true");
    next();
});

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
});

/**
 * Login process via user and password
 * Returns a session-token to use...
 * +
 * @section security
 * @type post
 * @url /authenticate/:user
 * @param {string} login a description ( required da kein Gleichheitszeichen {string=}
 * @param {string} password a description ( required da kein Gleichheitszeichen {string=}
 *
 */
app.post('/authenticate/:user', (req, res) => {
    console.log("No implemented !");
});

/**
 * Get a list of all approval-workflow items
 *
 * @section approvals
 * @type get
 * @url /approvals
 */
app.get('/approvals', (req, res) => {
    res.json(data.workflows);
});

/**
 * Get details for a certain approval-workflow item
 * Identification done via the 'id' (which is currently only a number 1,2,3...)
 *
 * @section approvals
 * @type get
 * @url /approvals/:id
 * @param {string} id a description ( required da kein Gleichheitszeichen {string=}
 *
 */
app.get('/approvals/:id', (req, res) => {
    res.json(data.workflowsdetails[req.params.id]);
});

/**
 * Approve a certain approval-workflow item
 * Identification done via the 'id' (which is currently only a number 1,2,3...)
 *
 * @section approvals
 * @type post
 * @url /approvals/:id/approve
 * @param {string} id a description ( required da kein Gleichheitszeichen {string=}
 *
 */
app.post('/approvals/:id/approve', (req, res) => {
    console.log("No implemented !");
});

/**
 * Reject a certain approval-workflow item
 * Identification done via the 'id' (which is currently only a number 1,2,3...)
 *
 * @section approvals
 * @type post
 * @url /approvals/:id/reject
 * @param {string} id a description ( required da kein Gleichheitszeichen {string=}
 *
 */
app.post('/approvals/:id/reject', (req, res) => {
    console.log("No implemented !");
});

/**
 * Return a certain approval-workflow item
 * Identification done via the 'id' (which is currently only a number 1,2,3...)
 *
 * @section approvals
 * @type post
 * @url /approvals/:id/return
 * @param {string} id a description ( required da kein Gleichheitszeichen {string=}
 *
 */
app.post('/approvals/:id/return', (req, res) => {
    console.log("No implemented !");
});

const server = app.listen(8081, () => {
    console.log("Server started on port", (server.address() as AddressInfo).port);
});

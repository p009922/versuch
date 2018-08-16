"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const csv_loader_1 = require("./csv-loader");
const path = require('path');
const app = express();
const data = csv_loader_1.loadData('data/');
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
app.post('/authenticate/:user', (req, res) => {
    console.log("No implemented !");
});
app.get('/approvals', (req, res) => {
    res.json(data.workflows);
});
app.get('/approvals/:id', (req, res) => {
    res.json(data.workflowsdetails[req.params.id]);
});
app.post('/approvals/:id/approve', (req, res) => {
    console.log("No implemented !");
});
app.post('/approvals/:id/reject', (req, res) => {
    console.log("No implemented !");
});
app.post('/approvals/:id/return', (req, res) => {
    console.log("No implemented !");
});
const server = app.listen(8081, () => {
    console.log("Server started on port", server.address().port);
});
//# sourceMappingURL=server.js.map
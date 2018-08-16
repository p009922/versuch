"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
function loadData(path) {
    return toJson();
}
exports.loadData = loadData;
function readSheet(path) {
    const csv = fs.readFileSync(path).toString();
    const rows = csv.match(/[^\r\n]+/g);
    const sheet = rows.map(row => row.split(';'));
    sheet.shift();
    return sheet;
}
function toJson() {
    const workflows = getWorkflows(readSheet('data/workflows.csv'));
    const workflowsdetails = getWorkflowsDetails(readSheet('data/workflowsdetails.csv'));
    return {
        workflows,
        workflowsdetails
    };
}
function getWorkflows(sheet) {
    return Object.values(arrayToObject(sheet, row => ({
        [row[0]]: {
            id: row[0],
            type: row[1],
            title: row[2],
            status: row[3],
            timestamp: toEpochInSeconds(row[4])
        }
    })));
}
function getWorkflowsDetails(sheet) {
    return Object.values(arrayToObject(sheet, row => ({
        [row[0]]: {
            id: row[0],
            type: row[1],
            title: row[2],
            status: row[3],
            timestamp: toEpochInSeconds(row[4]),
            description: row[5],
            url1: row[6],
            url2: row[7]
        }
    })));
}
function toEpochInSeconds(dateStr) {
    const groups = dateStr.match(/^([0-3][0-9])\.([0-1][0-9])\.([0-9]{4}) ([0-2][0-9]):([0-5][0-9])$/);
    if (groups === null) {
        throw new Error(`Expected date format 'DD.MM.YYYY hh:mm:ss' but found ${dateStr}`);
    }
    const [day, month, year, hours, minutes] = groups.slice(1, 6).map(str => Number.parseInt(str));
    const epochInMillis = new Date(year, month - 1, day, hours, minutes).getTime();
    return Math.floor(epochInMillis / 1000);
}
function arrayToObject(array, mapper) {
    return array.reduce((result, element) => Object.assign(result, mapper(element)), {});
}
//# sourceMappingURL=csv-loader.js.map
import * as fs from 'fs';

export interface IWorkflow {
    id: string;
    type: string;
    title: string;
    status: string;
    timestamp: string; // number;
}

export interface IWorkflowDetails extends IWorkflow {
    description: string;
    url1: string;
    url2: string;
}

interface IAppData {
    workflows: IWorkflow[];
    workflowsdetails: IWorkflowDetails[];
}

export function loadData(path: string): IAppData {
    return toJson();
}

function readSheet(path: string): string[][] {
    const csv = (fs.readFileSync(path) as Buffer).toString();
    const rows = csv.match(/[^\r\n]+/g);
    const sheet = rows.map(row => row.split(';'));
    sheet.shift();
    return sheet;
}

function toJson(): IAppData {

    const workflows = getWorkflows(readSheet('data/workflows.csv'));
    const workflowsdetails = getWorkflowsDetails(readSheet('data/workflowsdetails.csv'));

    return {
        workflows,
        workflowsdetails
    };
}

function getWorkflows(sheet: string[][]): IWorkflow[] {
    return Object.values(arrayToObject(sheet, row => ({
        // console.log(row);
        [row[0]]: {
            id: row[0],
            type: row[1],
            title: row[2],
            status: row[3],
            timestamp: toEpochInSeconds(row[4])
        }
    })));
}

function getWorkflowsDetails(sheet: string[][]): IWorkflowDetails[] {
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

function toEpochInSeconds(dateStr: string): number {
    const groups = dateStr.match(/^([0-3][0-9])\.([0-1][0-9])\.([0-9]{4}) ([0-2][0-9]):([0-5][0-9])$/);
    if (groups === null) {
        throw new Error(`Expected date format 'DD.MM.YYYY hh:mm:ss' but found ${dateStr}`);
    }
    const [day, month, year, hours, minutes] = groups.slice(1, 6).map(str => Number.parseInt(str));
    const epochInMillis = new Date(year, month - 1, day, hours, minutes).getTime();
    return Math.floor(epochInMillis / 1000);
}

function arrayToObject<T, U>(array: T[], mapper: (t: T) => {}): { [key: string]: U } {
    return array.reduce((result, element) => Object.assign(result, mapper(element)), {});
}
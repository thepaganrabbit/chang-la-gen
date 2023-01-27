import fs from 'fs';
import moment from 'moment';
import prompt from 'prompt';
import path from 'path';


export interface ChangesLog {
    type: string;
    message: string;
}

export interface GeneratedLog {
    date_logged: string;
    project: string;
    handle: string;
    ticket: string | number;
    changes: ChangesLog | ChangesLog[];
}

export interface LogGenInterface {
    getSettings: () => Promise<void>;
    createJSONFile: () => Promise<void | Error>;
    createMDFile: () => Promise<void | Error>;
    checkIfJsonFilesExists: () => Promise<boolean | Error>;
    checkIfMdFileExists: () => Promise<boolean | Error>;
    init: () => Promise<void>;
    beforeCheck: () => Promise<void | Error>;
    getCurrentLogs: () => Promise<Array<GeneratedLog> | Error>;
    getTicketNumber: () => Promise<string | number | Error>;
    getChanges: () => Promise<ChangesLog[] | ChangesLog | Error>;
}

export interface ChanlagenSettings {
    handle: string;
    emitMd: boolean;
    projectName: string;
    ticketStyle: 'string' | 'number';
    jsonPath: string;
}

export default class LogGen implements LogGenInterface {
    handle: string = '';
    emitMd: boolean = true;
    projectName: string = '';
    ticketStyle: 'string' | 'number' = 'string';
    currentLogs: GeneratedLog[] = [];
    jsonPath: string = '';
    constructor() { }
    async getSettings() {
        try {
            if (!await fs.existsSync(path.join(__dirname, './config.changlogen.json'))) {
                throw new Error('Unabel to locate the config.changlogen.json');
            }
            const settingStr = await fs.readFileSync(path.join(__dirname, '../config.changlogen.json'));
            const settings: ChanlagenSettings = JSON.parse(settingStr.toString());
            console.log("here are your settings, if they do not look right cancel and fix in your config.");
            console.log(settings);
            console.log("If the settings are correct type Y/N");
            const {answer}: {answer: string} = await prompt.get(['answer']);
            if (answer.toLowerCase() === 'n') {
                process.exit();
            }
            this.handle = settings.handle;
            this.emitMd = settings.emitMd;
            this.projectName = settings.projectName;
            this.ticketStyle = settings.ticketStyle;
            this.jsonPath = settings.jsonPath;
        } catch (error) {
            throw error;
        }
    }
    async createJSONFile() {
        try {
            await fs.writeFileSync(path.join(__dirname, `../${this.jsonPath}logs.json`), JSON.stringify([]));
        } catch (error) {
            throw error;
        }
    }
    async createMDFile() {
        try {
            await fs.writeFileSync(path.join(__dirname, '../logs.md'), JSON.stringify(''));
        } catch (error) {
            throw error;
        }
    }
    async checkIfJsonFilesExists() {
        try {
            return await fs.existsSync(path.join(__dirname, `../${this.jsonPath}logs.json`));
        } catch (error) {
            throw error;
        }
    }
    async checkIfMdFileExists() {
        try {
            return await fs.existsSync(path.join(__dirname, '../logs.md'));
        } catch (error) {
            throw error;
        }
    }

    async beforeCheck() {
        try {
            if (!await this.checkIfJsonFilesExists()) {
                await this.createJSONFile();
            }
            if (!await this.checkIfMdFileExists() && this.emitMd) {
                await this.createMDFile();
            }
        } catch (error) {
            throw error;
        }
    }
    async getCurrentLogs() {
        try {
            let currentLogs = await fs.readFileSync(path.join(__dirname, `../${this.jsonPath}logs.json`));
            let logs: GeneratedLog[] = JSON.parse(currentLogs as any);
            return logs;
        } catch (error) {
            throw error;
        }
    }
    async init() {
        try {
            await this.beforeCheck();
            this.currentLogs = await this.getCurrentLogs();
        } catch (error) {
            throw error;
        }
    }
    async getTicketNumber() {
        try {
            const { ticket } = await prompt.get(['ticket']);
            if (this.ticketStyle === 'number') {
                return parseInt((ticket as string), 10);
            }
            return ticket as string;
        } catch (error) {
            throw error;
        }
    }
    async getChanges() {
        try {
            const { numberOfChanges } = await prompt.get(['numberOfChanges']);
            const amount = parseInt((numberOfChanges as string), 10);
            const changes: ChangesLog[] = [];
            let i = 1;
            for (i; i <= amount; i++) {
                const notes = await prompt.get(['type', 'message']);
                changes.push((notes as unknown as ChangesLog));
            }
            if (amount === 1) {
                return changes[0];
            } else {
                return changes;
            }
        } catch (error) {
            throw error;
        }
    }
    async writeToJSON() {
        try {
            await fs.writeFileSync(path.join(__dirname, `./${this.jsonPath}logs.json`), JSON.stringify(this.currentLogs));
        } catch (error) {
            throw error;
        }
    }
    async writeToMD() {
        try {
            const writeString = `# Change Logs\n\n${this.currentLogs.map((log) => { return `\n**Log Date:${log.date_logged} - ${log.project} - submitted by: ${log.handle} - Jira/Link: ${log.ticket}**\n\t${(log as any).isArray() ? (log.changes as ChangesLog[]).join() : log}` }).join()}`.replace(',', '');
            await fs.writeFileSync(path.join(__dirname, '../logs.md'), (writeString.toString() as any).replaceAll(',', ''));
        } catch (error) {
            throw error;
        }
    }
    async start() {
        try {
            await this.getSettings();
        
            // await this.init();
            // const ticketNumber = await this.getTicketNumber();
            // const changeOrChanges = await this.getChanges();
            // const log: GeneratedLog = {
            //     date_logged: moment().format("MMMM Do YYYY | (h:mm:ss a)"),
            //     project: this.projectName,
            //     handle: this.handle,
            //     ticket: ticketNumber,
            //     changes: changeOrChanges
            // }
            // this.currentLogs.push(log);
            // await this.writeToJSON();
            // if (this.emitMd) await this.writeToMD();
        } catch (error) {
            throw error;
        }
    }
}



import fs from 'fs';
import moment from 'moment';
import prompt from 'prompt';


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
    checkSettings: boolean;
}

export default class LogGen implements LogGenInterface {
    handle: string = '';
    emitMd: boolean = true;
    projectName: string = '';
    ticketStyle: 'string' | 'number' = 'string';
    currentLogs: GeneratedLog[] = [];
    jsonPath: string = '';
    checkSettings: boolean = false;
    constructor() { }
    async getSettings() {
        try {
            const configPath = process.cwd() + '/config.changlogen.json';
            if (!await fs.existsSync(configPath)) {
                throw new Error('Unable to locate the config.changlogen.json');
            }
            const settingStr = await fs.readFileSync(configPath);
            const settings: ChanlagenSettings = JSON.parse(settingStr.toString());
            this.handle = settings.handle;
            this.emitMd = settings.emitMd;
            this.projectName = settings.projectName;
            this.ticketStyle = settings.ticketStyle;
            this.jsonPath = settings.jsonPath;
            this.checkSettings = settings.checkSettings;
            if (this.checkSettings) {
                console.log("here are your settings, if they do not look right cancel and fix in your config.");
                console.log(settings);
                console.log("If the settings are correct type Y/N");
                const { answer }: { answer: string } = await prompt.get(['answer']);
                if (answer.toLowerCase() === 'n') {
                    process.exit();
                }
            }
        } catch (error) {
            throw error;
        }
    }
    async createJSONFile() {
        try {
            const jsonLogPath = process.cwd() + `/${this.jsonPath}logs.json`;
            await fs.writeFileSync(jsonLogPath, JSON.stringify([]));
        } catch (error) {
            throw error;
        }
    }
    async createMDFile() {
        try {
            const mdLogPath = process.cwd() + `/logs.md`;
            await fs.writeFileSync(mdLogPath, JSON.stringify(''));
        } catch (error) {
            throw error;
        }
    }
    async checkIfJsonFilesExists() {
        try {
            const jsonLogPath = process.cwd() + `/${this.jsonPath}logs.json`;
            return await fs.existsSync(jsonLogPath);
        } catch (error) {
            throw error;
        }
    }
    async checkIfMdFileExists() {
        try {
            const mdLogPath = process.cwd() + `/logs.md`;
            return await fs.existsSync(mdLogPath);
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
            const jsonLogPath = process.cwd() + `/${this.jsonPath}logs.json`;
            let currentLogs = await fs.readFileSync(jsonLogPath).toString();
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
            const jsonLogPath = process.cwd() + `/${this.jsonPath}logs.json`;
            await fs.writeFileSync(jsonLogPath, JSON.stringify(this.currentLogs));
        } catch (error) {
            throw error;
        }
    }
    async writeToMD() {
        try {
            const mdLogPath = process.cwd() + `/logs.md`;
            const writeString = `# Change Logs\n\n${this.currentLogs.map((log) => { return `\n**Log Date:${log.date_logged} - ${log.project} - submitted by: ${log.handle} - Jira/Link: ${log.ticket}**\n\t${log.changes instanceof Array ? (log.changes as ChangesLog[]).map(lg => `${lg.type} - ${lg.message}`).join() : `${log.changes.type} - ${log.changes.message}`}` }).join()}`.replace(',', '');
            await fs.writeFileSync(mdLogPath, (writeString.toString() as any).replaceAll(',', ''));
        } catch (error) {
            throw error;
        }
    }
    async start() {
        try {
            await this.getSettings();
            await this.init();
            const ticketNumber = await this.getTicketNumber();
            const changeOrChanges = await this.getChanges();
            const log: GeneratedLog = {
                date_logged: moment().format("MMMM Do YYYY | (h:mm:ss a)"),
                project: this.projectName,
                handle: this.handle,
                ticket: ticketNumber,
                changes: changeOrChanges
            }
            this.currentLogs.push(log);
            await this.writeToJSON();
            if (this.emitMd) await this.writeToMD();
        } catch (error) {
            throw error;
        }
    }
}



const prompt = require("prompt");
const moment = require('moment');
const fs = require('fs');

const createJSONFile = async () => {
    await fs.writeFileSync('logs.json', JSON.stringify([]));
}
const createMDFile = async () => {
    await fs.writeFileSync('logs.md', JSON.stringify(''));
}


const checkIfJsonFilesExists = async () => {
    return await fs.existsSync('logs.json');
}

const checkIfMdFilesExists = async () => {
    return await fs.existsSync('logs.md');
}

const main = async () => {

    if (!await checkIfJsonFilesExists()) {
        await createJSONFile();
    }
    let currentLogs = await fs.readFileSync('logs.json');
    currentLogs = JSON.parse(currentLogs);
    prompt.start();
    const data = await prompt.get(['project', 'handle', 'ticket']);
    console.log(data);
    const { numberOfChanges } = await prompt.get(['numberOfChanges']);
    const amount = parseInt(numberOfChanges, 10);
    const changes = [];
    let i = 1;
    for (i; i <= amount; i++) {
        const notes = await prompt.get(['type', 'message']);
        changes.push(notes);
    }

    const log = {
        date_logged: moment().format("MMMM Do YYYY | (h:mm:ss a)"),
        ...data,
        changes: changes.map(change => {
            return `- ${change.type} - ${change.message}\n\t`
        }),
    };
    currentLogs.push(log);
    await fs.writeFileSync('logs.json', JSON.stringify(currentLogs));
    console.log(log);
    console.log('updating md');

    if (!await checkIfMdFilesExists()) {
        await createMDFile();
    }
    const writeString = `# Change Logs\n\n${currentLogs.map((log) => {return `\n**Log Date:${log.date_logged} - ${log.project} - submitted by: ${log.handle} - Jira/Link: ${log.ticket}**\n\t${log.changes.join()}`}).join()}`.replace(',', '');
    await fs.writeFileSync('logs.md', writeString.toString().replaceAll(',', ''));
}

main();
# Quickly Generate a Changelog md && Json (development)
---

(Warning  this is still in development do not use in prod) Adding this to a precommit script to ensure that a simple change log is generated as json and md is a simple way to have changelogs added. 

## The Config 

Create a file in your root directory and title it: config.changlogen.json

```JSON
{
    "handle": "@gustavog",
    "projectName": "EIL",
    "emitMd": true,
    "ticketStyle": "string",
    "jsonPath": "public/"
}

```

## The JSON file

The JSON file should be an array of GeneratedLogs (Type seen below) which could be pulled in and displayed in a simple webpage.

```TypeScript
interface ChangesLog {
    type: string;
    message: string;
}

interface GeneratedLog {
    date_logged: string; // auto generated when log is added
    project: string;
    handle: string;
    ticket: string | number;
    changes: ChangesLog | ChangesLog[];
}
```

## The MD file

The md fileshould be a basic list of logs and will be displayed at the root level. You can chose not to emit the MD file in the settings.


### How to use this package
---

Initialize it so that the json and MD files are created, the first person to initialize it will create the files that should be committed to the repository and should not be deleted. eventually it would be nice to intigrate this with an api to store the logs and get the logs but under its current state the logs must be commited if you want it to work. 

either in the precommit script of your choice before the end.

```JavaScript
const LogGen = require('chalagen');

const log = new LogGen();
log.start(); //this calls the prompt
```

```TypeScript
import LogGen from 'chalagen';

const log: LogGenInterface = new LogGen();
log.start();
```


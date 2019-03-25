"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const fs_1 = require("fs");
const path_1 = require("path");
require("reflect-metadata");
const models_1 = require("./models");
const log = console.log;
const exit = process.exit;
const path = path_1.join(__dirname, "..", ".env");
if (!fs_1.existsSync(path)) {
    log("environment variables file is not found.");
    exit(1);
}
const { error, parsed } = dotenv_1.config({ path });
if (error) {
    log(error.message);
    exit(1);
}
else {
    log("start worker", parsed);
    const client = new models_1.Client();
    client.name = "Malu";
    log(client);
}

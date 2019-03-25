"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error = console.error;
const exit = process.exit;
const logError = (err) => error(err.message);
const exitOnError = (err) => {
    logError(err);
    exit();
};
exports.default = { logError, exitOnError };

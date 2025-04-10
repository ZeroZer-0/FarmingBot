let testingMode = false;

/**
 * Gets the current testing mode status.
 * @returns {boolean} - The current testing mode status.
 */
export function getTestingMode() {
    return testingMode;
}

/**
 * Sets the testing mode status.
 * @param {boolean} value - The new testing mode status.
 */
export function setTestingMode(value) {
    testingMode = value;
}


let botState = "Stopped"; // Possible states: "Running", "Paused", "Stopped"
let previousState = "Stopped";

/**
 * Gets the current state of the bot.
 * @returns {string} - The current bot state.
 */
export function getBotState() {
    return botState;
}

/**
 * Sets the state of the bot.
 * @param {string} state - The new state of the bot.
 */
export function setBotState(state) {
    previousState = botState;
    botState = state;
}

/**
 * Gets the previous state of the bot.
 * @returns {string} - The previous bot state.
 */
export function getPreviousBotState() {
    return previousState;
}


const LOG_LEVELS = {
    CHAT: 0,
    ERROR: 1,
    WARN: 2,
    INFO: 3,
    DEBUG: 4,
};

let currentLogLevel = LOG_LEVELS.CHAT; // Default log level

/**
 * Gets the current log level.
 * @returns {string} - The current log level.
 */
export function getCurrentLogLevel() {
    return Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === currentLogLevel);
}

/**
 * Sets the current log level.
 * @param {string} level - The log level to set ("ERROR", "WARN", "INFO", "DEBUG").
 */
export function setLogLevel(level) {
    if (LOG_LEVELS[level] !== undefined) {
        currentLogLevel = LOG_LEVELS[level];
    }
}

/**
 * Cycles the current log level
 */
export function cycleLogLevel() {
    currentLogLevel += 1;
    if (currentLogLevel > 4) {
        currentLogLevel = 1;
    }
}


const logMessages = []; // Array to store log messages for the GUI

/**
 * Retrieves the latest log messages.
 * @returns {Array<string>} - The stored log messages.
 */
export function getLogMessages() {
    return logMessages;
}

/**
 * Adds a new log message to the array.
 * @param {string} message - The message to add.
 */
export function addLogMessage(message) {
    logMessages.push(message);
}

/**
 * Shifts logMessage
 * @param {number} amount - The amount to shift the log messages.
 */
export function shiftLogMessages(amount = 1) {
    logMessages.shift(amount);
}


let isFollowingPath = false;

/**
 * Gets the current path following status.
 * @returns {boolean} - The current path following status.
 */
export function getIsFollowingPath() {
    return isFollowingPath;
}

/**
 * Sets the path following status.
 * @param {boolean} value - The new path following status.
 */
export function setIsFollowingPath(value) {
    isFollowingPath = value;
}


let currentPath = [];

/**
 * Gets the current path.
 * @returns {Array} - The current path.
 */
export function getCurrentPath() {
    return currentPath;
}

/**
 * Sets the current path.
 * @param {Array} path - The new path.
 */
export function setCurrentPath(path) {
    currentPath = path;
}


let currentIndex = 0;

/**
 * Gets the current path index.
 * @returns {number} - The current path index.
 */
export function getCurrentIndex() {
    return currentIndex;
}

/**
 * Sets the current path index.
 * @param {number} index - The new path index.
 */
export function setCurrentIndex(index) {
    currentIndex = index;
}


let targetPos = {};

/**
 * Gets the target point.
 * @returns {Object} - The target point.
 */
export function getTargetPoint() {
    return targetPos;
}

/**
 * Sets the target point.
 * @param {Object} point - The new target point.
 */
export function setTargetPoint(point) {
    targetPos = point;
}


let currentPathType = false;

/**
 * Gets the current path type.
 * @returns {string} - The current path type.
 */
export function getCurrentPathType() {
    return currentPathType;
}

/**
 * Sets the current path type.
 * @param {string} pathType - The new path type.
 */
export function setCurrentPathType(pathType) {
    currentPathType = pathType;
}


let runEvacuationPath = false;

/**
 * Gets the current Evacuation path status.
 * @returns {boolean} - The current Evacuation path status.
 */
export function getRunEvacuationPath() {
    return runEvacuationPath;
}

/**
 * Sets the Evacuation path status.
 * @param {boolean} value - The new Evacuation path status.
 */
export function setRunEvacuationPath(value) {
    runEvacuationPath = value;
}

/**
 * Toggles the Evacuation path status.
 */
export function toggleRunEvacuationPath() {
    runEvacuationPath = !runEvacuationPath;
}



let guiVisible = false;

/**
 * Gets the current GUI visibility status.
 * @returns {boolean} - The current GUI visibility status.
 */
export function getGuiVisible() {
    return guiVisible;
}

/**
 * Sets the GUI visibility status.
 * @param {boolean} value - The new GUI visibility status.
 */
export function setGuiVisible(value) {
    guiVisible = value;
}

/**
 * Toggles the GUI visibility status.
 */
export function toggleGuiVisible() {
    guiVisible = !guiVisible;
}



let currentArea = "undefined";

/**
 * Gets the current area.
 * @returns {string} - The current area.
 */
export function getCurrentArea() {
    return currentArea;
}

/**
 * Sets the current area.
 * @param {string} area - The new area.
 */
export function setCurrentArea(area) {
    currentArea = area;
}


let pestCount = 0;

/**
 * Gets the current pest count.
 * @returns {number} - The current pest count.
 */
export function getPestCount() {
    return pestCount;
}

/**
 * Sets the current pest count.
 * @param {number} count - The new pest count.
 */
export function setPestCount(count) {
    pestCount = count;
}


let minPestCount = 4;

/**
 * Gets the minimum pest count.
 * @returns {number} - The minimum pest count.
 */
export function getMinPestCount() {
    return minPestCount;
}

/**
 * Sets the minimum pest count.
 * @param {number} count - The new minimum pest count.
 */
export function setMinPestCount(count) {
    minPestCount = count;
}


let pestRepellentTimer = "Not Enabled";

if (testingMode) {
    pestRepellentTimer = "None";
}

/**
 * Gets the current pest repellent timer.
 */
export function updatePestRepellent() {
    if (testingMode) return;
    if (getCurrentArea() !== "Garden") return;
    let pestLine = TabList.getNames().find((line) => ChatLib.removeFormatting(line).startsWith(' Repellent:'));
    if (pestLine !== undefined) {
        pestRepellentTimer = pestLine.substring(13).trim();
    } else {
        pestRepellentTimer = "Not Enabled";
    }
}

/**
 * Gets the current pest repellent timer.
 * @returns {string} - The current pest repellent timer.
 */
export function getPestRepellentTimer() {
    return pestRepellentTimer;
}

/**
 * Sets the current pest repellent timer. Only used for testing.
 * @param {string} timer - The new pest repellent timer.
 */
export function setPestRepellentTimer(timer) {
    if (!testingMode) return; 
    pestRepellentTimer = timer;
}


let reapplyPestRepellent = false;

/**
 * Gets the current reapply pest repellent status.
 * @returns {boolean} - The current reapply pest repellent status.
 */
export function getReapplyPestRepellent() {
    return reapplyPestRepellent;
}

/**
 * Sets the reapply pest repellent status.
 * @param {boolean} value - The new reapply pest repellent status.
 */
export function setReapplyPestRepellent(value) {
    reapplyPestRepellent = value;
}


let checkFailed = false;

/**
 * Gets the current check failed status.
 * @returns {boolean} - The current check failed status.
 */
export function getCheckFailed() {
    return checkFailed;
}

/**
 * Sets the check failed status.
 * @param {boolean} value - The new check failed status.
 */
export function setCheckFailed(value) {
    checkFailed = value;
}


let initialTool = null;

/**
 * Gets the initial tool.
 * @return {string} - The initial tool.
 */
export function getInitialTool() {
    return initialTool;
}

/**
 * Sets the initial tool.
 * @param {string} tool - The new initial tool.
 */
export function setInitialTool(tool) {
    initialTool = tool;
}
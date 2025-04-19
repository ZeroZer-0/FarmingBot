// pathConfig.js - Manages loading and saving path configurations

import { getTestingMode } from "../core/globalVaribles";
import { logInfo, logError, logDebug } from "../core/logger";

let pathsFileLocation = "./config/FarmBot/paths.json";

fixPathConfigFile();


/**
 * Loads path configurations from the paths.json file.
 * @returns {Object} - The path configurations (Primary, Secondary, Evacuation).
 */
export function loadPaths() {
    if (getTestingMode()) {
        pathsFileLocation = "./config/FarmBot/testing paths.json";
    } else {
        pathsFileLocation = "./config/FarmBot/paths.json";
    }
    if (!FileLib.exists(pathsFileLocation)) {
        savePaths({ Primary: [], Secondary: [], Evacuation: [] }); // Create a default file
    }

    try {
        const fileContent = FileLib.read(pathsFileLocation);
        const paths = JSON.parse(fileContent);
        logDebug(`Loaded paths: ${Object.keys(paths).join(", ")}`);
        return paths;
    } catch (e) {
        logError(`Failed to load paths.json: ${e.message}`);
        return { Primary: [], Secondary: [], Evacuation: [] }; // Return default paths
    }
}


/**
 * Saves the given path configurations to the paths.json file.
 * @param {Object} paths - The path configurations to save.
 * @param {Array} paths.Primary - The Primary path points.
 * @param {Array} paths.Secondary - The Secondary path points.
 * @param {Array} paths.Evacuation - The Evacuation path points.
 */
export function savePaths(paths) {
    try {
        const jsonContent = JSON.stringify(paths, null, 4);
        FileLib.write(pathsFileLocation, jsonContent);
        logInfo("Paths saved successfully.");
    } catch (e) {
        logError(`Failed to save paths.json: ${e.message}`);
    }
}


/**
 * Adds a new point to a specified path.
 * @param {string} pathType - The type of path ("Primary", "Secondary", "Evacuation").
 * @param {Object} point - The point to add (e.g., {x: 0, y: 64, z: 0}).
 */
export function addPathPoint(pathType, point) {
    if (!isValidPoint(point)) {
        logError("Invalid point structure. A valid point must contain x and z coordinates.");
        return;
    }

    const paths = loadPaths();
    if (!paths[pathType]) {
        logError(`Invalid path type: ${pathType}`);
        return;
    }
    paths[pathType].push(point);
    savePaths(paths);
    logInfo(`Added point to ${pathType}: ${JSON.stringify(point)}`);
}


/**
 * Removes a point from a specified path by index.
 * @param {string} pathType - The type of path ("Primary", "Secondary", "Evacuation").
 * @param {number} index - The index of the point to remove.
 */
export function removePathPoint(pathType, index) {
    const paths = loadPaths();
    if (!paths[pathType]) {
        logError(`Invalid path type: ${pathType}`);
        return;
    }
    if (index < 0 || index >= paths[pathType].length) {
        logError(`Invalid index ${index} for path ${pathType}.`);
        return;
    }
    const removed = paths[pathType].splice(index, 1);
    savePaths(paths);
    logInfo(`Removed point from ${pathType}: ${JSON.stringify(removed[0])}`);
}


/**
 * Retrieves all points of a specified path.
 * @param {string} pathType - The type of path ("Primary", "Secondary", "Evacuation").
 * @returns {Array} - The points in the specified path.
 */
export function getPathPoints(pathType) {
    const paths = loadPaths();
    if (!paths[pathType]) {
        logError(`Invalid path type: ${pathType}`);
        return [];
    }
    return paths[pathType];
}


/**
 * Validates the structure of a path point.
 * @param {Object} point - The point to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
function isValidPoint(point) {
    return typeof point.x === "number" && typeof point.z === "number";
}

export function getPathConfigFile() {
    return pathsFileLocation;
}

/**
 * Fixes the path configuration file if it doesn't exist.
 */
function fixPathConfigFile() {
    if (getTestingMode()) {
        pathsFileLocation = "./config/FarmBot/testing paths.json";
    } else {
        pathsFileLocation = "./config/FarmBot/paths.json";
    }
    if (!FileLib.exists(pathsFileLocation)) {
        const defaultPaths = {
            Primary: [],
            Secondary: [],
            Evacuation: []
        };
        FileLib.write(pathsFileLocation, JSON.stringify(defaultPaths, null, 4));
        logInfo("Created default paths.json file.");
    } else {
        const fileContent = FileLib.read(pathsFileLocation);
        let paths = JSON.parse(fileContent);
        for (let pathType in paths) {
            if (!Array.isArray(paths[pathType])) {
                logError(`Invalid path structure for ${pathType}. Expected an array.`);
                paths[pathType] = [];
            } else {
                if (paths[pathType].length !== 0 && paths[pathType][0].hasOwnProperty("forcedKeys")) {
                    return;
                }
                for (let point of paths[pathType]) {
                    point.forcedKeys = point.forcedKeys || [];
                }
            }
        }
        FileLib.write(pathsFileLocation, JSON.stringify(paths, null, 4));
    }
}

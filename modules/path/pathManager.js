// pathManager.js - Core path-following logic
import { setBotState, getCurrentIndex, getCurrentPath, getCurrentPathType, getIsFollowingPath, getRunEvacuationPath, getTargetPoint, setCurrentIndex, setCurrentPath, setCurrentPathType, setIsFollowingPath, setRunEvacuationPath, setTargetPoint, getBotState, getCurrentArea, setCurrentArea, setGuiVisible, setPestCount, getTestingMode, updatePestRepellent, getInitialTool } from "../core/globalVaribles";
import { calculateMovementDelta, getMovementDirections, hasReachedTarget } from "../path/pathUtils";
import { pressKey, releaseKey, releaseAllKeys, tapKey, forceRealseAllKeys } from "../core/keyManager";
import { logInfo, logWarn, logDebug } from "../core/logger";
import { getPlayerPosition } from "../player/playerManager";
import { getPathPoints } from "./pathConfig";
import { playAlarm } from "../checkers/alarm";

let currentDirection = [];
let evacuating = false;
let wait = true;

const directions = ["forward", "left", "right", "back"];

/**
 * Varifies the set path is vailid a starts bot if so.
 */
export function startPathFollowing() {
    if (getBotState() !== "Running") return;
    if (getIsFollowingPath() || getCurrentArea() !== "Garden") {
        return;
    }

    let timeout = 400 + Math.random() * 200;
    setCurrentPath(getPathPoints(getCurrentPathType()));
    setIsFollowingPath(true);
    currentDirection = [];
    setCurrentIndex(0);
    if (Math.random() < 0.5) { timeout += (1000 + Math.random() * 1000); }
    setTimeout(() => {
        restartPosistion();
        tapKey("key.sneak", 200 + Math.random() * 500);
        setTimeout( () => {wait = false;} , 300);
        if (getCurrentPath().length === 0) {
            logWarn(`Cannot start path-following. The ${pathType} path is empty or invalid.`);
            return;
        }
        logInfo(`Started following the ${getCurrentPathType()} path with ${getCurrentPath().length} points.`);
    }, timeout);
}

export function startEvacuationPath() {
    let timeout = 400 + Math.random() * 200;
    if (Math.random() < 0.5) { timeout += (1000 + Math.random() * 1000); }
    setTimeout(() => {
        if (getTestingMode()) {
            setCurrentArea("Hub");
            ChatLib.command("tp @p -225 4 340 0 0");
        } else {
            ChatLib.command("warp hub");
        }
        setTimeout( () => {
            setCurrentPath(getPathPoints("Evacuation"));
            setCurrentPathType("Evacuation");
            setCurrentIndex(0);
            setIsFollowingPath(true);
            currentDirection = [];
            evacuating = true;
            wait = false;
            logInfo(`Started following the Evacuation path with ${getCurrentPath().length} points.`);
        }, 300 + Math.random() * 200);
    }, timeout);
}


/**
 * Stops the current path-following process.
 */
export function stopPathFollowing() {
    let timeout = 400 + Math.random() * 200;
    if (Math.random() < 0.4) { timeout += (1000 + Math.random() *1000); }
    setTimeout(() => {
        wait = true;
        releaseAllKeys();
        currentDirection = [];
        if (!getIsFollowingPath()) {
            logWarn("No path is currently being followed.");
            return;
        }
        if (getRunEvacuationPath()) {
            setRunEvacuationPath(false);
            startEvacuationPath();
            return;
        }
        setIsFollowingPath(false);
        logInfo("Stopped following the path.");
        setBotState("Stopped");
    }, timeout);
}

/**
 * Periodically checks and moves the player towards the next point in the path.
 */
export function followPathStep() {
    if (wait) {
        return;
    }
    if (!getIsFollowingPath() || getCurrentIndex() >= getCurrentPath().length) {
        stopPathFollowing();
        return;
    }

    if (getCurrentArea() !== "Garden" && !evacuating) {
        logWarn("Player is not in the garden area. Stopping path-following.");
        stopPathFollowing();
        playAlarm();
        return;
    }

    const playerPos = getPlayerPosition();
    setTargetPoint(getCurrentPath()[getCurrentIndex()]);

    if (hasReachedTarget(playerPos, getTargetPoint())) {
        logInfo(`Reached point ${getCurrentIndex() + 1}/${getCurrentPath().length}.`);
        setCurrentIndex(getCurrentIndex() + 1);
        if (getCurrentIndex() >= getCurrentPath().length) {
            setIsFollowingPath(false);
            if (evacuating) {
                evacuating = false;
                releaseAllKeys();
                postEvacuation();
                return;
            }
            setCurrentPathType("Primary");
            let timeout = 400 + Math.random() * 200;
            if (Math.random() < 0.2) { timeout += (1000 + Math.random() * 1000); }
            wait = true;
            setTimeout(() => {
                restartPosistion();
                setTimeout( () => {startPathFollowing();} , 1000 + Math.random() * 400);
            }, timeout);
        }
    }
    pressKey("key.attack");
    pressKey("key.sprint");
    moveTowardsPoint(playerPos, getTargetPoint());
}

/**
 * Moves the player towards a target point by pressing the appropriate keys.
 * @param {Object} playerPos - The player's current position.
 * @param {Object} targetPoint - The target position.
 */
function moveTowardsPoint(playerPos, targetPoint) {
    let newDirections = getMovementDirections(calculateMovementDelta(playerPos, targetPoint));
    directions.forEach((direction) => {
        if (currentDirection.includes(direction) && !newDirections.includes(direction)) {
            if (evacuating) {
            releaseKey(`key.${direction}`);
            } else {
                setTimeout(() => {releaseKey(`key.${direction}`);}, 50 + Math.random() * 100);
            }
        } else if (!currentDirection.includes(direction) && newDirections.includes(direction)) {
            if (evacuating) {
                pressKey(`key.${direction}`);
            } else {
                setTimeout(() => {pressKey(`key.${direction}`);}, 160 + Math.random() * 100);
            }
        }
    });
    currentDirection = newDirections;
}

/**
 * Restarts the bot to the start of the farm
 */
function restartPosistion() {
    forceRealseAllKeys();
    currentDirection = [];
    if (getTestingMode()) {
        ChatLib.command("tp @p -213 4 337 180 0");
    } else {        
        ChatLib.command("warp garden");
    }
}

function postEvacuation() {
    releaseAllKeys();
    setGuiVisible(false);
    setTimeout( () => {tapKey("key.attack");}, 300 + Math.random() * 700);
    setTimeout( () => {Client.Companion.disconnect();}, 17000 + Math.random() * 12000);
    setBotState("Stopped");
}

export function stopMovement() {
    releaseAllKeys();
    currentDirection = [];
}
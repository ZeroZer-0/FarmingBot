// playerManager.js - Handles player-related data and state updates

import { getCurrentArea, getTestingMode, setCurrentArea } from "../core/globalVaribles";
import { logInfo, logWarn } from "../core/logger";

/**
 * Retrieves the player's current position.
 * @returns {Object} - The player's position ({x, y, z}).
 */
export function getPlayerPosition() {
    try {
        return { x: parseInt(Math.round(Player.getX())), y: parseInt(Math.round(Player.getY())) | 0, z: parseInt(Math.round(Player.getZ())) | 0 };
    } catch (e) {
        logWarn("Failed to retrieve player position. Returning default values.");
        return { x: 0, y: 0, z: 0 };
    }
}

/**
 * Retrieves the player's current facing direction (yaw and pitch).
 * @returns {Object} - The player's facing direction ({yaw, pitch}).
 */
export function getPlayerFacing() {
    try {
        const yaw = Player.getYaw();
        const pitch = Player.getPitch();
        return { yaw, pitch };
    } catch (e) {
        logWarn("Failed to retrieve player facing direction. Returning default values.");
        return { yaw: 0, pitch: 0 };
    }
}

/**
 * Checks if the player is currently holding an item.
 * @returns {boolean} - True if the player is holding an item, false otherwise.
 */
export function isPlayerHoldingItem() {
    return Player.getHeldItem() !== null;
}

/**
 * Retrieves the name of the item the player is currently holding.
 * @returns {string|null} - The name of the held item, or null if no item is held.
 */
export function getHeldItemName() {
    const item = Player.getHeldItem();
    return item ? item.getName() : "None";
}

/**
 * Logs the player's current position and facing direction.
 */
export function logPlayerState() {
    const pos = getPlayerPosition();
    const facing = getPlayerFacing();
    logInfo(`Player Position: x=${pos.x}, y=${pos.y}, z=${pos.z}`);
    logInfo(`Player Facing: yaw=${facing.yaw}, pitch=${facing.pitch}`);
}

/**
 * Checks if the player is wearing specific armor.
 * @param {string} armorName - The name of the armor to check.
 * @returns {boolean} - True if the player is wearing the armor, false otherwise.
 */
export function isWearingArmor(armorName) {
    const armor = Player.getArmorInventory();
    return armor.some(piece => piece && piece.getName().includes(armorName));
}


/**
 * Updates player's current area.
 */
export function updatePlayerArea() {
    if (getTestingMode()) {
        setCurrentArea(getCurrentArea());
        return;
    }
    let areaLine = TabList.getNames().find((line) => ChatLib.removeFormatting(line).startsWith('Area:'));
    if (areaLine !== undefined) {
        setCurrentArea(ChatLib.removeFormatting(areaLine).substring(6).trim());
    } else {
        setCurrentArea("undefined");
    }
}


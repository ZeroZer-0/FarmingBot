// keyManager.js - Handles Minecraft key actions using Client keybinds

import { logError, logDebug } from "./logger";

let heldKeys = new Set();

/**
 * Presses and holds the specified key.
 * @param {string} description - The Minecraft keybind description (e.g., "key.forward").
 */
export function pressKey(description) {
    const key = Client.getKeyBindFromDescription(description);
    if (key) {
        key.setState(true);
        heldKeys.add(description);
    } else {
        logError(`Keybind with description '${description}' not found.`);
    }
}

/**
 * Releases the specified key.
 * @param {string} description - The Minecraft keybind description (e.g., "key.forward").
 */
export function releaseKey(description) {
    const key = Client.getKeyBindFromDescription(description);
    if (key) {
        key.setState(false);
-        heldKeys.delete(description);
    } else {
        logError(`Keybind with description '${description}' not found.`);
    }
}

/**
 * Taps (presses and releases) the specified key.
 * @param {string} description - The Minecraft keybind description (e.g., "key.forward").
 * @param {number} duration - The duration to hold the key in milliseconds (default is 100ms).
 */
export function tapKey(description, duration = 100) {
    const key = Client.getKeyBindFromDescription(description);
    if (key) {
        key.setState(true);
        setTimeout(() => {
            key.setState(false);
        }, duration);
    } else {
        logError(`Keybind with description '${description}' not found.`);
    }
}

/**
 * Releases all currently held keys.
 */
export function releaseAllKeys() {
    heldKeys.forEach((keyDescription) => {
        const key = Client.getKeyBindFromDescription(keyDescription);
        key.setState(false);
    });
    heldKeys.clear();
}

/**
 * Forces the release of all keys, regardless of their current state.
 */
export function forceRealseAllKeys() {
    const allKeys = ["forward", "back", "left", "right"];
    allKeys.forEach((key) => {
        const keyBind = Client.getKeyBindFromDescription(`key.${key}`);
        if (keyBind) {
            keyBind.setState(false);
        } else {
            logError(`Keybind with description 'key.${key}' not found.`);
        }
    });
    heldKeys.clear();
}
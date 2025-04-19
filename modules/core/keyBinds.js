import { logDebug, logError } from "./logger";

const keybinds = new Set();
const actions = {};

register("step", () => {
    keybinds.forEach((keybindName) => {
        let keybind = getKeyBindByDescription(keybindName);
        if (keybind && keybind.isPressed()) {
            actions[keybindName]();
        }
    });
});

export function makeKeybind(name, key, category, action) {
    if (!action) {
        action = () => { logDebug(`${name} Button Pressed`) };
    }
    const keybind = new KeyBind(name, getKeyCodeByName(key.toUpperCase()), category);
    keybinds.add(name);
    actions[name] = action;
    return keybind;
}

const keyCodes = {
    0: { name: "NONE", description: "" },
    1: { name: "ESCAPE", description: "Escape" },
    2: { name: "1", description: "" },
    3: { name: "2", description: "" },
    4: { name: "3", description: "" },
    5: { name: "4", description: "" },
    6: { name: "5", description: "" },
    7: { name: "6", description: "" },
    8: { name: "7", description: "" },
    9: { name: "8", description: "" },
    10: { name: "9", description: "" },
    11: { name: "0", description: "" },
    12: { name: "MINUS", description: "-" },
    13: { name: "EQUALS", description: "=" },
    14: { name: "BACK", description: "Backspace" },
    15: { name: "TAB", description: "Tab" },
    16: { name: "Q", description: "" },
    17: { name: "W", description: "" },
    18: { name: "E", description: "" },
    19: { name: "R", description: "" },
    20: { name: "T", description: "" },
    21: { name: "Y", description: "" },
    22: { name: "U", description: "" },
    23: { name: "I", description: "" },
    24: { name: "O", description: "" },
    25: { name: "P", description: "" },
    26: { name: "LBRACKET", description: "[" },
    27: { name: "RBRACKET", description: "]" },
    28: { name: "RETURN", description: "Enter" },
    29: { name: "LCONTROL", description: "Left Control" },
    30: { name: "A", description: "" },
    31: { name: "S", description: "" },
    32: { name: "D", description: "" },
    33: { name: "F", description: "" },
    34: { name: "G", description: "" },
    35: { name: "H", description: "" },
    36: { name: "J", description: "" },
    37: { name: "K", description: "" },
    38: { name: "L", description: "" },
    39: { name: "SEMICOLON", description: ";" },
    40: { name: "APOSTROPHE", description: "'" },
    41: { name: "GRAVE", description: "`" },
    42: { name: "LSHIFT", description: "Left Shift" },
    43: { name: "BACKSLASH", description: "\\" },
    44: { name: "Z", description: "" },
    45: { name: "X", description: "" },
    46: { name: "C", description: "" },
    47: { name: "V", description: "" },
    48: { name: "B", description: "" },
    49: { name: "N", description: "" },
    50: { name: "M", description: "" },
    51: { name: "COMMA", description: "," },
    52: { name: "PERIOD", description: "." },
    53: { name: "SLASH", description: "/" },
    54: { name: "RSHIFT", description: "Right Shift" },
    55: { name: "MULTIPLY", description: "" },
    56: { name: "LMENU", description: "Left Menu/Alt" },
    57: { name: "SPACE", description: "" },
    58: { name: "CAPITAL", description: "Caps Lock" },
    59: { name: "F1", description: "" },
    60: { name: "F2", description: "" },
    61: { name: "F3", description: "" },
    62: { name: "F4", description: "" },
    63: { name: "F5", description: "" },
    64: { name: "F6", description: "" },
    65: { name: "F7", description: "" },
    66: { name: "F8", description: "" },
    67: { name: "F9", description: "" },
    68: { name: "F10", description: "" },
    69: { name: "NUMLOCK", description: "Number Lock" },
    70: { name: "SCROLL", description: "Scroll Lock" },
    71: { name: "NUMPAD7", description: "" },
    72: { name: "NUMPAD8", description: "" },
    73: { name: "NUMPAD9", description: "" },
    74: { name: "SUBTRACT", description: "" },
    75: { name: "NUMPAD4", description: "" },
    76: { name: "NUMPAD5", description: "" },
    77: { name: "NUMPAD6", description: "" },
    78: { name: "ADD", description: "" },
    79: { name: "NUMPAD1", description: "" },
    80: { name: "NUMPAD2", description: "" },
    81: { name: "NUMPAD3", description: "" },
    82: { name: "NUMPAD0", description: "" },
    83: { name: "DECIMAL", description: "" },
    87: { name: "F11", description: "" },
    88: { name: "F12", description: "" },
    100: { name: "F13", description: "" },
    101: { name: "F14", description: "" },
    102: { name: "F15", description: "" },
    112: { name: "KANA", description: "" },
    121: { name: "CONVERT", description: "" },
    123: { name: "NOCONVERT", description: "" },
    125: { name: "YEN", description: "¥" },
    141: { name: "NUMPADEQUALS", description: "" },
    144: { name: "CIRCUMFLEX", description: "^" },
    145: { name: "AT", description: "@" },
    146: { name: "COLON", description: ":" },
    147: { name: "UNDERLINE", description: "_" },
    148: { name: "KANJI", description: "" },
    149: { name: "STOP", description: "" },
    150: { name: "AX", description: "" },
    151: { name: "UNLABELED", description: "" },
    156: { name: "NUMPADENTER", description: "" },
    157: { name: "RCONTROL", description: "Right Control" },
    179: { name: "NUMPADCOMMA", description: "" },
    181: { name: "DIVIDE", description: "" },
    183: { name: "SYSRQ", description: "" },
    184: { name: "RMENU", description: "Right Menu/Alt" },
    197: { name: "PAUSE", description: "" },
    199: { name: "HOME", description: "" },
    200: { name: "UP", description: "Up Arrow" },
    201: { name: "PRIOR", description: "Page Up" },
    203: { name: "LEFT", description: "Left Arrow" },
    205: { name: "RIGHT", description: "Right Arrow" },
    207: { name: "END", description: "" },
    208: { name: "DOWN", description: "Down Arrow" },
    209: { name: "NEXT", description: "Page Down" },
    210: { name: "INSERT", description: "" },
    211: { name: "DELETE", description: "" },
    219: { name: "LMETA", description: "Left Meta/Super" },
    220: { name: "RMETA", description: "Right Meta/Super" },
    221: { name: "APPS", description: "" },
    222: { name: "POWER", description: "" },
    223: { name: "SLEEP", description: "" },
};

/**
 * Gets the name of the key by its keyCode.
 * @param {number} keyCode - The key code.
 * @returns {string|null} - The name of the key or null if not found.
 */
export function getKeyNameByCode(keyCode) {
    const key = keyCodes[keyCode];
    return key ? key.name : null;
}

/**
 * Gets the description of the key by its keyCode.
 * @param {number} keyCode - The key code.
 * @returns {string|null} - The description of the key or null if not found.
 */
export function getKeyDescriptionByCode(keyCode) {
    const key = keyCodes[keyCode];
    return key ? key.description : null;
}

/**
 * Gets the keyCode by the key name.
 * @param {string} name - The name of the key.
 * @returns {number|null} - The keyCode or null if not found.
 */
export function getKeyCodeByName(name) {
    for (let i = 0; i < Object.keys(keyCodes).length; i++) {
        if (keyCodes[i] && (keyCodes[i].name === name.toUpperCase()) || keyCodes[i].description === name) {
            return i;
        }
    }
    return null;
}

/**
 * Gets the description of the key by its name.
 * @param {string} name - The name of the key.
 * @returns {string|null} - The description of the key or null if not found.
 */
export function getKeyDescriptionByName(name) {
    for (const key of Object.values(keyCodes)) {
        if (key.name === name.toUpperCase()) {
            return key.description;
        }
    }
    return null;
}

/**
 * Gets the key name by its description.
 * @param {string} description - The description of the key.
 * @returns {string|null} - The name of the key or null if not found.
 */
export function getKeyNameByDescription(description) {
    for (const key of Object.values(keyCodes)) {
        if (key.description === description) {
            return key.name;
        }
    }
    return null;
}

/**
 * Gets the keyCode by the key description.
 * @param {string} description - The description of the key.
 * @returns {number|null} - The keyCode or null if not found.
 */
export function getKeyCodeByDescription(description) {
    for (const [keyCode, key] of Object.entries(keyCodes)) {
        if (key.description === description) {
            return parseInt(keyCode, 10);
        }
    }
    return null;
}

/**
 * Gets keybind by the key name.
 * @param {string} name - The name of the key.
 * @returns {KeyBind|null} - The keybind or null if not found.
 */
export function getKeyBindByKeyName(name) {
    const keybind = Client.getKeyBindFromKey(getKeyCodeByName(name));
    if (keybind) {
        return keybind;
    }
    return null;
}

/**
 * Gets keybind by the key description.
 * @param {string} description - The description of the key.
 * @returns {KeyBind|null} - The keybind or null if not found.
 */
export function getKeyBindByDescription(description) {
    const keybind = Client.getKeyBindFromDescription(description);
    if (keybind) {
        return keybind;
    }
    return null;
}

/**
 * Gets keybind by the key code.
 * @param {number} keyCode - The key code.
 * @returns {KeyBind|null} - The keybind or null if not found.
 */
export function getKeyBindByCode(keyCode) {
    const keybind = Client.getKeyBindFromKey(keyCode);
    if (keybind) {
        return keybind;
    }
    return null;
}

/**
 * Get name by keybind
 * @param {KeyBind} keybind - The keybind.
 * @returns {string|null} - The name of the key or null if not found.
 */
export function getNameByKeyBind(keybind) {
    return getKeyNameByCode(keybind.getKeyCode());
}

/**
 * Get description by keybind
 * @param {KeyBind} keybind - The keybind.
 * @returns {string|null} - The description of the key or null if not found.
 */
export function getDescriptionByKeyBind(keybind) {
    return getKeyDescriptionByCode(keybind.getKeyCode());
}

/**
 * Get key code by keybind
 * @param {KeyBind} keybind - The keybind.
 * @returns {number|null} - The keyCode or null if not found.
 */
export function getCodeByKeyBind(keybind) {
    return keybind.getKeyCode();
}

/**
 * Get keybind by name
 * @param {string} name - The name of the key.
 * @returns {KeyBind|null} - The keybind or null if not found.
 */
export function getKeyBindByName(name) {
    return getKeyBindByCode(getKeyCodeByName(name));
}

/**
 * Get keybind by description
 * @param {string} description - The description of the key.
 * @returns {KeyBind|null} - The keybind or null if not found.
 */
export function getKeyBindByKeyDescription(description) {
    return getKeyBindByCode(getKeyCodeByDescription(description));
}

/**
 * Get key name by keybind
 * @param {KeyBind} keybind - The keybind.
 * @returns {string|null} - The name of the key or null if not found.
 */
export function getKeyNameByKeyBind(keybind) {
    return getKeyNameByCode(keybind.getKeyCode());
}

/**
 * Get key description by keybind
 * @param {KeyBind} keybind - The keybind.
 * @returns {string|null} - The description of the key or null if not found.
 */
export function getKeyDescriptionByKeyBind(keybind) {
    return getKeyDescriptionByCode(keybind.getKeyCode());
}


/**
 * Get key from keybind description
 * @param {string} description - The description of the key.
 * @returns {KeyBind|null} - The keybind or null if not found.
 */
export function getKeyFromKeyBindDescription(description) {
    const keybind = getKeyBindByDescription(description);
    if (keybind) {
        return getKeyNameByCode(keybind.getKeyCode());
    }
    return null;
}
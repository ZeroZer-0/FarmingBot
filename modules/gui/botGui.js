import {
    getLogMessages,
    toggleRunEvacuationPath,
    getCurrentPath,
    getCurrentPathType,
    getCurrentIndex,
    getTargetPoint,
    getRunEvacuationPath,
    getBotState,
    getCurrentLogLevel,
    cycleLogLevel,
    toggleGuiVisible,
    getGuiVisible,
    getMinPestCount,
    getPestCount,
    getCurrentArea,
    getPestRepellentTimer,
    getReapplyPestRepellent,
} from "../core/globalVaribles";
import { startBot, stopBot, pauseBot, resumeBot } from "../core/stateManager";
import { getPlayerPosition, getPlayerFacing } from "../player/playerManager";
import { logChat, logDebug, getFormattedTimestamp } from "../core/logger";
import { makeKeybind, getDescriptionByKeyBind, getNameByKeyBind } from "../core/keyBinds";
import { createWarningGui } from "../gui/warningGui"; 

// Global scalers for current screen size vs. "base" resolution
let widthScale = Renderer.screen.getWidth() / 854;
let heightScale = Renderer.screen.getHeight() / 480;

/**
 * Instead of storing scaled positions,
 * store base (unscaled) positions/sizes.
 */
const buttons = [
    {
        label: "Main Path",
        baseX: 20,
        baseY: 360,
        baseWidth: 120,
        baseHeight: 30,
        keyBind: makeKeybind("Main Path", "O", "Bot", () => { startBot("Primary") }),
    },
    {
        label: "Alt Path",
        baseX: 20,
        baseY: 400,
        baseWidth: 120,
        baseHeight: 30,
        keyBind: makeKeybind("Alt Path", "U", "Bot", () => { startBot("Secondary") }),
    },
    {
        label: "Pause Bot",
        baseX: 160,
        baseY: 360,
        baseWidth: 120,
        baseHeight: 30,
        keyBind: makeKeybind("Pause", "P", "Bot", () => { pauseBot() }),
    },
    {
        label: "Toggle Evac",
        baseX: 300,
        baseY: 400,
        baseWidth: 120,
        baseHeight: 30,
        keyBind: makeKeybind("Toggle Evac", "L", "Bot", () => { toggleRunEvacuationPath() }),
    },
    {
        label: "Resume Bot",
        baseX: 300,
        baseY: 360,
        baseWidth: 120,
        baseHeight: 30,
        keyBind: makeKeybind("Resume", "J", "Bot", () => { resumeBot() }),
    },
    {
        label: "Stop Bot",
        baseX: 160,
        baseY: 400,
        baseWidth: 120,
        baseHeight: 30,
        keyBind: makeKeybind("Stop", "K", "Bot", () => { stopBot() }),
    },
    {
        label: "Log Level",
        baseX: 450,
        baseY: 360,
        baseWidth: 120,
        baseHeight: 30,
        keyBind: makeKeybind("Log Level", "I", "Bot", () => { cycleLogLevel() }),
    },
    {
        label: "Toggle GUI",
        baseX: 450,
        baseY: 400,
        baseWidth: 120,
        baseHeight: 30,
        keyBind: makeKeybind("Toggle GUI", ";", "Bot", () => { toggleBotGui() }),
    }
];

register("chat", (chat) => {
    if (getGuiVisible()) {
        logChat(ChatLib.getChatMessage(chat));
        cancel(chat);
    }
});


register("renderOverlay", (event) => {
    // If GUI is hidden, do nothing
    if (!getGuiVisible()) {
        Scoreboard.setShouldRender(true);
        return;
    }

    if (event.getType && (event.getType() === "TITLE" || event.getType() === "SUBTITLE")) {
        event.cancel();
    }

    Scoreboard.setShouldRender(false);

    // Recompute scaling factors each frame
    const screenWidth = Renderer.screen.getWidth();
    const screenHeight = Renderer.screen.getHeight();
    widthScale = screenWidth / 854;
    heightScale = screenHeight / 480;

    // Semi-transparent background
    Renderer.drawRect(Renderer.color(0, 0, 0, 150), 0, 0, screenWidth, screenHeight);
    Renderer.scale(Math.sqrt(widthScale * heightScale));

    // Title
    Renderer.drawString(
        "Bot Control Panel",
        (screenWidth / 2 - 100) * widthScale,
        10 * heightScale,
        true
    );

    // Inventory Display
    drawInventory(50 * widthScale, 200 * heightScale);

    // Bot State
    const botState = getBotState();
    let botStateColorPrefix = "";
    switch (botState) {
        case "Running":
            botStateColorPrefix = "&a";
            break;
        case "Paused":
            botStateColorPrefix = "&e";
            break;
        case "Stopped":
            botStateColorPrefix = "&c";
            break;
        default:
            botStateColorPrefix = "&7";
            break;
    }
    Renderer.drawString(
        `${botStateColorPrefix}Bot State: ${botState}`,
        10 * widthScale,
        10 * heightScale,
        true
    );

    // Player Information
    const pos = getPlayerPosition();
    const facing = getPlayerFacing();
    Renderer.drawString(`Yaw: ${facing.yaw.toFixed(2)}`, 10 * widthScale, 30 * heightScale, true);
    Renderer.drawString(`Pitch: ${facing.pitch.toFixed(2)}`, 10 * widthScale, 50 * heightScale, true);
    Renderer.drawString(
        `Position: X=${pos.x.toFixed(1)}, Y=${pos.y.toFixed(1)}, Z=${pos.z.toFixed(1)}`,
        10 * widthScale,
        70 * heightScale,
        true
    );

    // Path Information
    const path = getCurrentPath();
    const target = getTargetPoint();
    let pathColorPrefix = "";
    switch (getCurrentPathType()) {
        case "Primary":
            pathColorPrefix = "&f";
            break;
        case "Secondary":
            pathColorPrefix = "&9";
            break;
        case "Evacuation":
            pathColorPrefix = "&a";
            break;
        default:
            pathColorPrefix = "&7";
            break;
    }
    Renderer.drawString(
        `Path: ${path.length > 0 ? pathColorPrefix + getCurrentPathType() : "&cNone"}`,
        10 * widthScale,
        90 * heightScale,
        true
    );
    Renderer.drawString(
        `Current Point: ${
            path.length > 0 ? getCurrentIndex() + "/" + path.length : "&cN/A"
        }`,
        10 * widthScale,
        110 * heightScale,
        true
    );
    Renderer.drawString(
        `Target Location: X:${
            target.x || "&cN/A&r"
        }, Y:${target.y || "&cN/A&r"}, Z:${target.z || "&cN/A&r"}`,
        10 * widthScale,
        130 * heightScale,
        true
    );

    // Evacuation Path
    const EvacuationPath = getRunEvacuationPath();
    const EvacuationColorPrefix = EvacuationPath ? "&a" : "&c";
    Renderer.drawString(
        `${EvacuationColorPrefix}Evacuation: ${EvacuationPath ? "Enabled" : "Disabled"}`,
        10 * widthScale,
        150 * heightScale,
        true
    );

    // Log Level
    let logLevel = getCurrentLogLevel();
    logLevel = logLevel.charAt(0).toUpperCase() + logLevel.slice(1).toLowerCase();
    let logLevelColorPrefix = "";
    switch (logLevel) {
        case "Info":
            logLevelColorPrefix = "&f";
            break;
        case "Debug":
            logLevelColorPrefix = "&9";
            break;
        case "Warn":
            logLevelColorPrefix = "&e";
            break;
        case "Error":
            logLevelColorPrefix = "&c";
            break;
        default:
            logLevelColorPrefix = "&7";
            break;
    }
    Renderer.drawString(
        `${logLevelColorPrefix}Log Level: ${logLevel}`,
        10 * widthScale,
        170 * heightScale,
        true
    );

    // Draw Log Panel
    drawLogPanel(
        screenWidth - (410) * widthScale,
        30 * heightScale,
        400 * widthScale,
        200 * heightScale
    );

    // Draw Current Area
    const currentArea = getCurrentArea();
    let areaColorPrefix = "";
    switch (currentArea) {
        case "Garden":
            areaColorPrefix = "&2";
            break;
        case "Hub":
            areaColorPrefix = "&6";
            break;
        default:
            areaColorPrefix = "&r";
            break;
    }
    Renderer.drawString(
        `${areaColorPrefix}Area: ${currentArea}`,
        screenWidth - Renderer.getStringWidth(`Area: ${currentArea}`) - 5,
        screenHeight - (53) * heightScale,
        true
    );

    // Pest Count
    const pestCount = getPestCount();
    const minPestCount = getMinPestCount();
    const pestColorPrefix = pestCount >= minPestCount ? "&c" : "&a";
    Renderer.drawString(
        `${pestColorPrefix}Pest Count: ${pestCount} / ${minPestCount}`,
        screenWidth - Renderer.getStringWidth(`Pest Count: ${pestCount} / ${minPestCount}`) - 5,
        screenHeight - (43) * heightScale,
        true
    );

    // Reapply Pest Repellent
    const reapplyPestRepellent = getReapplyPestRepellent();
    const reapplyColorPrefix = reapplyPestRepellent ? "&a" : "&c";
    Renderer.drawString(
        `${reapplyColorPrefix}Reapply Repellent: ${reapplyPestRepellent}`,
        screenWidth - Renderer.getStringWidth(`${reapplyColorPrefix}Reapply Repellent: ${reapplyPestRepellent}`) - 5,
        screenHeight - (33) * heightScale,
        true
    );

    // Formatted Time
    const formattedTime = getFormattedTimestamp();
    Renderer.drawString(
        formattedTime,
        screenWidth - Renderer.getStringWidth(formattedTime) - 5,
        screenHeight - (23) * heightScale,
        true
    );

    // Draw Pest Repellent Timer
    const pestRepellentTimer = getPestRepellentTimer();
    let pestRepellentColorPrefix = "";
    switch (ChatLib.removeFormatting(pestRepellentTimer)) {
        case "Not Enabled":
            pestRepellentColorPrefix = "&8";
            break;
        case "None":
            pestRepellentColorPrefix = "&c";
            break;
        default:
            pestRepellentColorPrefix = "&a";
            break;
    }

    Renderer.drawString(
        `${pestRepellentColorPrefix}Pest Repellent: ${pestRepellentTimer}`,
        screenWidth - Renderer.getStringWidth(`${pestRepellentColorPrefix}Pest Repellent: ${pestRepellentTimer}`) - 5,
        screenHeight - (13) * heightScale,
        true
    );

    // Now handle each button's scaled draw
    buttons.forEach((button) => {
        // Compute scaled dimensions based on current screen size
        const scaledX = button.baseX * widthScale;
        const scaledY = button.baseY * heightScale;
        const scaledW = button.baseWidth * widthScale;
        const scaledH = button.baseHeight * heightScale;

        // Draw the button background
        Renderer.drawRect(
            Renderer.color(50, 50, 50, 200),
            scaledX,
            scaledY,
            scaledW,
            scaledH
        );

        // Button label:
        const keyBindDescription = getDescriptionByKeyBind(button.keyBind) || getNameByKeyBind(button.keyBind);

        /**
         * Slight offset for text so it's drawn near the center.
         * You can fine-tune text centering as you like.
         */
        const textX = scaledX + scaledW / 2 - (Renderer.getStringWidth(button.label) / 2);
        const textY = scaledY + (scaledH / 2 - 4); // half the button height minus half the font height

        Renderer.drawString(
            `${keyBindDescription} = ${button.label}`,
            textX,
            textY,
            true
        );
    });
});

/**
 * Draws the player's inventory in the GUI, replicating the Minecraft inventory style.
 * Adds white lines between slots for better visibility.
 * @param {number} x - The top-left x-coordinate (scaled).
 * @param {number} y - The top-left y-coordinate (scaled).
 */
function drawInventory(x, y) {
    const inventory = Player.getInventory().getItems();

    // Single-dimension scale for slot size
    const slotSize = 36 * (widthScale + heightScale) / 2; 
    const rows = 4; // Rows of the inventory grid
    const cols = 9; // Columns of the inventory grid

    // Draw slots and items
    inventory.forEach((item, index) => {
        let col = (index % cols) - 1;
        if (index > 35) {
            col = -2;
        }
        let row = Math.floor(index / cols);
        if (index < 9) {
            row = 4;
        } else if (index > 35) {
            row = 5 - (index - 35);
        }

        const slotX = (x + (col + 1) * slotSize);
        const slotY = (y + (row - 1) * slotSize);

        // Draw slot background
        Renderer.drawRect(
            Renderer.color(50, 50, 50, 200),
            slotX,
            slotY,
            slotSize,
            slotSize
        );

        // Draw item icon if present
        if (item) {
            item.draw(
                (slotX - slotSize) + slotSize / 0.9,
                slotY + slotSize / 7.4,
                1.8 * (Math.sqrt(widthScale * heightScale))
            );
        }
    });

    // Draw grid lines
    const gridColor = Renderer.color(255, 255, 255, 150);
    for (let row = 0; row <= rows; row++) {
        Renderer.drawLine(
            gridColor,
            x - slotSize,
            y + row * slotSize,
            x + cols * slotSize,
            y + row * slotSize,
            2 * Math.sqrt(widthScale * heightScale)
        );
    }
    for (let col = -1; col <= cols; col++) {
        Renderer.drawLine(
            gridColor,
            x + col * slotSize,
            y,
            x + col * slotSize,
            y + rows * slotSize,
            2 * Math.sqrt(widthScale * heightScale)
        );
    }

    // Highlight the hotbar's currently held item
    const heldIndex = Player.getHeldItemIndex();
    Renderer.drawRect(
        Renderer.color(0, 255, 0, 150),
        x + heldIndex * slotSize,
        y + 3 * slotSize,
        slotSize,
        slotSize
    );

    // Handle hovering
    const mouseX = Client.getMouseX();
    const mouseY = Client.getMouseY();

    inventory.forEach((item, index) => {
        let col = (index % cols) - 1;
        if (index > 35) {
            col = -2;
        }
        let row = Math.floor(index / cols);
        if (index < 9) {
            row = 4;
        } else if (index > 35) {
            row = 5 - (index - 35);
        }

        const slotX = x + (col + 1) * slotSize;
        const slotY = y + (row - 1) * slotSize;

        if (
            mouseX >= slotX &&
            mouseX <= slotX + slotSize &&
            mouseY >= slotY &&
            mouseY <= slotY + slotSize
        ) {
            // Highlight hovered slot
            Renderer.drawRect(
                Renderer.color(255, 255, 255, 100),
                slotX,
                slotY,
                slotSize,
                slotSize
            );

            // Show item name as tooltip
            if (item) {
                Tessellator.pushMatrix(); // Save the current matrix state
                Tessellator.translate(0, 0, 500); // Move the tooltip to a higher z-index
                Renderer.drawString(item.getName(), mouseX + 5, mouseY + 5, true);
                Tessellator.popMatrix(); // Restore the original matrix state
            }
        }
    });
}

function drawLogPanel(x, y, width, height) {
    const logMessages = getLogMessages().slice().reverse();
    const lineHeight = 15 * (Math.sqrt(widthScale * heightScale)/1.2); // Approx. scaled line height
    const maxLines = Math.floor(((height-15) / lineHeight) / (Math.sqrt(widthScale * heightScale)/1.2))-1;

    // Draw panel background
    Renderer.drawRect(Renderer.color(255, 255, 255, 30), x, y, width, height);

    // Title
    Renderer.drawString("Log Messages", x + width / 2.5, y + 5, true);

    let renderedLines = [];
    let currentLineCount = 0;

    // Process log messages into lines until maxLines is reached
    for (let i = 0; i < logMessages.length && currentLineCount < maxLines; i++) {
        const message = logMessages[i].replace(/&[0-9a-fklmnor]/g, "");
        const formattedMessage = ChatLib.removeFormatting(message);
        const timestampRegex = /^\[\d{2}\/\d{2}\/\d{4} - \d{2}:\d{2}:\d{2}\]/;
        const cleanedMessage = formattedMessage.replace(timestampRegex, "").trim();
        const maxWidth = width / (Math.sqrt(widthScale * heightScale)/1.2);
        let words = cleanedMessage.split(" ");
        let currentLine = "";

        words.forEach((word) => {
            const testLine = currentLine + word + " ";
            if (Renderer.getStringWidth(testLine) > maxWidth) {
                if (currentLineCount < maxLines) {
                    renderedLines.push(currentLine.trim());
                    currentLineCount++;
                }
                currentLine = word + " ";
            } else {
                currentLine = testLine;
            }
        });

        if (currentLine.trim().length > 0 && currentLineCount < maxLines) {
            renderedLines.push(currentLine.trim());
            currentLineCount++;
        }
    }

    // Render the lines
    renderedLines.forEach((line, index) => {
        const currentY = ((y + 20)/(Math.sqrt(widthScale * heightScale)/1.2)) + index * lineHeight;
        Renderer.scale(Math.sqrt(widthScale * heightScale)/1.2);
        Renderer.drawString(line, (x/(Math.sqrt(widthScale * heightScale)/1.2)) + 5, currentY, true);
    });
}

export function toggleBotGui() {
    if (!getGuiVisible()) {
        let unboundButtons = new Set();
        buttons
            .filter((button) => !button.keyBind || button.keyBind.getKeyCode() == 0)
            .forEach((button) => {
                unboundButtons.add(button.keyBind.getDescription());
            });
        if (unboundButtons.size > 0) {
            const warningMessage = `The following keybind(s) are not set: ${[
                ...unboundButtons
            ].join(", ")}.\nIt will be difficult to control the bot without them.`;
            const warningGui = createWarningGui(warningMessage);
            warningGui.open();
        }
    }
    logDebug("Toggling GUI visibility.");
    ChatLib.clearChat();
    toggleGuiVisible();
}

register("gameLoad", () => {
    let unboundButtons = new Set();
    buttons
        .filter((button) => !button.keyBind || button.keyBind.getKeyCode() == 0)
        .forEach((button) => {
            unboundButtons.add(button.keyBind.getDescription());
        });
    if (unboundButtons.size > 0) {
        const warningMessage = `The following keybind(s) are not set: ${[
            ...unboundButtons
        ].join(", ")}.\nIt will be difficult to control the bot without them.`;
        const warningGui = createWarningGui(warningMessage);
        warningGui.open();
    }
});

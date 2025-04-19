// Declare external classes and modules
const JFileChooser = Java.type("javax.swing.JFileChooser");
const FileReader = Java.type("java.io.FileReader");
const BufferedReader = Java.type("java.io.BufferedReader");
const FileWriter = Java.type("java.io.FileWriter");
const BufferedWriter = Java.type("java.io.BufferedWriter");
let Thread = Java.type("java.lang.Thread");

import { getKeyFromKeyBindDescription } from "../core/keyBinds.js";
import { logDebug } from "../core/logger.js";
import { savePaths, loadPaths } from "../path/pathConfig.js";

// Global scrollOffset variable to track the first visible point index
let scrollOffset = 0;

let pathConfig = loadPaths();
let activeTab = Object.keys(pathConfig)[0]; // Default active tab

export function openPathGui() {
    const gui = new Gui();

    // Reset the active tab and scroll offset on GUI open
    activeTab = Object.keys(pathConfig)[0];
    scrollOffset = 0;

    gui.registerDraw(() => {
        let screenWidth = Renderer.screen.getWidth();
        let screenHeight = Renderer.screen.getHeight();
        let guiWidth = screenWidth * 0.8;
        let guiHeight = screenHeight * 0.8;
        let guiX = guiWidth / 8;  // left margin
        let guiY = guiHeight / 8; // top margin

        // Draw GUI background
        Renderer.drawRect(Renderer.color(0, 0, 0, 175), guiX, guiY, guiWidth, guiHeight);

        // Calculate scaling (use ** for exponentiation)
        let guiScale = Math.sqrt(screenWidth ** 2 + screenHeight ** 2) / Math.sqrt(473 ** 2 + 854 ** 2);

        // Layout sizes for points
        let pointSizeY = Math.floor(guiHeight / 12);
        let pointSizeX = Math.floor(guiWidth / 12);
        // Determine max visible points (adjust formula as desired)
        let maxPoints = Math.floor(((guiHeight * 0.8) / pointSizeY) / 1.2);

        // ---- Draw Tabs ----
        let tabNames = Object.keys(pathConfig);
        let tabWidth = (guiWidth / tabNames.length) / 3;
        let tabHeight = guiHeight / 12;
        for (let i = 0; i < tabNames.length; i++) {
            let tabName = tabNames[i];
            let tabX = guiX + (i * tabWidth * 1.1) + (guiWidth / 64);
            let tabY = guiY + (guiHeight / 40);
            if (tabName === activeTab) {
                Renderer.drawRect(Renderer.color(0, 200, 255, 255), tabX, tabY, tabWidth, tabHeight);
            } else {
                Renderer.drawRect(Renderer.color(0, 200, 255, 100), tabX, tabY, tabWidth, tabHeight);
            }
            scaledStringDraw(guiScale, ` ${tabName}`, tabX, tabY + tabHeight / 3);
        }

        // ---- Draw Import/Export Buttons ----
        let portName = ["Import", "Export"];
        let portWidth = (guiWidth / portName.length) / 6;
        let portHeight = guiHeight / 12;
        for (let i = 0; i < portName.length; i++) {
            let portX = guiWidth - (i * portWidth * 1.1) + (guiWidth / 32);
            let portY = guiY + (guiHeight / 40);
            Renderer.drawRect(
                portName[i] === "Import" ? Renderer.color(200, 0, 0, 200) : Renderer.color(0, 200, 0, 200),
                portX,
                portY,
                portWidth,
                portHeight
            );
            scaledStringDraw(guiScale, ` ${portName[i]}`, portX, portY + portHeight / 3);
        }

        // ---- Draw Add Point Button ----
        let addPointWidth = (guiWidth / 2) / 13;
        let addPointHeight = guiHeight / 12;
        let addPointX = guiWidth - (portWidth * 1.2) + (guiWidth / 32) - addPointWidth;
        let addPointY = guiY + (guiHeight / 40);
        Renderer.drawRect(Renderer.color(0, 0, 255, 200), addPointX, addPointY, addPointWidth, addPointHeight);
        scaledStringDraw(guiScale, `  +`, addPointX, addPointY + addPointHeight / 3);

        // ---- Draw Path Points (with scrolling) ----
        let totalPoints = pathConfig[activeTab].length;
        let visiblePoints = Math.min(maxPoints, totalPoints);
        // Loop only through the visible slice
        for (let i = 0; i < visiblePoints; i++) {
            let actualIndex = i + scrollOffset;
            if (actualIndex >= totalPoints) break;
            let yOffset = i * pointSizeY * 1.2;
            let pointObj = pathConfig[activeTab][actualIndex] || { x: "None", y: "None", z: "None" };

            // Draw background for the point row
            Renderer.drawRect(
                Renderer.color(100, 100, 100, 220),
                (guiX * 1.2) - (guiWidth / 96),
                guiHeight / 4 + yOffset - (pointSizeY / 20),
                guiWidth - (guiWidth / 20) + (guiWidth / 96),
                pointSizeY + (pointSizeY / 10)
            );
            // Draw three sub-rectangles for X, Y, Z
            Renderer.drawRect(Renderer.color(0, 200, 255, 220), (guiX * 1.2), guiHeight / 4 + yOffset, pointSizeX, pointSizeY);
            Renderer.drawRect(Renderer.color(0, 200, 255, 220), (guiX * 1.2) + pointSizeX * 1.2, guiHeight / 4 + yOffset, pointSizeX, pointSizeY);
            Renderer.drawRect(Renderer.color(0, 200, 255, 220), (guiX * 1.2) + pointSizeX * 2.4, guiHeight / 4 + yOffset, pointSizeX, pointSizeY);
            // Draw the X, Y, Z labels
            scaledStringDraw(guiScale, ` X: ${pointObj.x}`, (guiX * 1.2), guiHeight / 4 + yOffset + pointSizeY / 3);
            scaledStringDraw(guiScale, ` Y: ${pointObj.y}`, (guiX * 1.2) + pointSizeX * 1.2, guiHeight / 4 + yOffset + pointSizeY / 3);
            scaledStringDraw(guiScale, ` Z: ${pointObj.z}`, (guiX * 1.2) + pointSizeX * 2.4, guiHeight / 4 + yOffset + pointSizeY / 3);

            // ---- Draw Movement Buttons (Forward, Left, Back, Right) ----
            let moveButtonWidth = pointSizeX / 1.2;
            let moveButtonHeight = pointSizeY / 1.2;
            let moveButtonX = (guiX * 1.2) + pointSizeX * 3.6;
            let moveButtonY = guiHeight / 4 + yOffset + (guiHeight / 12) / 8;
            let moveButtons = ["forward", "left", "back", "right"];
            for (let j = 0; j < moveButtons.length; j++) {
                let color = pointObj.forcedKeys && pointObj.forcedKeys.includes(moveButtons[j])
                    ? Renderer.color(0, 0, 160, 200)
                    : Renderer.color(60, 60, 60, 200);
                Renderer.drawRect(color, moveButtonX, moveButtonY, moveButtonWidth, moveButtonHeight);
                scaledStringDraw(guiScale, ` ${getKeyFromKeyBindDescription("key." + moveButtons[j])}`, moveButtonX + moveButtonWidth / 3, moveButtonY + moveButtonHeight / 3);
                moveButtonX += moveButtonWidth * 1.2;
            }
            
            // ---- Draw Arrow Buttons (Up/Down for reordering) ----
            let arrowButtonWidth = pointSizeX / 1.2;
            let arrowButtonHeight = pointSizeY / 1.2;
            let arrowButtonX = guiWidth - (pointSizeX * 1.2);
            let arrowButtonY = guiHeight / 4 + yOffset + (guiHeight / 12) / 8;
            Renderer.drawRect(Renderer.color(60, 60, 60, 200), arrowButtonX, arrowButtonY, arrowButtonWidth, arrowButtonHeight);
            scaledStringDraw(guiScale, ` ↑`, arrowButtonX + arrowButtonWidth / 3, arrowButtonY + arrowButtonHeight / 3);
            arrowButtonX += arrowButtonWidth * 1.2;
            Renderer.drawRect(Renderer.color(60, 60, 60, 200), arrowButtonX, arrowButtonY, arrowButtonWidth, arrowButtonHeight);
            scaledStringDraw(guiScale, ` ↓`, arrowButtonX + arrowButtonWidth / 3, arrowButtonY + arrowButtonHeight / 3);

            // ---- Draw Delete Button ----
            let deleteButtonWidth = pointSizeX / 3;
            let deleteButtonHeight = pointSizeY / 1.2;
            let deleteButtonX = guiWidth + (pointSizeX * 1.2) - deleteButtonWidth;
            let deleteButtonY = guiHeight / 4 + yOffset + (guiHeight / 12) / 8;
            Renderer.drawRect(Renderer.color(200, 0, 0, 200), deleteButtonX, deleteButtonY, deleteButtonWidth, deleteButtonHeight);
            scaledStringDraw(guiScale, `  X`, deleteButtonX, deleteButtonY + deleteButtonHeight / 3);
        }
        
        // ---- Draw Scrollbar on the Right Side of the GUI ----
        // Place the scrollbar 20 pixels from the right edge
        let scrollbarHeight = guiHeight/1.3;
        let scrollbarWidth = guiWidth / 80;
        let scrollbarX = guiX + guiWidth - scrollbarWidth - (guiWidth / 128);
        let scrollbarY = guiY + (guiHeight / 8);
        if (maxPoints < totalPoints) {
            drawScrollbar(scrollbarX, scrollbarY, scrollbarHeight, scrollbarWidth, scrollOffset, totalPoints, maxPoints);
        }
    });

    // ---- Register Scrolled Logic ----
    gui.registerScrolled((mouseX, mouseY, direction) => {
        let screenWidth = Renderer.screen.getWidth();
        let screenHeight = Renderer.screen.getHeight();
        let guiWidth = screenWidth * 0.8;
        let guiHeight = screenHeight * 0.8;
        // Determine the top-left corner of your GUI:
        let guiX = guiWidth / 8;
        let guiY = guiHeight / 8;
        if (mouseX >= guiX && mouseX <= guiX + guiWidth &&
            mouseY >= guiY && mouseY <= guiY + guiHeight) {
            let totalPoints = pathConfig[activeTab].length;
            let pointSizeY = Math.floor(guiHeight / 12);
            let maxPoints = Math.floor(((guiHeight * 0.8) / pointSizeY) / 1.2);
            let maxScroll = Math.max(0, totalPoints - maxPoints);
            scrollOffset = Math.max(0, Math.min(maxScroll, scrollOffset - direction));
        }
    });

    // ---- Register Clicked Logic ----
    gui.registerClicked((mouseX, mouseY, button) => {
        let screenWidth = Renderer.screen.getWidth();
        let screenHeight = Renderer.screen.getHeight();
        let guiWidth = screenWidth * 0.8;
        let guiHeight = screenHeight * 0.8;
        let guiX = guiWidth / 8;
        let guiY = guiHeight / 8;
        let pointSizeY = Math.floor(guiHeight / 12);
        let pointSizeX = Math.floor(guiWidth / 12);
        let maxPoints = Math.floor(((guiHeight * 0.8) / pointSizeY) / 1.2);
        let totalPoints = pathConfig[activeTab].length;
        let visiblePoints = Math.min(maxPoints, totalPoints);

        // --- Process Tab Clicks ---
        let tabNames = Object.keys(pathConfig);
        let tabWidth = (guiWidth / tabNames.length) / 3;
        let tabHeight = guiHeight / 12;
        for (let i = 0; i < tabNames.length; i++) {
            let tabName = tabNames[i];
            let tabX = guiX + (i * tabWidth * 1.1) + (guiWidth / 64);
            let tabY = guiY + (guiHeight / 40);
            if (mouseX >= tabX && mouseX <= tabX + tabWidth &&
                mouseY >= tabY && mouseY <= tabY + tabHeight) {
                activeTab = tabName;
                scrollOffset = 0; // Reset scroll offset when changing tabs
                logDebug(`Active Tab: ${activeTab}`);
            }
        }

        // --- Process Import/Export Button Clicks ---
        let portName = ["Import", "Export"];
        let portWidth = (guiWidth / portName.length) / 6;
        let portHeight = guiHeight / 12;
        for (let i = 0; i < portName.length; i++) {
            let portX = guiWidth - (i * portWidth * 1.1) + (guiWidth / 32);
            let portY = guiY + (guiHeight / 40);
            if (mouseX >= portX && mouseX <= portX + portWidth &&
                mouseY >= portY && mouseY <= portY + portHeight) {
                if (portName[i] === "Import") {
                    importPathConfig();
                    logDebug("Importing paths...");
                } else if (portName[i] === "Export") {
                    exportPathConfig();
                    logDebug("Exporting paths...");
                }
            }
        }

        // --- Process Add Point Button Click ---
        let addPointWidth = (guiWidth / 2) / 13;
        let addPointHeight = guiHeight / 12;
        let addPointX = guiWidth - (portWidth * 1.2) + (guiWidth / 32) - addPointWidth;
        let addPointY = guiY + (guiHeight / 40);
        if (mouseX >= addPointX && mouseX <= addPointX + addPointWidth &&
            mouseY >= addPointY && mouseY <= addPointY + addPointHeight) {
            pathConfig[activeTab].push({
                x: Math.floor(Player.getX()),
                y: Math.floor(Player.getY()),
                z: Math.floor(Player.getZ()),
                forcedKeys: []
            });
            scrollOffset = Math.max(0, pathConfig[activeTab].length - maxPoints);
            logDebug(`Added point to ${activeTab} path. Total now: ${pathConfig[activeTab].length}`);
        }

        // --- Process Delete Button Clicks ---
        for (let i = 0; i < visiblePoints; i++) {
            let actualIndex = i + scrollOffset;
            let yOffset = i * pointSizeY * 1.2;
            let deleteButtonWidth = pointSizeX / 3;
            let deleteButtonHeight = pointSizeY / 1.2;
            let deleteButtonX = guiWidth + (pointSizeX * 1.2) - deleteButtonWidth;
            let deleteButtonY = guiHeight / 4 + yOffset + (guiHeight / 12) / 8;
            if (mouseX >= deleteButtonX && mouseX <= deleteButtonX + deleteButtonWidth &&
                mouseY >= deleteButtonY && mouseY <= deleteButtonY + deleteButtonHeight) {
                pathConfig[activeTab].splice(actualIndex, 1);
                break;
            }
        }

        // --- Process Movement Button Clicks ---
        let moveButtons = ["forward", "left", "back", "right"];
        for (let i = 0; i < visiblePoints; i++) {
            let actualIndex = i + scrollOffset;
            let yOffset = i * (guiHeight / 12) * 1.2;
            let moveButtonWidth = (guiWidth / 12) / 1.2;
            let moveButtonHeight = (guiHeight / 12) / 1.2;
            let moveButtonX = (guiX * 1.2) + (guiWidth / 12) * 3.6;
            let moveButtonY = guiHeight / 4 + yOffset + (guiHeight / 12) / 8;
            for (let j = 0; j < moveButtons.length; j++) {
                if (mouseX >= moveButtonX && mouseX <= moveButtonX + moveButtonWidth &&
                    mouseY >= moveButtonY && mouseY <= moveButtonY + moveButtonHeight) {
                    let point = pathConfig[activeTab][actualIndex];
                    if (point) {
                        if (point.forcedKeys.includes(moveButtons[j])) {
                            point.forcedKeys.splice(point.forcedKeys.indexOf(moveButtons[j]), 1);
                        } else {
                            point.forcedKeys.push(moveButtons[j]);
                        }
                        logDebug(`Toggled ${moveButtons[j]} for point ${actualIndex} in ${activeTab} path.`);
                    }
                }
                moveButtonX += moveButtonWidth * 1.2;
            }
        }

        // --- Process Arrow Button Clicks (for reordering points) ---
        let arrowButtonWidth = (guiWidth / 12) / 1.2;
        let arrowButtonHeight = (guiHeight / 12) / 1.2;
        for (let i = 0; i < visiblePoints; i++) {
            let actualIndex = i + scrollOffset;
            let yOffset = i * (guiHeight / 12) * 1.2;
            let arrowButtonX = guiWidth - (guiWidth / 12) * 1.2;
            let arrowButtonY = guiHeight / 4 + yOffset + (guiHeight / 12) / 8;
            let arrowButtons = ["↑", "↓"];
            for (let j = 0; j < arrowButtons.length; j++) {
                if (mouseX >= arrowButtonX && mouseX <= arrowButtonX + arrowButtonWidth &&
                    mouseY >= arrowButtonY && mouseY <= arrowButtonY + arrowButtonHeight) {
                    if (arrowButtons[j] === "↑" && actualIndex > 0) {
                        let temp = pathConfig[activeTab][actualIndex - 1];
                        pathConfig[activeTab][actualIndex - 1] = pathConfig[activeTab][actualIndex];
                        pathConfig[activeTab][actualIndex] = temp;
                    } else if (arrowButtons[j] === "↓" && actualIndex < pathConfig[activeTab].length - 1) {
                        let temp = pathConfig[activeTab][actualIndex + 1];
                        pathConfig[activeTab][actualIndex + 1] = pathConfig[activeTab][actualIndex];
                        pathConfig[activeTab][actualIndex] = temp;
                    }
                    logDebug(`Swapped point ${actualIndex} in ${activeTab} path using arrow ${arrowButtons[j]}.`);
                }
                arrowButtonX += arrowButtonWidth * 1.2;
            }
        }
    });

    gui.registerClosed(() => {
        savePaths(pathConfig);
    });

    gui.open();
}


/**
 * Imports path configuration from a JSON file.
 */
function importPathConfig() {
    new Thread(function() {
        var fileChooser = new JFileChooser();
        var result = fileChooser.showOpenDialog(null);
        if (result === JFileChooser.APPROVE_OPTION) {
            try {
                var file = fileChooser.getSelectedFile();
                var br = new BufferedReader(new FileReader(file));

                var stringBuilder = new java.lang.StringBuilder();
                var line;
                while ((line = br.readLine()) != null) {
                    stringBuilder.append(line);
                }
                br.close();

                var fileContent = stringBuilder.toString();
                var jsonData = JSON.parse(fileContent);
                pathConfig = jsonData;
            } catch (e) {
                ChatLib.chat("Error importing data: " + e.message);
            }
        }
    }).start();
}


/**
 * Exports path configuration to a JSON file.
 */
function exportPathConfig() {
    new Thread(function() {
        var fileChooser = new JFileChooser();
        var result = fileChooser.showSaveDialog(null);
        if (result === JFileChooser.APPROVE_OPTION) {
            try {
                var file = fileChooser.getSelectedFile();
                var bw = new BufferedWriter(new FileWriter(file));
                bw.write(JSON.stringify(pathConfig, null, 2));
                bw.close();
                ChatLib.chat("File saved to " + file.getAbsolutePath());
            } catch (e) {
                ChatLib.chat("Error writing JSON: " + e);
            }
        }
    }).start();
}

function scaledStringDraw(scale, string, x, y) {
    Renderer.scale(scale);
    Renderer.drawString(string, x / scale, y / scale, true);
}

/**
 * Draws a vertical scroll bar.
 * @param {number} x - The x coordinate for the scroll bar track.
 * @param {number} y - The y coordinate for the top of the scroll bar.
 * @param {number} height - The height of the scroll bar track.
 * @param {number} scrollOffset - The current scroll offset.
 * @param {number} totalItems - Total items in the list.
 * @param {number} maxVisible - Maximum number of visible items.
 */
function drawScrollbar(x, y, height, scrollbarWidth, scrollOffset, totalItems, maxVisible) {
    let totalScrollSteps = Math.max(1, totalItems - maxVisible);
    // Thumb height proportional to fraction visible (with a minimum size)
    let thumbHeight = height * (maxVisible / totalItems);
    thumbHeight = Math.max(20, thumbHeight);
    let thumbTravel = height - thumbHeight;
    let ratio = totalScrollSteps > 0 ? scrollOffset / totalScrollSteps : 0;
    let thumbY = y + ratio * thumbTravel;
    // Draw the track
    Renderer.drawRect(Renderer.color(50, 50, 50, 180), x, y, scrollbarWidth, height);
    // Draw the thumb
    Renderer.drawRect(Renderer.color(150, 150, 150, 180), x, thumbY, scrollbarWidth, thumbHeight);
}

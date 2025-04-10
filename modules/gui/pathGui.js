// Import Network Functions
import { logDebug } from "../core/logger.js";
import { savePaths, loadPaths } from "../path/pathConfig.js";

const JFileChooser = Java.type("javax.swing.JFileChooser");
const FileReader   = Java.type("java.io.FileReader");
const BufferedReader = Java.type("java.io.BufferedReader");
const FileWriter   = Java.type("java.io.FileWriter");
const BufferedWriter = Java.type("java.io.BufferedWriter");
let Thread         = Java.type("java.lang.Thread");

// =================== PATH GUI ===================
export function openPathGui() {
    const gui = new Gui();

    // Load Saved Path Points
    let pathConfig = loadPaths();
    let activeTab = "Primary"; // Active tab ("Primary" or "Secondary")
    let scrollOffset = 0; // Scroll position for the active tab

    const maxVisiblePoints = 7; // Number of points visible at a time
    const pointHeight = 40; // Height of each point in the list

    const guiX = 120, guiY = 30, guiWidth = 600, guiHeight = 400;

    // Register Scroll Logic
    gui.registerScrolled((mouseX, mouseY, direction) => {
        if (mouseX >= guiX && mouseX <= guiX + guiWidth && mouseY >= guiY && mouseY <= guiY + guiHeight) {
            const maxScroll = Math.max(0, pathConfig[activeTab].length - maxVisiblePoints);
            scrollOffset = Math.max(0, Math.min(maxScroll, scrollOffset - direction));
        }
    });

    // Register Mouse Click Logic
    gui.registerClicked((mouseX, mouseY) => {
        // Check Tab Clicks
        if (isButtonClicked(mouseX, mouseY, guiX + 10, guiY + 10, 100, 30)) {
            activeTab = "Primary";
            scrollOffset = 0;
        } else if (isButtonClicked(mouseX, mouseY, guiX + 120, guiY + 10, 100, 30)) {
            activeTab = "Secondary";
            scrollOffset = 0;
        } else if (isButtonClicked(mouseX, mouseY, guiX + 230, guiY + 10, 100, 30)) {
            activeTab = "Evacuation";
            scrollOffset = 0;
        } 

        // Check Add Point Button Click
        if (isButtonClicked(mouseX, mouseY, guiX + 10, guiY + 50, 100, 30)) {
            pathConfig[activeTab].push({
                x: Math.round(Player.getX()),
                y: Math.round(Player.getY()),
                z: Math.round(Player.getZ()),
            });
            scrollOffset = Math.max(0, pathConfig[activeTab].length - maxVisiblePoints);
        }

        // Check Scroll Up Button Click
        if (isButtonClicked(mouseX, mouseY, guiX + 120, guiY + 50, 30, 30)) {
            if (scrollOffset > 0) scrollOffset--;
        }

        // Check Scroll Down Button Click
        if (isButtonClicked(mouseX, mouseY, guiX + 160, guiY + 50, 30, 30)) {
            const maxScroll = Math.max(0, pathConfig[activeTab].length - maxVisiblePoints);
            if (scrollOffset < maxScroll) scrollOffset++;
        }

        // Check Move Up, Move Down, and Delete Button Clicks
        pathConfig[activeTab].slice(scrollOffset, scrollOffset + maxVisiblePoints).forEach((_, index) => {
            const yOffset = guiY + 100 + index * pointHeight;

            // Move Up Button
            if (isButtonClicked(mouseX, mouseY, guiX + 360, yOffset, 40, 30)) {
                const actualIndex = scrollOffset + index;
                if (actualIndex > 0) {
                    const temp = pathConfig[activeTab][actualIndex];
                    pathConfig[activeTab][actualIndex] = pathConfig[activeTab][actualIndex - 1];
                    pathConfig[activeTab][actualIndex - 1] = temp;
                }
            }

            // Move Down Button
            if (isButtonClicked(mouseX, mouseY, guiX + 410, yOffset, 50, 30)) {
                const actualIndex = scrollOffset + index;
                if (actualIndex < pathConfig[activeTab].length - 1) {
                    const temp = pathConfig[activeTab][actualIndex];
                    pathConfig[activeTab][actualIndex] = pathConfig[activeTab][actualIndex + 1];
                    pathConfig[activeTab][actualIndex + 1] = temp;
                }
            }

            // Delete Button
            if (isButtonClicked(mouseX, mouseY, guiX + 470, yOffset, 70, 30)) {
                pathConfig[activeTab].splice(scrollOffset + index, 1);
                maxScroll = Math.max(0, pathConfig[activeTab].length - maxVisiblePoints);
                scrollOffset = Math.min(scrollOffset, maxScroll);
            }
        });

        // Check Export Button Click
        if (isButtonClicked(mouseX, mouseY, guiX + 420, guiY + 10, 70, 30)) {
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

        // Check Import Button Click
        if (isButtonClicked(mouseX, mouseY, guiX + 500, guiY + 10, 70, 30)) {
            // Implement the import logic here (e.g., read from file or clipboard)
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

        // Check outside of the GUI
        if (mouseX < guiX || mouseX > guiX + guiWidth || mouseY < guiY || mouseY > guiY + guiHeight) {
            gui.close();
        }
    });

    // Register Drawing Logic
    gui.registerDraw(() => {
        Renderer.drawRect(Renderer.color(0, 0, 0, 180), guiX, guiY, guiWidth, guiHeight);

        // Draw Tabs
        drawButton(guiX + 10, guiY + 10, 100, 30, "Primary");
        drawButton(guiX + 120, guiY + 10, 100, 30, "Secondary");
        drawButton(guiX + 230, guiY + 10, 100, 30, "Evacuation");

        let guiXOffset = 0;
        if (activeTab === "Secondary") {
            guiXOffset = 120;
        } else if (activeTab === "Evacuation") {
            guiXOffset = 230;
        } else {
            guiXOffset = 10;
        }

        // Highlight Active Tab
        Renderer.drawRect(
            Renderer.color(0, 200, 0, 150),
            guiX + guiXOffset,
            guiY + 10,
            100,
            30
        );

        // Draw Path Points
        const activePoints = pathConfig[activeTab];
        activePoints.slice(scrollOffset, scrollOffset + maxVisiblePoints).forEach((point, index) => {
            const yOffset = guiY + 100 + index * pointHeight; // Add Spacing Buffer
            drawField(guiX + 20, yOffset, 70, 30, point.x);
            drawField(guiX + 105, yOffset, 70, 30, point.y);
            drawField(guiX + 190, yOffset, 70, 30, point.z);
            drawButton(guiX + 360, yOffset, 40, 30, "Up"); // Move Up
            drawButton(guiX + 410, yOffset, 50, 30, "Down"); // Move Down
            drawButton(guiX + 470, yOffset, 70, 30, "Delete"); // Delete
        });

        // Draw Scrollbar if there are more than maxVisiblePoints
        if (pathConfig[activeTab].length > maxVisiblePoints) {
            drawScrollbar(
                guiX + guiWidth - 20,
                guiY + 100,
                guiHeight - 150,
                scrollOffset,
                pathConfig[activeTab].length,
                maxVisiblePoints
            );
        }

        // Draw Buttons
        drawButton(guiX + 10, guiY + 50, 100, 30, "Add Point");
        drawButton(guiX + 120, guiY + 50, 30, 30, "↑");
        drawButton(guiX + 160, guiY + 50, 30, 30, "↓");
        drawButton(guiX + 420, guiY + 10, 70, 30, "Export"); 
        drawButton(guiX + 500, guiY + 10, 70, 30, "Import");
    });

    gui.registerClosed(() => {
        // Save the path configuration when the GUI is closed
        savePaths(pathConfig);
    });

    gui.open();
}

function isButtonClicked(mouseX, mouseY, x, y, width, height) {
    return mouseX >= x && mouseX <= x + width && mouseY >= y && mouseY <= y + height;
}

function drawButton(x, y, width, height, label) {
    Renderer.drawRect(Renderer.color(0, 100, 200, 180), x, y, width, height);
    Renderer.drawString(label, x + 10, y + 10);
}

function drawField(x, y, width, height, value) {
    Renderer.drawRect(Renderer.color(100, 100, 100, 180), x, y, width, height);
    Renderer.drawString(value.toString(), x + 5, y + 5);
}

function drawScrollbar(x, y, height, scrollOffset, totalPoints, maxVisiblePoints) {
    const totalScrollSteps = Math.max(1, totalPoints - maxVisiblePoints);
    const thumbHeight = Math.max(20, height / (totalScrollSteps + 1));
    const thumbY = y + (height - thumbHeight) * (scrollOffset / totalScrollSteps);

    Renderer.drawRect(Renderer.color(50, 50, 50, 180), x, y, 10, height);
    Renderer.drawRect(Renderer.color(150, 150, 150, 180), x, thumbY, 10, thumbHeight);
}

// main.js - Entry point for the ChatTriggers bot;

const File = Java.type("java.io.File");
if (!new File("./config/ChatTriggers/modules/FarmBot/").exists()) {
    ChatLib.chat(`&c!!!!!FarmBot appears to be miss named in your chat tiggers modules folder. Please rename it to FarmBot and run "/ct load"!!!!!`);
    throw new Error("Incorrect module name");
}


let folder = new File("./config/FarmBot/");
if (!folder.exists()) {
    folder.mkdirs();
}



import { getBotState, getIsFollowingPath, getCurrentPathType, updatePestRepellent, setReapplyPestRepellent, setCheckFailed, setMinPestCount } from "../core/globalVaribles";
import { inventoryChecker, resetInventoryChecker } from "../checkers/inventoryChecker";
import { resetYawPitchChecker, yawPitchChecker } from "../checkers/yawPitchChecker";
import { startPathFollowing, followPathStep } from "../path/pathManager";
import { resetToolChecker, toolChecker } from "../checkers/toolChecker";
import { pestChecker, resetPestChecker } from "../checkers/pestChecker";
import { logDebug, logError, logInfo } from "../core/logger";
import { updatePlayerArea } from "../player/playerManager";
import { checkPestRepellent } from "./pestRepellent";
import { openPathGui } from "../gui/pathGui";
import { toggleBotGui } from "../gui/botGui";
import { checkForUpdate } from "./autoUpdater";

checkForUpdate(); // Check for updates on module load

let lock1 = false;
let lock2 = false;

// Initialize ChatTriggers commands and events
register("command", (action) => {
    try {
        switch (action.toLowerCase()) {
            case "start":
                logInfo("Starting the bot...");
                startPathFollowing();
                break;
            case "pause":
                logInfo("Pausing the bot...");
                pauseBot();
                break;
            case "resume":
                logInfo("Resuming the bot...");
                resumeBot();
                break;
            case "stop":
                logInfo("Stopping the bot...");
                stopBot();
                break;
            default:
                logError("Invalid command. Use /bot [start|pause|resume|stop].");
        }
    } catch (e) {
        logError(`Error executing command: ${e.message}`);
    }
}).setName("bot");


// Open the bot GUI
register("command", () => {
    toggleBotGui();
}).setName("botgui")
    .setTabCompletions(["botgui"]);

// Open the path GUI
register("command", () => {
    openPathGui();
}).setName("pathgui")
    .setTabCompletions(["pathgui"]);

register("command", (minCount) => {
    setMinPestCount(parseInt(minCount));
    ChatLib.chat(`Minimum pest count set to ${minCount}`);
}).setName("minpestcount")
    .setTabCompletions(["minpestcount"]);

// Help command for ChatTriggers bot
register("command", () => {
    logInfo("Available commands:");
    logInfo("/botgui - Open the bot control GUI");
    logInfo("/pathgui - Open the path selection GUI");
    logInfo("/minpestcount [count] - Set the minimum pest count before playing an alarm");
    logInfo("/bot [start|pause|resume|stop] - Start, pause, resume, or stop the bot manually");
}).setName("bothelp")
    .setTabCompletions(["bothelp"]);

// Main bot logic
register("step", () => {
    try {
        updatePlayerArea();
        updatePestRepellent();
        if (getBotState() == "Running") {
            if (getIsFollowingPath()) {
                followPathStep();
            } else {
                logInfo("No path is currently being followed. Starting Primary path...");
                startPathFollowing(getCurrentPathType());
            }
        }
    } catch (e) {
        logError(`Error in step function: ${e.message}`);
    }
});

register("step", () => {
    try {
        updatePestRepellent();
        if (getBotState() == "Running") {
                checkPestRepellent();
            if (!lock1 && !lock2) {
                lock2 = true;
                setTimeout(() => {
                    logDebug("Resetting checkers...");
                    resetInventoryChecker();
                    resetToolChecker();
                    resetYawPitchChecker();
                    resetPestChecker();
                    lock1 = true;
                    setCheckFailed(false);
                    setTimeout( () => {setReapplyPestRepellent(true);} , 2000);
                }, 3000 + Math.random() * 2000);
            } else if (lock1 && lock2) {
                inventoryChecker();
                toolChecker();
                yawPitchChecker();
                pestChecker();
            }
        } else {
            lock1 = false;
            lock2 = false;
        }
    } catch (e) {
        logError(`Error in step function: ${e.message}`);
    }
}).setDelay(1);

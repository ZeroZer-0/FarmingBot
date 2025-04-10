import { getHeldItemName } from "../player/playerManager";
import { getCheckFailed, getCurrentArea, getRunEvacuationPath, setCheckFailed, setInitialTool, getInitialTool } from "../core/globalVaribles";
import { logError } from "../core/logger";
import { stopBot } from "../core/stateManager";
import { playAlarm } from "../checkers/alarm";
import { stopPathFollowing } from "../path/pathManager";

/**
 * Checks if the player's held tool has changed.
 */
export function toolChecker() {
    if (getCurrentArea() !== "Garden" || getCheckFailed()) return;
    const currentTool = ChatLib.removeFormatting(getHeldItemName());

    if (!getInitialTool()) {
        setInitialTool(currentTool);
        return;
    }

    if (currentTool !== getInitialTool()) {
        logError(`Tool mismatch detected. Started with: ${getInitialTool()}, now holding: ${currentTool}`);
        setCheckFailed(true);
        if (getRunEvacuationPath()) {
            stopPathFollowing();            
        } else {
            setTimeout( () => { stopBot(); }, Math.random() * 1500 + 500);
        }
        playAlarm();
    }
}

/**
 * Resets the initial tool state.
 */
export function resetToolChecker() {
    initialTool = ChatLib.removeFormatting(getHeldItemName());
}

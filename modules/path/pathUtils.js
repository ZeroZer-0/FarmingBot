// pathUtils.js - Helper functions for path management and movement calculations

import { getInitialTool } from "../core/globalVaribles";

/**
 * Determines the keys that cause the most dramatic movement in positive and negative X and Z directions.
 * @param {number} yaw - The player's current yaw angle in degrees.
 * @returns {Object} - Keys for positive and negative movements in X and Z directions.
 */
function yawToDirectionVector(yaw) {
    // Normalize yaw to [0, 360)
    yaw = (yaw % 360 + 360) % 360;

    // Convert yaw to radians (shifted by 90 degrees to match Minecraft orientation)
    const radians = (yaw + 90) * (Math.PI / 180);

    // Calculate directional vectors
    const forward_x = Math.cos(radians);
    const forward_z = Math.sin(radians);

    const backward_x = -forward_x;
    const backward_z = -forward_z;

    const left_x = -Math.cos(radians + Math.PI / 2);
    const left_z = -Math.sin(radians + Math.PI / 2);

    const right_x = -left_x;
    const right_z = -left_z;

    // Determine which key contributes the most to positive and negative X movement
    const xMovement = {
        positive: (() => {
            const contributions = {
                forward: forward_x,
                back: backward_x,
                left: left_x,
                right: right_x,
            };
            return Object.keys(contributions).reduce((a, b) =>
                contributions[a] > contributions[b] ? a : b
            );
        })(),
        negative: (() => {
            const contributions = {
                forward: forward_x,
                back: backward_x,
                left: left_x,
                right: right_x,
            };
            return Object.keys(contributions).reduce((a, b) =>
                contributions[a] < contributions[b] ? a : b
            );
        })(),
    };

    // Determine which key contributes the most to positive and negative Z movement
    const zMovement = {
        positive: (() => {
            const contributions = {
                forward: forward_z,
                back: backward_z,
                left: left_z,
                right: right_z,
            };
            return Object.keys(contributions).reduce((a, b) =>
                contributions[a] > contributions[b] ? a : b
            );
        })(),
        negative: (() => {
            const contributions = {
                forward: forward_z,
                back: backward_z,
                left: left_z,
                right: right_z,
            };
            return Object.keys(contributions).reduce((a, b) =>
                contributions[a] < contributions[b] ? a : b
            );
        })(),
    };

    return { x: xMovement, z: zMovement };
}

/**
 * Calculates the movement deltas needed to move from the current position to a target position.
 * @param {Object} currentPos - The current position ({x, y, z}).
 * @param {Object} targetPos - The target position ({x, y, z}).
 * @returns {Object} - A delta vector ({x, z}).
 */
export function calculateMovementDelta(currentPos, targetPos) {
    return {
        x: targetPos.x - currentPos.x,
        z: targetPos.z - currentPos.z,
    };
}

/**
 * Determines the best movement directions (e.g., forward, backward, left, right) to approach a target point.
 * @param {Object} delta - The movement delta ({x, z}).
 * @returns {Array<string>} - A list of movement directions (e.g., ["forward", "left"]).
 */
export function getMovementDirections(delta) {
    const yaw = Player.getYaw();
    const directions = yawToDirectionVector(yaw); // Get direction vectors based on yaw
    const movementDirections = [];

    // Normalize delta values to avoid precision issues
    const normX = delta.x;
    const normZ = delta.z;

    // Determine the best movement directions based on the delta vector
    if (normX > 0) movementDirections.push(directions.x.positive);
    else if (normX < 0) movementDirections.push(directions.x.negative);

    if (normZ > 0) movementDirections.push(directions.z.positive);
    else if (normZ < 0) movementDirections.push(directions.z.negative);
    
    return movementDirections;
}


/**
 * Calculates the distance between two points in 2D space (x, z).
 * @param {Object} point1 - The first point ({x, z}).
 * @param {Object} point2 - The second point ({x, z}).
 * @returns {number} - The Euclidean distance between the points.
 */
export function calculateDistance(point1, point2) {
    const deltaX = point2.x - point1.x;
    const deltaZ = point2.z - point1.z;
    return Math.sqrt(deltaX * deltaX + deltaZ * deltaZ);
}

/**
 * Checks if a player has reached a target point based on a given tolerance.
 * @param {Object} playerPos - The player's current position ({x, z}).
 * @param {Object} targetPos - The target position ({x, z}).
 * @param {number} tolerance - The distance tolerance (default: 0.5).
 * @returns {boolean} - True if the player is within the tolerance of the target point.
 */
export function hasReachedTarget(playerPos, targetPos, tolerance = 0.5) {
    return calculateDistance(playerPos, targetPos) <= tolerance;
}

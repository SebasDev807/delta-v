/**
 * Represents a 2D vector with x and y components.
 */

export interface Vector2D {
    x: number;
    y: number;
}
/**
 * Represents a celestial body in the simulation.
 */
export interface CelestialBody {
    name: string;
    mass: number;
    position: Vector2D;
    velocity: Vector2D;
    acceleration: Vector2D;
    color: string;
    radius: number;
}
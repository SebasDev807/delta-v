import {
    G,
    EARTH_MASS,
    EARTH_MOON_DISTANCE,
    EARTH_RADIUS, MOON_MASS,
    MOON_RADIUS
} from "../physics/constants";

import { velocityVerlet } from "../physics/integrator";
import type { CelestialBody } from "./CelestialBody";

/**
 * Representa el sistema gravitacional de la Tierra y la Luna.
 * 
 * @remarks
 * Inicializa ambos cuerpos en una orbita circular
 * idealizada alrededor de su baricentro.
 * 
 * 
 * No considera la influencia gravitacional del Sol ni de otros cuerpos celestes.
 * 
 */
export class Simulation {

    public readonly bodies: CelestialBody[];


    /**
     * Inicializa las posiciones y velocidades de la Tierra y la Luna en el sistema de referencia del baricentro.
     */
    constructor() {
        const totalMass = EARTH_MASS + MOON_MASS;
        const distance = EARTH_MOON_DISTANCE;

        //Distancias al baricentro
        const earthDistance = (MOON_MASS / totalMass) * distance;
        const moonDistance = (EARTH_MASS / totalMass) * distance;

        // Velocidad angular de la orbita circular
        const omega = Math.sqrt(
            (G * totalMass) / (distance ** 3)
        )

        console.log("Velocidad angular:", omega);
        console.log("Velocidad Tierra:", omega * earthDistance);
        console.log("Velocidad Luna:", omega * moonDistance);

        const earth: CelestialBody = {
            name: "Tierra",
            mass: EARTH_MASS,
            radius: EARTH_RADIUS,
            position: { x: -earthDistance, y: 0 },
            velocity: { x: 0, y: -omega * earthDistance },
            acceleration: { x: 0, y: 0 },
            color: "#3b82f6",
        }

        const moon: CelestialBody = {
            name: "Luna",
            mass: MOON_MASS,
            radius: MOON_RADIUS,
            position: { x: moonDistance, y: 0 },
            velocity: { x: 0, y: omega * moonDistance },
            acceleration: { x: 0, y: 0 },
            color: "#d1d5db",
        }

        this.bodies = [earth, moon];
    }

    /**
     * Avanza el sistema gravitacional de la Tierra y la Luna en un intervalo de tiempo dt
     * @param dt - Intervalo de integración en segundos
     * @returns no retorna nada
     */
    public update(dt: number): void {
        velocityVerlet(this.bodies, dt)
    }
}




































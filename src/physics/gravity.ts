import { G } from "./constants";
import type { CelestialBody, Vector2D } from "../simulation/CelestialBody";


/**
 * Calcula la aceleración gravitacional producida por un cuerpo
 * celeste sobre otro mediante la ley de gravitación de Newton.
 *
 * @param body - Cuerpo que experimenta la aceleración.
 * @param attractor - Cuerpo que genera el campo gravitacional.
 *
 * @returns Vector de aceleración en metros por segundo
 * al cuadrado (m/s²).
 *
 * @remarks
 * Implementa la expresión vectorial:
 *
 * a = G * M * r / |r|³
 *
 * Las posiciones deben expresarse en metros y las masas
 * en kilogramos.
 */
export const gravitationalAcceleration = (
    body: CelestialBody,
    attractor: CelestialBody
): Vector2D => {

    // Calcula la distancia entre los cuerpos
    const dx = attractor.position.x - body.position.x;
    const dy = attractor.position.y - body.position.y;

    // Calcula la distancia al cuadrado, necestario para la ley de gravitación universal
    const distanceSquared = dx * dx + dy * dy;

    if(distanceSquared === 0) {
        return { x: 0, y: 0 }; // Evita la división por cero si los cuerpos están en la misma posición
    }

    // Calcula la magnitud de la aceleración gravitacional usando la ley de gravitación universal
    const distance = Math.sqrt(distanceSquared);

    // Calcula el factor de aceleración gravitacional
    const factor = (G * attractor.mass) / (distanceSquared * distance);

    // Devuelve el vector de aceleración gravitacional
    return {
        x: factor * dx,
        y: factor * dy
    }

}
import type { CelestialBody, Vector2D } from "../simulation/CelestialBody";
import { gravitationalAcceleration } from "./gravity";

/**
 * Calcular la aceleracion gravitacional de cada cuerpo
 * mediante el principio de superposición, sumando las aceleraciones
 * 
 * @param bodies - Array de cuerpos celestes
 * 
 * @returns Array de vectores de aceleracion en m/s² para cada cuerpo celeste
 * 
 * @remarks
 * Cada cuerpo experimenta la suma vectorial de las
 * aceleraciones producidas por los demas cuerpos
 * 
 * El algoritmo tiene una complejidad de O(n^2).
 * No contempla colisiones ni relatividad general
 * 
 */

export const calculateAccelerations = (
    bodies: CelestialBody[]
): Vector2D[] => bodies.map((body, index) => {

    const total: Vector2D = { x: 0, y: 0 };

    // Itera sobre todos los cuerpos para calcular la aceleración gravitacional
    for (let i = 0; i < bodies.length; i++) {
        if (index === i) continue; // Un cuerpo no se atrae a sí mismo

        // Calcula la aceleración gravitacional producida por el cuerpo i sobre el cuerpo actual
        const acceleration = gravitationalAcceleration(
            body,
            bodies[i]
        );

        // Suma la aceleración al total acumulado
        total.x += acceleration.x;
        total.y += acceleration.y;
    }

    return total;

});


/**
 * Avanza la simulacion gravitacional de un intervalo de tiempo
 * mediante el metodo numerico de integracion Velocity Verlet
 * 
 * @param bodies - Cuerpos celestes que seran actualizados
 * @param dt - Intervalo de integracion en segundos
 * 
 * @throws Error - Si dt no es un numero positivo y finito
 * 
 * @remarks
 * El metodo utiliza las aceleraciones iniciales y finales
 * para actualizar la Velocidad
 * 
 * Es un integrador de segundo orden y es mas preciso que el metodo de Euler
 * 
 * No detecta colisiones ni adapta dt durante 
 * encuentros cercanos entre cuerpos.
 * 
 */
export const velocityVerlet = (
    bodies: CelestialBody[],
    dt: number
) => {

    if (!Number.isFinite(dt) || dt <= 0) {
        throw new Error("dt must be a positive finite number");
    }

    //1. Calcular las aceleraciones iniciales.
    const previousAccelerations = calculateAccelerations(bodies);

    //2. Actualizar todas las posiciones.
    for (let i = 0; i < bodies.length; i++) {
        const body = bodies[i];
        const acceleration = previousAccelerations[i];

        body.position.x +=
            body.velocity.x * dt +
            0.5 * acceleration.x * dt * dt;

        body.position.y +=
            body.velocity.y * dt +
            0.5 * acceleration.y * dt * dt;

    }
    // 3. Calcular aceleraciones en las nuevas posiciones.
    const nextAccelerations =
        calculateAccelerations(bodies);

    // 4. Actualizar velocidades y aceleraciones.
    for (let i = 0; i < bodies.length; i++) {
        const body = bodies[i];
        const previous = previousAccelerations[i];
        const next = nextAccelerations[i];

        body.velocity.x +=
            0.5 * (previous.x + next.x) * dt;

        body.velocity.y +=
            0.5 * (previous.y + next.y) * dt;

        body.acceleration = next;
    }


}

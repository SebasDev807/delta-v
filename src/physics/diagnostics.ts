
import { G } from "./constants";
import type {
  CelestialBody,
  Vector2D,
} from "../simulation/CelestialBody";

/**
 * Calcula la magnitud euclidiana de un vector bidimensional.
 *
 * @param vector - Vector expresado en unidades físicas coherentes.
 * @returns Magnitud del vector en las mismas unidades.
 */
export const magnitude = (vector: Vector2D): number => {
  return Math.hypot(vector.x, vector.y);
}

/**
 * Calcula la distancia entre dos cuerpos celestes.
 *
 * @param a - Primer cuerpo.
 * @param b - Segundo cuerpo.
 * @returns Distancia entre centros, en metros.
 */
export function distanceBetween(
  a: CelestialBody,
  b: CelestialBody
): number {
  return Math.hypot(
    b.position.x - a.position.x,
    b.position.y - a.position.y
  );
}

/**
 * Calcula la rapidez relativa entre dos cuerpos.
 *
 * @param a - Primer cuerpo.
 * @param b - Segundo cuerpo.
 * @returns Rapidez relativa en metros por segundo (m/s).
 */
export function relativeSpeed(
  a: CelestialBody,
  b: CelestialBody
): number {
  return Math.hypot(
    b.velocity.x - a.velocity.x,
    b.velocity.y - a.velocity.y
  );
}

/**
 * Calcula la energía mecánica total del sistema gravitacional.
 *
 * @param bodies - Conjunto de cuerpos celestes.
 * @returns Energía mecánica total en julios (J).
 *
 * @remarks
 * La energía total es la suma de la energía cinética
 * y la energía potencial gravitacional de cada pareja.
 *
 * E = Σ(1/2 m v²) - Σ(G m_i m_j / r_ij)
 *
 * Cada pareja se cuenta una sola vez para evitar
 * duplicar la energía potencial.
 *
 * No incluye energía de rotación de los cuerpos.
 *
 * @throws {Error}
 * Si dos cuerpos ocupan exactamente la misma posición.
 */
export function totalMechanicalEnergy(
  bodies: readonly CelestialBody[]
): number {
  let kinetic = 0;
  let potential = 0;

  for (let i = 0; i < bodies.length; i++) {
    const body = bodies[i];

    kinetic +=
      0.5 *
      body.mass *
      (body.velocity.x ** 2 + body.velocity.y ** 2);

    for (let j = i + 1; j < bodies.length; j++) {
      const other = bodies[j];
      const distance = distanceBetween(body, other);

      if (distance === 0) {
        throw new Error(
          "No se puede calcular la energía: distancia nula."
        );
      }

      potential -=
        (G * body.mass * other.mass) / distance;
    }
  }

  return kinetic + potential;
}

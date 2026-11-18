import type { Vector2D } from "../simulation/CelestialBody";

/**
 * Configuración de visualización de vectores físicos.
 *
 * @remarks
 * Las escalas modifican solamente la longitud de las
 * flechas en pantalla. No afectan las magnitudes físicas.
 */
export interface VectorDisplayOptions {
  /** Indica si se dibujan vectores de velocidad. */
  showVelocity: boolean;

  /** Indica si se dibujan vectores de aceleración. */
  showAcceleration: boolean;

  /**
   * Escala visual de velocidad, en píxeles por (m/s).
   */
  velocityScale: number;

  /**
   * Escala visual de aceleración, en píxeles por (m/s²).
   */
  accelerationScale: number;
}

/**
 * Valores vectoriales de referencia para visualización.
 *
 * @remarks
 * Permite mostrar vectores relativos a un cuerpo seguido
 * o vectores absolutos del sistema baricéntrico.
 */
export interface VectorReference {
  velocity: Vector2D;
  acceleration: Vector2D;
}

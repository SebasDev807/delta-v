import type { CelestialBody, Vector2D } from "../simulation/CelestialBody";
import type { VectorDisplayOptions, VectorReference } from "./interfaces";

/**
 * Configuración de cámara para transformar coordenadas físicas
 * del mundo (metros) en coordenadas visuales de pantalla (píxeles).
 */
export interface CameraOptions {
  /**
   * Punto del espacio físico que será colocado en el centro visual
   * de la pantalla.
   *
   * @remarks
   * Sus componentes se expresan en metros.
   */
  center: Vector2D;

  /**
   * Escala de visualización expresada como metros por píxel.
   *
   * @remarks
   * Un valor menor acerca la cámara (zoom in).
   * Un valor mayor aleja la cámara (zoom out).
   */
  metersPerPixel: number;
}

/**
 * Renderizador 2D para sistemas orbitales sobre un elemento Canvas.
 *
 * @remarks
 * Esta clase transforma coordenadas físicas expresadas en metros
 * a coordenadas de pantalla expresadas en píxeles.
 *
 * El renderizado no altera la simulación física; solo representa
 * visualmente el estado actual de los cuerpos.
 */
export class Renderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;

  /**
   * Opciones actuales de representación de vectores.
   */
  public vectorOptions: VectorDisplayOptions = {
    showVelocity: true,
    showAcceleration: true,
    velocityScale: 0.07,
    accelerationScale: 20_000,
  };

  private readonly trails = new Map<string, Vector2D[]>();
  /**
   * Configuración de la cámara usada por el renderizador.
   */
  public camera: CameraOptions;

  /**
   * Crea una nueva instancia del renderizador.
   *
   * @param canvas - Superficie de dibujo HTML usada para representar la simulación.
   *
   * @throws {Error}
   * Se lanza si no es posible obtener el contexto 2D del canvas.
   */
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error(
        "No fue posible obtener el contexto 2D del canvas."
      );
    }

    this.context = context;

    this.camera = {
      center: { x: 0, y: 0 },
      metersPerPixel: 600_000,
    };
  }




  /**
   * Ajusta la resolución interna del canvas al tamaño visible
   * del elemento en pantalla.
   *
   * @remarks
   * Debe invocarse al inicio y cada vez que cambie el tamaño
   * de la ventana para evitar distorsión o pérdida de nitidez.
   */
  public resize(): void {
    const { clientWidth, clientHeight } = this.canvas;

    this.canvas.width = clientWidth;
    this.canvas.height = clientHeight;
  }

  /**
   * Limpia completamente el canvas y dibuja el fondo espacial.
   */
  public clear(): void {
    this.context.fillStyle = "#000000";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Renderiza el estado completo del sistema orbital.
   *
   * @param bodies - Cuerpos celestes a dibujar.
   *
   * @remarks
   * El orden actual de dibujado es:
   * 1. fondo,
   * 2. trayectorias,
   * 3. cuerpos,
   * 4. etiquetas y referencias visuales.
   */

  /**
   * Renderiza el sistema orbital y sus magnitudes vectoriales.
   *
   * @param bodies - Cuerpos celestes que serán dibujados.
   * @param reference - Referencia de velocidad y aceleración
   * usada para los vectores.
   *
   * @remarks
   * Las trayectorias se dibujan utilizando coordenadas
   * del mundo y la transformación actual de cámara.
   */
  public render(
    bodies: readonly CelestialBody[],
    reference: VectorReference = {
      velocity: { x: 0, y: 0 },
      acceleration: { x: 0, y: 0 },
    }
  ): void {
    this.clear();
    this.drawGrid();
    this.updateTrails(bodies);
    this.drawTrails();
    this.drawBarycenter(bodies);
    this.drawBodies(bodies);
    this.drawVectors(bodies, reference);
  }


  /**
   * Convierte una posición física del mundo a una posición de pantalla.
   *
   * @param world - Posición física en metros.
   *
   * @returns Coordenadas visuales en píxeles dentro del canvas.
   *
   * @remarks
   * El eje Y del canvas crece hacia abajo, por lo que se invierte
   * el signo vertical respecto al sistema físico usual.
   */
  public worldToScreen(world: Vector2D): Vector2D {
    const x =
      this.canvas.width / 2 +
      (world.x - this.camera.center.x) / this.camera.metersPerPixel;

    const y =
      this.canvas.height / 2 -
      (world.y - this.camera.center.y) / this.camera.metersPerPixel;

    return { x, y };
  }

  /**
   * Dibuja una rejilla de referencia visual tenue.
   *
   * @remarks
   * Esta rejilla es únicamente informativa y no afecta
   * la simulación física.
   */
  private drawGrid(): void {
    const { context } = this;
    const spacing = 100;

    context.save();
    context.strokeStyle = "rgba(148, 163, 184, 0.12)";
    context.lineWidth = 1;

    for (let x = 0; x <= this.canvas.width; x += spacing) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, this.canvas.height);
      context.stroke();
    }

    for (let y = 0; y <= this.canvas.height; y += spacing) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(this.canvas.width, y);
      context.lineTo(this.canvas.width, y);
      context.stroke();
    }

    context.restore();
  }

  /**
   * Actualiza el historial de trayectorias de cada cuerpo.
   *
   * @param bodies - Cuerpos cuyos puntos orbitales se registrarán.
   *
   * @remarks
   * Cada cuerpo conserva un historial finito de posiciones para
   * representar su trayectoria reciente.
   */
  private updateTrails(bodies: readonly CelestialBody[]): void {
    const maxTrailLength = 600;

    for (const body of bodies) {
      const existingTrail = this.trails.get(body.name) ?? [];

      existingTrail.push({
        x: body.position.x,
        y: body.position.y,
      });

      if (existingTrail.length > maxTrailLength) {
        existingTrail.shift();
      }

      this.trails.set(body.name, existingTrail);
    }
  }

  /**
   * Dibuja las trayectorias registradas de todos los cuerpos.
   */
  private drawTrails(): void {
    const { context } = this;

    context.save();
    context.lineWidth = 1.5;

    for (const [, trail] of this.trails) {
      if (trail.length < 2) continue;

      context.beginPath();

      const first = this.worldToScreen(trail[0]);
      context.moveTo(first.x, first.y);

      for (let i = 1; i < trail.length; i++) {
        const point = this.worldToScreen(trail[i]);
        context.lineTo(point.x, point.y);
      }

      context.strokeStyle = "rgba(148, 163, 184, 0.5)";
      context.stroke();
    }

    context.restore();
  }

  /**
   * Dibuja todos los cuerpos celestes del sistema.
   *
   * @param bodies - Cuerpos a representar visualmente.
   */
  private drawBodies(bodies: readonly CelestialBody[]): void {
    for (const body of bodies) {
      this.drawBody(body);
    }
  }

  /**
   * Dibuja un cuerpo celeste individual y su etiqueta.
   *
   * @param body - Cuerpo celeste a dibujar.
   *
   * @remarks
   * Los radios físicos reales se escalan visualmente a píxeles.
   * Debido a la enorme diferencia entre tamaños astronómicos y
   * distancias orbitales, se aplica un radio mínimo visible.
   */
  private drawBody(body: CelestialBody): void {
    const { context } = this;
    const position = this.worldToScreen(body.position);

    const radiusInPixels = Math.max(
      body.radius / this.camera.metersPerPixel,
      4
    );

    context.save();

    context.beginPath();
    context.arc(position.x, position.y, radiusInPixels, 0, Math.PI * 2);
    context.fillStyle = body.color;
    context.fill();

    context.strokeStyle = "rgba(255, 255, 255, 0.35)";
    context.lineWidth = 1;
    context.stroke();

    context.fillStyle = "#e2e8f0";
    context.font = "12px sans-serif";
    context.fillText(body.name, position.x + radiusInPixels + 6, position.y - 8);

    context.restore();
  }


  /**
   * Calcula y dibuja el baricentro del sistema gravitacional.
  *
  * @param bodies - Conjunto de cuerpos celestes.
  *
  * @remarks
  * El baricentro se obtiene como el promedio ponderado
  * de las posiciones utilizando las masas:
  *
  * R = Σ(m_i * r_i) / Σ(m_i)
  *
  * La posición se expresa en metros antes de transformarse
  * a coordenadas de pantalla.
  */
  private drawBarycenter(
    bodies: readonly CelestialBody[]
  ): void {
    const totalMass = bodies.reduce(
      (sum, body) => sum + body.mass,
      0
    );

    if (totalMass <= 0) return;

    const center: Vector2D = {
      x: bodies.reduce(
        (sum, body) => sum + body.mass * body.position.x,
        0
      ) / totalMass,

      y: bodies.reduce(
        (sum, body) => sum + body.mass * body.position.y,
        0
      ) / totalMass,
    };

    const position = this.worldToScreen(center);
    const ctx = this.context;

    ctx.save();

    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(position.x - 8, position.y);
    ctx.lineTo(position.x + 8, position.y);
    ctx.moveTo(position.x, position.y - 8);
    ctx.lineTo(position.x, position.y + 8);
    ctx.stroke();

    ctx.fillStyle = "#fbbf24";
    ctx.font = "12px sans-serif";
    ctx.fillText(
      "Baricentro",
      position.x + 12,
      position.y - 10
    );

    ctx.restore();
  }



  /**
   * Establece la escala espacial de la cámara.
  *
  * @param metersPerPixel - Cantidad de metros representados
  * por cada píxel del canvas.
  *
  * @throws {RangeError}
  * Si la escala no es finita o es menor o igual que cero.
  */
  public setScale(metersPerPixel: number): void {
    if (
      !Number.isFinite(metersPerPixel) ||
      metersPerPixel <= 0
    ) {
      throw new RangeError(
        "La escala de cámara debe ser positiva y finita."
      );
    }

    this.camera.metersPerPixel = metersPerPixel;
  }

  /**
   * Establece el centro de la cámara en coordenadas físicas.
   *
   * @param position - Posición del centro en metros.
  */
  public setCameraCenter(position: Vector2D): void {
    this.camera.center = { ...position };
  }

  /**
   * Elimina todas las trayectorias almacenadas.
  *
  * @remarks
  * Se utiliza cuando se reinicia el sistema físico
  * para evitar mezclar órbitas de ejecuciones distintas.
  */
  public clearTrails(): void {
    this.trails.clear();
  }


  /**
   * Convierte coordenadas de pantalla a coordenadas físicas.
  *
  * @param screen - Posición en píxeles relativa al canvas.
  * @returns Posición correspondiente en el espacio físico,
  * expresada en metros.
  *
  * @remarks
  * Es la transformación inversa de worldToScreen().
  * El eje Y se invierte para conservar la orientación
  * cartesiana del sistema de simulación.
  */
  public screenToWorld(screen: Vector2D): Vector2D {
    return {
      x:
        this.camera.center.x +
        (screen.x - this.canvas.width / 2) *
        this.camera.metersPerPixel,

      y:
        this.camera.center.y -
        (screen.y - this.canvas.height / 2) *
        this.camera.metersPerPixel,
    };
  }

  /**
   * Desplaza la cámara mediante un vector expresado en píxeles.
  *
  * @param deltaX - Desplazamiento horizontal del puntero en píxeles.
  * @param deltaY - Desplazamiento vertical del puntero en píxeles.
  *
  * @returns No retorna ningún valor.
  *
  * @remarks
  * Arrastrar el lienzo hacia la derecha desplaza su contenido
  * hacia la derecha, por lo que el centro de la cámara
  * se mueve en sentido contrario.
  */
  public pan(deltaX: number, deltaY: number): void {
    this.camera.center.x -=
      deltaX * this.camera.metersPerPixel;

    this.camera.center.y +=
      deltaY * this.camera.metersPerPixel;
  }

  /**
   * Modifica el zoom manteniendo fijo el punto del mundo
   * situado debajo del cursor.
  *
  * @param factor - Factor multiplicativo del zoom.
  * Un valor mayor que 1 acerca la cámara.
  * @param screen - Posición del cursor relativa al canvas,
  * expresada en píxeles.
  *
  * @returns No retorna ningún valor.
  *
  * @remarks
  * La escala está limitada para evitar valores extremos.
  * El punto físico bajo el cursor se conserva después
  * de modificar el nivel de zoom.
  */
  public zoomAt(
    factor: number,
    screen: Vector2D
  ): void {
    if (!Number.isFinite(factor) || factor <= 0) {
      throw new RangeError(
        "El factor de zoom debe ser positivo y finito."
      );
    }

    const before = this.screenToWorld(screen);

    const minScale = 1_000;
    const maxScale = 1_000_000_000_000;

    this.camera.metersPerPixel = Math.max(
      minScale,
      Math.min(
        maxScale,
        this.camera.metersPerPixel / factor
      )
    );

    const after = this.screenToWorld(screen);

    this.camera.center.x += before.x - after.x;
    this.camera.center.y += before.y - after.y;
  }


  /**
   * Identifica el cuerpo celeste situado bajo una posición
   * determinada del lienzo.
   *
   * @param screen - Posición del cursor en píxeles CSS,
   * relativa al canvas.
   * @param bodies - Cuerpos celestes disponibles.
   *
   * @returns El cuerpo seleccionado o null si no existe
   * ningún cuerpo dentro del área de selección.
   *
   * @remarks
   * Utiliza la distancia euclidiana en coordenadas visuales.
   *
   * El radio de selección respeta un mínimo de 12 píxeles
   * para facilitar la interacción con cuerpos pequeños.
   *
   * Si varios cuerpos coinciden visualmente, selecciona
   * el más cercano al cursor.
   */
  public pickBody(
    screen: Vector2D,
    bodies: readonly CelestialBody[]
  ): CelestialBody | null {
    let selected: CelestialBody | null = null;
    let closestDistance = Infinity;

    for (const body of bodies) {
      const position = this.worldToScreen(body.position);

      const distance = Math.hypot(
        screen.x - position.x,
        screen.y - position.y
      );

      const visualRadius = Math.max(
        body.radius / this.camera.metersPerPixel,
        4
      );

      const selectionRadius = Math.max(visualRadius, 12);

      if (
        distance <= selectionRadius &&
        distance < closestDistance
      ) {
        selected = body;
        closestDistance = distance;
      }
    }

    return selected;
  }



  /**
   * Dibuja una flecha desde un punto de la pantalla.
   *
   * @param origin - Origen de la flecha en píxeles.
   * @param vector - Vector físico que determina su dirección
   * y magnitud.
   * @param scale - Factor de conversión de magnitud física
   * a longitud visual en píxeles.
   * @param color - Color CSS utilizado para la flecha.
   *
   * @remarks
   * La longitud es proporcional a la magnitud física.
   * No se aplica normalización ni saturación, para
   * mantener la proporcionalidad visual.
   *
   * La componente vertical se invierte porque el eje Y
   * del canvas crece hacia abajo.
   */
  private drawVectorArrow(
    origin: Vector2D,
    vector: Vector2D,
    scale: number,
    color: string
  ): void {
    const ctx = this.context;

    const dx = vector.x * scale;
    const dy = -vector.y * scale;

    const length = Math.hypot(dx, dy);

    if (!Number.isFinite(length) || length < 1) {
      return;
    }

    const endX = origin.x + dx;
    const endY = origin.y + dy;

    const angle = Math.atan2(dy, dx);
    const arrowSize = 9;

    ctx.save();

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Línea principal.
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Punta triangular de la flecha.
    ctx.beginPath();
    ctx.moveTo(endX, endY);

    ctx.lineTo(
      endX - arrowSize * Math.cos(angle - Math.PI / 6),
      endY - arrowSize * Math.sin(angle - Math.PI / 6)
    );

    ctx.lineTo(
      endX - arrowSize * Math.cos(angle + Math.PI / 6),
      endY - arrowSize * Math.sin(angle + Math.PI / 6)
    );

    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  /**
   * Representa los vectores de velocidad y aceleración
   * de los cuerpos celestes.
   *
   * @param bodies - Cuerpos físicos del sistema.
   * @param reference - Valores vectoriales del origen
   * del sistema de referencia seleccionado.
   *
   * @remarks
   * Las magnitudes representadas son diferencias
   * vectoriales respecto a la referencia.
   *
   * v_rel = v_body - v_ref
   * a_rel = a_body - a_ref
   *
   * Si ambas componentes de referencia son cero,
   * se representan los vectores del marco baricéntrico.
   */
  private drawVectors(
    bodies: readonly CelestialBody[],
    reference: VectorReference
  ): void {
    const options = this.vectorOptions;

    for (const body of bodies) {
      const origin = this.worldToScreen(body.position);

      if (options.showVelocity) {
        const relativeVelocity: Vector2D = {
          x: body.velocity.x - reference.velocity.x,
          y: body.velocity.y - reference.velocity.y,
        };

        this.drawVectorArrow(
          origin,
          relativeVelocity,
          options.velocityScale,
          "#34d399"
        );
      }

      if (options.showAcceleration) {
        const relativeAcceleration: Vector2D = {
          x: body.acceleration.x - reference.acceleration.x,
          y: body.acceleration.y - reference.acceleration.y,
        };

        this.drawVectorArrow(
          origin,
          relativeAcceleration,
          options.accelerationScale,
          "#fb923c"
        );
      }
    }
  }



}
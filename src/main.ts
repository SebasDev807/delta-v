
import "./style.css";

import { EARTH_MOON_DISTANCE } from "./physics/constants";

import {
  distanceBetween,
  relativeSpeed,
  totalMechanicalEnergy,
} from "./physics/diagnostics";

import type { VectorReference } from "./rendering/interfaces";
import { Simulation } from "./simulation/Simulation";
import { Renderer } from "./rendering/Renderer";

/**
 * Recupera un elemento HTML obligatorio de la interfaz.
 *
 * @typeParam T - Tipo concreto del elemento esperado.
 * @param selector - Selector CSS del elemento.
 * @returns Elemento encontrado.
 * @throws {Error} Si el selector no encuentra un elemento.
 */
function requireElement<T extends HTMLElement>(
  selector: string
): T {
  const element = document.querySelector<T>(selector);

  if (!element) {
    throw new Error(`Elemento no encontrado: ${selector}`);
  }

  return element;
}

/**
 * Inicializa el simulador orbital y sus controles.
 *
 * @remarks
 * Mantiene separado el tiempo físico del tiempo real
 * y utiliza un acumulador de tiempo con paso fijo.
 */
function main(): void {
  const app = requireElement<HTMLDivElement>("#app");


  app.innerHTML = `
  <div class="app-shell">

    <!-- Lienzo principal -->
    <canvas id="orbital-canvas"></canvas>

    <!-- Encabezado flotante -->
    <header class="floating-header">
      <div>
        <h1>Delta V</h1>
        <p>Laboratorio de mecánica orbital</p>
      </div>

      <span id="status" class="status-badge">
        En ejecución
      </span>
    </header>

    <!-- Contenedor de paneles flotantes -->
    <div class="floating-sidebar">

      <!-- Panel de información orbital -->
      <aside class="floating-panel">
        <h2>Datos orbitales</h2>

        <div class="metric">
          <span>Tiempo transcurrido</span>
          <strong id="elapsed">0 días</strong>
        </div>

        <div class="metric">
          <span>Distancia Tierra-Luna</span>
          <strong id="distance">—</strong>
        </div>

        <div class="metric">
          <span>Velocidad relativa</span>
          <strong id="speed">—</strong>
        </div>

        <div class="metric">
          <span>Energía mecánica</span>
          <strong id="energy">—</strong>
        </div>

        <div class="metric">
          <span>Variación de energía</span>
          <strong id="energy-error">—</strong>
        </div>
      </aside>

      <!-- Panel de controles -->
      <section class="floating-controls">
        <h2>Controles</h2>

        <!-- Control de simulación -->
        <div class="controls-grid">
          <button id="pause" type="button">
            Pausar
          </button>

          <button id="reset" type="button">
            Reiniciar
          </button>
        </div>

        <!-- Velocidad temporal -->
        <label for="time-scale">
          Velocidad temporal
        </label>

        <select id="time-scale">
          <option value="3600">
            1 hora/s
          </option>

          <option value="21600">
            6 horas/s
          </option>

          <option value="86400" selected>
            1 día/s
          </option>

          <option value="172800">
            2 días/s
          </option>
        </select>

        <!-- Zoom de cámara -->
        <label>Zoom de cámara</label>

        <div class="controls-grid">
          <button id="zoom-in" type="button">
            Acercar +
          </button>

          <button id="zoom-out" type="button">
            Alejar −
          </button>
        </div>

        <button id="reset-camera" type="button">
          Restablecer cámara
        </button>

        <!-- Seguimiento de cámara -->
        <label for="camera-target">
          Seguimiento de cámara
        </label>

        <select id="camera-target">
          <option value="free">
            Cámara libre
          </option>

          <option value="earth">
            Seguir la Tierra
          </option>

          <option value="moon">
            Seguir la Luna
          </option>
        </select>

        <!-- Controles de vectores físicos -->
        <div class="vector-section">
          <h2>Vectores físicos</h2>

          <!-- Vector de velocidad -->
          <label class="vector-toggle">
            <input
              type="checkbox"
              id="show-velocity"
              checked
            />

            <span
              class="vector-dot velocity-dot"
              aria-hidden="true"
            ></span>

            Mostrar velocidad
          </label>

          <!-- Vector de aceleración -->
          <label class="vector-toggle">
            <input
              type="checkbox"
              id="show-acceleration"
              checked
            />

            <span
              class="vector-dot acceleration-dot"
              aria-hidden="true"
            ></span>

            Mostrar aceleración
          </label>

          <!-- Escala del vector de velocidad -->
          <label for="velocity-scale">
            Escala de velocidad
          </label>

          <input
            id="velocity-scale"
            type="range"
            min="0.01"
            max="0.25"
            step="0.01"
            value="0.07"
          />

          <!-- Escala del vector de aceleración -->
          <label for="acceleration-scale">
            Escala de aceleración
          </label>

          <input
            id="acceleration-scale"
            type="range"
            min="5000"
            max="100000"
            step="5000"
            value="20000"
          />

          <!-- Sistema de referencia vectorial -->
          <p
            id="vector-reference-label"
            class="vector-note"
          >
            Referencia: baricentro
          </p>
        </div>
      </section>

    </div>
  </div>
`;

  const canvas =
    requireElement<HTMLCanvasElement>("#orbital-canvas");

  const pauseButton =
    requireElement<HTMLButtonElement>("#pause");

  const resetButton =
    requireElement<HTMLButtonElement>("#reset");

  const timeScaleSelect =
    requireElement<HTMLSelectElement>("#time-scale");

  const renderer = new Renderer(canvas);


  const velocityCheckbox =
    requireElement<HTMLInputElement>("#show-velocity");

  const accelerationCheckbox =
    requireElement<HTMLInputElement>("#show-acceleration");

  const velocityScaleInput =
    requireElement<HTMLInputElement>("#velocity-scale");

  const accelerationScaleInput =
    requireElement<HTMLInputElement>("#acceleration-scale");

  /**
   * Sincroniza las opciones visuales del renderizador
   * con los controles de la interfaz.
   *
   * @remarks
   * Únicamente modifica opciones de presentación;
   * no modifica valores físicos de los cuerpos.
   */
  const updateVectorOptions = (): void => {
    renderer.vectorOptions.showVelocity =
      velocityCheckbox.checked;

    renderer.vectorOptions.showAcceleration =
      accelerationCheckbox.checked;

    renderer.vectorOptions.velocityScale =
      Number(velocityScaleInput.value);

    renderer.vectorOptions.accelerationScale =
      Number(accelerationScaleInput.value);
  };

  velocityCheckbox.addEventListener(
    "change",
    updateVectorOptions
  );

  accelerationCheckbox.addEventListener(
    "change",
    updateVectorOptions
  );

  velocityScaleInput.addEventListener(
    "input",
    updateVectorOptions
  );

  accelerationScaleInput.addEventListener(
    "input",
    updateVectorOptions
  );

  updateVectorOptions();



  /**
   * Modos disponibles para posicionar la cámara.
   *
   * @remarks
   * El modo libre permite desplazamiento manual.
   * Los otros modos mantienen centrado un cuerpo celeste.
   */
  type CameraMode = "free" | "earth" | "moon";

  let cameraMode: CameraMode = "free";

  const cameraTarget =
    requireElement<HTMLSelectElement>("#camera-target");

  /**
   * Modifica el objetivo de seguimiento de la cámara.
   *
   * @param mode - Nuevo modo de cámara.
   *
   * @remarks
   * Este procedimiento solo modifica el estado visual.
   * No altera posiciones, velocidades ni aceleraciones.
   */

  /**
   * Cambia el modo de seguimiento de cámara.
   *
   * @param mode - Modo de cámara seleccionado.
   */
  const setCameraMode = (mode: CameraMode): void => {
    cameraMode = mode;
    cameraTarget.value = mode;
    updateVectorReferenceLabel();
  };

  /**
   * Sincroniza el centro de la cámara con el cuerpo seguido.
   *
   * @remarks
   * Debe ejecutarse después de actualizar la física
   * y antes de renderizar el fotograma.
   *
   * En modo libre no modifica el centro de cámara.
   */
  const updateCameraTracking = (): void => {
    if (cameraMode === "free") return;

    const targetIndex = cameraMode === "earth" ? 0 : 1;
    const target = simulation.bodies[targetIndex];

    if (!target) return;

    renderer.setCameraCenter(target.position);
  };

  cameraTarget.addEventListener("change", () => {
    setCameraMode(cameraTarget.value as CameraMode);
    updateCameraTracking();
  });


  /**
   * Obtiene los vectores de referencia correspondientes
   * al modo de cámara seleccionado.
   *
   * @returns Velocidad y aceleración de referencia,
   * expresadas en m/s y m/s² respectivamente.
   *
   * @remarks
   * En modo libre se utilizan los vectores del sistema
   * baricéntrico inicial.
   *
   * Al seguir un cuerpo se restan sus vectores a los
   * demás para visualizar el movimiento relativo.
   */
  const getVectorReference = (): VectorReference => {
    if (cameraMode === "free") {
      return {
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0 },
      };
    }

    const index = cameraMode === "earth" ? 0 : 1;
    const target = simulation.bodies[index];

    return {
      velocity: { ...target.velocity },
      acceleration: { ...target.acceleration },
    };
  };

  /**
   * Actualiza la indicación del sistema de referencia
   * utilizado para representar los vectores.
   */
  const updateVectorReferenceLabel = (): void => {
    const label = requireElement<HTMLElement>(
      "#vector-reference-label"
    );

    const descriptions = {
      free: "Referencia: baricentro",
      earth: "Referencia: Tierra",
      moon: "Referencia: Luna",
    };

    label.textContent = descriptions[cameraMode];
  };




  let activePointerId: number | null = null;
  let isDragging = false;

  let pointerStart = { x: 0, y: 0 };
  let lastPointerPosition = { x: 0, y: 0 };
  const DRAG_THRESHOLD = 5;

  /**
   * Obtiene la posición del puntero relativa al canvas.
   *
   * @param event - Evento de puntero del navegador.
   * @returns Coordenadas del puntero en píxeles CSS.
   */
  /**
  * Obtiene las coordenadas del puntero relativas al canvas.
  *
  * @param event - Evento del puntero o de la rueda.
  * @returns Posición en píxeles CSS.
  */
  const getPointerPosition = (
    event: PointerEvent | WheelEvent
  ): { x: number; y: number } => {
    const rect = canvas.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };
  /**
   * Inicia el desplazamiento manual de la cámara
   * al presionar el botón izquierdo del ratón.
   *
   * @param event - Evento de puntero.
   */
  const handlePointerDown = (
    event: PointerEvent
  ): void => {
    if (event.button !== 0 || activePointerId !== null) {
      return;
    }

    activePointerId = event.pointerId;
    pointerStart = getPointerPosition(event);
    lastPointerPosition = { ...pointerStart };

    isDragging = false;

    canvas.setPointerCapture(event.pointerId);
  };

  /**
   * Desplaza la cámara siguiendo el movimiento del puntero.
   *
   * @param event - Evento de movimiento del puntero.
   */
  /**
 * Detecta un arrastre y desplaza la cámara.
 *
 * @param event - Evento de movimiento del puntero.
 *
 * @remarks
 * Si el usuario desplaza el lienzo mientras seguía
 * un cuerpo, la cámara vuelve al modo libre.
 */
  const handlePointerMove = (
    event: PointerEvent
  ): void => {
    if (event.pointerId !== activePointerId) return;

    const current = getPointerPosition(event);

    const totalDistance = Math.hypot(
      current.x - pointerStart.x,
      current.y - pointerStart.y
    );

    if (
      !isDragging &&
      totalDistance >= DRAG_THRESHOLD
    ) {
      isDragging = true;
      setCameraMode("free");
      canvas.classList.add("dragging");
    }

    if (isDragging) {
      renderer.pan(
        current.x - lastPointerPosition.x,
        current.y - lastPointerPosition.y
      );
    }

    lastPointerPosition = current;
  };
  /**
   * Finaliza la operación de arrastre del lienzo.
   */

  /**
   * Finaliza la interacción y selecciona un cuerpo
   * si el movimiento no fue un arrastre.
   *
   * @param event - Evento de liberación del puntero.
   */
  const handlePointerUp = (
    event: PointerEvent
  ): void => {
    if (event.pointerId !== activePointerId) return;

    if (!isDragging) {
      const position = getPointerPosition(event);

      const selected = renderer.pickBody(
        position,
        simulation.bodies
      );

      if (selected === simulation.bodies[0]) {
        setCameraMode("earth");
      } else if (selected === simulation.bodies[1]) {
        setCameraMode("moon");
      }
    }

    activePointerId = null;
    isDragging = false;

    canvas.classList.remove("dragging");

    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }

    updateCameraTracking();
  };

  /**
 * Cancela una interacción sin seleccionar cuerpos.
 */
  const cancelPointerInteraction = (): void => {
    activePointerId = null;
    isDragging = false;
    canvas.classList.remove("dragging");
  };


  /**
   * Controla el acercamiento y alejamiento mediante
   * la rueda del ratón.
   *
   * @param event - Evento de desplazamiento de rueda.
   *
   * @remarks
   * La posición del cursor se utiliza como ancla del zoom.
   */
  const handleWheel = (
    event: WheelEvent
  ): void => {
    event.preventDefault();

    const position = getPointerPosition(event);

    const factor = Math.exp(-event.deltaY * 0.001);

    renderer.zoomAt(factor, position);
  };


  /**
   * Restablece la cámara al modo libre, centrada
   * en el origen del sistema de coordenadas.
   */
  const resetCamera = (): void => {
    setCameraMode("free");

    renderer.setCameraCenter({
      x: 0,
      y: 0,
    });

    resetCameraScale();
  };

  requireElement<HTMLButtonElement>(
    "#reset-camera"
  ).addEventListener("click", resetCamera);


  canvas.addEventListener("pointerdown", handlePointerDown);
  canvas.addEventListener("pointermove", handlePointerMove);
  canvas.addEventListener("pointerup", handlePointerUp);

  canvas.addEventListener(
    "pointercancel",
    cancelPointerInteraction
  );

  canvas.addEventListener(
    "lostpointercapture",
    cancelPointerInteraction
  );

  canvas.addEventListener(
    "wheel",
    handleWheel,
    { passive: false }
  );


  let simulation = new Simulation();

  const physicsDt = 60;
  let timeScale = Number(timeScaleSelect.value);
  let isPaused = false;

  let simulatedSeconds = 0;
  let accumulator = 0;
  let lastFrameTime = performance.now();

  let initialEnergy = totalMechanicalEnergy(
    simulation.bodies
  );

  /**
   * Ajusta la resolución y la escala de visualización.
   *
   * @remarks
   * La escala base se calcula según la dimensión más
   * pequeña del canvas para mantener la órbita visible.
   */

  /**
   * Ajusta la escala espacial inicial de la cámara
   * para representar la órbita Tierra-Luna.
   *
   * @returns No retorna valor.
   */
  const resetCameraScale = (): void => {
    const smallestDimension = Math.max(
      1,
      Math.min(canvas.clientWidth, canvas.clientHeight)
    );

    const baseScale =
      (2.5 * EARTH_MOON_DISTANCE) /
      smallestDimension;

    renderer.setScale(baseScale);
  };

  /**
   * Actualiza el tamaño del lienzo conservando
   * el nivel actual de acercamiento.
   *
   * @returns No retorna valor.
   */
  const resize = (): void => {
    renderer.resize();
  };


  /**
   * Actualiza los indicadores científicos del panel.
   */
  const updateHud = (): void => {
    const [earth, moon] = simulation.bodies;

    const distance = distanceBetween(earth, moon);
    const speed = relativeSpeed(earth, moon);
    const energy = totalMechanicalEnergy(
      simulation.bodies
    );

    const energyError =
      Math.abs((energy - initialEnergy) / initialEnergy) *
      100;

    requireElement<HTMLElement>("#elapsed").textContent =
      `${(simulatedSeconds / 86400).toFixed(2)} días`;

    requireElement<HTMLElement>("#distance").textContent =
      `${(distance / 1000).toLocaleString("es-CO", {
        maximumFractionDigits: 2,
      })} km`;

    requireElement<HTMLElement>("#speed").textContent =
      `${(speed / 1000).toFixed(4)} km/s`;

    requireElement<HTMLElement>("#energy").textContent =
      `${energy.toExponential(4)} J`;

    requireElement<HTMLElement>(
      "#energy-error"
    ).textContent = `${energyError.toExponential(3)} %`;
  };

  /**
   * Reinicia el sistema a sus condiciones iniciales.
   */
  const reset = (): void => {
    simulation = new Simulation();

    simulatedSeconds = 0;
    accumulator = 0;

    initialEnergy = totalMechanicalEnergy(
      simulation.bodies
    );

    // Reconstruir el historial visual.
    renderer.clearTrails();

    updateHud();
  };

  /**
   * Modifica el nivel de acercamiento de la cámara.
   *
   * @param factor - Multiplicador del nivel de zoom.
   */

  /**
   * Modifica el zoom utilizando el centro del canvas como ancla.
   *
   * @param factor - Factor de acercamiento o alejamiento.
   * @returns No retorna valor.
   */
  const changeZoom = (factor: number): void => {
    renderer.zoomAt(factor, {
      x: canvas.width / 2,
      y: canvas.height / 2,
    });
  };


  pauseButton.addEventListener("click", () => {
    isPaused = !isPaused;

    pauseButton.textContent = isPaused
      ? "Reanudar"
      : "Pausar";

    requireElement<HTMLElement>("#status").textContent =
      isPaused ? "En pausa" : "En ejecución";
  });

  resetButton.addEventListener("click", reset);

  timeScaleSelect.addEventListener("change", () => {
    timeScale = Number(timeScaleSelect.value);
    accumulator = 0;
  });

  requireElement<HTMLButtonElement>(
    "#zoom-in"
  ).addEventListener("click", () => changeZoom(1.25));

  requireElement<HTMLButtonElement>(
    "#zoom-out"
  ).addEventListener("click", () => changeZoom(0.8));


  requireElement<HTMLButtonElement>(
    "#reset-camera"
  ).addEventListener("click", resetCamera);


  window.addEventListener("resize", resize);

  resize();
  resetCameraScale();
  updateHud();
  /**
   * Ejecuta el ciclo principal de simulación y renderizado.
   *
   * @param now - Marca temporal del navegador en milisegundos.
   *
   * @remarks
   * Usa pasos físicos fijos de 60 segundos y limita el
   * tiempo real por cuadro para evitar acumulaciones enormes
   * cuando la pestaña ha estado inactiva.
   */
  const frame = (now: number): void => {
    const delta = Math.min(
      (now - lastFrameTime) / 1000,
      0.1
    );

    lastFrameTime = now;

    if (!isPaused) {
      accumulator += delta * timeScale;

      while (accumulator >= physicsDt) {
        simulation.update(physicsDt);
        simulatedSeconds += physicsDt;
        accumulator -= physicsDt;
      }
    }

    // Sincronizar la cámara con el cuerpo seleccionado.
    updateCameraTracking();

    // Renderizar desde la posición actual de la cámara.
    renderer.render(
      simulation.bodies,
      getVectorReference()
    );

    updateHud();

    requestAnimationFrame(frame);
  };

  requestAnimationFrame(frame);
}

main();

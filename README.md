# Orbital 2D

**Orbital 2D** es un simulador de mecánica orbital bidimensional desarrollado con **TypeScript, Vite y HTML Canvas 2D**. Su objetivo es explorar el movimiento gravitacional mediante cálculos físicos y visualizaciones interactivas, manteniendo separadas la física y la representación gráfica.

> **Estado:** prototipo funcional en desarrollo. La primera escena implementada es un sistema Tierra–Luna circular idealizado. No es todavía una herramienta de navegación espacial ni un modelo astronómico de efemérides.

## Funcionalidades actuales

- Simulación gravitacional newtoniana de cuerpos puntuales para el cálculo de fuerzas, con radios físicos almacenados para representación.
- Integración temporal mediante **Velocity Verlet** con paso físico fijo.
- Condiciones iniciales Tierra–Luna alrededor del baricentro común.
- Renderizado 2D con Canvas, trayectorias y rejilla visual.
- Cámara con desplazamiento manual, zoom centrado en cursor y restablecimiento.
- Seguimiento de Tierra y Luna por selector o clic en el lienzo.
- Pausa, reanudación, reinicio y selección de velocidad temporal.
- HUD con tiempo simulado, distancia, rapidez relativa, energía mecánica y error relativo de energía.
- Vectores de velocidad y aceleración visibles, con escalas y referencias configurables.
- Documentación TSDoc en las funciones, clases e interfaces relevantes.

## Tecnologías

- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/), plantilla Vanilla TypeScript
- Canvas 2D, HTML y CSS
- pnpm

## Requisitos

- Node.js compatible con la versión de Vite instalada en el proyecto
- pnpm

## Ejecución local

```bash
pnpm install
pnpm dev
```

Para compilar (según los scripts de la plantilla Vite):

```bash
pnpm build
pnpm preview
```

## Controles

| Acción | Interacción |
|---|---|
| Desplazar cámara | Arrastrar sobre el canvas |
| Zoom al cursor | Rueda del ratón |
| Seguir un cuerpo | Clic sobre él o selector de cámara |
| Volver a cámara libre | Arrastrar o restablecer cámara |
| Pausar/reanudar | Botón de pausa |
| Reiniciar | Botón de reinicio |
| Variar la velocidad de reproducción | Selector de velocidad temporal |
| Mostrar/ocultar vectores | Casillas de velocidad y aceleración |
| Ajustar longitud de vectores | Controles deslizantes |

## Fundamento físico

La aceleración de un cuerpo causada por otro se calcula mediante:

\[
\vec a = G M\frac{\vec r}{|\vec r|^3}
\]

La integración usa Velocity Verlet. El cálculo físico utiliza el Sistema Internacional (metros, kilogramos y segundos). **Los tamaños mínimos visibles, los vectores y el zoom son convenciones gráficas; no modifican el estado físico.**

## Limitaciones actuales

- Modelo clásico newtoniano 2D, sin relatividad general, perturbaciones solares o colisiones.
- Tierra–Luna inicia en una órbita circular **idealizada**, no en posiciones históricas reales.
- El integrador mantiene un paso temporal fijo; no incluye control adaptativo para encuentros cercanos.
- Las trayectorias visibles se muestrean por fotograma y pueden perder detalle al aumentar la velocidad temporal.
- El seguimiento de cámara cambia la vista; la transformación a vectores relativos se aplica solamente a los vectores dibujados, no a toda la simulación.
- La rejilla actual es una guía visual y no representa todavía una escala física rotulada.
- El diseño de paneles flotantes está orientado principalmente a escritorio.

## Documentación

- [Arquitectura](docs/architecture.md)
- [Modelo físico y validación](docs/physics.md)
- [Interfaz y controles](docs/interface.md)
- [Hoja de ruta y versiones](docs/roadmap.md)

## Organización del código

```text
src/
├── physics/
│   ├── constants.ts
│   ├── gravity.ts
│   ├── integrator.ts
│   └── diagnostics.ts
├── simulation/
│   ├── CelestialBody.ts
│   └── Simulation.ts
├── rendering/
│   └── Renderer.ts
├── main.ts
└── style.css
```

## Convenciones

- Documentar las funciones, clases, interfaces y componentes relevantes usando **TSDoc**.
- Indicar unidades físicas en `@param`, `@returns` y `@remarks` cuando proceda.
- No mezclar los cálculos físicos con el renderizado.
- Evitar abreviaturas ambiguas en las constantes (usar `G`, nunca `6`).
- Mantener activada la opción `erasableSyntaxOnly` de TypeScript y evitar *parameter properties*.

## Próximas versiones

Consulta [docs/roadmap.md](docs/roadmap.md). Las maniobras, impulsos Δv y elementos orbitales avanzados se han **pospuesto expresamente**; no son parte del alcance actual.

## Licencia

Pendiente de definir.

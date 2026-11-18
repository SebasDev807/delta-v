# Interfaz y controles

## Diseño actual

La interfaz utiliza un canvas de pantalla completa y paneles flotantes translúcidos para no ocultar el espacio de simulación. El HUD informa datos físicos y los controles modifican el reloj o la cámara.

## Interacciones

| Control | Efecto |
|---|---|
| Arrastrar el canvas | Mueve el centro de la cámara en coordenadas físicas |
| Rueda del ratón | Zoom alrededor del cursor |
| Clic en Tierra/Luna | Activa seguimiento del cuerpo seleccionado |
| Selector de cámara | Libre / Tierra / Luna |
| Pausar | Detiene la integración física, no la cámara |
| Reiniciar | Restaura condiciones iniciales y limpia trayectorias |
| Velocidad temporal | Cambia segundos simulados por segundo real |
| Acercar / Alejar | Zoom alrededor del centro del canvas |
| Restablecer cámara | Vuelve al origen baricéntrico y a la escala inicial |
| Interruptores de vectores | Activa u oculta velocidad y aceleración |
| Deslizadores vectoriales | Cambian exclusivamente la longitud visual de las flechas |

## Datos del HUD

- Tiempo simulado en días.
- Distancia entre centros de Tierra y Luna en kilómetros.
- Rapidez relativa Tierra–Luna en km/s.
- Energía mecánica total en julios.
- Error relativo porcentual de energía respecto al estado inicial.

## Visualización de vectores

- Verde: velocidad (`m/s`).
- Naranja: aceleración (`m/s²`).
- En cámara libre, los vectores corresponden al sistema baricéntrico.
- En seguimiento, las flechas representan diferencias respecto al cuerpo seleccionado.

**Importante:** las longitudes de flechas no tienen la misma escala porque velocidad y aceleración tienen distintas dimensiones físicas.

## Mejoras visuales conocidas

- Las trayectorias se actualizan desde el render; sería preferible muestrearlas a intervalos fijos de tiempo simulado.
- La rejilla no tiene aún rotulación de escala física.
- El panel flotante necesita mayor refinamiento para pantallas estrechas y dispositivos táctiles.
- El canvas puede mejorarse para pantallas de alta densidad de píxeles (`devicePixelRatio`).
- Conviene separar progresivamente el controlador de cámara y el HUD del archivo `main.ts`.

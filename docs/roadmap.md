# Hoja de ruta de Delta V

> Este documento refleja el alcance acordado hasta ahora. Las funcionalidades futuras son **propuestas**, no características ya implementadas ni fechas comprometidas.

## Versión actual — Prototipo Tierra–Luna

**Implementado según el desarrollo realizado hasta ahora:**

- [x] Proyecto Vite + Vanilla TypeScript.
- [x] Constantes físicas en unidades SI.
- [x] Cuerpos celestes con masa, radio, posición, velocidad y aceleración.
- [x] Gravitación N-cuerpos directa.
- [x] Velocity Verlet con paso temporal fijo.
- [x] Condiciones circulares ideales Tierra–Luna respecto al baricentro.
- [x] Canvas 2D, rejilla, cuerpos y trayectorias.
- [x] HUD de distancia, rapidez relativa, tiempo, energía y error energético.
- [x] Pausa, reanudación, reinicio y velocidad temporal.
- [x] Cámara libre con pan, zoom al cursor y reseteo.
- [x] Seguimiento de Tierra/Luna mediante selector o clic.
- [x] Visualización de velocidad y aceleración con escalas independientes.
- [x] Uso de TSDoc para las partes relevantes.

**Pendiente de verificar de manera sistemática:**

- [ ] Pruebas automáticas de conservación y convergencia.
- [ ] Validación de interacción de cámara y zoom en diferentes tamaños de pantalla.
- [ ] Validación del renderizado vectorial en ambos modos de referencia.

## Próxima versión — Estabilidad y calidad del simulador

- [ ] Extraer reloj físico y estado de interfaz fuera de `main.ts`.
- [ ] Incorporar pruebas automatizadas para gravedad, integrador y diagnósticos.
- [ ] Añadir muestreo de trayectorias basado en tiempo simulado, no en fotogramas.
- [ ] Mejorar compatibilidad con pantallas de alta densidad y móvil.
- [ ] Mostrar escala espacial y unidades en la rejilla.
- [ ] Mostrar el momento angular y su error de conservación.
- [ ] Manejar casos límite: cuerpos coincidentes, masas inválidas y encuentros próximos.

## Versión futura — Experimentos orbitales (pospuesta)

**Estas funcionalidades no se desarrollarán en la iteración actual:**

- [ ] Modificar condiciones iniciales desde la interfaz.
- [ ] Aplicar impulsos de velocidad (`Δv`) a cuerpos y sondas.
- [ ] Calcular semieje mayor, excentricidad, periapsis, apoapsis y período orbital.
- [ ] Analizar órbitas elípticas, parabólicas e hiperbólicas.
- [ ] Añadir panel de maniobras orbitales.

## Futuro a largo plazo — Simulación ampliada

- [ ] Permitir crear/eliminar cuerpos desde la interfaz.
- [ ] Introducir sondas y satélites.
- [ ] Añadir sistemas planetarios con más cuerpos.
- [ ] Explorar transferencias de Hohmann y otras trayectorias.
- [ ] Exportar/importar escenarios y resultados.
- [ ] Comparar integradores y monitorizar errores numéricos.

## Criterios de aceptación para nuevas funciones

1. El cálculo físico no debe depender del renderizador.
2. Todas las magnitudes deben tener unidades explícitas.
3. Funciones y componentes relevantes deben tener TSDoc.
4. Las visualizaciones deben distinguir escalas físicas de escalas gráficas.
5. Toda funcionalidad física importante debe acompañarse de una prueba verificable.

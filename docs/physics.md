# Modelo físico y validación

## Alcance

Modelo **newtoniano bidimensional** del sistema Tierra–Luna, con condiciones iniciales circulares idealizadas. La gravedad actúa entre masas puntuales; cada cuerpo almacena un radio para visualización. No se simulan colisiones ni la influencia solar.

## Unidades

| Magnitud | Unidad |
|---|---|
| Masa | kg |
| Posición y distancia | m |
| Velocidad | m/s |
| Aceleración | m/s² |
| Tiempo de integración | s |
| Energía | J |
| Gravitación universal `G` | m³/(kg·s²) |

## Constantes de partida

| Constante | Valor |
|---|---:|
| `G` | `6.67430e-11` |
| Masa terrestre | `5.9722e24 kg` |
| Masa lunar | `7.342e22 kg` |
| Radio terrestre | `6_371_000 m` |
| Radio lunar | `1_737_400 m` |
| Separación inicial | `384_400_000 m` |

La separación inicial **no** equivale a una predicción de la distancia real en una fecha dada.

## Gravitación

Para el cuerpo `i` atraído por el `j`:

\[
\vec a_{i\leftarrow j}=Gm_j \frac{\vec r_j-\vec r_i}{|\vec r_j-\vec r_i|^3}
\]

La aceleración total es la suma vectorial de las contribuciones de los demás cuerpos. El cálculo directo tiene complejidad O(N²).

## Integración temporal

Con paso fijo `Δt`, Velocity Verlet utiliza:

\[
\vec r_{n+1}=\vec r_n+\vec v_n\Delta t+\tfrac12\vec a_n\Delta t^2
\]

\[
\vec v_{n+1}=\vec v_n+\tfrac12(\vec a_n+\vec a_{n+1})\Delta t
\]

Primero se actualizan **todas** las posiciones, luego se recalculan las aceleraciones y finalmente las velocidades; así se evita depender del orden de los cuerpos.

## Condiciones iniciales circulares

- Masa total: `M = M_T + M_L`.
- Distancias al baricentro: `r_T = d M_L / M`, `r_L = d M_T / M`.
- Velocidad angular: `ω = sqrt(G M / d³)`.
- Velocidades iniciales tangenciales y opuestas: `v_T = ωr_T`, `v_L = ωr_L`.

La velocidad relativa circular inicial es aproximadamente **1.024 km/s**. La posición del baricentro está aproximadamente a **4 670 km** del centro de la Tierra.

## Diagnósticos

- Distancia: `|r_L - r_T|`.
- Rapidez relativa: `|v_L - v_T|`.
- Energía total: `Σ (1/2 m_i |v_i|²) − Σ_{i<j} (Gm_i m_j/r_ij)`.
- Error energético relativo porcentual: `100 × |(E − E₀)/E₀|`, si `E₀ ≠ 0`.

El signo negativo de la energía total es compatible con una órbita gravitacionalmente ligada.

## Validación manual sugerida

1. Inicializar la simulación y comprobar velocidad relativa de aproximadamente 1.024 km/s.
2. Simular al menos 30 días con `physicsDt = 60 s`.
3. Comprobar que la distancia Tierra–Luna sigue próxima a la separación inicial.
4. Observar la variación de energía: debe ser pequeña y no crecer sin control con este escenario estable.
5. Repetir con `physicsDt` más pequeño y comparar la convergencia.
6. Pausar o mover cámara: no debe cambiar la física.
7. Probar casos de distancia exactamente cero: el modelo actualmente lanza un error, ya que no incluye colisiones.

## Limitaciones y precauciones

- Velocity Verlet no garantiza precisión para encuentros cercanos con `dt` grande.
- El integrador implementado no tiene detección de colisiones ni paso adaptativo.
- Las velocidades relativas usadas para dibujar no cambian la referencia inercial interna.
- Las flechas utilizan factores de escala visual en píxeles por unidad física.
- La escala mínima de radio visual puede exagerar el tamaño aparente de los cuerpos.

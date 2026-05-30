# Análisis de métricas (Python)

Script que consume la API REST del backend, procesa tickets con Pandas y exporta gráficos + JSON para el dashboard React (`/metrics`).

## Requisitos

- Backend Spring Boot en `http://localhost:8080`
- Usuario admin: `admin@test.com` / `123456` (credenciales usadas por el script)

## Instalación

```bash
cd python
pip install -r requirements.txt
```

## Generar métricas y gráficos

Desde la raíz del proyecto:

```bash
python python/metrics_analyzer.py
```

Salida:

- `frontend/public/data/metrics.json` — KPIs y agrupaciones
- `frontend/public/charts/*.png` — 5 gráficas (barras, pie, líneas, scatter, boxplot)

## Ver en la app

1. Inicia backend y frontend (`npm run dev` en `frontend/`)
2. Inicia sesión y entra al **Dashboard**
3. Pulsa **Métricas** o visita `http://localhost:5173/metrics`

Tras actualizar datos en la BD, vuelve a ejecutar el script y pulsa **Actualizar Datos** en el dashboard de métricas.

# Análisis de métricas (Python)

Módulo independiente que consume la API REST del backend, procesa tickets con **Pandas** y exporta resultados para el dashboard React en `/metrics`.

## Qué hace el script

1. **API REST** – Login y consulta de:
   - `GET /tickets?page=0&size=1000`
   - `GET /users`
2. **Pandas** – DataFrames, 5 filtros con `query()`, agrupaciones con `groupby()`
3. **Matplotlib** – 5 gráficos (barras, pie, líneas, scatter, boxplot) con título y etiquetas
4. **Exportación**
   - `frontend/public/data/metrics.json`
   - `frontend/public/charts/*.png`

## Requisitos

- Python 3.10+
- Backend Spring Boot en `http://localhost:8080`
- Credenciales por defecto: `admin@test.com` / `123456`

## Instalación

```bash
cd python
pip install -r requirements.txt
```

## Ejecutar

Desde la **raíz del proyecto**:

```bash
python python/metrics_analyzer.py
```

Las rutas de salida se resuelven automáticamente respecto a la carpeta del repositorio.

## Ver resultados en la app

1. Backend y frontend en ejecución
2. Iniciar sesión en la app
3. Ir a **Métricas** o `http://localhost:5173/metrics`
4. Tras cambios en la BD, volver a ejecutar el script y pulsar **Actualizar Datos**

## Dependencias

- `requests`
- `pandas`
- `matplotlib`
- `numpy`

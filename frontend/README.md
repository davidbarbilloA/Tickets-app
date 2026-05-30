# Frontend – Ticket System

SPA en **React + TypeScript + Vite** para el gestor de tickets.

## Scripts

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run preview
npm run lint
```

## Páginas

| Archivo | Ruta | Descripción |
|---------|------|-------------|
| `Login.tsx` | `/login` | Autenticación |
| `Dashboard.tsx` | `/dashboard` | Tickets paginados (10/página) |
| `MetricsDashboard.tsx` | `/metrics` | KPIs + gráficos desde `public/data` y `public/charts` |
| `AdminPanel.tsx` | `/admin` | Usuarios y asignaciones (ADMIN) |
| `Register.tsx` | `/register` | Registro de usuarios (ADMIN) |

## Proxy de desarrollo

`vite.config.ts` redirige al backend en `localhost:8080`:

- `/api`
- `/tickets`
- `/users`

## Métricas

Los datos estáticos se generan con el script en `../python/metrics_analyzer.py`. Ver el [README principal](../README.md) y [python/README.md](../python/README.md).

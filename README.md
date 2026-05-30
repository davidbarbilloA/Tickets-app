# Ticket System – Plataforma de gestión de soporte

Sistema full-stack para registrar, asignar y resolver incidencias entre usuarios, técnicos y administradores. Incluye autenticación JWT, control por roles, paginación, historial, comentarios y un módulo de **métricas** (Python + dashboard React).

## Tech stack

| Capa | Tecnologías |
|------|-------------|
| **Frontend** | React 19, TypeScript, Vite, Axios, React Router, Lucide React |
| **Backend** | Spring Boot, Spring Security, JWT, JPA/Hibernate, REST API |
| **Base de datos** | MySQL |
| **Analítica** | Python 3, Pandas, Matplotlib, Requests |

## Estructura del proyecto

```text
App Tickets/
├── backend/ticket-system/     # API REST (Spring Boot)
├── frontend/                  # SPA React (Vite)
├── python/                    # Script de métricas (no modifica backend/frontend)
├── database/                  # Script SQL de esquema y datos iniciales
└── README.md
```

## Funcionalidades

- Autenticación con **JWT** y renovación mediante refresh token (cookie httpOnly)
- Roles **ADMIN**, **TECH** y **USER**
- CRUD de tickets con estados: `OPEN` → `IN_PROGRESS` → `RESOLVED` → `CLOSED`
- Prioridades: `LOW`, `MEDIUM`, `HIGH`
- Asignación de técnicos (admin)
- **Paginación** en el dashboard (10 tickets por página)
- **Comentarios** en tickets (TECH y ADMIN)
- **Historial** de cambios de estado y de técnico
- Panel de administración de usuarios
- **Dashboard de métricas** (`/metrics`): KPIs + gráficos generados con Python

## Sistema de roles y visibilidad

| Rol | Permisos principales | Tickets que ve en el dashboard |
|-----|----------------------|--------------------------------|
| **USER** | Crear tickets, ver detalle de los suyos | Solo los que **él creó** |
| **TECH** | Cambiar estado, comentar | Solo los **asignados a su email** |
| **ADMIN** | Todo lo anterior + registrar usuarios, asignar técnicos, métricas | **Todos** |

Los tickets sin técnico asignado solo los gestiona el **ADMIN** (pestaña de asignaciones).

## Rutas del frontend

| Ruta | Acceso | Descripción |
|------|--------|-------------|
| `/login` | Público | Inicio de sesión |
| `/dashboard` | Autenticado | Listado de tickets (paginado) |
| `/metrics` | Autenticado | KPIs y gráficas de analítica |
| `/admin` | Solo ADMIN | Usuarios y asignación de tickets |
| `/register` | Solo ADMIN | Alta de usuarios |

Desde el dashboard, el botón **Métricas** lleva a `/metrics`.

## API REST (principales endpoints)

### Autenticación (`/api/auth`)

```http
POST /api/auth/login
POST /api/auth/register    # Solo ADMIN
POST /api/auth/refresh
POST /api/auth/logout
```

### Tickets (`/tickets`)

```http
GET    /tickets?page=0&size=10     # Paginado (Spring Page)
GET    /tickets/{id}
POST   /tickets
PUT    /tickets/{id}
DELETE /tickets/{id}
PATCH  /tickets/{id}/status        # Body: { "status": "OPEN" | "IN_PROGRESS" | ... }
PATCH  /tickets/{id}/assign        # Body: { "technicianId": 4 }
GET    /tickets/{id}/comments
POST   /tickets/{id}/comments      # Body: { "content": "..." }
GET    /tickets/{id}/history
```

### Usuarios (`/users`) – ADMIN

```http
GET    /users
GET    /users/technicians
POST   /users
PUT    /users/{id}
DELETE /users/{id}
```

> El frontend en desarrollo usa proxy de Vite hacia `http://localhost:8080` para `/api`, `/tickets` y `/users`.

## Modelo de datos

Entidades principales:

- `users`
- `tickets`
- `ticket_comments`
- `ticket_history`
- `refresh_tokens` (gestión de sesión)

Relaciones:

```text
User 1 ── * Ticket (creador)
User 1 ── * Ticket (técnico asignado, opcional)
Ticket 1 ── * TicketComment
Ticket 1 ── * TicketHistory
```

## Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/davidbarbilloA/Tickets-app.git
cd Tickets-app
```

### 2. Base de datos MySQL

1. Crear la base de datos (por ejemplo `ticket_system`).
2. Importar el script:

```bash
mysql -u root -p ticket_system < database/bd_service_tickets.sql
```

3. Configurar la conexión en el backend (`application.properties` o `application.yml` en `backend/ticket-system/src/main/resources/`), por ejemplo:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/ticket_system
spring.datasource.username=root
spring.datasource.password=tu_password
spring.jpa.hibernate.ddl-auto=update
```

### 3. Backend (puerto 8080)

**Requisitos:** Java 17+, Maven, MySQL en ejecución.

```bash
cd backend/ticket-system
./mvnw spring-boot:run
```

En Windows:

```bash
mvnw.cmd spring-boot:run
```

API disponible en: `http://localhost:8080`

### 4. Frontend (puerto 5173)

**Requisitos:** Node.js 18+

```bash
cd frontend
npm install
npm run dev
```

App disponible en: `http://localhost:5173`

### 5. Métricas con Python (opcional)

Genera `frontend/public/data/metrics.json` y las gráficas PNG a partir de la API (requiere backend activo).

```bash
cd python
pip install -r requirements.txt
cd ..
python python/metrics_analyzer.py
```

Detalle en [python/README.md](python/README.md).

El script usa por defecto `admin@test.com` / `123456` para autenticarse contra la API.

Luego abre **Métricas** en la app o visita `http://localhost:5173/metrics`.

**Salida del análisis:**

- 2 endpoints REST: `/tickets` y `/users`
- 5 filtros de negocio con Pandas `query()`
- Agrupaciones con `groupby()`
- 5 gráficos Matplotlib (barras, pie, líneas, scatter, boxplot)
- Exportación a JSON y PNG para el dashboard React

## Usuarios de prueba (dump SQL)

| Email | Rol | Contraseña (demo) |
|-------|-----|-------------------|
| `admin@test.com` | ADMIN | `123456` |
| `user@test.com` | USER | `123456` |
| `tech1@test.com` | TECH | `123456` |
| `tech2@test.com` | TECH | `123456` |

> Si cambias contraseñas en la BD, actualiza también las credenciales en `python/metrics_analyzer.py` si usas el script de métricas.

## Flujo típico de uso

1. **USER** inicia sesión → crea un ticket (se asigna un técnico al azar si hay técnicos en el sistema).
2. **ADMIN** puede reasignar técnicos en `/admin` → pestaña *Asignaciones de Tickets*.
3. **TECH** ve solo sus tickets asignados → cambia estado y añade comentarios.
4. Cualquier usuario autenticado puede consultar **Métricas** tras ejecutar el script Python.

## Build de producción (frontend)

```bash
cd frontend
npm run build
npm run preview
```

## Autor

- [@davidbarbilloA](https://github.com/davidbarbilloA)

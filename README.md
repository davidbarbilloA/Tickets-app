
# Hola, Soy David! 👋


# Ticket System – Support Management Platform
Sistema de gestión de tickets para registrar, asignar y resolver incidencias de soporte técnico entre usuarios y técnicos.

El proyecto implementa una arquitectura full-stack con autenticación segura, control de roles y seguimiento del ciclo de vida de los tickets.


## Tech Stack

**Frontend:** React, TypeScript, Axios, Vite

**Backend:** Spring Boot, Spring Security, JWT Authentication, JPA/ Hibernate, REST API

**Base de Datos:** MySQL
## Funcionalidades

- Autenticación y automatización mediante **JWT**
- Sistema de roles **(ADMIN, TECH, USER)**
- Creación y gestion de tickets
- Asignación de tickets a técnicos
- API REST segura


## Arquitectura
```text
ticket-system
│
├── backend
│   ├── config
│   ├── controllers
│   ├── domain
│   ├── exceptions
│   ├── mapper
│   ├── services
│   ├── repositories
│   └── security
│
└── frontend
    ├── components
    ├── pages
    └── services
```
## Modelo de Base de Datos

Principales entidades del sistema:

- **users**
- **tickets**
- **ticket_history**
- **ticket_comments**

Relaciones principales

```text
User 1 ── * Tickets
Ticket 1 ── * TicketHistory
Ticket 1 ── * TicketComments
```

Estados de tickets:

```text
OPEN → IN_PROGRESS → RESOLVED → CLOSED
```
## Sistema de Roles

| Rol               | Permisos                | 
| :-----------------------| :------------------ | 
| `USER`                    | `Crear tickets`|  
| `TECH`                    | `Gestionar y resolver tickets`|
| `ADMIN`                   | `Administrador total del sitio`|                           
## API Endponts

#### Autenticación

```http
  POST /api/auth/login
  POST /api/auth/register
```

#### Tickets

```http
  GET /api/tickets
  POST /api/tickets
  PUT /api/tickets/{id}
  DELETE /api/tickets/{id}
```
#### Comentarios

```http
  POST /api/tickets/{id}/comments
  GET /api/tickets/{id}/comments
```

## Instalación y ejecución

**1. Clonar el repositorio**

```bash
  git clone https://github.com/davidbarbilloA/Tickets-app.git
  cd Tickets-app
```
## 
**2. Backend:**

    Requisitos

    - Java 17+
    - Maven
    - MySQL

Ejecutar:

```bash
    cd backend/ticket-system
    mvn spring-boot:run
```
Servidor disponible en 

```bash
  http://localhost:8080
```
## 
**3. Frontend:**

    Requisitos

    - Node.js

Ejecutar:

```bash
    cd frontend
    npm install
    npm run dev
```
Aplicación disponible en 

```bash
  http://localhost:5173
```

## Mejoras Futuras

- Adjuntar archivos a tickets
- Notificaciones en tiempo real
- Dashboard con métricas
- Paginación de tickets
- Seguimiento estado de tickets
- Historial de cambios de estado
- Comentarios en tickets
## Authors

- [@davidbarbilloa](https://github.com/davidbarbilloA)

Ticket System – Support Management Platform

Sistema de gestión de tickets para registrar, asignar y resolver incidencias de soporte técnico entre usuarios y técnicos.

El proyecto implementa una arquitectura full-stack con autenticación segura, control de roles y seguimiento del ciclo de vida de los tickets.

🚀 Tecnologías
Backend

Spring Boot

Spring Security

JWT Authentication

JPA / Hibernate

REST API

Frontend

React

TypeScript

Axios

Vite

Base de datos

MySQL

⚙️ Funcionalidades

Autenticación y autorización mediante JWT

Sistema de roles (ADMIN, TECH, USER)

Creación y gestión de tickets

Asignación de tickets a técnicos

Seguimiento de estados de tickets

Historial de cambios de estado

Comentarios en tickets

API REST segura

🗂️ Arquitectura del proyecto
ticket-system
│
├── backend
│   ├── config
│   ├── controllers
│   ├── domain
│   ├── exeptions
│   ├── mapper
│   ├── services
│   ├── repositories
│   └── security
│
└── frontend
    ├── components
    ├── pages
    └── services
🗄️ Modelo de Base de Datos

Principales entidades del sistema:

users

tickets

ticket_history

ticket_comments

Relaciones principales:

User 1 ── * Tickets
Ticket 1 ── * TicketHistory
Ticket 1 ── * TicketComments

Estados de ticket:

OPEN → IN_PROGRESS → RESOLVED → CLOSED
🔐 Sistema de Roles
Rol	Permisos
USER	Crear tickets
TECH	Gestionar y resolver tickets
ADMIN	Administrar usuarios
📡 API Endpoints
Autenticación
POST /api/auth/login
POST /api/auth/register
Tickets
GET /api/tickets
POST /api/tickets
PUT /api/tickets/{id}
DELETE /api/tickets/{id}
Comentarios
POST /api/tickets/{id}/comments
GET /api/tickets/{id}/comments
🖥️ Instalación y ejecución
1. Clonar repositorio
git clone https://github.com/tuusuario/ticket-system.git
cd ticket-system
2. Backend

Requisitos

Java 17+

Maven

MySQL

Ejecutar:

cd backend
mvn spring-boot:run

Servidor disponible en:

http://localhost:8080
3. Frontend

Requisitos

Node.js

Ejecutar:

cd frontend
npm install
npm run dev

Aplicación disponible en:

http://localhost:5173
📷 Screenshots
Pendientes

📌 Mejoras futuras

Adjuntar archivos a tickets

Notificaciones en tiempo real

Dashboard con métricas

Paginación de tickets

Deploy en cloud

👨‍💻 Autor

David – Full Stack Developer

GitHub:
https://github.com/davidbarbilloA

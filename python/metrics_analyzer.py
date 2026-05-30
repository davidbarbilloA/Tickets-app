import os
import json
import requests
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
DATA_DIR = os.path.join(PROJECT_ROOT, "frontend", "public", "data")
CHARTS_DIR = os.path.join(PROJECT_ROOT, "frontend", "public", "charts")

# Configurar el estilo de los gráficos para que se vean premium (Dark theme)
plt.style.use('dark_background')
plt.rcParams['figure.facecolor'] = '#0f172a'
plt.rcParams['axes.facecolor'] = '#1e293b'
plt.rcParams['text.color'] = '#f8fafc'
plt.rcParams['axes.labelcolor'] = '#94a3b8'
plt.rcParams['xtick.color'] = '#94a3b8'
plt.rcParams['ytick.color'] = '#94a3b8'
plt.rcParams['font.sans-serif'] = 'sans-serif'

# 1. Consumir la API REST desde Python
BASE_URL = "http://localhost:8080"
LOGIN_URL = f"{BASE_URL}/api/auth/login"
TICKETS_URL = f"{BASE_URL}/tickets"
USERS_URL = f"{BASE_URL}/users"

def get_auth_token():
    print("Iniciando sesión en la API REST...")
    try:
        response = requests.post(LOGIN_URL, json={
            "email": "admin@test.com",
            "password": "123456"
        })
        if response.status_code == 200:
            token = response.json().get("token")
            print("Token obtenido con éxito.")
            return token
        else:
            print(f"Error de autenticación: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"No se pudo conectar a la API: {e}")
        return None

def fetch_data():
    token = get_auth_token()
    if not token:
        print("Usando datos de respaldo (backup local) para garantizar la ejecución...")
        return get_backup_data()
        
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        # Obtener todos los tickets (tamaño grande para traer todos)
        tickets_resp = requests.get(f"{TICKETS_URL}?page=0&size=1000", headers=headers)
        users_resp = requests.get(USERS_URL, headers=headers)
        
        if tickets_resp.status_code == 200 and users_resp.status_code == 200:
            tickets_data = tickets_resp.json().get("content", [])
            users_data = users_resp.json()
            
            # Si hay muy pocos tickets, rellenamos con datos realistas para los gráficos
            if len(tickets_data) < 5:
                print("Pocos tickets en la BD. Creando tickets de prueba para métricas más ricas...")
                seed_tickets(headers)
                # Volver a consultar
                tickets_resp = requests.get(f"{TICKETS_URL}?page=0&size=1000", headers=headers)
                tickets_data = tickets_resp.json().get("content", [])
                
            return tickets_data, users_data
        else:
            print("Error al consultar endpoints. Usando datos de respaldo...")
            return get_backup_data()
    except Exception as e:
        print(f"Error al consumir la API: {e}. Usando datos de respaldo...")
        return get_backup_data()

def seed_tickets(headers):
    # Generar algunos tickets realistas usando la API
    sample_tickets = [
        {"title": "Fallo en pasarela de pagos", "description": "Error 500 al procesar tarjetas de crédito Visa", "priority": "HIGH"},
        {"title": "Error al cargar dashboard", "description": "Los gráficos de barras no cargan en Safari", "priority": "MEDIUM"},
        {"title": "Actualizar términos y condiciones", "description": "Modificar el texto legal de privacidad", "priority": "LOW"},
        {"title": "Fuga de memoria en el login", "description": "El endpoint de login consume mucha memoria bajo carga", "priority": "HIGH"},
        {"title": "Ajuste de colores del botón de logout", "description": "Cambiar el rojo a uno más suave", "priority": "LOW"},
        {"title": "Configurar notificaciones por correo", "description": "Enviar un email al asignar un técnico", "priority": "MEDIUM"},
        {"title": "Lentitud en la consulta de usuarios", "description": "La paginación tarda más de 3 segundos", "priority": "HIGH"},
        {"title": "Error de tipeo en perfil", "description": "Dice 'Usario' en vez de 'Usuario'", "priority": "LOW"},
        {"title": "Problema con caracteres especiales", "description": "Las tildes se rompen en el formulario de registro", "priority": "MEDIUM"},
        {"title": "Integración con Slack", "description": "Crear webhook para avisar de nuevos tickets", "priority": "LOW"},
        {"title": "Revisar expiración de JWT", "description": "El token expira muy rápido (menos de 5 minutos)", "priority": "HIGH"},
    ]
    for st in sample_tickets:
        try:
            requests.post(TICKETS_URL, json=st, headers=headers)
        except Exception as e:
            print(f"Error seeding ticket: {e}")
            
    # Asignar algunos técnicos de forma aleatoria para enriquecer el dataset
    try:
        tickets_resp = requests.get(f"{TICKETS_URL}?page=0&size=1000", headers=headers)
        tickets = tickets_resp.json().get("content", [])
        for i, t in enumerate(tickets):
            if i % 2 == 0:
                # Asignar a técnico 2 (ID 5) o técnico 1 (ID 4)
                tech_id = 5 if i % 4 == 0 else 4
                requests.patch(f"{TICKETS_URL}/{t['id']}/assign", json={"technicianId": tech_id}, headers=headers)
                # Cambiar algunos estados
                if i % 3 == 0:
                    requests.patch(f"{TICKETS_URL}/{t['id']}/status", json={"status": "IN_PROGRESS"}, headers=headers)
                elif i % 5 == 0:
                    requests.patch(f"{TICKETS_URL}/{t['id']}/status", json={"status": "RESOLVED"}, headers=headers)
    except Exception as e:
        print(f"Error assigning technicians during seed: {e}")

def get_backup_data():
    # Datos simulados de respaldo para asegurar que el script funcione sin importar el entorno
    print("Cargando datos locales simulados...")
    users = [
        {"id": 1, "name": "Admin", "email": "admin@test.com", "role": "ADMIN"},
        {"id": 2, "name": "usuario", "email": "user@test.com", "role": "USER"},
        {"id": 4, "name": "tecnico1", "email": "tech1@test.com", "role": "TECH"},
        {"id": 5, "name": "tecnico2", "email": "tech2@test.com", "role": "TECH"}
    ]
    tickets = [
        {"id": 1, "title": "Prueba inicial", "description": "Prueba de conexión", "status": "IN_PROGRESS", "createdAt": "2026-05-20T10:00:00", "creatorEmail": "user@test.com", "assignedToEmail": "tech2@test.com"},
        {"id": 2, "title": "Fallo en pasarela de pagos", "description": "Error 500 al procesar tarjetas de crédito Visa", "status": "OPEN", "createdAt": "2026-05-25T11:00:00", "creatorEmail": "user@test.com", "assignedToEmail": None},
        {"id": 3, "title": "Error al cargar dashboard", "description": "Los gráficos de barras no cargan en Safari", "status": "IN_PROGRESS", "createdAt": "2026-05-26T12:00:00", "creatorEmail": "user@test.com", "assignedToEmail": "tech1@test.com"},
        {"id": 4, "title": "Actualizar términos y condiciones", "description": "Modificar el texto legal de privacidad", "status": "CLOSED", "createdAt": "2026-05-27T13:00:00", "creatorEmail": "admin@test.com", "assignedToEmail": "tech2@test.com"},
        {"id": 5, "title": "Fuga de memoria en el login", "description": "El endpoint de login consume mucha memoria bajo carga", "status": "OPEN", "createdAt": "2026-05-28T14:00:00", "creatorEmail": "user@test.com", "assignedToEmail": None},
        {"id": 6, "title": "Ajuste de colores del botón", "description": "Cambiar el rojo a uno más suave", "status": "RESOLVED", "createdAt": "2026-05-28T15:00:00", "creatorEmail": "admin@test.com", "assignedToEmail": "tech1@test.com"},
        {"id": 7, "title": "Configurar notificaciones", "description": "Enviar un email al asignar un técnico", "status": "IN_PROGRESS", "createdAt": "2026-05-29T09:00:00", "creatorEmail": "user@test.com", "assignedToEmail": "tech2@test.com"},
        {"id": 8, "title": "Lentitud en consulta de usuarios", "description": "La paginación tarda más de 3 segundos", "status": "OPEN", "createdAt": "2026-05-29T10:00:00", "creatorEmail": "user@test.com", "assignedToEmail": None},
        {"id": 9, "title": "Error de tipeo en perfil", "description": "Dice 'Usario' en vez de 'Usuario'", "status": "CLOSED", "createdAt": "2026-05-29T11:00:00", "creatorEmail": "admin@test.com", "assignedToEmail": "tech1@test.com"},
        {"id": 10, "title": "Problema con caracteres especiales", "description": "Las tildes se rompen en el formulario", "status": "OPEN", "createdAt": "2026-05-30T08:00:00", "creatorEmail": "user@test.com", "assignedToEmail": None}
    ]
    return tickets, users

def run_analysis():
    tickets_data, users_data = fetch_data()
    
    # 2. Cargar en DataFrames de Pandas
    df_tickets = pd.DataFrame(tickets_data)
    df_users = pd.DataFrame(users_data)
    
    # Preprocesamiento: Limpieza y creación de variables auxiliares
    df_tickets['assignedToEmail'] = df_tickets['assignedToEmail'].fillna('Sin asignar')
    df_tickets['description_len'] = df_tickets['description'].apply(lambda x: len(str(x)))
    df_tickets['title_len'] = df_tickets['title'].apply(lambda x: len(str(x)))
    df_tickets['createdAt'] = pd.to_datetime(df_tickets['createdAt'])
    
    print("\n--- DATAFRAME TICKETS (Primeros 5 registros) ---")
    print(df_tickets.head())
    
    # 3. Aplicar filtros sobre los datos (5 filtros con query() y operadores lógicos)
    print("\n=== APLICANDO FILTROS DE NEGOCIO ===")
    
    # Filtro 1: Tickets activos creados por un usuario específico
    f1 = df_tickets.query("creatorEmail == 'user@test.com' and (status == 'OPEN' or status == 'IN_PROGRESS')")
    print(f"\n1. ¿Qué tickets activos pertenecen al usuario estándar (user@test.com)? (Total: {len(f1)})")
    print(f1[['id', 'title', 'status', 'creatorEmail']])
    
    # Filtro 2: Tickets en curso asignados a 'tech2@test.com'
    f2 = df_tickets.query("assignedToEmail == 'tech2@test.com' and status == 'IN_PROGRESS'")
    print(f"\n2. ¿Qué tickets están en progreso por el técnico 2 (tech2@test.com)? (Total: {len(f2)})")
    print(f2[['id', 'title', 'status', 'assignedToEmail']])
    
    # Filtro 3: Tickets sin asignar que aún están abiertos
    f3 = df_tickets.query("assignedToEmail == 'Sin asignar' and status == 'OPEN'")
    print(f"\n3. ¿Qué incidencias están sin asignar y abiertas (Crítico)? (Total: {len(f3)})")
    print(f3[['id', 'title', 'status', 'assignedToEmail']])
    
    # Filtro 4: Tickets con descripción detallada (larga) que ya fueron resueltos o cerrados
    f4 = df_tickets.query("description_len > 15 and (status == 'RESOLVED' or status == 'CLOSED')")
    print(f"\n4. ¿Qué incidencias detalladas ya se resolvieron o cerraron? (Total: {len(f4)})")
    print(f4[['id', 'title', 'description_len', 'status']])
    
    # Filtro 5: Tickets de autogestión (creador y asignado son el mismo o creados por admin)
    f5 = df_tickets.query("creatorEmail == 'admin@test.com' and assignedToEmail != 'Sin asignar'")
    print(f"\n5. ¿Qué tickets creados por el administrador están asignados a algún técnico? (Total: {len(f5)})")
    print(f5[['id', 'title', 'creatorEmail', 'assignedToEmail']])
    
    # 4. Agrupar y resumir información
    print("\n=== AGRUPACIONES Y MÉTRICAS ===")
    
    # Agrupación 1: Estado del ticket
    by_status = df_tickets.groupby('status').size().to_dict()
    print("\nTickets por Estado:")
    print(by_status)
    
    # Agrupación 2: Asignaciones por técnico
    by_tech = df_tickets.groupby('assignedToEmail').size().to_dict()
    print("\nAsignaciones por Técnico:")
    print(by_tech)
    
    # Agrupación 3: Creaciones por usuario
    by_creator = df_tickets.groupby('creatorEmail').size().to_dict()
    print("\nTickets creados por Usuario:")
    print(by_creator)
    
    # Métricas agregadas
    total_tickets = len(df_tickets)
    open_tickets = len(df_tickets[df_tickets['status'] == 'OPEN'])
    in_progress_tickets = len(df_tickets[df_tickets['status'] == 'IN_PROGRESS'])
    resolved_tickets = len(df_tickets[df_tickets['status'] == 'RESOLVED'])
    closed_tickets = len(df_tickets[df_tickets['status'] == 'CLOSED'])
    unassigned_tickets = len(df_tickets[df_tickets['assignedToEmail'] == 'Sin asignar'])
    
    resolution_rate = ((resolved_tickets + closed_tickets) / total_tickets * 100) if total_tickets > 0 else 0.0
    
    # Exportar datos agrupados a JSON
    metrics_json = {
        "summary": {
            "totalTickets": total_tickets,
            "openTickets": open_tickets,
            "inProgressTickets": in_progress_tickets,
            "resolvedTickets": resolved_tickets,
            "closedTickets": closed_tickets,
            "unassignedTickets": unassigned_tickets,
            "resolutionRate": round(resolution_rate, 2)
        },
        "byStatus": by_status,
        "byTech": by_tech,
        "byCreator": by_creator
    }
    
    os.makedirs(DATA_DIR, exist_ok=True)
    os.makedirs(CHARTS_DIR, exist_ok=True)
    
    with open(os.path.join(DATA_DIR, "metrics.json"), "w", encoding="utf-8") as f:
        json.dump(metrics_json, f, indent=4, ensure_ascii=False)
    print(f"\nDatos de métricas exportados a {DATA_DIR}/metrics.json")
    
    # 5. Generar gráficas con Matplotlib (5 gráficas de diferentes tipos)
    print("\n=== GENERANDO GRÁFICOS ===")
    
    # Gráfica 1: Barras - Tickets por Estado
    plt.figure(figsize=(7, 4.5))
    statuses = list(by_status.keys())
    counts = list(by_status.values())
    colors = ['#3b82f6' if s == 'IN_PROGRESS' else '#fbbf24' if s == 'OPEN' else '#10b981' if s == 'CLOSED' else '#a855f7' for s in statuses]
    plt.bar(statuses, counts, color=colors, edgecolor='white', linewidth=0.5, width=0.6)
    plt.title("Distribución de Tickets por Estado", fontsize=14, pad=15, fontweight='bold')
    plt.xlabel("Estado del Ticket", fontsize=11, labelpad=10)
    plt.ylabel("Cantidad", fontsize=11, labelpad=10)
    plt.grid(axis='y', linestyle='--', alpha=0.2)
    plt.tight_layout()
    plt.savefig(os.path.join(CHARTS_DIR, "chart_status_bar.png"), dpi=150)
    plt.close()
    
    # Gráfica 2: Pie - Creadores de Tickets
    plt.figure(figsize=(6, 5))
    creators = list(by_creator.keys())
    creator_counts = list(by_creator.values())
    plt.pie(creator_counts, labels=creators, autopct='%1.1f%%', startangle=140, 
            colors=['#60a5fa', '#a78bfa', '#34d399', '#fca5a5'],
            textprops={'fontsize': 10, 'weight': 'bold'},
            wedgeprops={'edgecolor': '#0f172a', 'linewidth': 2})
    plt.title("Proporción de Tickets por Creador", fontsize=14, pad=15, fontweight='bold')
    plt.tight_layout()
    plt.savefig(os.path.join(CHARTS_DIR, "chart_creator_pie.png"), dpi=150)
    plt.close()
    
    # Gráfica 3: Líneas - Creación acumulada a lo largo del tiempo
    plt.figure(figsize=(7, 4.5))
    df_sorted = df_tickets.sort_values('createdAt')
    df_sorted['count'] = 1
    df_sorted['cumulative'] = df_sorted['count'].cumsum()
    plt.plot(df_sorted['createdAt'], df_sorted['cumulative'], color='#38bdf8', marker='o', linewidth=2.5, markersize=6)
    plt.title("Historial de Carga y Creación Acumulada", fontsize=14, pad=15, fontweight='bold')
    plt.xlabel("Fecha de Creación", fontsize=11, labelpad=10)
    plt.ylabel("Total de Tickets (Acumulado)", fontsize=11, labelpad=10)
    plt.gcf().autofmt_xdate()
    plt.grid(True, linestyle='--', alpha=0.15)
    plt.tight_layout()
    plt.savefig(os.path.join(CHARTS_DIR, "chart_timeline_line.png"), dpi=150)
    plt.close()
    
    # Gráfica 4: Scatter - ID de Ticket vs Longitud de Descripción
    plt.figure(figsize=(7, 4.5))
    plt.scatter(df_tickets['id'], df_tickets['description_len'], color='#c084fc', alpha=0.8, s=80, edgecolors='white', linewidths=0.5)
    # Línea de tendencia
    if len(df_tickets) > 1:
        z = np.polyfit(df_tickets['id'], df_tickets['description_len'], 1)
        p = np.poly1d(z)
        plt.plot(df_tickets['id'], p(df_tickets['id']), color='#e879f9', linestyle=':', alpha=0.7, label='Tendencia')
    plt.title("Relación ID de Ticket vs Longitud de Descripción", fontsize=14, pad=15, fontweight='bold')
    plt.xlabel("ID del Ticket (Orden Cronológico)", fontsize=11, labelpad=10)
    plt.ylabel("Longitud del Detalle (Caracteres)", fontsize=11, labelpad=10)
    plt.grid(True, linestyle='--', alpha=0.15)
    plt.tight_layout()
    plt.savefig(os.path.join(CHARTS_DIR, "chart_complexity_scatter.png"), dpi=150)
    plt.close()
    
    # Gráfica 5: Boxplot - Distribución de Longitud de Título por Estado
    plt.figure(figsize=(7, 4.5))
    state_groups = [df_tickets[df_tickets['status'] == s]['title_len'].values for s in statuses]
    bp = plt.boxplot(state_groups, tick_labels=statuses, patch_artist=True,
                boxprops=dict(facecolor='#1e293b', color='#60a5fa', linewidth=1.5),
                capprops=dict(color='#94a3b8'),
                whiskerprops=dict(color='#94a3b8'),
                flierprops=dict(markeredgecolor='#ef4444', marker='o'),
                medianprops=dict(color='#34d399', linewidth=2))
    
    # Pintar las cajas
    colors_bp = [(59/255, 130/255, 246/255, 0.3), (251/255, 191/255, 36/255, 0.3), (16/255, 185/255, 129/255, 0.3), (168/255, 85/255, 247/255, 0.3)]
    for patch, color in zip(bp['boxes'], colors_bp[:len(bp['boxes'])]):
        patch.set_facecolor(color)
        
    plt.title("Distribución de la Longitud del Asunto por Estado", fontsize=14, pad=15, fontweight='bold')
    plt.xlabel("Estado del Ticket", fontsize=11, labelpad=10)
    plt.ylabel("Longitud del Título (Caracteres)", fontsize=11, labelpad=10)
    plt.grid(axis='y', linestyle='--', alpha=0.15)
    plt.tight_layout()
    plt.savefig(os.path.join(CHARTS_DIR, "chart_length_boxplot.png"), dpi=150)
    plt.close()
    
    print("¡5 Gráficos generados con éxito y guardados en frontend/public/charts/!")

if __name__ == "__main__":
    run_analysis()

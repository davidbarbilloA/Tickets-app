import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import type { User as UserType } from "../types/user";
import { Users, UserPlus, Trash2, Shield, Loader2, AlertCircle, X, Ticket as TicketIcon, UserCheck } from "lucide-react";

interface Ticket {
    id: number;
    title: string;
    status: string;
    creatorEmail: string;
    assignedToEmail: string;
}

export default function AdminPanel() {
    const [users, setUsers] = useState<UserType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form crear usuario
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<"USER" | "TECH" | "ADMIN">("USER");
    const [submitting, setSubmitting] = useState(false);
    const [userToDelete, setUserToDelete] = useState<UserType | null>(null);

    // Gestión de técnicos por ticket
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [technicians, setTechnicians] = useState<UserType[]>([]);
    const [loadingTickets, setLoadingTickets] = useState(false);
    const [activeTab, setActiveTab] = useState<"users" | "tickets">("users");
    const [assigningTicketId, setAssigningTicketId] = useState<number | null>(null);
    const [selectedTechId, setSelectedTechId] = useState<number | null>(null);
    const [savingAssign, setSavingAssign] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
        fetchTicketsAndTechs();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get<UserType[]>("/users");
            setUsers(response.data);
        } catch (error) {
            setError("No se pudieron cargar los usuarios.");
        } finally {
            setLoading(false);
        }
    };

    const fetchTicketsAndTechs = async () => {
        setLoadingTickets(true);
        try {
            const [ticketsRes, techsRes] = await Promise.all([
                api.get<Ticket[]>("/tickets"),
                api.get<UserType[]>("/users/technicians"),
            ]);
            setTickets(ticketsRes.data);
            setTechnicians(techsRes.data);
        } catch (error) {
            console.error("Error al cargar tickets/técnicos", error);
        } finally {
            setLoadingTickets(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post("/api/auth/register", { name, email, password, role });
            setName("");
            setEmail("");
            setPassword("");
            setRole("USER");
            fetchUsers();
            fetchTicketsAndTechs();
        } catch (error) {
            alert("Error al crear usuario");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        setSubmitting(true);
        try {
            await api.delete(`/users/${userToDelete.id}`);
            fetchUsers();
            setUserToDelete(null);
        } catch (error) {
            alert("No se pudo eliminar el usuario. Es posible que tenga tickets vinculados.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleAssignTechnician = async (ticketId: number) => {
        if (!selectedTechId) return;
        setSavingAssign(true);
        try {
            await api.patch(`/tickets/${ticketId}/assign`, { technicianId: selectedTechId });
            await fetchTicketsAndTechs();
            setAssigningTicketId(null);
            setSelectedTechId(null);
        } catch (error: any) {
            const msg = error?.response?.data || error?.message || "Error desconocido";
            alert(`Error al reasignar el técnico: ${msg}`);
        } finally {
            setSavingAssign(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case "OPEN": return "#fbbf24";
            case "IN_PROGRESS": return "#3b82f6";
            case "CLOSED": return "#10b981";
            default: return "#94a3b8";
        }
    };

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", color: "white", padding: "2rem" }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                <header style={{ marginBottom: "2rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ background: "#c084fc", borderRadius: "12px", padding: "10px" }}>
                        <Shield size={28} color="white" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ margin: 0 }}>Panel de Administración</h1>
                        <p style={{ color: "#94a3b8", margin: 0 }}>Gestiona usuarios, permisos y asignaciones del sistema.</p>
                    </div>
                    <button
                        onClick={() => navigate("/dashboard")}
                        title="Volver a Tickets"
                        style={{
                            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                            color: "#94a3b8", cursor: "pointer", padding: "8px", borderRadius: "10px",
                            display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s"
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                            e.currentTarget.style.color = "#ef4444";
                            e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.2)";
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                            e.currentTarget.style.color = "#94a3b8";
                            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                        }}
                    >
                        <X size={24} />
                    </button>
                </header>

                {/* Tabs */}
                <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0" }}>
                    {[
                        { key: "users", label: "Usuarios", icon: <Users size={16} /> },
                        { key: "tickets", label: "Asignaciones de Tickets", icon: <TicketIcon size={16} /> },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as any)}
                            style={{
                                display: "flex", alignItems: "center", gap: "0.5rem",
                                background: "transparent", border: "none", borderBottom: activeTab === tab.key ? "2px solid #3b82f6" : "2px solid transparent",
                                color: activeTab === tab.key ? "#60a5fa" : "#64748b",
                                fontSize: "0.95rem", fontWeight: 600, padding: "0.75rem 1rem",
                                cursor: "pointer", transition: "all 0.2s", marginBottom: "-1px"
                            }}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* TAB: USUARIOS */}
                {activeTab === "users" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem" }}>
                        {/* Create User Form */}
                        <div className="glass-card" style={{ height: "fit-content" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
                                <UserPlus size={20} color="#60a5fa" />
                                <h3 style={{ margin: 0 }}>Crear Usuario</h3>
                            </div>
                            <form onSubmit={handleCreateUser}>
                                <div style={{ marginBottom: "1rem" }}>
                                    <label style={{ display: "block", fontSize: "0.875rem", color: "#94a3b8", marginBottom: "0.5rem" }}>Nombre</label>
                                    <input value={name} onChange={e => setName(e.target.value)} required placeholder="Nombre completo" />
                                </div>
                                <div style={{ marginBottom: "1rem" }}>
                                    <label style={{ display: "block", fontSize: "0.875rem", color: "#94a3b8", marginBottom: "0.5rem" }}>Email</label>
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="correo@ejemplo.com" />
                                </div>
                                <div style={{ marginBottom: "1rem" }}>
                                    <label style={{ display: "block", fontSize: "0.875rem", color: "#94a3b8", marginBottom: "0.5rem" }}>Contraseña</label>
                                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
                                </div>
                                <div style={{ marginBottom: "1.5rem" }}>
                                    <label style={{ display: "block", fontSize: "0.875rem", color: "#94a3b8", marginBottom: "0.5rem" }}>Rol</label>
                                    <select
                                        value={role}
                                        onChange={e => setRole(e.target.value as any)}
                                        style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", background: "#1e293b", color: "white", border: "1px solid #334155" }}
                                    >
                                        <option value="USER">Usuario (Cliente)</option>
                                        <option value="TECH">Técnico</option>
                                        <option value="ADMIN">Administrador</option>
                                    </select>
                                </div>
                                <button type="submit" disabled={submitting} style={{ width: "100%", background: "#3b82f6" }}>
                                    {submitting ? <Loader2 className="animate-spin" size={20} /> : "Crear Usuario"}
                                </button>
                            </form>
                        </div>

                        {/* Users List */}
                        <div className="glass-card">
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
                                <Users size={20} color="#60a5fa" />
                                <h3 style={{ margin: 0 }}>Usuarios del Sistema</h3>
                            </div>

                            {loading ? (
                                <div style={{ textAlign: "center", padding: "3rem" }}>
                                    <Loader2 className="animate-spin" size={32} color="#3b82f6" />
                                </div>
                            ) : error ? (
                                <div style={{ textAlign: "center", padding: "2rem", color: "#ef4444" }}>
                                    <AlertCircle size={32} style={{ marginBottom: "1rem" }} />
                                    <p>{error}</p>
                                </div>
                            ) : (
                                <div style={{ overflowX: "auto" }}>
                                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                        <thead style={{ textAlign: "left", background: "rgba(255,255,255,0.05)" }}>
                                            <tr>
                                                <th style={{ padding: "1rem" }}>Usuario</th>
                                                <th style={{ padding: "1rem" }}>Rol</th>
                                                <th style={{ padding: "1rem" }}>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map(u => (
                                                <tr key={u.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                                    <td style={{ padding: "1rem" }}>
                                                        <div style={{ fontWeight: 600 }}>{u.name}</div>
                                                        <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{u.email}</div>
                                                    </td>
                                                    <td style={{ padding: "1rem" }}>
                                                        <span style={{
                                                            fontSize: "0.75rem", padding: "2px 8px", borderRadius: "4px",
                                                            background: u.role === 'ADMIN' ? 'rgba(192, 132, 252, 0.2)' : u.role === 'TECH' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                                                            color: u.role === 'ADMIN' ? '#c084fc' : u.role === 'TECH' ? '#60a5fa' : '#94a3b8',
                                                            border: "1px solid currentColor"
                                                        }}>
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: "1rem" }}>
                                                        <button
                                                            onClick={() => setUserToDelete(u)}
                                                            style={{ background: "transparent", border: "1px solid #ef4444", color: "#ef4444", padding: "4px 8px" }}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB: ASIGNACIONES DE TICKETS */}
                {activeTab === "tickets" && (
                    <div className="glass-card">
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
                            <UserCheck size={20} color="#60a5fa" />
                            <h3 style={{ margin: 0 }}>Reasignar Técnico por Ticket</h3>
                        </div>
                        <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
                            Selecciona un ticket y cambia el técnico responsable. El cambio quedará registrado en el historial del ticket.
                        </p>

                        {loadingTickets ? (
                            <div style={{ textAlign: "center", padding: "3rem" }}>
                                <Loader2 className="animate-spin" size={32} color="#3b82f6" />
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                {tickets.map(ticket => (
                                    <div key={ticket.id} style={{
                                        background: "rgba(255,255,255,0.03)", borderRadius: "10px",
                                        padding: "1rem 1.25rem", border: "1px solid rgba(255,255,255,0.07)"
                                    }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
                                            <div>
                                                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.3rem" }}>
                                                    <span style={{ fontSize: "0.75rem", color: "#64748b" }}>#{ticket.id}</span>
                                                    <span style={{
                                                        fontSize: "0.7rem", fontWeight: 700, padding: "2px 7px", borderRadius: "4px",
                                                        background: `${getStatusColor(ticket.status)}22`,
                                                        color: getStatusColor(ticket.status),
                                                        border: `1px solid ${getStatusColor(ticket.status)}55`
                                                    }}>
                                                        {ticket.status}
                                                    </span>
                                                </div>
                                                <p style={{ margin: 0, fontWeight: 600, color: "#f1f5f9" }}>{ticket.title}</p>
                                                <div style={{ display: "flex", gap: "1rem", marginTop: "0.3rem" }}>
                                                    <span style={{ fontSize: "0.78rem", color: "#3b82f6" }}>Por: {ticket.creatorEmail}</span>
                                                    <span style={{ fontSize: "0.78rem", color: "#10b981" }}>
                                                        Técnico: {ticket.assignedToEmail || "Sin asignar"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                                {assigningTicketId === ticket.id ? (
                                                    <>
                                                        <select
                                                            onChange={e => setSelectedTechId(Number(e.target.value))}
                                                            defaultValue=""
                                                            style={{
                                                                background: "#1e293b", border: "1px solid #334155",
                                                                borderRadius: "8px", color: "white",
                                                                padding: "6px 10px", fontSize: "0.875rem"
                                                            }}
                                                        >
                                                            <option value="" disabled>Selecciona técnico</option>
                                                            {technicians.map(t => (
                                                                <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                                                            ))}
                                                        </select>
                                                        <button
                                                            onClick={() => handleAssignTechnician(ticket.id)}
                                                            disabled={savingAssign || !selectedTechId}
                                                            style={{ background: "#10b981", border: "none", borderRadius: "8px", padding: "6px 14px", color: "white", cursor: "pointer", fontSize: "0.875rem" }}
                                                        >
                                                            {savingAssign ? "..." : "Guardar"}
                                                        </button>
                                                        <button
                                                            onClick={() => { setAssigningTicketId(null); setSelectedTechId(null); }}
                                                            style={{ background: "transparent", border: "1px solid #475569", borderRadius: "8px", padding: "6px 10px", color: "#94a3b8", cursor: "pointer", fontSize: "0.875rem" }}
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => { setAssigningTicketId(ticket.id); setSelectedTechId(null); }}
                                                        style={{
                                                            display: "flex", alignItems: "center", gap: "0.4rem",
                                                            background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)",
                                                            borderRadius: "8px", padding: "6px 14px", color: "#60a5fa",
                                                            cursor: "pointer", fontSize: "0.875rem"
                                                        }}
                                                    >
                                                        <UserCheck size={15} />
                                                        Cambiar técnico
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {tickets.length === 0 && (
                                    <p style={{ textAlign: "center", color: "#64748b", padding: "2rem" }}>No hay tickets disponibles.</p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal Confirmación Eliminación */}
            {userToDelete && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }}>
                    <div className="glass-card" style={{ width: "100%", maxWidth: "400px", textAlign: "center" }}>
                        <div style={{ background: "rgba(239, 68, 68, 0.1)", width: "60px", height: "60px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem auto" }}>
                            <AlertCircle size={32} color="#ef4444" />
                        </div>
                        <h2 style={{ marginBottom: "1rem" }}>¿Eliminar Usuario?</h2>
                        <p style={{ color: "#94a3b8", marginBottom: "2rem" }}>
                            Estás a punto de eliminar a <strong>{userToDelete.name}</strong>.
                            Esta acción eliminará todos sus tickets creados y desvinculará sus tareas asignadas.
                        </p>
                        <div style={{ display: "flex", gap: "1rem" }}>
                            <button onClick={() => setUserToDelete(null)} style={{ flex: 1, background: "transparent", border: "1px solid #334155", color: "#94a3b8" }}>
                                Cancelar
                            </button>
                            <button onClick={handleDeleteUser} disabled={submitting} style={{ flex: 1, background: "#ef4444", border: "none" }}>
                                {submitting ? "Eliminando..." : "Eliminar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

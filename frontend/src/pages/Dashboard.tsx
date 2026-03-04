import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import type { Ticket } from "../types/ticket";
import { Ticket as TicketIcon, LogOut, Plus, RefreshCw, Clock, CheckCircle2, AlertCircle, Shield } from "lucide-react";

export default function Dashboard() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [userRole] = useState(localStorage.getItem("role") || "USER");
    const [userEmail] = useState(localStorage.getItem("userEmail") || "");
    const [isStatusMenuOpen, setIsStatusMenuOpen] = useState<number | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [newTicket, setNewTicket] = useState({ title: "", description: "", priority: "LOW" });
    const [submittingTicket, setSubmittingTicket] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const response = await api.get<Ticket[]>("/tickets");
            let filteredTickets = response.data;
            
            // Usuario solo ve sus propios tickets
            if (userRole === "USER") {
                filteredTickets = response.data.filter(t => t.creatorEmail === userEmail);
            }
            
            setTickets(filteredTickets);
        } catch (error) {
            console.error("Error fetching tickets", error);
        } finally {
            setLoading(false);
        }
    };

    const updateTicketStatus = async (ticketId: number, newStatus: string) => {
        try {
            await api.patch(`/tickets/${ticketId}/status`, `"${newStatus}"`, {
                headers: { "Content-Type": "application/json" }
            });
            fetchTickets();
            setIsStatusMenuOpen(null);
            if (isDetailModalOpen && selectedTicket?.id === ticketId) {
                setSelectedTicket((prev: Ticket | null) => prev ? { ...prev, status: newStatus } : null);
            }
        } catch (error) {
            alert("Error al actualizar el estado");
        }
    };

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingTicket(true);
        try {
            await api.post("/tickets", newTicket);
            setIsCreateModalOpen(false);
            setNewTicket({ title: "", description: "", priority: "LOW" });
            fetchTickets();
        } catch (error) {
            alert("Error al crear el ticket");
        } finally {
            setSubmittingTicket(false);
        }
    };

    const openDetails = (ticket: Ticket) => {
        setSelectedTicket(ticket);
        setIsDetailModalOpen(true);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case "open": return <Clock size={16} color="#fbbf24" />;
            case "in_progress": return <RefreshCw size={16} color="#3b82f6" />;
            case "closed": return <CheckCircle2 size={16} color="#10b981" />;
            default: return <AlertCircle size={16} color="#94a3b8" />;
        }
    };

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", color: "white" }}>
            {/* Header */}
            <header style={{
                background: "rgba(30, 41, 59, 0.8)",
                backdropFilter: "blur(12px)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                padding: "1rem 2rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                position: "sticky",
                top: 0,
                zIndex: 10
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ background: "#3b82f6", borderRadius: "8px", padding: "6px" }}>
                        <TicketIcon size={24} color="white" />
                    </div>
                    <h2 style={{ margin: 0, fontSize: "1.25rem" }} className="text-gradient">TicketMaster</h2>
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                    {userRole === "ADMIN" && (
                        <button style={{ 
                            background: "rgba(192, 132, 252, 0.2)", 
                            border: "1px solid #c084fc",
                            color: "#c084fc",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem"
                        }} onClick={() => navigate("/admin")}>
                            <Shield size={18} />
                            Registro de usuarios
                        </button>
                    )}
                    <button style={{ 
                        background: "rgba(255, 255, 255, 0.05)", 
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem"
                    }} onClick={fetchTickets}>
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                        Refrescar
                    </button>
                    <button style={{ 
                        background: "#ef4444", 
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem"
                    }} onClick={handleLogout}>
                        <LogOut size={18} />
                        Salir
                    </button>
                </div>
            </header>

            <main style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                    <div>
                        <h1 style={{ marginBottom: "0.5rem" }}>Tus Tickets</h1>
                        <p style={{ color: "#94a3b8", margin: 0 }}>Gestiona y supervisa todas tus solicitudes de soporte.</p>
                    </div>
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "0.5rem",
                            padding: "0.8rem 1.5rem"
                        }}
                    >
                        <Plus size={20} />
                        Nuevo Ticket
                    </button>
                </div>

                {loading && tickets.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "4rem" }}>
                        <RefreshCw className="animate-spin" size={48} color="#3b82f6" style={{ marginBottom: "1rem" }} />
                        <p>Cargando tickets...</p>
                    </div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "1.5rem" }}>
                        {tickets.map((ticket) => (
                            <div key={ticket.id} className="glass-card" style={{ padding: "1.5rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                                    <h3 style={{ margin: 0, fontSize: "1.125rem", color: "#f8fafc" }}>{ticket.title}</h3>
                                    <div style={{ 
                                        display: "flex", 
                                        alignItems: "center", 
                                        gap: "0.4rem",
                                        background: "rgba(255, 255, 255, 0.05)",
                                        padding: "4px 8px",
                                        borderRadius: "6px",
                                        fontSize: "0.75rem",
                                        textTransform: "uppercase",
                                        fontWeight: "bold",
                                        border: "1px solid rgba(255, 255, 255, 0.1)"
                                    }}>
                                        {getStatusIcon(ticket.status)}
                                        {ticket.status}
                                    </div>
                                </div>
                                <p style={{ color: "#94a3b8", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
                                    {ticket.description || "Sin descripción proporcionada."}
                                </p>
                                <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)", paddingTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>ID: #{ticket.id}</span>
                                        {userRole !== "USER" && (
                                            <span style={{ fontSize: "0.75rem", color: "#3b82f6" }}>Por: {ticket.creatorEmail}</span>
                                        )}
                                        {ticket.assignedToEmail && (
                                            <span style={{ fontSize: "0.75rem", color: "#10b981" }}>Asignado: {ticket.assignedToEmail}</span>
                                        )}
                                    </div>
                                    
                                    {userRole === "TECH" || userRole === "ADMIN" ? (
                                        <div style={{ position: "relative" }}>
                                            <button 
                                                onClick={() => setIsStatusMenuOpen(isStatusMenuOpen === ticket.id ? null : ticket.id)}
                                                style={{ 
                                                    background: "transparent", 
                                                    border: "1px solid #3b82f6", 
                                                    color: "#3b82f6",
                                                    fontSize: "0.875rem",
                                                    padding: "4px 12px"
                                                }}
                                            >
                                                Estado
                                            </button>
                                            
                                            {isStatusMenuOpen === ticket.id && (
                                                <div style={{ 
                                                    position: "absolute", 
                                                    bottom: "100%", 
                                                    right: 0, 
                                                    background: "#1e293b", 
                                                    border: "1px solid #334155", 
                                                    borderRadius: "8px", 
                                                    padding: "4px",
                                                    zIndex: 20,
                                                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                                                }}>
                                                    {["OPEN", "IN_PROGRESS", "CLOSED"].map(s => (
                                                        <button 
                                                            key={s} 
                                                            onClick={() => updateTicketStatus(ticket.id, s)}
                                                            style={{ 
                                                                display: "block", 
                                                                width: "100%", 
                                                                textAlign: "left", 
                                                                background: "transparent", 
                                                                padding: "8px 16px",
                                                                fontSize: "0.8rem",
                                                                border: "none",
                                                                color: "white"
                                                            }}
                                                        >
                                                            {s}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : null}

                                    <button 
                                        onClick={() => openDetails(ticket)}
                                        style={{ 
                                            background: "rgba(59, 130, 246, 0.1)", 
                                            border: "1px solid rgba(59, 130, 246, 0.2)", 
                                            color: "#3b82f6",
                                            fontSize: "0.875rem",
                                            padding: "4px 12px"
                                        }}
                                    >
                                        Detalles
                                    </button>
                                </div>
                            </div>
                        ))}

                        {tickets.length === 0 && !loading && (
                            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "4rem", background: "rgba(255, 255, 255, 0.02)", borderRadius: "16px", border: "1px dashed rgba(255, 255, 255, 0.1)" }}>
                                <TicketIcon size={48} color="#475569" style={{ marginBottom: "1rem" }} />
                                <h3 style={{ color: "#f8fafc" }}>No hay tickets aún</h3>
                                <p style={{ color: "#94a3b8" }}>Parece que todo está al día. Crea un nuevo ticket si necesitas ayuda.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Modal Crear Ticket */}
            {isCreateModalOpen && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }}>
                    <div className="glass-card" style={{ width: "100%", maxWidth: "500px" }}>
                        <h2 style={{ marginBottom: "1.5rem" }}>Crear Nuevo Ticket</h2>
                        <form onSubmit={handleCreateTicket}>
                            <div style={{ marginBottom: "1.2rem" }}>
                                <label style={{ display: "block", color: "#94a3b8", fontSize: "0.875rem", marginBottom: "0.5rem" }}>Título</label>
                                <input value={newTicket.title} onChange={e => setNewTicket({...newTicket, title: e.target.value})} placeholder="Ej: Error al iniciar sesión" required />
                            </div>
                            <div style={{ marginBottom: "1.2rem" }}>
                                <label style={{ display: "block", color: "#94a3b8", fontSize: "0.875rem", marginBottom: "0.5rem" }}>Descripción</label>
                                <textarea 
                                    value={newTicket.description} 
                                    onChange={e => setNewTicket({...newTicket, description: e.target.value})} 
                                    placeholder="Detalla tu problema aquí..." 
                                    required 
                                    style={{ width: "100%", height: "120px", background: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "white", padding: "12px", fontFamily: "inherit" }}
                                />
                            </div>
                            <div style={{ marginBottom: "2rem" }}>
                                <label style={{ display: "block", color: "#94a3b8", fontSize: "0.875rem", marginBottom: "0.5rem" }}>Prioridad</label>
                                <select 
                                    value={newTicket.priority} 
                                    onChange={e => setNewTicket({...newTicket, priority: e.target.value})}
                                    style={{ width: "100%", padding: "12px", background: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "white" }}
                                >
                                    <option value="LOW">Baja</option>
                                    <option value="MEDIUM">Media</option>
                                    <option value="HIGH">Alta</option>
                                </select>
                            </div>
                            <div style={{ display: "flex", gap: "1rem" }}>
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} style={{ flex: 1, background: "transparent", border: "1px solid #334155", color: "#94a3b8" }}>Cancelar</button>
                                <button type="submit" disabled={submittingTicket} style={{ flex: 1 }}>{submittingTicket ? "Creando..." : "Crear Ticket"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Detalles */}
            {isDetailModalOpen && selectedTicket && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }}>
                    <div className="glass-card" style={{ width: "100%", maxWidth: "600px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                            <h2 style={{ margin: 0 }}>Detalles del Ticket #{selectedTicket.id}</h2>
                            <button onClick={() => setIsDetailModalOpen(false)} style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: "1.5rem", padding: 0 }}>×</button>
                        </div>
                        
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.5rem", marginBottom: "2rem" }}>
                            <div>
                                <h4 style={{ color: "#64748b", margin: "0 0 0.5rem 0", fontSize: "0.8rem", textTransform: "uppercase" }}>Asunto</h4>
                                <p style={{ margin: 0, fontSize: "1.1rem" }}>{selectedTicket.title}</p>
                            </div>
                            <div>
                                <h4 style={{ color: "#64748b", margin: "0 0 0.5rem 0", fontSize: "0.8rem", textTransform: "uppercase" }}>Estado</h4>
                                <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.05)", padding: "4px 12px", borderRadius: "20px" }}>
                                    {getStatusIcon(selectedTicket.status)}
                                    <span style={{ fontWeight: "bold" }}>{selectedTicket.status}</span>
                                </div>
                            </div>
                            <div style={{ gridColumn: "1 / -1" }}>
                                <h4 style={{ color: "#64748b", margin: "0 0 0.5rem 0", fontSize: "0.8rem", textTransform: "uppercase" }}>Descripción</h4>
                                <div style={{ background: "rgba(255,255,255,0.02)", padding: "1rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", whiteSpace: "pre-wrap" }}>
                                    {selectedTicket.description}
                                </div>
                            </div>
                            <div>
                                <h4 style={{ color: "#64748b", margin: "0 0 0.5rem 0", fontSize: "0.8rem", textTransform: "uppercase" }}>Creado por</h4>
                                <p style={{ margin: 0 }}>{selectedTicket.creatorEmail}</p>
                                <span style={{ fontSize: "0.8rem", color: "#64748b" }}>{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                            </div>
                            <div>
                                <h4 style={{ color: "#64748b", margin: "0 0 0.5rem 0", fontSize: "0.8rem", textTransform: "uppercase" }}>Técnico Asignado</h4>
                                <p style={{ margin: 0 }}>{selectedTicket.assignedToEmail || "Buscando técnico..."}</p>
                            </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <button onClick={() => setIsDetailModalOpen(false)} style={{ background: "#3b82f6" }}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

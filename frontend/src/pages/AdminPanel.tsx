import { useEffect, useState } from "react";
import api from "../api/axios";
import type { User as UserType } from "../types/user";
import { Users, UserPlus, Trash2, Shield, Loader2, AlertCircle } from "lucide-react";

export default function AdminPanel() {
    const [users, setUsers] = useState<UserType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Form state
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<"USER" | "TECH" | "ADMIN">("USER");
    const [submitting, setSubmitting] = useState(false);
    const [userToDelete, setUserToDelete] = useState<UserType | null>(null);

    useEffect(() => {
        fetchUsers();
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

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post("/api/auth/register", { name, email, password, role });
            // Clear form
            setName("");
            setEmail("");
            setPassword("");
            setRole("USER");
            fetchUsers();
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

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", color: "white", padding: "2rem" }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                <header style={{ marginBottom: "2rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ background: "#c084fc", borderRadius: "12px", padding: "10px" }}>
                        <Shield size={28} color="white" />
                    </div>
                    <div>
                        <h1 style={{ margin: 0 }}>Panel de Administración</h1>
                        <p style={{ color: "#94a3b8", margin: 0 }}>Gestiona los usuarios y permisos del sistema.</p>
                    </div>
                </header>

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
                                    style={{ 
                                        width: "100%", 
                                        padding: "0.75rem", 
                                        borderRadius: "8px", 
                                        background: "#1e293b", 
                                        color: "white", 
                                        border: "1px solid #334155" 
                                    }}
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
                                                        fontSize: "0.75rem", 
                                                        padding: "2px 8px", 
                                                        borderRadius: "4px",
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
            </div>

            {/* Custom Confirmation Modal */}
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
                            <button 
                                onClick={() => setUserToDelete(null)} 
                                style={{ flex: 1, background: "transparent", border: "1px solid #334155", color: "#94a3b8" }}
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleDeleteUser} 
                                disabled={submitting}
                                style={{ flex: 1, background: "#ef4444", border: "none" }}
                            >
                                {submitting ? "Eliminando..." : "Eliminar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

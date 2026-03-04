import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { UserPlus, Mail, Lock, User, Loader2, ArrowLeft } from "lucide-react";

export default function Register() {
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [role, setRole] = useState<"USER" | "TECH" | "ADMIN">("USER");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await api.post("/api/auth/register", {
                name,
                email,
                password,
                role
            });

            // After register, redirect to login
            navigate("/");
        } catch (error: any) {
            setError(error.response?.data?.message || "Error al registrar usuario");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100vh",
            padding: "1rem"
        }}>
            <div className="glass-card" style={{ width: "100%", maxWidth: "400px" }}>
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <div style={{
                        background: "rgba(16, 185, 129, 0.1)",
                        width: "60px",
                        height: "60px",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 1rem auto"
                    }}>
                        <UserPlus size={32} color="#10b981" />
                    </div>
                    <h1 className="text-gradient">Registrar Usuario</h1>
                    <p style={{ color: "#94a3b8" }}>Panel de registro administrativo</p>
                </div>

                <form onSubmit={handleRegister}>
                    <div style={{ marginBottom: "1.25rem" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", color: "#94a3b8" }}>
                            Nombre Completo
                        </label>
                        <div style={{ position: "relative" }}>
                            <User size={18} style={{ position: "absolute", left: "12px", top: "14px", color: "#64748b" }} />
                            <input
                                type="text"
                                placeholder="Tu nombre"
                                style={{ paddingLeft: "40px" }}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: "1.25rem" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", color: "#94a3b8" }}>
                            Correo Electrónico
                        </label>
                        <div style={{ position: "relative" }}>
                            <Mail size={18} style={{ position: "absolute", left: "12px", top: "14px", color: "#64748b" }} />
                            <input
                                type="email"
                                placeholder="tu@correo.com"
                                style={{ paddingLeft: "40px" }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: "1.5rem" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", color: "#94a3b8" }}>
                            Contraseña
                        </label>
                        <div style={{ position: "relative" }}>
                            <Lock size={18} style={{ position: "absolute", left: "12px", top: "14px", color: "#64748b" }} />
                            <input
                                type="password"
                                placeholder="••••••••"
                                style={{ paddingLeft: "40px" }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: "1.5rem" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", color: "#94a3b8" }}>
                            Asignar Rol
                        </label>
                        <select 
                            value={role} 
                            onChange={(e) => setRole(e.target.value as any)}
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

                    {error && (
                        <div style={{
                            padding: "0.75rem",
                            borderRadius: "8px",
                            background: "rgba(239, 68, 68, 0.1)",
                            color: "#ef4444",
                            fontSize: "0.875rem",
                            marginBottom: "1.5rem",
                            border: "1px solid rgba(239, 68, 68, 0.2)"
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.5rem",
                            height: "48px",
                            background: "#3b82f6",
                            color: "white"
                        }}
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            "Crear Usuario"
                        )}
                    </button>
                    
                    <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
                        <Link to="/dashboard" style={{ 
                            color: "#94a3b8", 
                            fontSize: "0.875rem", 
                            display: "inline-flex", 
                            alignItems: "center", 
                            gap: "0.4rem",
                            textDecoration: "none"
                        }}>
                            <ArrowLeft size={14} />
                            Volver al Dashboard
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { LogIn, Mail, Lock, Loader2 } from "lucide-react";

export default function Login() {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await api.post("/api/auth/login", {
                email,
                password,
            });

            localStorage.setItem("token", response.data.token);
            localStorage.setItem("role", response.data.role);
            localStorage.setItem("userEmail", email);
            navigate("/dashboard");
        } catch (error: any) {
            setError(error.response?.data?.message || "Credenciales incorrectas");
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
                        background: "rgba(59, 130, 246, 0.1)",
                        width: "60px",
                        height: "60px",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 1rem auto"
                    }}>
                        <LogIn size={32} color="#3b82f6" />
                    </div>
                    <h1 className="text-gradient">Bienvenido</h1>
                    <p style={{ color: "#94a3b8" }}>Ingresa tus credenciales para continuar</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: "1.5rem" }}>
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
                            height: "48px"
                        }}
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            "Iniciar Sesión"
                        )}
                    </button>


                </form>
            </div>
        </div>
    );
}

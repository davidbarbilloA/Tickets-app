import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
    ArrowLeft, AlertTriangle, 
    TrendingUp, FileText, RefreshCw 
} from "lucide-react";

interface MetricsSummary {
    totalTickets: number;
    openTickets: number;
    inProgressTickets: number;
    resolvedTickets: number;
    closedTickets: number;
    unassignedTickets: number;
    resolutionRate: number;
}

interface MetricsData {
    summary: MetricsSummary;
    byStatus: Record<string, number>;
    byTech: Record<string, number>;
    byCreator: Record<string, number>;
}

export default function MetricsDashboard() {
    const [metrics, setMetrics] = useState<MetricsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadMetrics();
    }, []);

    const loadMetrics = async () => {
        setLoading(true);
        setLoadError(null);
        try {
            const response = await fetch(`/data/metrics.json?t=${Date.now()}`);
            if (response.ok) {
                const data = await response.json();
                setMetrics(data);
            } else {
                setMetrics(null);
                setLoadError("No se encontró metrics.json. Ejecuta el script de Python para generar los datos.");
            }
        } catch {
            setMetrics(null);
            setLoadError("Error al cargar las métricas. Verifica que el frontend esté en ejecución.");
        } finally {
            setLoading(false);
        }
    };

    const charts = [
        {
            title: "1. Estado General de Tickets (Barras)",
            src: "/charts/chart_status_bar.png",
            conclusion: "La distribución muestra una carga operativa considerable en el estado 'IN_PROGRESS' y 'RESOLVED', lo que indica que el equipo de soporte técnico está respondiendo activamente a las solicitudes recibidas, pero requiere atención para evitar cuellos de botella en la fase de resolución final."
        },
        {
            title: "2. Proporción de Tickets por Creador (Pie)",
            src: "/charts/chart_creator_pie.png",
            conclusion: "La mayor cantidad de solicitudes provienen del usuario de pruebas estándar (user@test.com), lo que valida que los flujos de creación están concentrados en los perfiles correspondientes. Los administradores generan una proporción menor de tickets."
        },
        {
            title: "3. Historial de Carga Acumulada (Líneas)",
            src: "/charts/chart_timeline_line.png",
            conclusion: "El gráfico temporal muestra una tendencia incremental constante en el volumen de tickets de soporte técnico creados a lo largo del tiempo. Esto requiere planificar un aumento en la capacidad del equipo de soporte para evitar tiempos de respuesta elevados."
        },
        {
            title: "4. Relación ID de Ticket vs Complejidad (Scatter)",
            src: "/charts/chart_complexity_scatter.png",
            conclusion: "El gráfico de dispersión muestra una correlación uniforme en la longitud de las descripciones a lo largo de los IDs de los tickets. Esto indica que los usuarios mantienen un estándar consistente al describir sus problemas, sin variaciones drásticas en la complejidad promedio por ticket."
        },
        {
            title: "5. Distribución de Longitud de Asunto (Boxplot)",
            src: "/charts/chart_length_boxplot.png",
            conclusion: "Los tickets en progreso y cerrados presentan una mayor dispersión en la longitud de sus títulos, sugiriendo que incidencias más complejas requieren explicaciones más largas en el asunto para diferenciarse y ser procesadas adecuadamente por los técnicos."
        }
    ];

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", color: "white", padding: "2rem" }}>
            {/* Header */}
            <header style={{
                maxWidth: "1200px",
                margin: "0 auto 2rem auto",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                paddingBottom: "1.5rem"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <button 
                        onClick={() => navigate("/dashboard")}
                        style={{
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            borderRadius: "8px",
                            padding: "8px",
                            color: "white",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 style={{ margin: 0, fontSize: "1.75rem" }} className="text-gradient">
                            Dashboard de Analítica y Métricas (Python + React)
                        </h1>
                        <p style={{ color: "#94a3b8", margin: "4px 0 0 0" }}>
                            Visualización de datos procesados por Pandas y graficados con Matplotlib.
                        </p>
                    </div>
                </div>
                <button 
                    onClick={loadMetrics}
                    style={{
                        background: "rgba(59, 130, 246, 0.1)",
                        border: "1px solid #3b82f6",
                        color: "#3b82f6",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "10px 16px",
                        borderRadius: "8px",
                        cursor: "pointer"
                    }}
                >
                    <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    Actualizar Datos
                </button>
            </header>

            {/* Main Content */}
            <main style={{ maxWidth: "1200px", margin: "0 auto" }}>
                {loading && !metrics ? (
                    <div style={{ textAlign: "center", padding: "4rem" }}>
                        <RefreshCw className="animate-spin" size={48} color="#3b82f6" style={{ marginBottom: "1rem" }} />
                        <p>Cargando métricas generadas por Python...</p>
                    </div>
                ) : loadError && !metrics ? (
                    <div className="glass-card" style={{ padding: "2.5rem", textAlign: "center", maxWidth: "640px", margin: "0 auto" }}>
                        <AlertTriangle size={48} color="#fbbf24" style={{ marginBottom: "1rem" }} />
                        <h2 style={{ marginTop: 0 }}>Datos de métricas no disponibles</h2>
                        <p style={{ color: "#94a3b8", lineHeight: 1.6 }}>{loadError}</p>
                        <pre style={{
                            textAlign: "left",
                            background: "#1e293b",
                            padding: "1rem",
                            borderRadius: "8px",
                            fontSize: "0.85rem",
                            color: "#e2e8f0",
                            marginTop: "1.5rem",
                            overflowX: "auto",
                        }}>
{`cd python
pip install -r requirements.txt
cd ..
python python/metrics_analyzer.py`}
                        </pre>
                        <p style={{ color: "#64748b", fontSize: "0.875rem", marginTop: "1rem" }}>
                            El backend debe estar en ejecución (puerto 8080) para leer la BD vía API.
                        </p>
                        <button onClick={loadMetrics} style={{ marginTop: "1rem" }}>
                            Reintentar carga
                        </button>
                    </div>
                ) : (
                    <>
                        {/* KPIs section - 3 Tarjetas de indicadores KPI */}
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                            gap: "1.5rem",
                            marginBottom: "2.5rem"
                        }}>
                            {/* KPI 1 */}
                            <div className="glass-card" style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "1.25rem" }}>
                                <div style={{ background: "rgba(59, 130, 246, 0.15)", borderRadius: "12px", padding: "12px", color: "#3b82f6" }}>
                                    <FileText size={30} />
                                </div>
                                <div>
                                    <span style={{ fontSize: "0.875rem", color: "#94a3b8", display: "block", marginBottom: "4px" }}>Total de Incidencias</span>
                                    <strong style={{ fontSize: "1.75rem", color: "white" }}>
                                        {metrics?.summary.totalTickets || 0}
                                    </strong>
                                </div>
                            </div>

                            {/* KPI 2 */}
                            <div className="glass-card" style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "1.25rem" }}>
                                <div style={{ background: "rgba(16, 185, 129, 0.15)", borderRadius: "12px", padding: "12px", color: "#10b981" }}>
                                    <TrendingUp size={30} />
                                </div>
                                <div>
                                    <span style={{ fontSize: "0.875rem", color: "#94a3b8", display: "block", marginBottom: "4px" }}>Tasa de Resolución</span>
                                    <strong style={{ fontSize: "1.75rem", color: "#10b981" }}>
                                        {metrics?.summary.resolutionRate || 0}%
                                    </strong>
                                </div>
                            </div>

                            {/* KPI 3 */}
                            <div className="glass-card" style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "1.25rem" }}>
                                <div style={{ background: "rgba(239, 68, 68, 0.15)", borderRadius: "12px", padding: "12px", color: "#ef4444" }}>
                                    <AlertTriangle size={30} />
                                </div>
                                <div>
                                    <span style={{ fontSize: "0.875rem", color: "#94a3b8", display: "block", marginBottom: "4px" }}>Tickets sin Asignar</span>
                                    <strong style={{ fontSize: "1.75rem", color: "#ef4444" }}>
                                        {metrics?.summary.unassignedTickets || 0}
                                    </strong>
                                </div>
                            </div>
                        </div>

                        {/* Charts Section - Mínimo 4 gráficas */}
                        <h2 style={{ marginBottom: "1.5rem", fontSize: "1.5rem" }}>Gráficos y Conclusiones del Negocio</h2>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
                            {charts.map((chart, idx) => (
                                <div key={idx} className="glass-card" style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
                                    gap: "2rem",
                                    padding: "2rem",
                                    alignItems: "center"
                                }}>
                                    {/* Imagen de Matplotlib */}
                                    <div style={{
                                        background: "#1e293b",
                                        borderRadius: "12px",
                                        padding: "1rem",
                                        border: "1px solid rgba(255,255,255,0.05)",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center"
                                    }}>
                                        <img 
                                            src={chart.src} 
                                            alt={chart.title}
                                            style={{
                                                maxWidth: "100%",
                                                height: "auto",
                                                borderRadius: "8px",
                                                boxShadow: "0 4px 12px rgba(0,0,0,0.5)"
                                            }}
                                            onError={(e) => {
                                                // Fallback si no encuentra la imagen
                                                (e.target as HTMLImageElement).src = "https://placehold.co/600x400/1e293b/ffffff?text=Cargando+Gráfico...";
                                            }}
                                        />
                                    </div>

                                    {/* Título y Conclusión */}
                                    <div>
                                        <h3 style={{ marginTop: 0, color: "#3b82f6", fontSize: "1.25rem", marginBottom: "1rem" }}>
                                            {chart.title}
                                        </h3>
                                        <div style={{
                                            background: "rgba(255,255,255,0.02)",
                                            padding: "1.5rem",
                                            borderRadius: "8px",
                                            borderLeft: "4px solid #3b82f6",
                                            lineHeight: "1.6",
                                            color: "#e2e8f0"
                                        }}>
                                            <h4 style={{ margin: "0 0 8px 0", fontSize: "0.9rem", textTransform: "uppercase", color: "#94a3b8" }}>
                                                Conclusión y Análisis
                                            </h4>
                                            {chart.conclusion}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

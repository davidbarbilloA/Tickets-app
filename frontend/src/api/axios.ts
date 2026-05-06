import axios, { type InternalAxiosRequestConfig } from "axios";

const api = axios.create({
    baseURL: "/",
    withCredentials: true, // ← necesario para enviar/recibir cookies httpOnly
});

// Interceptor de REQUEST — agrega el access token a cada petición
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor de RESPONSE — maneja errores globalmente
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Si es 401 y no es un reintento ya hecho
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // marcamos para no entrar en loop infinito

            try {
                // Intentar renovar el access token con el refresh token (cookie)
                const refreshResponse = await api.post("/api/auth/refresh");
                const newToken = refreshResponse.data.token;

                // Guardar el nuevo access token
                localStorage.setItem("token", newToken);

                // Actualizar el header de la petición original
                originalRequest.headers.Authorization = `Bearer ${newToken}`;

                // Reintentar la petición original con el nuevo token
                return api(originalRequest);

            } catch (refreshError) {
                // Si el refresh también falla → sesión expirada, al login
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                localStorage.removeItem("userEmail");
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
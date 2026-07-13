import { useAuthStore } from '../store/authStore'; // Importamos el gestor de estado

// Usa la variable correcta según tu entorno de producción
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL 
  || (window.location.hostname === "localhost" ? "http://localhost:5001" : "");

const handleResponse = async (res) => {
    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Error desconocido del servidor' }));
        throw new Error(error.detail || error.message || `HTTP ${res.status}`);
    }
    return res.json();
};

// ─── GET /api/user/profile ───────────────────────────────────────────────────
export const fetchProfile = async () => {
    const { authenticatedFetch } = useAuthStore.getState();
    const res = await authenticatedFetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'GET',
    });
    return handleResponse(res);
};

// ─── PATCH /api/user/profile ─────────────────────────────────────────────────
export const updateProfile = async (data) => {
    const { authenticatedFetch } = useAuthStore.getState();
    const res = await authenticatedFetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
    return handleResponse(res);
};

// ─── POST /api/user/avatar ───────────────────────────────────────────────────
export const uploadAvatar = async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);

    // CRÍTICO: NO usamos authenticatedFetch aquí porque inyectaría 'Content-Type: application/json'.
    // Para FormData, el navegador debe autogenerar el Content-Type con el 'boundary'.
    // Solo inyectamos credentials para que envíe la cookie segura.
    const res = await fetch(`${API_BASE_URL}/api/user/avatar`, {
        method: 'POST',
        credentials: 'include', 
        body: formData,
    });
    
    // Validar expiración de sesión manualmente para este caso aislado
    if (res.status === 401) {
        useAuthStore.getState().logout();
        throw new Error("Sesión expirada");
    }

    return handleResponse(res);
};

// ─── PATCH /api/user/password ────────────────────────────────────────────────
export const changePassword = async ({ currentPassword, newPassword }) => {
    const { authenticatedFetch } = useAuthStore.getState();
    const res = await authenticatedFetch(`${API_BASE_URL}/api/user/password`, {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword, newPassword }),
    });
    return handleResponse(res);
};

// ─── DELETE /api/user/account ────────────────────────────────────────────────
export const deleteAccount = async () => {
    const { authenticatedFetch } = useAuthStore.getState();
    const res = await authenticatedFetch(`${API_BASE_URL}/api/user/account`, {
        method: 'DELETE',
    });
    return handleResponse(res);
};
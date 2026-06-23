const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

const handleResponse = async (res) => {
    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(error.message || `HTTP ${res.status}`);
    }
    return res.json();
};

// ─── GET /api/user/profile ───────────────────────────────────────────────────
export const fetchProfile = async () => {
    const res = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    return handleResponse(res);
};

// ─── PATCH /api/user/profile ─────────────────────────────────────────────────
export const updateProfile = async (data) => {
    const res = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse(res);
};

// ─── POST /api/user/avatar ───────────────────────────────────────────────────
export const uploadAvatar = async (file) => {
    const token = localStorage.getItem('authToken');
    const formData = new FormData();
    formData.append('avatar', file);

    const res = await fetch(`${API_BASE_URL}/user/avatar`, {
        method: 'POST',
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
    });
    return handleResponse(res);
};

// ─── PATCH /api/user/password ────────────────────────────────────────────────
export const changePassword = async ({ currentPassword, newPassword }) => {
    const res = await fetch(`${API_BASE_URL}/user/password`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ currentPassword, newPassword }),
    });
    return handleResponse(res);
};

// ─── DELETE /api/user/account ────────────────────────────────────────────────
export const deleteAccount = async () => {
    const res = await fetch(`${API_BASE_URL}/user/account`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    return handleResponse(res);
};
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from "../../../store/authStore";
import { useNavigate } from 'react-router-dom';

export const useProfile = () => {
    // 1. Conectamos directamente con el cerebro de autenticación (Zustand)
    const usuarioAuth = useAuthStore((state) => state.usuario);
    const loginAction = useAuthStore((state) => state.login); // Reutilizamos login para actualizar datos
    const logoutAction = useAuthStore((state) => state.logout);

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const navigate = useNavigate();

    const showSuccess = (msg) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(null), 3500);
    };

    // ─── Cargar perfil sincronizado con Zustand ───────────────────────────────
    const loadProfile = useCallback(() => {
        setLoading(true);
        setError(null);
        try {
            if (usuarioAuth) {
                // Mapeamos los datos reales del Login hacia la estructura visual del Perfil
                setProfile({
                    fullName: usuarioAuth.nombre || 'Operario',
                    email: usuarioAuth.email || '',
                    employeeId: `VX-${usuarioAuth.id || '0000'}`,
                    phone: usuarioAuth.phone || '+34 000 000 000', // Mock complementario
                    birthDate: usuarioAuth.birthDate || '1990-01-01', // Mock complementario
                    bio: usuarioAuth.bio || `Operario activo del sector Logístico.`,
                    avatarUrl: usuarioAuth.avatarUrl || null,
                    provider: 'email', 
                });
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [usuarioAuth]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- carga el perfil al montar; se reescribe en la Fase 3 (perfil real)
        loadProfile();
    }, [loadProfile]);

    // ─── Actualizar campos del perfil (Sincroniza UI y Zustand) ───────────────
    const saveProfile = async (updatedData) => {
        setSaving(true);
        setError(null);
        try {
            // Simulamos retraso de red de 1 segundo
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 1. Actualizamos el estado local de esta pantalla
            setProfile((prev) => ({ ...prev, ...updatedData }));

            // 2. IMPORTANTE: Actualizamos el estado global (Zustand) 
            // para que la terminal y el menú lateral vean el nuevo nombre.
            loginAction({
                ...usuarioAuth,
                nombre: updatedData.fullName || usuarioAuth.nombre,
                phone: updatedData.phone,
                birthDate: updatedData.birthDate,
                bio: updatedData.bio
            });

            showSuccess('Perfil actualizado correctamente.');
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setSaving(false);
        }
    };

    // ─── Subir avatar ────────────────────────────────────────────────────────────
    const saveAvatar = async (file) => {
        setSaving(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            const avatarUrl = URL.createObjectURL(file);
            
            setProfile((prev) => ({ ...prev, avatarUrl }));
            
            // Actualizamos Zustand para que el Sidebar muestre la foto nueva
            loginAction({ ...usuarioAuth, avatarUrl });

            showSuccess('Foto de perfil actualizada.');
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setSaving(false);
        }
    };

    // ─── Cambiar contraseña (Mock) ───────────────────────────────────────────────
    const updatePassword = async (passwords) => {
        setSaving(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 1200));
            if (passwords.newPassword !== passwords.confirmPassword) {
                throw new Error("Las contraseñas no coinciden");
            }
            showSuccess('Contraseña cambiada (Simulación).');
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setSaving(false);
        }
    };

    // ─── Eliminar cuenta (Logout Seguro) ─────────────────────────────────────────
    const removeAccount = async () => {
        setSaving(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Expulsamos al usuario limpiando el Zustand real
            logoutAction(); 
            navigate('/login');
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setSaving(false);
        }
    };

    return {
        profile,
        loading,
        saving,
        error,
        successMsg,
        saveProfile,
        saveAvatar,
        updatePassword,
        removeAccount,
        reload: loadProfile,
    };
};
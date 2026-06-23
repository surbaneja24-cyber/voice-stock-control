import { useState, useEffect, useCallback } from 'react';
import {
  fetchProfile,
  updateProfile,
  uploadAvatar,
  changePassword,
  deleteAccount,
} from '../Services/profileService';

const MOCK_PROFILE = {
  fullName: 'Alex Mercer',
  employeeId: 'VX-88492',
  email: 'alex.mercer@voxstock.app',
  phone: '+1 (555) 019-8472',
  birthDate: '1990-06-15',
  bio: '',
  avatarUrl: null,
  provider: 'email', // 'email' | 'google' | 'apple'
};

export const useProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  // ─── Cargar perfil al montar ────────────────────────────────────────────────
  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: reemplazar MOCK_PROFILE por la llamada real cuando el endpoint esté listo
      // const data = await fetchProfile();
      const data = MOCK_PROFILE;
      setProfile(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // ─── Actualizar campos del perfil ───────────────────────────────────────────
  const saveProfile = async (updatedData) => {
    setSaving(true);
    setError(null);
    try {
      // TODO: descomentar cuando el endpoint esté listo
      // const updated = await updateProfile(updatedData);
      // setProfile(updated);
      setProfile((prev) => ({ ...prev, ...updatedData }));
      showSuccess('Profile updated successfully.');
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
      // TODO: descomentar cuando el endpoint esté listo
      // const { avatarUrl } = await uploadAvatar(file);
      const avatarUrl = URL.createObjectURL(file); // simulación local
      setProfile((prev) => ({ ...prev, avatarUrl }));
      showSuccess('Profile photo updated.');
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // ─── Cambiar contraseña ──────────────────────────────────────────────────────
  const updatePassword = async (passwords) => {
    setSaving(true);
    setError(null);
    try {
      // TODO: descomentar cuando el endpoint esté listo
      // await changePassword(passwords);
      showSuccess('Password changed successfully.');
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // ─── Eliminar cuenta ─────────────────────────────────────────────────────────
  const removeAccount = async () => {
    setSaving(true);
    setError(null);
    try {
      // TODO: descomentar cuando el endpoint esté listo
      // await deleteAccount();
      localStorage.removeItem('authToken');
      window.location.href = '/login';
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
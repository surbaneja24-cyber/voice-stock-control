import React, { useState } from 'react';
import ProfileHeader from './components/ProfileHeader';
import PersonalInfoForm from './components/PersonalInfoForm';
import SecuritySection from './components/SecuritySection';
import DangerZone from './components/DangerZone';
import { useProfile } from './hooks/useProfile';

// ─── Toast de feedback ─────────────────────────────────────────────────────────
function Toast({ message, type = 'success' }) {
  if (!message) return null;
  const styles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error: 'bg-red-50 border-red-200 text-red-800',
  };
  return (
    <div
      className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl border text-sm font-semibold shadow-md animate-fadeIn ${styles[type]}`}>
      {type === 'success' ? '✅ ' : '❌ '}
      {message}
    </div>
  );
}

// ─── Skeleton de carga ─────────────────────────────────────────────────────────
function ProfileSkeleton() {
  return (
    <div className="max-w-3xl w-full flex flex-col gap-6 animate-pulse">
      <div className="bg-white rounded-2xl p-6 h-32 border border-slate-100" />
      <div className="bg-white rounded-2xl p-6 h-64 border border-slate-100" />
      <div className="bg-white rounded-2xl p-6 h-24 border border-slate-100" />
    </div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────────
export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);

  const {
    profile,
    loading,
    saving,
    error,
    successMsg,
    saveProfile,
    saveAvatar,
    updatePassword,
    removeAccount,
  } = useProfile();

  const handleSave = async (data) => {
    const ok = await saveProfile(data);
    if (ok) setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex justify-center">
        <ProfileSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex justify-center text-left">
      {/* Feedback global */}
      <Toast message={successMsg} type="success" />
      <Toast message={error} type="error" />

      <div className="max-w-3xl w-full flex flex-col gap-6">
        <ProfileHeader
          profile={profile}
          isEditing={isEditing}
          onToggleEdit={() => setIsEditing((v) => !v)}
          onAvatarChange={saveAvatar}
          saving={saving}
        />

        <PersonalInfoForm
          profile={profile}
          isEditing={isEditing}
          onSave={handleSave}
          saving={saving}
        />

        <SecuritySection
          profile={profile}
          onChangePassword={updatePassword}
          saving={saving}
        />

        <DangerZone
          onDeleteAccount={removeAccount}
          saving={saving}
        />
      </div>
    </div>
  );
}
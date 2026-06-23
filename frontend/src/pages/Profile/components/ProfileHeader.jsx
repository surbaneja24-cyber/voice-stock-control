import React, { useRef } from 'react';
import { useThemeStore } from '../../../store/themeStore';

const getInitials = (name = '') =>
    name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

const PROVIDER_BADGE = {
    google: { label: 'Google account', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    apple: { label: 'Apple account', color: 'bg-slate-100 text-slate-700 border-slate-200' },
    email: { label: 'Email account', color: 'bg-violet-50 text-violet-700 border-violet-200' },
};

export default function ProfileHeader({
    profile,
    isEditing,
    onToggleEdit,
    onAvatarChange,
    saving,
}) {
    const darkMode = useThemeStore((state) => state.darkMode);

    const fileInputRef = useRef(null);
    const badge = PROVIDER_BADGE[profile?.provider] || PROVIDER_BADGE.email;

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) onAvatarChange(file);
    };

    return (
        <div
            className={`rounded-2xl p-6 border flex flex-col sm:flex-row items-center justify-between gap-6 transition-colors duration-300 ${
                darkMode
                    ? 'bg-slate-900 border-slate-700'
                    : 'bg-white border-slate-100'
            }`}
        >
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                <div className="relative group">
                    <div className="w-20 h-20 rounded-full border-2 border-slate-200 overflow-hidden flex items-center justify-center bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-2xl font-bold select-none">
                        {profile?.avatarUrl ? (
                            <img
                                src={profile.avatarUrl}
                                alt="avatar"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            getInitials(profile?.fullName || '')
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={saving}
                        className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold cursor-pointer"
                        aria-label="Change profile photo"
                    >
                        Change
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </div>

                <div>
                    <h2
                        className={`text-2xl font-bold ${
                            darkMode ? 'text-white' : 'text-slate-900'
                        }`}
                    >
                        {profile?.fullName}
                    </h2>

                    <p
                        className={`text-sm mt-0.5 ${
                            darkMode ? 'text-slate-400' : 'text-slate-500'
                        }`}
                    >
                        {profile?.email}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-2.5 justify-center sm:justify-start">
                        <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block" />
                            Active
                        </span>

                        <span
                            className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${badge.color}`}
                        >
                            {badge.label}
                        </span>
                    </div>
                </div>
            </div>

            <button
                type="button"
                onClick={onToggleEdit}
                className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 border ${
                    isEditing
                        ? 'bg-amber-500 hover:bg-amber-600 border-amber-600 text-white'
                        : darkMode
                        ? 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-white'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                }`}
            >
                {isEditing ? '✕ Cancel' : '✏️ Edit profile'}
            </button>
        </div>
    );
}
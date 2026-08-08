import { useState, useEffect } from 'react';
import { useThemeStore } from '../../../store/themeStore';

const Field = ({ label, children, darkMode }) => (
    <div className="flex flex-col gap-1.5">
        <label
            className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'
                }`}
        >
            {label}
        </label>
        {children}
    </div>
);

export default function PersonalInfoForm({
    profile,
    isEditing,
    onSave,
    saving,
}) {
    const darkMode = useThemeStore((state) => state.darkMode);

    const [form, setForm] = useState({
        fullName: '',
        phone: '',
        birthDate: '',
        bio: '',
    });

    useEffect(() => {
        if (profile) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza el formulario local cuando el perfil llega desde el backend
            setForm({
                fullName: profile.fullName || '',
                phone: profile.phone || '',
                birthDate: profile.birthDate || '',
                bio: profile.bio || '',
            });
        }
    }, [profile]);

    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async () => {
        await onSave(form);
    };

    const inputCls = (disabled) => `
        w-full px-4 py-2.5 rounded-xl border font-medium transition-all
        focus:outline-none focus:border-violet-500
        ${darkMode
            ? 'bg-slate-800 border-slate-700 text-white focus:bg-slate-800'
            : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white'
        }
        ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
    `;

    return (
        <div
            className={`rounded-2xl p-6 border flex flex-col gap-6 transition-colors duration-300 ${darkMode
                    ? 'bg-slate-900 border-slate-700'
                    : 'bg-white border-slate-100'
                }`}
        >
            <div
                className={`flex items-center gap-2 pb-4 border-b ${darkMode
                        ? 'border-slate-700'
                        : 'border-slate-100'
                    }`}
            >
                <span className="text-violet-600 text-lg">👤</span>

                <h3
                    className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-800'
                        }`}
                >
                    Personal information
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Full name" darkMode={darkMode}>
                    <input
                        type="text"
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={inputCls(!isEditing)}
                        placeholder="Your full name"
                    />
                </Field>

                <Field label="Employee ID" darkMode={darkMode}>
                    <input
                        type="text"
                        value={profile?.employeeId || '—'}
                        disabled
                        className={`w-full px-4 py-2.5 rounded-xl border font-medium cursor-not-allowed ${darkMode
                                ? 'bg-slate-800 border-slate-700 text-slate-400'
                                : 'bg-slate-100 border-slate-200 text-slate-400'
                            }`}
                    />
                </Field>

                <Field label="Email address" darkMode={darkMode}>
                    <div className="relative">
                        <input
                            type="email"
                            value={profile?.email || ''}
                            disabled
                            className={`w-full px-4 py-2.5 rounded-xl border font-medium cursor-not-allowed ${darkMode
                                    ? 'bg-slate-800 border-slate-700 text-slate-400'
                                    : 'bg-slate-100 border-slate-200 text-slate-400'
                                }`}
                        />

                        <span
                            className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs px-1.5 py-0.5 rounded ${darkMode
                                    ? 'bg-slate-800 text-slate-400'
                                    : 'bg-slate-100 text-slate-400'
                                }`}
                        >
                            Read-only
                        </span>
                    </div>
                </Field>

                <Field label="Phone number" darkMode={darkMode}>
                    <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={inputCls(!isEditing)}
                        placeholder="+1 (555) 000-0000"
                    />
                </Field>

                <Field label="Date of birth" darkMode={darkMode}>
                    <input
                        type="date"
                        name="birthDate"
                        value={form.birthDate}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={inputCls(!isEditing)}
                    />
                </Field>
            </div>

            <Field label="Bio" darkMode={darkMode}>
                <textarea
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    disabled={!isEditing}
                    rows={3}
                    className={`${inputCls(!isEditing)} resize-none`}
                    placeholder="A short description about yourself..."
                />
            </Field>

            {isEditing && (
                <div className="flex justify-end mt-1">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={saving}
                        className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-colors flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />
                                Saving...
                            </>
                        ) : (
                            'Save changes'
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
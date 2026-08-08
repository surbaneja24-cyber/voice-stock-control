import { useState } from 'react';
import { useThemeStore } from '../../../store/themeStore';

export default function SecuritySection({
    profile,
    onChangePassword,
    saving,
}) {
    const darkMode = useThemeStore((state) => state.darkMode);

    const [form, setForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [validationError, setValidationError] = useState('');
    const [open, setOpen] = useState(false);

    const inputCls = `
        w-full px-4 py-2.5 rounded-xl border font-medium transition-all
        focus:outline-none focus:border-violet-500
        ${
            darkMode
                ? 'bg-slate-800 border-slate-700 text-white'
                : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white'
        }
    `;

    if (profile?.provider !== 'email') {
        return (
            <div
                className={`rounded-2xl p-6 border flex flex-col gap-4 ${
                    darkMode
                        ? 'bg-slate-900 border-slate-700'
                        : 'bg-white border-slate-100'
                }`}
            >
                <div
                    className={`flex items-center gap-2 pb-4 border-b ${
                        darkMode
                            ? 'border-slate-700'
                            : 'border-slate-100'
                    }`}
                >
                    <span className="text-slate-500 text-lg">🔒</span>

                    <h3
                        className={`text-lg font-bold ${
                            darkMode
                                ? 'text-white'
                                : 'text-slate-800'
                        }`}
                    >
                        Security
                    </h3>
                </div>

                <p
                    className={`text-sm ${
                        darkMode
                            ? 'text-slate-400'
                            : 'text-slate-500'
                    }`}
                >
                    Your account is managed by{' '}
                    <span className="font-semibold capitalize">
                        {profile?.provider}
                    </span>
                    . Password management is handled through that provider.
                </p>
            </div>
        );
    }

    const handleChange = (e) =>
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));

    const handleSubmit = async () => {
        setValidationError('');

        if (form.newPassword.length < 8) {
            setValidationError(
                'New password must be at least 8 characters.'
            );
            return;
        }

        if (form.newPassword !== form.confirmPassword) {
            setValidationError('Passwords do not match.');
            return;
        }

        const ok = await onChangePassword({
            currentPassword: form.currentPassword,
            newPassword: form.newPassword,
        });

        if (ok) {
            setForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });

            setOpen(false);
        }
    };

    return (
        <div
            className={`rounded-2xl p-6 border flex flex-col gap-4 ${
                darkMode
                    ? 'bg-slate-900 border-slate-700'
                    : 'bg-white border-slate-100'
            }`}
        >
            <div
                className={`flex items-center gap-2 pb-4 border-b ${
                    darkMode
                        ? 'border-slate-700'
                        : 'border-slate-100'
                }`}
            >
                <span className="text-slate-500 text-lg">🔒</span>

                <h3
                    className={`text-lg font-bold ${
                        darkMode
                            ? 'text-white'
                            : 'text-slate-800'
                    }`}
                >
                    Security
                </h3>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <p
                        className={`text-sm font-semibold ${
                            darkMode
                                ? 'text-white'
                                : 'text-slate-800'
                        }`}
                    >
                        Password
                    </p>

                    <p
                        className={`text-xs mt-0.5 ${
                            darkMode
                                ? 'text-slate-400'
                                : 'text-slate-500'
                        }`}
                    >
                        Change your account password
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    className="text-sm font-bold text-violet-600 hover:text-violet-700 transition-colors"
                >
                    {open ? 'Cancel' : 'Change password'}
                </button>
            </div>

            {open && (
                <div
                    className={`flex flex-col gap-3 pt-2 border-t ${
                        darkMode
                            ? 'border-slate-700'
                            : 'border-slate-100'
                    }`}
                >
                    {validationError && (
                        <p className="text-xs text-red-600 font-medium bg-red-50 rounded-lg px-3 py-2">
                            {validationError}
                        </p>
                    )}

                    <input
                        type="password"
                        name="currentPassword"
                        value={form.currentPassword}
                        onChange={handleChange}
                        className={inputCls}
                        placeholder="Current password"
                    />

                    <input
                        type="password"
                        name="newPassword"
                        value={form.newPassword}
                        onChange={handleChange}
                        className={inputCls}
                        placeholder="New password (min. 8 characters)"
                    />

                    <input
                        type="password"
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        className={inputCls}
                        placeholder="Confirm new password"
                    />

                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={saving}
                            className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-colors flex items-center gap-2"
                        >
                            {saving
                                ? 'Saving...'
                                : 'Update password'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
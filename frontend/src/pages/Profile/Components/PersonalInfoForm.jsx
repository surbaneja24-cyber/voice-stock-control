import React, { useState, useEffect } from 'react';

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
    {children}
  </div>
);

const inputCls = (disabled) =>
  `w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium 
   focus:outline-none focus:border-violet-500 focus:bg-white transition-all
   ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`;

export default function PersonalInfoForm({ profile, isEditing, onSave, saving }) {
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    birthDate: '',
    bio: '',
  });

  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.fullName || '',
        phone: profile.phone || '',
        birthDate: profile.birthDate || '',
        bio: profile.bio || '',
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    await onSave(form);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-100 flex flex-col gap-6">
      {/* Header sección */}
      <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
        <span className="text-violet-600 text-lg">👤</span>
        <h3 className="text-lg font-bold text-slate-800">Personal information</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Full Name */}
        <Field label="Full name">
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

        {/* Employee ID — siempre deshabilitado */}
        <Field label="Employee ID">
          <input
            type="text"
            value={profile?.employeeId || '—'}
            disabled
            className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-400 font-medium cursor-not-allowed select-none"
          />
        </Field>

        {/* Email — solo lectura (es del proveedor de auth) */}
        <Field label="Email address">
          <div className="relative">
            <input
              type="email"
              value={profile?.email || ''}
              disabled
              className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-400 font-medium cursor-not-allowed select-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
              Read-only
            </span>
          </div>
        </Field>

        {/* Phone */}
        <Field label="Phone number">
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

        {/* Birth date */}
        <Field label="Date of birth">
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

      {/* Bio */}
      <Field label="Bio">
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

      {/* Botón guardar */}
      {isEditing && (
        <div className="flex justify-end mt-1">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2"
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
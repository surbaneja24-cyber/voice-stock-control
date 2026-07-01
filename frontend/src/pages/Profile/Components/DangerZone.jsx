import React, { useState } from 'react';

export default function DangerZone({ onDeleteAccount, saving }) {
  const [showModal, setShowModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const CONFIRM_WORD = 'DELETE';

  const handleDelete = async () => {
    if (confirmText !== CONFIRM_WORD) return;
    await onDeleteAccount();
  };

  return (
    <>
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-red-100 flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-red-50 pb-4">
          <span className="text-red-500 text-lg">⚠️</span>
          <h3 className="text-lg font-bold text-red-800">Danger zone</h3>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Delete account</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md">
              Permanently remove your account and all associated data. This action cannot be undone.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition-colors shadow-xs w-full sm:w-auto"
          >
            Delete account
          </button>
        </div>
      </div>

      {/* Modal de confirmación */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl flex flex-col gap-5 animate-fadeIn">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Are you sure?</h3>
              <p className="text-sm text-slate-500 mt-2">
                This will permanently delete your account and all of your data. There is no way to recover it.
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
              Type <span className="font-mono font-bold">{CONFIRM_WORD}</span> to confirm.
            </div>

            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-red-400 transition-all font-mono tracking-widest text-center text-slate-800"
              placeholder={CONFIRM_WORD}
              autoFocus
            />

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => { setShowModal(false); setConfirmText(''); }}
                className="px-4 py-2.5 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={confirmText !== CONFIRM_WORD || saving}
                className="px-4 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
              >
                {saving ? 'Deleting...' : 'Yes, delete my account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
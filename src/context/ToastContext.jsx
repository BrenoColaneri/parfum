import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showConfirm = useCallback(({ title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', onConfirm, onCancel, isDanger = false }) => {
    setConfirmDialog({
      title,
      message,
      confirmText,
      cancelText,
      isDanger,
      onConfirm: async () => {
        setConfirmDialog(null);
        if (onConfirm) await onConfirm();
      },
      onCancel: () => {
        setConfirmDialog(null);
        if (onCancel) onCancel();
      }
    });
  }, []);

  const toastSuccess = useCallback((msg) => showToast(msg, 'success'), [showToast]);
  const toastError = useCallback((msg) => showToast(msg, 'error'), [showToast]);
  const toastInfo = useCallback((msg) => showToast(msg, 'info'), [showToast]);
  const toastWarning = useCallback((msg) => showToast(msg, 'warning'), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, toastSuccess, toastError, toastInfo, toastWarning, showConfirm }}>
      {children}
      
      {/* Toast Notification Container */}
      <div 
        aria-live="polite"
        style={{
          position: 'fixed',
          top: 'calc(env(safe-area-inset-top, 20px) + 20px)',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90%',
          maxWidth: '450px',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          pointerEvents: 'none'
        }}
      >
        {toasts.map(toast => {
          let bg = 'rgba(15, 23, 42, 0.95)';
          let border = '1px solid rgba(255, 255, 255, 0.15)';
          let icon = <Info size={20} color="var(--accent)" />;

          if (toast.type === 'success') {
            border = '1px solid #10b981';
            icon = <CheckCircle2 size={20} color="#10b981" />;
          } else if (toast.type === 'error') {
            border = '1px solid #ef4444';
            icon = <AlertCircle size={20} color="#ef4444" />;
          } else if (toast.type === 'warning') {
            border = '1px solid #f59e0b';
            icon = <AlertTriangle size={20} color="#f59e0b" />;
          }

          return (
            <div
              key={toast.id}
              style={{
                pointerEvents: 'auto',
                background: bg,
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border,
                borderRadius: '14px',
                padding: '0.85rem 1.1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                animation: 'slideDown 0.3s ease-out'
              }}
            >
              <div style={{ flexShrink: 0 }}>{icon}</div>
              <div style={{ flex: 1, fontSize: '0.9rem', color: '#f8fafc', fontWeight: 500, lineHeight: 1.4 }}>
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.6)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal Dialog */}
      {confirmDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100000,
          padding: '1.5rem'
        }}>
          <div className="glass-card" style={{
            maxWidth: '420px',
            width: '100%',
            padding: '2rem',
            borderRadius: '20px',
            border: confirmDialog.isDanger ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--accent)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: confirmDialog.isDanger ? '#ef4444' : 'var(--text-main)' }}>
              {confirmDialog.title}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.75rem', lineHeight: 1.5 }}>
              {confirmDialog.message}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={confirmDialog.onCancel}
                style={{
                  flex: 1,
                  padding: '0.85rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'var(--text-main)',
                  fontWeight: 600,
                  fontSize: '0.95rem'
                }}
              >
                {confirmDialog.cancelText}
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                style={{
                  flex: 1,
                  padding: '0.85rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: confirmDialog.isDanger ? '#ef4444' : 'var(--accent)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  boxShadow: confirmDialog.isDanger ? '0 4px 12px rgba(239,68,68,0.4)' : '0 4px 12px rgba(59,130,246,0.4)'
                }}
              >
                {confirmDialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Retorno seguro caso o hook seja usado fora do provider
    return {
      showToast: () => {},
      toastSuccess: () => {},
      toastError: () => {},
      toastInfo: () => {},
      toastWarning: () => {},
      showConfirm: () => {}
    };
  }
  return context;
};


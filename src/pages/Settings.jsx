import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppProvider';
import { useToast } from '../context/ToastContext';
import { 
  LogOut, 
  Moon,
  Sun,
  Key, 
  Mail, 
  Phone, 
  MessageSquare,
  Sparkles,
  Loader2
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

const Settings = () => {
  const { logout, user, isDemoMode, enableDemoMode, disableDemoMode } = useAppContext();
  const { toastSuccess, toastError, toastInfo, showConfirm } = useToast();
  const navigate = useNavigate();
  const [isLightMode, setIsLightMode] = useState(false);

  // Modais de Alteração
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme === 'light') {
      setIsLightMode(true);
      document.body.classList.add('light-theme');
    }
  }, []);

  const handleLogout = () => {
    showConfirm({
      title: 'Deseja encerrar a sessão?',
      message: 'Você será desconectado da sua conta com segurança.',
      confirmText: 'Sair',
      isDanger: true,
      onConfirm: async () => {
        await logout();
        toastInfo('Sessão encerrada com sucesso.');
        navigate('/login');
      }
    });
  };

  const handleThemeToggle = () => {
    const newMode = !isLightMode;
    setIsLightMode(newMode);
    
    if (newMode) {
      document.body.classList.add('light-theme');
      localStorage.setItem('app-theme', 'light');
      toastSuccess('Tema Claro ativado');
    } else {
      document.body.classList.remove('light-theme');
      localStorage.setItem('app-theme', 'dark');
      toastSuccess('Tema Escuro ativado');
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toastError('A senha deve conter no mínimo 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toastError('As senhas não coincidem.');
      return;
    }

    setIsSavingPassword(true);
    try {
      if (supabase?.auth && !isDemoMode) {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        toastSuccess('Senha atualizada com sucesso!');
      } else {
        toastSuccess('Senha simulada atualizada com sucesso (Modo Demonstração).');
      }
      setShowPasswordModal(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toastError('Erro ao atualizar senha: ' + error.message);
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleSaveEmail = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toastError('Por favor, insira um endereço de e-mail válido.');
      return;
    }

    setIsSavingEmail(true);
    try {
      if (supabase?.auth && !isDemoMode) {
        const { error } = await supabase.auth.updateUser({ email: newEmail });
        if (error) throw error;
        toastSuccess('Link de confirmação enviado para os e-mails (antigo e novo). Verifique sua caixa de entrada.');
      } else {
        toastSuccess('E-mail atualizado com sucesso no ambiente local.');
      }
      setShowEmailModal(false);
      setNewEmail('');
    } catch (error) {
      toastError('Erro ao atualizar e-mail: ' + error.message);
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handleContactWhatsApp = () => {
    window.open("https://wa.me/5511999999999?text=Olá, preciso de suporte no app Biblioteria Parfum.", "_blank");
  };

  const handlePhoneCall = () => {
    window.location.href = "tel:+5511999999999";
  };

  const handleEmailSupport = () => {
    window.location.href = "mailto:suporte@biblioteria.com?subject=Suporte Biblioteria Parfum";
  };

  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    background: 'transparent', 
    color: 'var(--text-main)', 
    padding: '1.2rem 1.25rem', 
    border: 'none',
    borderBottom: '1px solid var(--glass-border)', 
    borderRadius: '0', 
    boxShadow: 'none',
    cursor: 'pointer',
    fontSize: '0.95rem',
    textAlign: 'left',
    transition: 'background 0.2s'
  };

  const lastButtonStyle = {
    ...buttonStyle,
    borderBottom: 'none'
  };

  return (
    <div className="page-wrapper" style={{ paddingBottom: '100px' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Configurações & Ajustes</h1>
        <p className="subtitle">Gerencie suas preferências, conta e opções do sistema</p>
      </header>

      {/* Cartão de Identificação do Usuário */}
      <div className="glass-card" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '1.2rem'
        }}>
          {(user?.user_metadata?.name || user?.email || 'U').charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-main)' }}>
            {user?.user_metadata?.name || 'Colecionador(a)'}
          </h3>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {user?.email || 'Conectado'}
          </p>
        </div>
        {isDemoMode && (
          <span style={{
            fontSize: '0.75rem',
            padding: '0.3rem 0.6rem',
            borderRadius: '20px',
            background: 'rgba(245, 158, 11, 0.2)',
            color: '#f59e0b',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            fontWeight: 600
          }}>
            Modo Demo
          </span>
        )}
      </div>

      {/* Seção Conta e Segurança */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', color: 'var(--accent)', marginBottom: '0.75rem' }}>Conta e Segurança</h2>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
          <button onClick={() => setShowPasswordModal(true)} style={buttonStyle}>
            <Key size={18} style={{ marginRight: '1rem', color: 'var(--accent)' }} />
            Mudar Senha
          </button>
          <button onClick={() => setShowEmailModal(true)} style={lastButtonStyle}>
            <Mail size={18} style={{ marginRight: '1rem', color: 'var(--accent)' }} />
            Mudar E-mail
          </button>
        </div>
      </div>

      {/* Seção Apresentação & Demonstração */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', color: 'var(--accent)', marginBottom: '0.75rem' }}>Recursos de Apresentação</h2>
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={16} color="var(--accent)" />
                Acervo de Demonstração
              </h4>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Carrega coleção curada com fragrâncias famosas para testes e apresentações
              </p>
            </div>
            <button
              onClick={() => {
                if (isDemoMode) {
                  disableDemoMode();
                  toastInfo('Modo demonstração desativado.');
                } else {
                  enableDemoMode();
                  toastSuccess('Acervo de demonstração ativado com sucesso!');
                }
              }}
              style={{
                padding: '0.6rem 1rem',
                borderRadius: '8px',
                background: isDemoMode ? '#10b981' : 'var(--glass-bg)',
                color: isDemoMode ? 'white' : 'var(--text-main)',
                border: '1px solid var(--glass-border)',
                fontWeight: 600,
                fontSize: '0.85rem'
              }}
            >
              {isDemoMode ? 'Ativado' : 'Carregar Demo'}
            </button>
          </div>
        </div>
      </div>

      {/* Seção Preferências */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', color: 'var(--accent)', marginBottom: '0.75rem' }}>Preferências do Aplicativo</h2>
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
          <button onClick={handleThemeToggle} style={lastButtonStyle}>
            {isLightMode ? (
              <Sun size={18} style={{ marginRight: '1rem', color: '#f59e0b' }} />
            ) : (
              <Moon size={18} style={{ marginRight: '1rem', color: 'var(--accent)' }} />
            )}
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div>Tema do Sistema</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Atualmente: {isLightMode ? 'Modo Claro' : 'Modo Escuro'}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Seção Suporte e Contato */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', color: 'var(--accent)', marginBottom: '0.75rem' }}>Canais de Suporte</h2>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
          <button onClick={handleContactWhatsApp} style={buttonStyle}>
            <MessageSquare size={18} style={{ marginRight: '1rem', color: '#22c55e' }} />
            WhatsApp de Atendimento
          </button>
          <button onClick={handlePhoneCall} style={buttonStyle}>
            <Phone size={18} style={{ marginRight: '1rem', color: '#38bdf8' }} />
            Telefone de Suporte
          </button>
          <button onClick={handleEmailSupport} style={lastButtonStyle}>
            <Mail size={18} style={{ marginRight: '1rem', color: '#eab308' }} />
            E-mail de Contato
          </button>
        </div>
      </div>

      {/* Botão de Logout */}
      <button 
        onClick={handleLogout}
        style={{
          width: '100%',
          padding: '1rem',
          borderRadius: '14px',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          background: 'rgba(239, 68, 68, 0.1)',
          color: '#ef4444',
          fontWeight: 600,
          fontSize: '1rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          transition: 'all 0.2s'
        }}
      >
        <LogOut size={18} />
        Encerrar Sessão
      </button>

      {/* Modal Alterar Senha */}
      {showPasswordModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '1.5rem'
        }}>
          <div className="glass-card" style={{ maxWidth: '420px', width: '100%', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Key size={20} color="var(--accent)" /> Atualizar Senha
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Digite sua nova senha abaixo (mínimo de 6 caracteres).
            </p>
            <form onSubmit={handleSavePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nova Senha</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isSavingPassword}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    borderRadius: '10px',
                    border: '1px solid var(--glass-border)',
                    background: 'var(--glass-bg)',
                    color: 'var(--text-main)',
                    marginTop: '0.3rem'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Confirmar Nova Senha</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isSavingPassword}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    borderRadius: '10px',
                    border: '1px solid var(--glass-border)',
                    background: 'var(--glass-bg)',
                    color: 'var(--text-main)',
                    marginTop: '0.3rem'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  disabled={isSavingPassword}
                  style={{
                    flex: 1,
                    padding: '0.8rem',
                    borderRadius: '10px',
                    border: '1px solid var(--glass-border)',
                    background: 'none',
                    color: 'var(--text-main)',
                    fontWeight: 500
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingPassword}
                  style={{
                    flex: 1,
                    padding: '0.8rem',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'var(--accent)',
                    color: 'white',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {isSavingPassword ? <Loader2 size={18} className="lucide-spin" /> : 'Salvar Senha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Alterar E-mail */}
      {showEmailModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '1.5rem'
        }}>
          <div className="glass-card" style={{ maxWidth: '420px', width: '100%', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={20} color="var(--accent)" /> Atualizar E-mail
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Informe o novo endereço de e-mail associado à sua conta.
            </p>
            <form onSubmit={handleSaveEmail} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Novo E-mail</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="novo@email.com"
                  disabled={isSavingEmail}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    borderRadius: '10px',
                    border: '1px solid var(--glass-border)',
                    background: 'var(--glass-bg)',
                    color: 'var(--text-main)',
                    marginTop: '0.3rem'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  disabled={isSavingEmail}
                  style={{
                    flex: 1,
                    padding: '0.8rem',
                    borderRadius: '10px',
                    border: '1px solid var(--glass-border)',
                    background: 'none',
                    color: 'var(--text-main)',
                    fontWeight: 500
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingEmail}
                  style={{
                    flex: 1,
                    padding: '0.8rem',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'var(--accent)',
                    color: 'white',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {isSavingEmail ? <Loader2 size={18} className="lucide-spin" /> : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;

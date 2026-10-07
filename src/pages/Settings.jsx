import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppProvider';
import { 
  LogOut, 
  Moon,
  Sun,
  Key, 
  Mail, 
  Phone, 
  AtSign, 
  MessageSquare 
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

const Settings = () => {
  const { logout, user } = useAppContext();
  const navigate = useNavigate();
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme === 'light') {
      setIsLightMode(true);
      document.body.classList.add('light-theme');
    }
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleChangePassword = async () => {
    const newPassword = window.prompt("Digite sua nova senha (mínimo 6 caracteres):");
    if (!newPassword) return;
    
    if (newPassword.length < 6) {
      alert("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      alert("Senha atualizada com sucesso!");
    } catch (error) {
      alert("Erro ao atualizar senha: " + error.message);
    }
  };

  const handleChangeEmail = async () => {
    const newEmail = window.prompt("Digite seu novo endereço de e-mail:");
    if (!newEmail) return;

    // Regex simples para validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      alert("Por favor, insira um e-mail válido.");
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      alert("Um link de confirmação foi enviado para ambos os e-mails (antigo e novo). Por favor, verifique sua caixa de entrada.");
    } catch (error) {
      alert("Erro ao atualizar e-mail: " + error.message);
    }
  };

  const handleThemeToggle = () => {
    const newMode = !isLightMode;
    setIsLightMode(newMode);
    
    if (newMode) {
      document.body.classList.add('light-theme');
      localStorage.setItem('app-theme', 'light');
    } else {
      document.body.classList.remove('light-theme');
      localStorage.setItem('app-theme', 'dark');
    }
  };

  const handleContactWhatsApp = () => {
    window.open("https://wa.me/5511999999999?text=Olá, preciso de suporte no app Biblioteria.", "_blank");
  };

  const handlePhoneCall = () => {
    window.location.href = "tel:+5511999999999";
  };

  const handleEmailSupport = () => {
    window.location.href = "mailto:suporte@biblioteria.com?subject=Suporte Biblioteria";
  };

  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    background: 'transparent', 
    color: 'var(--text-primary)', 
    padding: '1.2rem 1rem', 
    border: 'none',
    borderBottom: '1px solid rgba(255,255,255,0.05)', 
    borderRadius: '0', 
    boxShadow: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    textAlign: 'left'
  };

  const lastButtonStyle = {
    ...buttonStyle,
    borderBottom: 'none'
  };

  return (
    <div className="page-container" style={{ paddingBottom: '100px' }}>
      <header className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Configurações</h1>
        <p className="page-subtitle">Gerencie suas preferências e conta</p>
      </header>

      <div className="settings-section">
        <h2 style={{ fontSize: '1.2rem', color: 'var(--accent)', marginBottom: '1rem', marginTop: '1rem' }}>Conta e Segurança</h2>
        
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0', padding: '0', overflow: 'hidden' }}>
          <button 
            onClick={handleChangePassword}
            style={buttonStyle}
            className="settings-btn"
          >
            <Key size={20} style={{ marginRight: '1rem', color: 'var(--accent)' }} />
            Mudar Senha
          </button>
          
          <button 
            onClick={handleChangeEmail}
            style={lastButtonStyle}
            className="settings-btn"
          >
            <Mail size={20} style={{ marginRight: '1rem', color: 'var(--accent)' }} />
            Mudar Email
          </button>
        </div>
      </div>

      <div className="settings-section">
        <h2 style={{ fontSize: '1.2rem', color: 'var(--accent)', marginBottom: '1rem', marginTop: '2rem' }}>Preferências</h2>
        
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden', display: 'flex' }}>
          <button 
            onClick={handleThemeToggle}
            style={lastButtonStyle}
            className="settings-btn"
          >
            {isLightMode ? (
              <Sun size={20} style={{ marginRight: '1rem', color: 'var(--accent)' }} />
            ) : (
              <Moon size={20} style={{ marginRight: '1rem', color: 'var(--accent)' }} />
            )}
            {isLightMode ? 'Ativar Modo Escuro' : 'Ativar Modo Claro'}
          </button>
        </div>
      </div>

      <div className="settings-section">
        <h2 style={{ fontSize: '1.2rem', color: 'var(--accent)', marginBottom: '1rem', marginTop: '2rem' }}>Suporte e Contato</h2>
        
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0', padding: '0', overflow: 'hidden' }}>
          <button 
            onClick={handleContactWhatsApp}
            style={buttonStyle}
            className="settings-btn"
          >
            <MessageSquare size={20} style={{ marginRight: '1rem', color: 'var(--accent)' }} />
            Contato via WhatsApp
          </button>

          <button 
            onClick={handlePhoneCall}
            style={buttonStyle}
            className="settings-btn"
          >
            <Phone size={20} style={{ marginRight: '1rem', color: 'var(--accent)' }} />
            Ligar para o Suporte
          </button>

          <button 
            onClick={handleEmailSupport}
            style={lastButtonStyle}
            className="settings-btn"
          >
            <AtSign size={20} style={{ marginRight: '1rem', color: 'var(--accent)' }} />
            Enviar E-mail Comercial
          </button>
        </div>
      </div>

      <div className="settings-section" style={{ marginTop: '3rem', marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
        <button 
          onClick={handleLogout}
          className="action-button danger" 
          style={{ width: '100%', padding: '1.2rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}
        >
          <LogOut size={20} style={{ marginRight: '0.5rem' }} />
          Sair da Conta (Logout)
        </button>
      </div>

    </div>
  );
};

export default Settings;

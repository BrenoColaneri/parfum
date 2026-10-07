import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppProvider';
import { 
  LogOut, 
  Moon, 
  Key, 
  Mail, 
  Phone, 
  AtSign, 
  MessageSquare 
} from 'lucide-react';

const Settings = () => {
  const { logout, user } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNotImplemented = (feature) => {
    alert(`${feature} será ativado na próxima fase de desenvolvimento.`);
  };

  const handleThemeToggle = () => {
    // Basic theme toggle simulation
    document.body.classList.toggle('light-theme');
    alert('Tema alterado! (Simulação visual ativa)');
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
            onClick={() => handleNotImplemented('Mudar Senha')}
            className="action-button" 
            style={{ justifyContent: 'flex-start', background: 'transparent', color: 'var(--text-primary)', padding: '1.2rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', borderRadius: '0', boxShadow: 'none' }}
          >
            <Key size={20} style={{ marginRight: '1rem', color: 'var(--accent)' }} />
            Mudar Senha
          </button>
          
          <button 
            onClick={() => handleNotImplemented('Mudar Email')}
            className="action-button" 
            style={{ justifyContent: 'flex-start', background: 'transparent', color: 'var(--text-primary)', padding: '1.2rem 1rem', borderRadius: '0', boxShadow: 'none' }}
          >
            <Mail size={20} style={{ marginRight: '1rem', color: 'var(--accent)' }} />
            Mudar Email
          </button>
        </div>
      </div>

      <div className="settings-section">
        <h2 style={{ fontSize: '1.2rem', color: 'var(--accent)', marginBottom: '1rem', marginTop: '2rem' }}>Preferências</h2>
        
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
          <button 
            onClick={handleThemeToggle}
            className="action-button" 
            style={{ justifyContent: 'flex-start', background: 'transparent', color: 'var(--text-primary)', padding: '1.2rem 1rem', borderRadius: '0', boxShadow: 'none' }}
          >
            <Moon size={20} style={{ marginRight: '1rem', color: 'var(--accent)' }} />
            Alterar Tema
          </button>
        </div>
      </div>

      <div className="settings-section">
        <h2 style={{ fontSize: '1.2rem', color: 'var(--accent)', marginBottom: '1rem', marginTop: '2rem' }}>Suporte e Contato</h2>
        
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0', padding: '0', overflow: 'hidden' }}>
          <button 
            onClick={() => handleNotImplemented('Mensagem de Contato')}
            className="action-button" 
            style={{ justifyContent: 'flex-start', background: 'transparent', color: 'var(--text-primary)', padding: '1.2rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', borderRadius: '0', boxShadow: 'none' }}
          >
            <MessageSquare size={20} style={{ marginRight: '1rem', color: 'var(--accent)' }} />
            Contato via Mensagem
          </button>

          <button 
            onClick={() => handleNotImplemented('Telefone de Suporte')}
            className="action-button" 
            style={{ justifyContent: 'flex-start', background: 'transparent', color: 'var(--text-primary)', padding: '1.2rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', borderRadius: '0', boxShadow: 'none' }}
          >
            <Phone size={20} style={{ marginRight: '1rem', color: 'var(--accent)' }} />
            Telefone
          </button>

          <button 
            onClick={() => handleNotImplemented('Email de Suporte')}
            className="action-button" 
            style={{ justifyContent: 'flex-start', background: 'transparent', color: 'var(--text-primary)', padding: '1.2rem 1rem', borderRadius: '0', boxShadow: 'none' }}
          >
            <AtSign size={20} style={{ marginRight: '1rem', color: 'var(--accent)' }} />
            Email (Contato Comercial)
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

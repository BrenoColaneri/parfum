import React, { useState } from 'react';
import { Flame, Loader2, Sparkles, Key } from 'lucide-react';
import { useAppContext } from '../context/AppProvider';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

const Login = () => {
  const { login, signup, enableDemoMode } = useAppContext();
  const { toastSuccess, toastError, toastInfo } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toastError('Preencha seu e-mail e senha.');
      return;
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        if (!name.trim()) {
          toastError('Por favor, informe seu nome.');
          setIsLoading(false);
          return;
        }
        await signup(email, password, name);
        toastSuccess('Conta criada com sucesso! Você já pode entrar.');
        setIsSignUp(false);
      } else {
        await login(email, password);
        toastSuccess('Bem-vindo(a) à sua Biblioteria Olfativa!');
        navigate('/');
      }
    } catch (err) {
      toastError(err.message || 'Falha na autenticação. Verifique os dados.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAccess = () => {
    enableDemoMode();
    toastSuccess('Modo Demonstração ativado com acervo curado!');
    navigate('/');
  };

  const handleSendResetPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toastError('Informe o e-mail cadastrado.');
      return;
    }

    setIsSendingReset(true);
    try {
      if (supabase?.auth) {
        const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
          redirectTo: window.location.origin + '/settings'
        });
        if (error) throw error;
        toastSuccess('Link de recuperação enviado para sua caixa de entrada!');
        setShowForgotModal(false);
        setForgotEmail('');
      } else {
        toastInfo('Modo local: no ambiente de produção um link seguro é despachado.');
        setShowForgotModal(false);
      }
    } catch (err) {
      toastError('Erro ao enviar link de recuperação: ' + err.message);
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '2rem 1.5rem',
      background: 'var(--bg-gradient)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ 
          width: '84px', 
          height: '84px', 
          borderRadius: '50%', 
          background: 'rgba(59, 130, 246, 0.12)', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          margin: '0 auto 1.25rem',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          boxShadow: '0 0 30px rgba(59, 130, 246, 0.2)'
        }}>
          <Flame size={44} color="var(--accent)" />
        </div>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.4rem', letterSpacing: '-0.03em' }}>PARFUM</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Biblioteria Olfativa e Oráculo Inteligente</p>
      </div>

      <div className="glass-card" style={{ maxWidth: '440px', width: '100%', margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'flex', marginBottom: '1.75rem', borderBottom: '1px solid var(--glass-border)' }}>
          <button 
            type="button"
            onClick={() => setIsSignUp(false)}
            style={{ 
              flex: 1, 
              padding: '0.85rem', 
              background: 'none', 
              border: 'none', 
              color: !isSignUp ? 'var(--accent)' : 'var(--text-muted)',
              borderBottom: !isSignUp ? '2px solid var(--accent)' : '2px solid transparent',
              fontWeight: !isSignUp ? 'bold' : 'normal',
              fontSize: '1rem'
            }}>
            Entrar
          </button>
          <button 
            type="button"
            onClick={() => setIsSignUp(true)}
            style={{ 
              flex: 1, 
              padding: '0.85rem', 
              background: 'none', 
              border: 'none', 
              color: isSignUp ? 'var(--accent)' : 'var(--text-muted)',
              borderBottom: isSignUp ? '2px solid var(--accent)' : '2px solid transparent',
              fontWeight: isSignUp ? 'bold' : 'normal',
              fontSize: '1rem'
            }}>
            Criar Conta
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {isSignUp && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nome Completo</label>
              <input 
                type="text" 
                required={isSignUp}
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Seu nome ou apelido"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  border: '1px solid var(--glass-border)',
                  background: 'var(--glass-bg)',
                  color: 'var(--text-main)',
                  fontSize: '0.95rem'
                }}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>E-mail</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                border: '1px solid var(--glass-border)',
                background: 'var(--glass-bg)',
                color: 'var(--text-main)',
                fontSize: '0.95rem'
              }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Senha</label>
              {!isSignUp && (
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  Esqueci minha senha
                </button>
              )}
            </div>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                border: '1px solid var(--glass-border)',
                background: 'var(--glass-bg)',
                color: 'var(--text-main)',
                fontSize: '0.95rem'
              }}
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            style={{
              background: 'var(--accent)',
              color: 'white',
              border: 'none',
              padding: '0.95rem',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.35)',
              marginTop: '0.5rem'
            }}
          >
            {isLoading ? <Loader2 size={20} className="lucide-spin" /> : (isSignUp ? 'Cadastrar' : 'Acessar Meu Acervo')}
          </button>
        </form>

        <div style={{ margin: '1.75rem 0 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>OU</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
        </div>

        {/* Botão de Demonstração para Apresentação */}
        <button
          type="button"
          onClick={handleDemoAccess}
          style={{
            width: '100%',
            background: 'rgba(255, 255, 255, 0.05)',
            color: 'var(--text-main)',
            border: '1px solid var(--glass-border)',
            padding: '0.85rem',
            borderRadius: '12px',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s'
          }}
        >
          <Sparkles size={18} color="var(--accent)" />
          Acessar Modo Demonstração
        </button>
      </div>

      {/* Modal de Esqueci Minha Senha */}
      {showForgotModal && (
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
          zIndex: 10000,
          padding: '1.5rem'
        }}>
          <div className="glass-card" style={{ maxWidth: '420px', width: '100%', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Key size={20} color="var(--accent)" /> Recuperar Senha
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Digite seu e-mail cadastrado. Enviaremos um link de acesso seguro para você redefinir sua senha.
            </p>
            <form onSubmit={handleSendResetPassword}>
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                placeholder="seu@email.com"
                disabled={isSendingReset}
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  border: '1px solid var(--glass-border)',
                  background: 'var(--glass-bg)',
                  color: 'var(--text-main)',
                  fontSize: '0.95rem',
                  marginBottom: '1.25rem'
                }}
              />
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  disabled={isSendingReset}
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
                  disabled={isSendingReset}
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
                  {isSendingReset ? <Loader2 size={18} className="lucide-spin" /> : 'Enviar Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;

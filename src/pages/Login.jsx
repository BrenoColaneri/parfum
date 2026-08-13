import React, { useState } from 'react';
import { Flame } from 'lucide-react';
import { useAppContext } from '../context/AppProvider';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login, signup } = useAppContext();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (email && password) {
      try {
        if (isSignUp) {
          await signup(email, password, name);
          alert('Conta criada com sucesso! Você já pode entrar.');
          setIsSignUp(false);
        } else {
          await login(email, password);
          navigate('/');
        }
      } catch (err) {
        setErrorMsg(err.message || 'Ocorreu um erro.');
      }
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '2rem',
      background: 'var(--bg-gradient)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          borderRadius: '50%', 
          background: 'rgba(59, 130, 246, 0.1)', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          margin: '0 auto 1rem',
          border: '1px solid rgba(59, 130, 246, 0.2)'
        }}>
          <Flame size={40} color="var(--accent)" />
        </div>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Diário de Perfumaria</h1>
        <p style={{ color: 'var(--text-muted)' }}>Sintonize sua Fragrância com o Tempo</p>
      </div>

      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
          <button 
            onClick={() => setIsSignUp(false)}
            style={{ 
              flex: 1, 
              padding: '1rem', 
              background: 'none', 
              border: 'none', 
              color: !isSignUp ? 'var(--accent)' : 'var(--text-muted)',
              borderBottom: !isSignUp ? '2px solid var(--accent)' : '2px solid transparent',
              fontWeight: !isSignUp ? 'bold' : 'normal'
            }}>
            Entrar
          </button>
          <button 
            onClick={() => setIsSignUp(true)}
            style={{ 
              flex: 1, 
              padding: '1rem', 
              background: 'none', 
              border: 'none', 
              color: isSignUp ? 'var(--accent)' : 'var(--text-muted)',
              borderBottom: isSignUp ? '2px solid var(--accent)' : '2px solid transparent',
              fontWeight: isSignUp ? 'bold' : 'normal'
            }}>
            Criar Conta
          </button>
        </div>

        {errorMsg && <p style={{ color: '#ef4444', textAlign: 'center', marginBottom: '1rem', fontSize: '0.9rem' }}>{errorMsg}</p>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {isSignUp && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nome</label>
              <input 
                type="text" 
                required={isSignUp}
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Seu nome"
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: '1px solid var(--glass-border)',
                  background: 'rgba(0,0,0,0.2)',
                  color: 'white',
                  fontSize: '1rem'
                }}
              />
            </div>
          )}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>E-mail</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '12px',
                border: '1px solid var(--glass-border)',
                background: 'rgba(0,0,0,0.2)',
                color: 'white',
                fontSize: '1rem'
              }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Senha</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '12px',
                border: '1px solid var(--glass-border)',
                background: 'rgba(0,0,0,0.2)',
                color: 'white',
                fontSize: '1rem'
              }}
            />
          </div>
          <button type="submit" style={{
            background: 'var(--accent)',
            color: 'white',
            border: 'none',
            padding: '1rem',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
          }}>
            {isSignUp ? 'Cadastrar' : 'Acessar Meu Acervo'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

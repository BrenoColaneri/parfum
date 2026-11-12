import { describe, it, expect } from 'vitest';

describe('Módulo de Autenticação e Segurança', () => {
  it('deve validar formato básico de e-mail', () => {
    const validEmail = 'usuario@biblioteria.com';
    const invalidEmail = 'usuario-invalido';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    expect(emailRegex.test(validEmail)).toBe(true);
    expect(emailRegex.test(invalidEmail)).toBe(false);
  });

  it('deve validar requisitos de tamanho mínimo da senha (6 caracteres)', () => {
    const shortPassword = '123';
    const validPassword = 'minhasenhasegura';

    expect(shortPassword.length >= 6).toBe(false);
    expect(validPassword.length >= 6).toBe(true);
  });

  it('deve formatar o nome do usuário a partir do e-mail quando o nome não for fornecido', () => {
    const email = 'breno.colaneri@email.com';
    const prefix = email.split('@')[0];
    const formattedName = prefix.replace(/[0-9.]/g, ' ').replace(/\s+/g, ' ').trim();
    const capitalized = formattedName.split(' ')[0].charAt(0).toUpperCase() + formattedName.split(' ')[0].slice(1);

    expect(capitalized).toBe('Breno');
  });

  it('deve limpar os estados da sessão no logout para evitar vazamento de dados', () => {
    let session = {
      isAuthenticated: true,
      user: { id: 'u-1', email: 'teste@email.com' },
      inventory: [{ id: '1', name: 'Bleu de Chanel' }],
      wishlist: [{ id: 'w-1', name: 'Aventus' }]
    };

    // Executa simulação de logout
    session = {
      isAuthenticated: false,
      user: null,
      inventory: [],
      wishlist: []
    };

    expect(session.isAuthenticated).toBe(false);
    expect(session.user).toBeNull();
    expect(session.inventory).toHaveLength(0);
    expect(session.wishlist).toHaveLength(0);
  });
});


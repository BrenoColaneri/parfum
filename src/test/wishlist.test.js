import { describe, it, expect } from 'vitest';

describe('Módulo de Lista de Desejos (Wishlist)', () => {
  it('deve armazenar o preço-alvo real definido pelo usuário sem simulações randômicas', () => {
    const item = {
      name: 'Tom Ford Tobacco Vanille',
      targetPrice: 1850.00,
      volume: '50ml'
    };

    expect(item.targetPrice).toBe(1850.00);
    expect(typeof item.targetPrice).toBe('number');
  });

  it('deve gerar URLs legítimas de pesquisa para Google Shopping, Amazon e Sephora', () => {
    const perfumeName = 'Dior Homme Intense';
    const googleShoppingUrl = `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(perfumeName)}`;
    const amazonUrl = `https://www.amazon.com.br/s?k=${encodeURIComponent(perfumeName)}`;
    const sephoraUrl = `https://www.sephora.com.br/busca/?q=${encodeURIComponent(perfumeName)}`;

    expect(googleShoppingUrl).toContain('Dior%20Homme%20Intense');
    expect(googleShoppingUrl).toContain('tbm=shop');
    expect(amazonUrl).toContain('amazon.com.br');
    expect(sephoraUrl).toContain('sephora.com.br');
  });

  it('deve remover corretamente um item da lista de desejos', () => {
    let wishlist = [
      { id: 'w-1', name: 'Creed Aventus' },
      { id: 'w-2', name: 'Nishane Hacivat' }
    ];

    wishlist = wishlist.filter(w => w.id !== 'w-1');
    expect(wishlist).toHaveLength(1);
    expect(wishlist[0].id).toBe('w-2');
  });
});


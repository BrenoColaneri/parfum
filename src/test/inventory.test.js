import { describe, it, expect } from 'vitest';

describe('Módulo de Biblioteria (Inventory)', () => {
  const sampleInventory = [
    {
      id: 'p-1',
      name: 'Bleu de Chanel',
      brand: 'Chanel',
      type: 'Amadeirado Aromático',
      gender: 'Masculino',
      intensity: 'Forte',
      price_paid: 890.00,
      full_details: { volume_ml: 100, sprays_used: 50 }
    },
    {
      id: 'p-2',
      name: 'Baccarat Rouge 540',
      brand: 'MFK',
      type: 'Floral Doce',
      gender: 'Unissex',
      intensity: 'Forte',
      price_paid: 2450.00,
      full_details: { volume_ml: 70, sprays_used: 10 }
    },
    {
      id: 'p-3',
      name: 'Acqua di Giò',
      brand: 'Armani',
      type: 'Cítrico Fresco',
      gender: 'Masculino',
      intensity: 'Leve',
      price_paid: 550.00,
      full_details: { volume_ml: 100, sprays_used: 180 }
    }
  ];

  it('deve calcular corretamente o valor total investido na coleção (price_paid)', () => {
    const totalInvested = sampleInventory.reduce((acc, p) => acc + (parseFloat(p.price_paid) || 0), 0);
    expect(totalInvested).toBe(3890.00);
  });

  it('deve filtrar fragrâncias por termo de busca (nome ou marca)', () => {
    const term = 'chanel';
    const filtered = sampleInventory.filter(p => 
      p.name.toLowerCase().includes(term) || (p.brand && p.brand.toLowerCase().includes(term))
    );
    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe('Bleu de Chanel');
  });

  it('deve filtrar fragrâncias por gênero', () => {
    const unissexOnly = sampleInventory.filter(p => p.gender === 'Unissex');
    expect(unissexOnly).toHaveLength(1);
    expect(unissexOnly[0].name).toBe('Baccarat Rouge 540');
  });

  it('deve atualizar o preço pago de um perfume existente', () => {
    let inventory = [...sampleInventory];
    const updateId = 'p-3';
    const newPrice = 599.90;

    inventory = inventory.map(p => p.id === updateId ? { ...p, price_paid: newPrice } : p);

    const updated = inventory.find(p => p.id === updateId);
    expect(updated.price_paid).toBe(599.90);
  });

  it('deve incrementar corretamente as borrifadas e controlar o nível restante', () => {
    const perfume = { ...sampleInventory[0] };
    const spraysToAdd = 4;
    const currentSprays = perfume.full_details.sprays_used || 0;
    perfume.full_details.sprays_used = currentSprays + spraysToAdd;

    expect(perfume.full_details.sprays_used).toBe(54);
    // Estimativa de ~10 borrifadas por ml
    const totalEstimatedSprays = perfume.full_details.volume_ml * 10;
    const percentageRemaining = Math.max(0, 100 - (perfume.full_details.sprays_used / totalEstimatedSprays * 100));
    expect(percentageRemaining).toBeCloseTo(94.6, 1);
  });
});


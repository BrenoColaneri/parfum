import { describe, it, expect } from 'vitest';

describe('Módulo de Histórico SOTD (Scent of the Day)', () => {
  it('deve agrupar os perfumes por data de uso em ordem decrescente', () => {
    const sotdHistory = [
      { id: '1', perfume_id: 'p-1', date: '2026-11-10' },
      { id: '2', perfume_id: 'p-2', date: '2026-11-11' },
      { id: '3', perfume_id: 'p-3', date: '2026-11-10' }
    ];

    const inventory = [
      { id: 'p-1', name: 'Bleu de Chanel' },
      { id: 'p-2', name: 'Sauvage Elixir' },
      { id: 'p-3', name: 'Acqua di Giò' }
    ];

    const grouped = sotdHistory.reduce((acc, curr) => {
      if (!acc[curr.date]) acc[curr.date] = [];
      const perfume = inventory.find(p => p.id === curr.perfume_id);
      if (perfume) acc[curr.date].push(perfume);
      return acc;
    }, {});

    const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

    expect(sortedDates[0]).toBe('2026-11-11');
    expect(sortedDates[1]).toBe('2026-11-10');
    expect(grouped['2026-11-10']).toHaveLength(2);
    expect(grouped['2026-11-11']).toHaveLength(1);
  });

  it('deve prevenir o registro duplicado do mesmo perfume na mesma data', () => {
    const sotdHistory = [
      { id: '1', perfume_id: 'p-1', date: '2026-11-11' }
    ];

    const candidatePerfumeId = 'p-1';
    const candidateDate = '2026-11-11';

    const isDuplicate = sotdHistory.some(
      s => s.perfume_id === candidatePerfumeId && s.date === candidateDate
    );

    expect(isDuplicate).toBe(true);
  });

  it('deve identificar o perfume mais utilizado na coleção (Top 1)', () => {
    const sotdHistory = [
      { id: '1', perfume_id: 'p-1', date: '2026-11-01' },
      { id: '2', perfume_id: 'p-2', date: '2026-11-02' },
      { id: '3', perfume_id: 'p-1', date: '2026-11-03' },
      { id: '4', perfume_id: 'p-1', date: '2026-11-04' },
      { id: '5', perfume_id: 'p-3', date: '2026-11-05' }
    ];

    const counts = {};
    sotdHistory.forEach(s => {
      counts[s.perfume_id] = (counts[s.perfume_id] || 0) + 1;
    });

    const topUsedId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    expect(topUsedId).toBe('p-1');
    expect(counts['p-1']).toBe(3);
  });
});


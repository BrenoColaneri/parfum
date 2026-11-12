import { describe, it, expect } from 'vitest';
import {
  simulateAIRecommendation,
  findClones,
  perfumeBattle,
  recommendLayering,
  formatCustomOccasion,
  chatWithSommelier
} from '../utils/aiRecommender';

describe('Módulo de Inteligência Artificial e Fallbacks', () => {
  const sampleInventory = [
    { id: '1', name: 'Acqua di Giò', type: 'Cítrico Fresco', brand: 'Armani' },
    { id: '2', name: 'Sauvage Elixir', type: 'Especiado Quente', brand: 'Dior' },
    { id: '3', name: 'Bleu de Chanel', type: 'Amadeirado Aromático', brand: 'Chanel' }
  ];

  it('deve gerar recomendação climática coerente (perfume fresco em dia quente)', async () => {
    const warmWeather = { temp: 30, condition: 'Ensolarado', city: 'Rio de Janeiro' };
    const occasion = 'Academia';

    const result = await simulateAIRecommendation(warmWeather, occasion, sampleInventory, 'Tarde');
    expect(result).toBeDefined();
    expect(result.perfume).toBeDefined();
    expect(result.rationale).toBeDefined();
    expect(result.recommendedNotes.length).toBeGreaterThan(0);
    // Em calor intenso de 30°C ou academia, deve escolher perfume fresco
    expect(result.perfume.type.toLowerCase()).toMatch(/(fresco|cítrico)/);
  });

  it('deve gerar recomendação climática coerente (perfume denso em noite fria)', async () => {
    const coldWeather = { temp: 14, condition: 'Frio e Nublado', city: 'Curitiba' };
    const occasion = 'Jantar';

    const result = await simulateAIRecommendation(coldWeather, occasion, sampleInventory, 'Noite');
    expect(result).toBeDefined();
    expect(result.perfume).toBeDefined();
    expect(result.perfume.type.toLowerCase()).toMatch(/(especiado|amadeirado)/);
  });

  it('deve fornecer contratipos confiáveis sem quebrar na ausência de rede', async () => {
    const clones = await findClones('Sauvage Elixir');
    expect(Array.isArray(clones)).toBe(true);
    expect(clones.length).toBeGreaterThan(0);
    expect(clones[0]).toHaveProperty('name');
    expect(clones[0]).toHaveProperty('similarity');
  });

  it('deve realizar a Batalha Olfativa entre 2 fragrâncias com critérios estruturados', async () => {
    const battle = await perfumeBattle(sampleInventory[0], sampleInventory[1]);
    expect(battle).toBeDefined();
    expect(battle).toHaveProperty('projection_winner');
    expect(battle).toHaveProperty('overall_winner');
    expect(battle).toHaveProperty('overall_verdict');
  });

  it('deve sugerir Layering entre duas fragrâncias distintas da coleção', async () => {
    const layering = await recommendLayering(sampleInventory);
    expect(layering).toBeDefined();
    expect(layering).toHaveProperty('perfume1_name');
    expect(layering).toHaveProperty('perfume2_name');
    expect(layering.perfume1_name).not.toBe(layering.perfume2_name);
  });

  it('deve formatar ocasião customizada com ícone adequado', async () => {
    const formatted = await formatCustomOccasion('casamento na praia');
    expect(formatted.name).toBe('Casamento na praia');
    expect(formatted.lucideIcon).toBeDefined();
  });

  it('deve responder mensagens no Sommelier Virtual sem travar', async () => {
    const reply = await chatWithSommelier(sampleInventory, [], 'Qual perfume usar hoje à noite?');
    expect(typeof reply).toBe('string');
    expect(reply.length).toBeGreaterThan(10);
  });
});


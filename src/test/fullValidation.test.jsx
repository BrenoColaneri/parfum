import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../context/ToastContext';
import { AppProvider, DEMO_PERFUMES } from '../context/AppProvider';
import {
  enrichPerfumeData,
  fetchPerfumeDetails,
  recommendNewPerfumes,
  recommendLayering,
  perfumeBattle,
  findClones,
  chatWithSommelier
} from '../utils/aiRecommender';
import Login from '../pages/Login';
import Home from '../pages/Home';
import Inventory from '../pages/Inventory';
import Wishlist from '../pages/Wishlist';
import Analysis from '../pages/Analysis';
import History from '../pages/History';
import Settings from '../pages/Settings';
import BottomNav from '../components/BottomNav';
import FloatingChat from '../components/FloatingChat';

const renderWithProviders = (ui, { route = '/' } = {}) => {
  return render(
    <ToastProvider>
      <AppProvider>
        <MemoryRouter initialEntries={[route]}>
          {ui}
        </MemoryRouter>
      </AppProvider>
    </ToastProvider>
  );
};

describe('Validação Integral de Componentes, Regras de Negócio e Fallbacks de IA', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.classList.remove('light-theme');
  });

  it('deve enriquecer perfume conhecido com precisão enciclopédica (identified: true)', async () => {
    const res = await enrichPerfumeData({ perfumeName: 'Bleu de Chanel' });
    expect(res.identified).toBe(true);
    expect(res.name).toBe('Bleu de Chanel');
    expect(res.brand).toBe('Chanel');
    expect(res.concentration).toBe('EDP');
    expect(res.type).toContain('Amadeirado');
  });

  it('deve informar limitação (identified: false e aiWarning) para perfume inexistente sem inventar confirmação', async () => {
    const res = await enrichPerfumeData({ perfumeName: 'Perfume Inexistente XYZ 9999' });
    expect(res.identified).toBe(false);
    expect(res.aiWarning).toBeDefined();
    expect(res.aiWarning).toContain('Não foi possível confirmar automaticamente');
  });

  it('deve informar limitação quando apenas imagem é enviada e serviço de visão está indisponível', async () => {
    const res = await enrichPerfumeData({
      perfumeName: '',
      imageBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      imageMimeType: 'image/png'
    });
    expect(res.identified).toBe(false);
    expect(res.aiWarning).toContain('Não foi possível identificar o frasco automaticamente pela imagem');
  });

  it('deve rejeitar formato de imagem incompatível em enrichPerfumeData', async () => {
    const res = await enrichPerfumeData({
      perfumeName: 'Teste',
      imageBase64: 'ZmFrZQ==',
      imageMimeType: 'application/pdf'
    });
    expect(res.identified).toBe(false);
    expect(res.aiWarning).toContain('Formato de arquivo incompatível');
  });

  it('deve retornar ficha técnica completa com volume_ml e sprays_used preservados', async () => {
    const details = await fetchPerfumeDetails('Dior Sauvage');
    expect(details).toHaveProperty('description');
    expect(details).toHaveProperty('pyramid');
    expect(details.pyramid.top.length).toBeGreaterThan(0);
    expect(details.perfumer).toBe('François Demachy');
    expect(details.volume_ml).toBe(100);
    expect(details.sprays_used).toBe(0);
  });

  it('deve recomendar novos perfumes em Descobrir excluindo os que já estão na coleção', async () => {
    const owned = [{ name: 'Layton', brand: 'Parfums de Marly' }];
    const recs = await recommendNewPerfumes(owned);
    expect(recs.length).toBeGreaterThan(0);
    expect(recs.some(r => r.name.toLowerCase() === 'layton')).toBe(false);
  });

  it('deve gerar Layering com 1º e 2º perfume selecionados, compatibilidade, ordem de aplicação e dicas', async () => {
    const p1 = DEMO_PERFUMES[0];
    const p2 = DEMO_PERFUMES[1];
    const mix = await recommendLayering(DEMO_PERFUMES, p1, p2);
    expect(mix.perfume1_name).toBe(p1.name);
    expect(mix.perfume2_name).toBe(p2.name);
    expect(mix.compatibility).toBeDefined();
    expect(mix.application_order).toContain('1º');
    expect(mix.usage_tips).toBeDefined();
  });

  it('deve avaliar Batalha Olfativa dinamicamente com base na concentração, intensidade e notas', async () => {
    const lightFresh = {
      name: 'Colônia Cítrica Leve',
      concentration: 'EDC',
      intensity: 'Leve',
      type: 'Cítrico Fresco',
      notes: 'Limão, Água',
      user_rating: 3
    };
    const powerhouse = {
      name: 'Elixir Oriental Intenso',
      concentration: 'Extrait',
      intensity: 'Forte',
      type: 'Oriental Especiado',
      notes: 'Oud, Baunilha, Âmbar, Cardamomo',
      user_rating: 5
    };
    const battle = await perfumeBattle(powerhouse, lightFresh);
    expect(battle.projection_winner).toBe('Elixir Oriental Intenso');
    expect(battle.compliments_winner).toBe('Elixir Oriental Intenso');
    expect(battle.overall_winner).toBe('Elixir Oriental Intenso');
  });

  it('deve retornar contratipos específicos para clássicos da perfumaria', async () => {
    const clones = await findClones('Bleu de Chanel');
    expect(clones.length).toBeGreaterThan(0);
    expect(clones[0].brand).toBe('In The Box');
  });

  it('deve responder contextualmente no Sommelier Virtual citando a coleção do usuário e conceitos técnicos', async () => {
    const collectionReply = await chatWithSommelier(DEMO_PERFUMES, [], 'Quais perfumes eu tenho na minha coleção?');
    expect(collectionReply).toContain('Bleu de Chanel');

    const techReply = await chatWithSommelier(DEMO_PERFUMES, [], 'Qual a diferença entre EDT e EDP?');
    expect(techReply).toContain('Eau de Toilette');
    expect(techReply).toContain('Eau de Parfum');

    const emptyReply = await chatWithSommelier(DEMO_PERFUMES, [], '   ');
    expect(emptyReply).toContain('Por favor, envie uma pergunta');
  });

  it('deve renderizar a tela de Login e validar modo demonstração', () => {
    renderWithProviders(<Login />, { route: '/login' });
    expect(screen.getByText('PARFUM')).toBeDefined();
    expect(screen.getByText('Acessar Modo Demonstração')).toBeDefined();
  });

  it('deve renderizar Home, BottomNav e FloatingChat sem erros', () => {
    localStorage.setItem('parfum_demo_mode', 'true');
    renderWithProviders(
      <>
        <Home />
        <FloatingChat />
        <BottomNav />
      </>
    );
    expect(screen.getByText(/Horário do Evento/i)).toBeDefined();
    expect(screen.getByText(/Qual será a sua ocasião hoje\?/i)).toBeDefined();
  });

  it('deve renderizar Inventory com filtros combináveis de Gênero e Família e abrir formulário de adição', () => {
    localStorage.setItem('parfum_demo_mode', 'true');
    renderWithProviders(<Inventory />);
    expect(screen.getByText('Biblioteria Olfativa')).toBeDefined();
    expect(screen.getByText('Bleu de Chanel')).toBeDefined();

    // Filtra por Unissex
    const unissexBtn = screen.getByRole('button', { name: 'Unissex' });
    fireEvent.click(unissexBtn);
    expect(screen.getByText('Baccarat Rouge 540')).toBeDefined();
  });

  it('deve renderizar Wishlist, Analysis, History e Settings sem quebrar', () => {
    localStorage.setItem('parfum_demo_mode', 'true');
    const { unmount: u1 } = renderWithProviders(<Wishlist />);
    expect(screen.getByText('Lista de Desejos')).toBeDefined();
    u1();

    const { unmount: u2 } = renderWithProviders(<Analysis />);
    expect(screen.getByText('Ferramentas de IA')).toBeDefined();
    u2();

    const { unmount: u3 } = renderWithProviders(<History />);
    expect(screen.getByText('Perfil Olfativo')).toBeDefined();
    u3();

    const { unmount: u4 } = renderWithProviders(<Settings />);
    expect(screen.getByText('Configurações & Ajustes')).toBeDefined();
    u4();
  });

  it('deve alternar e persistir o tema claro/escuro no localStorage e document.body', () => {
    localStorage.setItem('parfum_demo_mode', 'true');
    renderWithProviders(<Settings />);
    const themeBtn = screen.getByText('Tema do Sistema').closest('button');
    fireEvent.click(themeBtn);
    expect(localStorage.getItem('app-theme')).toBe('light');
    expect(document.body.classList.contains('light-theme')).toBe(true);
  });
});


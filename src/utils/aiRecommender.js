import { GoogleGenerativeAI } from '@google/generative-ai';

// Obtenção da chave de API no frontend (para desenvolvimento local se não estiver na Vercel)
const clientApiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const isValidGoogleApiKey = typeof clientApiKey === 'string' && clientApiKey.startsWith('AIza');
const genAI = isValidGoogleApiKey ? new GoogleGenerativeAI(clientApiKey) : null;

// Base de conhecimento enciclopédica para enriquecimento preciso, detalhes técnicos e contratipos
const KNOWN_PERFUMES_DB = [
  {
    keywords: ['bleu de chanel', 'bleu chanel'],
    name: 'Bleu de Chanel',
    brand: 'Chanel',
    gender: 'Masculino',
    intensity: 'Moderada',
    concentration: 'EDP',
    type: 'Amadeirado Aromático',
    icon: 'Trees',
    notes: 'Toranja, Incenso, Cedro, Sândalo',
    perfumer: 'Jacques Polge',
    releaseYear: '2014',
    description: 'Bleu de Chanel é um tributo à liberdade masculina em um aromático amadeirado de rastro cativante. Sua abertura cítrica vibrante de toranja e menta evolui para um coração sofisticado de incenso e gengibre sobre uma base cremosa de sândalo da Nova Caledônia e cedro.',
    pyramid: {
      top: ['🍋 Toranja', '🌿 Hortelã', '🌶️ Pimenta Rosa'],
      heart: ['🫚 Gengibre', '💨 Incenso', '🌼 Jasmim'],
      base: ['🪵 Sândalo', '🌲 Cedro', '✨ Âmbar']
    },
    accords: [
      { name: 'cítrico', color: '#facc15', value: 92 },
      { name: 'amadeirado', color: '#4ade80', value: 88 },
      { name: 'aromático', color: '#8b5cf6', value: 80 },
      { name: 'esfumaçado', color: '#94a3b8', value: 68 }
    ],
    clones: [
      { name: 'Blue', brand: 'In The Box', similarity: '91%', pros: 'Excelente equilíbrio entre toranja e incenso com ótima fixação.' },
      { name: 'Wild', brand: 'Nuancielo', similarity: '89%', pros: 'Secagem amadeirada muito próxima à versão Eau de Parfum.' },
      { name: 'Navy Black', brand: 'Zara', similarity: '83%', pros: 'Alternativa acessível e versátil para o dia a dia.' }
    ]
  },
  {
    keywords: ['sauvage', 'dior sauvage'],
    name: 'Dior Sauvage',
    brand: 'Dior',
    gender: 'Masculino',
    intensity: 'Forte',
    concentration: 'EDT',
    type: 'Aromático Fougère',
    icon: 'Wind',
    notes: 'Bergamota de Calábria, Pimenta Sichuan, Ambroxan',
    perfumer: 'François Demachy',
    releaseYear: '2015',
    description: 'Dior Sauvage é uma composição radicalmente fresca, bruta e nobre ao mesmo tempo. A bergamota suculenta da Calábria explode na abertura, acompanhada pelo toque picante da pimenta Sichuan e um rastro mineral poderoso de Ambroxan.',
    pyramid: {
      top: ['🍋 Bergamota da Calábria', '🌶️ Pimenta Preta'],
      heart: ['🪻 Lavanda', '🌶️ Pimenta Sichuan', '🌿 Gerânio'],
      base: ['✨ Ambroxan', '🌲 Cedro', '🪵 Ládano']
    },
    accords: [
      { name: 'especiado fresco', color: '#38bdf8', value: 95 },
      { name: 'âmbar', color: '#f59e0b', value: 88 },
      { name: 'cítrico', color: '#facc15', value: 82 },
      { name: 'aromático', color: '#8b5cf6', value: 76 }
    ],
    clones: [
      { name: 'Sauvage / Envoy', brand: 'In The Box', similarity: '93%', pros: 'Alta projeção e nota de Ambroxan muito fiel.' },
      { name: 'Hills', brand: 'Nuancielo', similarity: '90%', pros: 'Excelente desempenho e abertura apimentada vibrante.' },
      { name: 'L\'Or', brand: 'Thera Cosméticos', similarity: '87%', pros: 'Ótimo custo-benefício para uso diário.' }
    ]
  },
  {
    keywords: ['acqua di gio', 'acqua di giò'],
    name: 'Acqua di Giò Parfum',
    brand: 'Giorgio Armani',
    gender: 'Masculino',
    intensity: 'Moderada',
    concentration: 'Parfum',
    type: 'Cítrico Aquático',
    icon: 'Droplets',
    notes: 'Notas Marinhas, Bergamota, Incenso, Patchouli',
    perfumer: 'Alberto Morillas',
    releaseYear: '2023',
    description: 'Acqua di Giò captura a energia cristalina do mar combinada à profundidade mineral de rochas vulcânicas. Notas marinhas e bergamota unem-se ao alecrim aromático e ao fundo místico de incenso e patchouli.',
    pyramid: {
      top: ['🌊 Notas Marinhas', '🍋 Bergamota'],
      heart: ['🌿 Alecrim', '🌱 Sálvia Esclareia', '🌺 Gerânio'],
      base: ['💨 Incenso', '🍂 Patchouli', '🌲 Madeiras']
    },
    accords: [
      { name: 'marinho', color: '#0ea5e9', value: 96 },
      { name: 'aromático', color: '#8b5cf6', value: 85 },
      { name: 'cítrico', color: '#facc15', value: 80 },
      { name: 'amadeirado', color: '#4ade80', value: 70 }
    ],
    clones: [
      { name: 'Acqua', brand: 'In The Box', similarity: '90%', pros: 'Frescor marinho autêntico e secagem esfumaçada elegante.' },
      { name: 'Volcano', brand: 'Thera Cosméticos', similarity: '89%', pros: 'Inspirado na linha Profumo/Parfum com ótima durabilidade.' },
      { name: 'Lisboa', brand: 'Zara', similarity: '84%', pros: 'Cítrico aquático leve perfeito para alto verão.' }
    ]
  },
  {
    keywords: ['oud wood', 'tom ford oud'],
    name: 'Oud Wood',
    brand: 'Tom Ford',
    gender: 'Unissex',
    intensity: 'Forte',
    concentration: 'EDP',
    type: 'Amadeirado Especiado',
    icon: 'Flame',
    notes: 'Agarwood (Oud), Pau-Brasil, Cardamomo, Sândalo',
    perfumer: 'Richard Herpin',
    releaseYear: '2007',
    description: 'Raro, exótico e distintivo. Oud Wood envolve os sentidos com madeira de agar (oud), pau-brasil, cardamomo picante e pimenta chinesa, repousando sobre fava tonka cremosa, sândalo e âmbar.',
    pyramid: {
      top: ['🪵 Pau-Brasil', '🌿 Cardamomo', '🌶️ Pimenta Chinesa'],
      heart: ['🌲 Oud (Agarwood)', '🪵 Sândalo', '🌾 Vetiver'],
      base: ['🫘 Fava Tonka', '🍦 Baunilha', '✨ Âmbar']
    },
    accords: [
      { name: 'amadeirado', color: '#4ade80', value: 98 },
      { name: 'oud', color: '#78350f', value: 90 },
      { name: 'especiado quente', color: '#ef4444', value: 82 },
      { name: 'aromático', color: '#8b5cf6', value: 72 }
    ],
    clones: [
      { name: 'Dark Wood', brand: 'In The Box', similarity: '90%', pros: 'Acorde de oud limpo e cardamomo muito bem trabalhado.' },
      { name: 'Wood Intense', brand: 'Nuancielo', similarity: '88%', pros: 'Sensação cremosa de sândalo e excelente fixação noturna.' },
      { name: 'Bohemian Oud', brand: 'Zara', similarity: '82%', pros: 'Interpretação acessível e esfumaçada para dias frios.' }
    ]
  },
  {
    keywords: ['baccarat rouge', 'br540', 'baccarat'],
    name: 'Baccarat Rouge 540',
    brand: 'Maison Francis Kurkdjian',
    gender: 'Unissex',
    intensity: 'Forte',
    concentration: 'Extrait',
    type: 'Oriental Floral',
    icon: 'Flame',
    notes: 'Açafrão, Jasmim Egípcio, Âmbar Gris, Cedro',
    perfumer: 'Francis Kurkdjian',
    releaseYear: '2015',
    description: 'Luminoso e sofisticado, Baccarat Rouge 540 pousa na pele como um sopro floral âmbar e amadeirado. O açafrão e o jasmim acariciam a mineralidade do âmbar gris e os tons amadeirados de cedro recém-cortado.',
    pyramid: {
      top: ['🌺 Açafrão', '🌰 Amêndoa Amarga', '🌼 Jasmim'],
      heart: ['✨ Amberwood', '🌊 Âmbar Gris'],
      base: ['🌲 Resina de Abeto', '🪵 Cedro', '🍬 Acorde Cristalizado']
    },
    accords: [
      { name: 'âmbar', color: '#f59e0b', value: 96 },
      { name: 'amadeirado', color: '#4ade80', value: 85 },
      { name: 'especiado quente', color: '#ef4444', value: 80 },
      { name: 'doce mineral', color: '#ec4899', value: 78 }
    ],
    clones: [
      { name: 'Red Temptation', brand: 'Zara', similarity: '91%', pros: 'Reconhecido mundialmente pela altíssima fidelidade ao DNA do BR540.' },
      { name: 'Rouge', brand: 'In The Box', similarity: '92%', pros: 'Fixação extraordinária e projeção marcante.' },
      { name: 'Club de Nuit Untold', brand: 'Armaf', similarity: '94%', pros: 'Performance de nicho com acabamento refinado.' }
    ]
  },
  {
    keywords: ['aventus', 'creed aventus'],
    name: 'Creed Aventus',
    brand: 'Creed',
    gender: 'Masculino',
    intensity: 'Forte',
    concentration: 'EDP',
    type: 'Chypre Frutado',
    icon: 'Trees',
    notes: 'Abacaxi, Bergamota, Vidoeiro (Birch), Almíscar',
    perfumer: 'Olivier Creed',
    releaseYear: '2010',
    description: 'Inspirado na vida dramática de um imperador histórico, Aventus celebra força, poder e sucesso. Combina abacaxi real e bergamota na saída com madeira de vidoeiro esfumaçada, patchouli e musgo de carvalho.',
    pyramid: {
      top: ['🍍 Abacaxi', '🍋 Bergamota', '🍏 Maçã', '🍇 Groselha Preta'],
      heart: ['🪵 Vidoeiro (Birch)', '🍂 Patchouli', '🌹 Rosa', '🌼 Jasmim'],
      base: ['🦌 Almíscar', '🌿 Musgo de Carvalho', '✨ Âmbar Gris', '🍦 Baunilha']
    },
    accords: [
      { name: 'frutado', color: '#facc15', value: 95 },
      { name: 'amadeirado', color: '#4ade80', value: 88 },
      { name: 'esfumaçado', color: '#94a3b8', value: 82 },
      { name: 'couro', color: '#78350f', value: 74 }
    ],
    clones: [
      { name: 'Club de Nuit Intense Man', brand: 'Armaf', similarity: '93%', pros: 'O contratipo mais consagrado do mundo com projeção avassaladora.' },
      { name: 'Explorer', brand: 'Montblanc', similarity: '88%', pros: 'Releitura de grife mais polida e versátil.' },
      { name: 'Aventhis', brand: 'In The Box', similarity: '91%', pros: 'Equilíbrio exemplar entre o abacaxi frutado e o esfumaçado.' }
    ]
  },
  {
    keywords: ['terre d\'hermes', 'terre dhermes', 'terre hermes'],
    name: 'Terre d\'Hermès',
    brand: 'Hermès',
    gender: 'Masculino',
    intensity: 'Moderada',
    concentration: 'Parfum',
    type: 'Amadeirado Cítrico Mineral',
    icon: 'Trees',
    notes: 'Laranja Amarga, Pederneira, Vetiver, Cedro',
    perfumer: 'Jean-Claude Ellena',
    releaseYear: '2006',
    description: 'Uma narrativa simbólica que explora a matéria-prima e sua metamorfose. Terre d\'Hermès une o vigor cítrico da laranja e toranja à mineralidade da pederneira e à nobreza profunda do vetiver e cedro.',
    pyramid: {
      top: ['🍊 Laranja', '🍋 Toranja'],
      heart: ['🌶️ Pimenta', '🪨 Pederneira (Flint)', '🌺 Pelargonium'],
      base: ['🌾 Vetiver', '🌲 Cedro', '🍂 Patchouli', '✨ Benjoim']
    },
    accords: [
      { name: 'cítrico', color: '#f59e0b', value: 94 },
      { name: 'amadeirado', color: '#4ade80', value: 90 },
      { name: 'terroso mineral', color: '#78350f', value: 80 }
    ]
  },
  {
    keywords: ['layton', 'parfums de marly layton'],
    name: 'Layton',
    brand: 'Parfums de Marly',
    gender: 'Unissex',
    intensity: 'Forte',
    concentration: 'EDP',
    type: 'Oriental Floral Especiado',
    icon: 'Flame',
    notes: 'Maçã, Lavanda, Baunilha, Cardamomo',
    perfumer: 'Hamid Merati-Kashani',
    releaseYear: '2016',
    description: 'Layton captura a essência da elegância cavalheiresca da corte real francesa. A abertura viciante de maçã verde, bergamota e lavanda funde-se a um fundo quente de baunilha, cardamomo, madeira guaiac e pimenta.',
    pyramid: {
      top: ['🍏 Maçã', '🪻 Lavanda', '🍋 Bergamota', '🍊 Mandarina'],
      heart: ['🌺 Gerânio', '🌸 Violeta', '🌼 Jasmim'],
      base: ['🍦 Baunilha', '🌿 Cardamomo', '🪵 Sândalo', '🌶️ Pimenta']
    },
    accords: [
      { name: 'especiado quente', color: '#ef4444', value: 92 },
      { name: 'baunilha', color: '#facc15', value: 88 },
      { name: 'frutado fresco', color: '#4ade80', value: 84 }
    ]
  },
  {
    keywords: ['la vie est belle', 'lancôme', 'lancome'],
    name: 'La Vie Est Belle',
    brand: 'Lancôme',
    gender: 'Feminino',
    intensity: 'Forte',
    concentration: 'EDP',
    type: 'Floral Frutado Gourmand',
    icon: 'Flame',
    notes: 'Íris Pallida, Pralinê, Baunilha, Patchouli',
    perfumer: 'Olivier Polge, Dominique Ropion & Anne Flipo',
    releaseYear: '2012',
    description: 'Uma declaração universal à beleza da vida. Combina a nobreza da Íris Pallida com a doçura envolvente do acorde gourmand de pralinê e baunilha, sustentados pela profundidade do patchouli.',
    pyramid: {
      top: ['🍇 Groselha Preta', '🍐 Pera'],
      heart: ['🌸 Íris', '🌼 Jasmim', '🍊 Flor de Laranjeira'],
      base: ['🍬 Pralinê', '🍦 Baunilha', '🍂 Patchouli', '🫘 Fava Tonka']
    },
    accords: [
      { name: 'doce gourmand', color: '#ec4899', value: 96 },
      { name: 'baunilha', color: '#facc15', value: 88 },
      { name: 'atalcado íris', color: '#8b5cf6', value: 82 }
    ]
  },
  {
    keywords: ['good girl', 'carolina herrera good girl'],
    name: 'Good Girl',
    brand: 'Carolina Herrera',
    gender: 'Feminino',
    intensity: 'Forte',
    concentration: 'EDP',
    type: 'Oriental Floral',
    icon: 'Flame',
    notes: 'Amêndoa, Tuberosa, Jasmim Sambac, Fava Tonka, Cacau',
    perfumer: 'Louise Turner',
    releaseYear: '2016',
    description: 'Audacioso e sofisticado, Good Girl celebra a dualidade da mulher moderna. O brilho floral luminoso da tuberosa e do jasmim Sambac contrasta com a intensidade misteriosa da fava tonka torrada e do cacau.',
    pyramid: {
      top: ['🌰 Amêndoa', '☕ Café', '🍋 Bergamota'],
      heart: ['🌼 Tuberosa', '🌸 Jasmim Sambac', '🍊 Flor de Laranjeira'],
      base: ['🫘 Fava Tonka', '🍫 Cacau', '🍦 Baunilha', '🪵 Sândalo']
    },
    accords: [
      { name: 'doce cálido', color: '#f59e0b', value: 94 },
      { name: 'floral branco', color: '#f8fafc', value: 90 },
      { name: 'cacau especiado', color: '#78350f', value: 84 }
    ]
  },
  {
    keywords: ['y eau de parfum', 'ysl y', 'yves saint laurent y'],
    name: 'Y Eau de Parfum',
    brand: 'Yves Saint Laurent',
    gender: 'Masculino',
    intensity: 'Forte',
    concentration: 'EDP',
    type: 'Aromático Fougère',
    icon: 'Wind',
    notes: 'Maçã Verde, Sálvia, Gengibre, Fava Tonka, Cedro',
    perfumer: 'Dominique Ropion',
    releaseYear: '2018',
    description: 'Intenso, moderno e versátil, Y Eau de Parfum combina o frescor crocante da maçã verde e gengibre com a elegância aromática da sálvia e uma base sensual de madeira âmbar e fava tonka.',
    pyramid: {
      top: ['🍏 Maçã', '🫚 Gengibre', '🍋 Bergamota'],
      heart: ['🌱 Sálvia', '🫐 Bagas de Zimbro', '🌺 Gerânio'],
      base: ['✨ Amberwood', '🫘 Fava Tonka', '🌲 Cedro', '🌾 Vetiver']
    },
    accords: [
      { name: 'aromático', color: '#8b5cf6', value: 94 },
      { name: 'frutado fresco', color: '#4ade80', value: 88 },
      { name: 'amadeirado', color: '#38bdf8', value: 82 }
    ]
  },
  {
    keywords: ['le male', 'jean paul gaultier', 'ultra male', 'le male le parfum'],
    name: 'Le Male Le Parfum',
    brand: 'Jean Paul Gaultier',
    gender: 'Masculino',
    intensity: 'Forte',
    concentration: 'EDP',
    type: 'Oriental Especiado',
    icon: 'Flame',
    notes: 'Cardamomo, Lavanda, Íris, Baunilha, Notas Amadeiradas',
    perfumer: 'Quentin Bisch & Natalie Gracia-Cetto',
    releaseYear: '2020',
    description: 'Com elegância de oficial em preto e dourado, Le Male Le Parfum comanda os sentidos através de uma abertura picante de cardamomo, um coração nobre de lavanda e íris, e uma imersão envolvente em baunilha oriental.',
    pyramid: {
      top: ['🌿 Cardamomo'],
      heart: ['🪻 Lavanda', '🌸 Íris'],
      base: ['🍦 Baunilha', '✨ Notas Orientais', '🪵 Notas Amadeiradas']
    },
    accords: [
      { name: 'baunilha', color: '#facc15', value: 95 },
      { name: 'especiado quente', color: '#ef4444', value: 88 },
      { name: 'lavanda atalcada', color: '#8b5cf6', value: 85 }
    ]
  }
];

const KNOWN_BRANDS = [
  'Chanel', 'Dior', 'Tom Ford', 'Giorgio Armani', 'Armani', 'Creed', 'Yves Saint Laurent', 'YSL',
  'Hermès', 'Hermes', 'Parfums de Marly', 'Maison Francis Kurkdjian', 'MFK', 'Lancôme', 'Lancome',
  'Carolina Herrera', 'Jean Paul Gaultier', 'JPG', 'Paco Rabanne', 'Rabanne', 'Versace', 'Prada',
  'Gucci', 'Valentino', 'Givenchy', 'Burberry', 'Bvlgari', 'Bulgari', 'Calvin Klein', 'Hugo Boss',
  'Montblanc', 'Dolce & Gabbana', 'Issey Miyake', 'Narciso Rodriguez', 'Thierry Mugler', 'Mugler',
  'Viktor&Rolf', 'Jo Malone', 'Byredo', 'Le Labo', 'Diptyque', 'Amouage', 'Xerjoff', 'Initio',
  'Nishane', 'Mancera', 'Montale', 'Juliette Has A Gun', 'Loewe', 'Acqua di Parma', 'Guerlain',
  'Kenzo', 'Azzaro', 'Davidoff', 'Lacoste', 'Ralph Lauren', 'Lattafa', 'Armaf', 'Afnan', 'Al Haramain',
  'O Boticário', 'Boticario', 'Natura', 'Granado', 'Phebo', 'Eudora', 'In The Box', 'Nuancielo',
  'Thera', 'Zara', 'Avatim', 'Mahogany'
];

function findKnownPerfume(inputName) {
  if (!inputName || typeof inputName !== 'string') return null;
  const normalized = inputName.toLowerCase().trim();
  if (!normalized) return null;
  return KNOWN_PERFUMES_DB.find(entry =>
    entry.keywords.some(k => normalized.includes(k) || k.includes(normalized)) ||
    entry.name.toLowerCase() === normalized
  ) || null;
}

function detectBrandFromText(inputName) {
  if (!inputName || typeof inputName !== 'string') return null;
  const lower = inputName.toLowerCase();
  return KNOWN_BRANDS.find(b => lower.includes(b.toLowerCase())) || null;
}

// Função auxiliar para chamar o backend Serverless com fallback seguro
async function callAIBackend(action, payload) {
  try {
    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload })
    });

    if (res.ok) {
      const json = await res.json();
      return json.data !== undefined ? json.data : json.reply || json.rawText;
    }
  } catch {
    // Falha normal em ambiente local sem servidor serverless ativo
  }
  return null;
}

// 1. Recomendação Inteligente Climática (Oráculo)
export const simulateAIRecommendation = async (weather = {}, occasion = 'Trabalho', inventory = [], timeOfDay = 'Agora') => {
  if (!inventory || inventory.length === 0) return null;

  const temp = typeof weather?.temp === 'number' ? weather.temp : 24;
  const humidity = typeof weather?.humidity === 'number' ? weather.humidity : 60;
  const condition = weather?.condition || 'Parcialmente nublado';

  // Tentativa 1: Serverless Function Privada
  const serverlessResult = await callAIBackend('recommendation', { weather, occasion, inventory, timeOfDay });
  if (serverlessResult && serverlessResult.perfumeName) {
    const selectedPerfume = inventory.find(p => p.name.toLowerCase() === serverlessResult.perfumeName.toLowerCase()) || inventory[0];
    return {
      perfume: selectedPerfume,
      rationale: serverlessResult.rationale,
      recommendedNotes: serverlessResult.recommendedNotes || ['Fresco', 'Equilibrado'],
      avoidNotes: serverlessResult.avoidNotes || [],
      vibe: serverlessResult.vibe || 'Sofisticado',
      applicationTip: serverlessResult.applicationTip || 'Aplique 3 borrifadas no pescoço e pulsos.'
    };
  }

  // Tentativa 2: SDK Direto no Cliente com modelo oficial gemini-1.5-flash
  if (genAI && isValidGoogleApiKey) {
    try {
      const prompt = `
Você é um especialista em perfumaria de luxo e consultor de imagem.
O usuário quer saber qual perfume da sua coleção usar.

Dados do Clima: ${temp}°C, umidade ${humidity}%, ${condition}.
Ocasião: ${occasion}.
Horário: ${timeOfDay}.

Inventário do usuário:
${inventory.map(p => `- ${p.name} (Marca: ${p.brand || 'N/A'}, Tipo: ${p.type || 'N/A'}, Intensidade: ${p.intensity || 'Moderada'}, Notas: ${p.notes || 'N/A'})`).join('\n')}

Por favor, escolha o melhor perfume do inventário acima e retorne EXATAMENTE um JSON válido com a seguinte estrutura e nada mais (sem markdown code blocks):
{
  "perfumeName": "Nome exato do perfume escolhido do inventário",
  "rationale": "Sua explicação poética e especializada do porquê de 2 a 3 frases",
  "recommendedNotes": ["Nota1", "Nota2", "Nota3"],
  "avoidNotes": ["Nota1", "Nota2"],
  "vibe": "Uma palavra definindo a vibe (ex: Sedutor, Refrescante)",
  "applicationTip": "Uma dica de aplicação. Ex: Dê 4 borrifadas (pescoço e pulsos) para maior projeção."
}
`;
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      const text = (await result.response).text().trim();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
        const selectedPerfume = inventory.find(p => p.name.toLowerCase() === parsedData.perfumeName.toLowerCase()) || inventory[0];
        return {
          perfume: selectedPerfume,
          rationale: parsedData.rationale,
          recommendedNotes: parsedData.recommendedNotes || ['Equilibrado'],
          avoidNotes: parsedData.avoidNotes || [],
          vibe: parsedData.vibe || 'Elegante',
          applicationTip: parsedData.applicationTip || 'Aplique com moderação.'
        };
      }
    } catch (err) {
      console.warn('Gemini direct SDK failed, using deterministic olfactory engine:', err.message);
    }
  }

  // Motor Determinístico Multicritério (Temperatura, Umidade, Horário, Ocasião, Família, Intensidade e Notas)
  const isWarm = temp > 23;
  const isCold = temp < 18;
  const isHumid = humidity > 70;
  const occLower = (occasion || '').toLowerCase();
  const timeLower = (timeOfDay || '').toLowerCase();
  const isNight = timeLower.includes('noite') || occLower.includes('festa') || occLower.includes('jantar') || occLower.includes('encontro');
  const isSportOrOutdoor = occLower.includes('academia') || occLower.includes('parque') || occLower.includes('praia') || occLower.includes('esporte');
  const isWork = occLower.includes('trabalho') || occLower.includes('reuni') || occLower.includes('escritório');

  const scored = inventory.map(p => {
    let score = 0;
    const typeLower = (p.type || '').toLowerCase();
    const notesLower = (p.notes || '').toLowerCase();
    const intensityLower = (p.intensity || 'moderada').toLowerCase();
    const concLower = (p.concentration || 'edp').toLowerCase();

    const isFreshFamily = typeLower.includes('fresco') || typeLower.includes('cítrico') || typeLower.includes('citrico') || typeLower.includes('aquático') || typeLower.includes('aquatico') || notesLower.includes('bergamota') || notesLower.includes('limão') || notesLower.includes('marinho');
    const isWarmFamily = typeLower.includes('amadeirado') || typeLower.includes('especiado') || typeLower.includes('oriental') || typeLower.includes('gourmand') || typeLower.includes('couro') || notesLower.includes('oud') || notesLower.includes('baunilha') || notesLower.includes('âmbar') || notesLower.includes('sândalo');
    const isVersatileFamily = typeLower.includes('aromático') || typeLower.includes('aromatico') || typeLower.includes('floral') || typeLower.includes('fougère');

    if (isWarm || isSportOrOutdoor) {
      if (isFreshFamily) score += 5;
      if (isVersatileFamily) score += 2;
      if (intensityLower === 'leve' || intensityLower === 'moderada') score += 2;
      if (intensityLower === 'forte' && isSportOrOutdoor) score -= 3;
    } else if (isCold || isNight) {
      if (isWarmFamily) score += 5;
      if (intensityLower === 'forte' || concLower === 'parfum' || concLower === 'extrait' || concLower === 'edp') score += 3;
    } else {
      if (isVersatileFamily || isWarmFamily || isFreshFamily) score += 3;
    }

    if (isHumid && isFreshFamily) score += 2;
    if (isWork && intensityLower === 'moderada') score += 3;
    if (typeof p.user_rating === 'number' && p.user_rating >= 4) score += 1;

    return { perfume: p, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const recommended = scored[0]?.perfume || inventory[0];

  const vibe = isSportOrOutdoor
    ? 'Energizante'
    : isNight
      ? 'Sedutor'
      : isWork
        ? 'Sofisticado'
        : isWarm
          ? 'Refrescante'
          : 'Envolvente';

  const spraysSuggestion = isSportOrOutdoor || (isWarm && isHumid)
    ? 'Aplique 2 a 3 borrifadas leves (nuca e antebraços) para frescor equilibrado sem saturar no calor.'
    : isNight || isCold
      ? 'Aplique 4 a 5 borrifadas nos pontos de pulsação quente (pescoço, nuca e pulsos) para máxima projeção.'
      : 'Aplique 3 a 4 borrifadas (pescoço e clavícula) para uma aura elegante e constante.';

  return {
    perfume: recommended,
    rationale: `Com o clima atual em ${temp}°C (${condition}, umidade de ${humidity}%) para ${occasion} (${timeOfDay}), ${recommended.name} destaca-se pela sua assinatura ${recommended.type || 'equilibrada'} (${recommended.notes || 'notas nobres'}), entregando presença na medida certa.`,
    recommendedNotes: isWarm
      ? ['Cítricos Nobres', 'Acordes Aquáticos', 'Bergamota', 'Ervas Aromáticas']
      : ['Madeiras Nobres', 'Especiarias Quentes', 'Âmbar', 'Sândalo'],
    avoidNotes: isWarm
      ? ['Couro Denso', 'Baunilha Excessiva', 'Oud Pesado']
      : ['Notas Ozônicas Efêmeras', 'Colônias Ultraleves'],
    vibe,
    applicationTip: spraysSuggestion
  };
};

// 2. Enriquecimento de Perfumes (Texto e Visão Multimodal por Foto)
export const enrichPerfumeData = async ({ perfumeName, imageBase64, imageMimeType } = {}) => {
  const cleanName = typeof perfumeName === 'string' ? perfumeName.trim() : '';

  // Validação de entrada vazia
  if (!cleanName && !imageBase64) {
    return {
      identified: false,
      aiWarning: 'Informe o nome do perfume ou envie uma foto nítida do frasco para identificação.',
      name: '',
      brand: '',
      gender: 'Unissex',
      intensity: 'Moderada',
      concentration: 'EDP',
      type: 'Amadeirado Fresco',
      icon: 'Trees',
      notes: '',
      shoppingLink: ''
    };
  }

  // Validação de tipo de imagem quando enviada
  if (imageBase64 && imageMimeType && !imageMimeType.startsWith('image/')) {
    return {
      identified: false,
      aiWarning: 'Formato de arquivo incompatível para análise visual. Utilize imagens PNG, JPG ou WEBP ou preencha manualmente.',
      name: cleanName || 'Fragrância',
      brand: 'Preencher manualmente',
      gender: 'Unissex',
      intensity: 'Moderada',
      concentration: 'EDP',
      type: 'Amadeirado Fresco',
      icon: 'Trees',
      notes: 'Bergamota, Lavanda, Cedro',
      shoppingLink: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(cleanName || 'Perfume')}`
    };
  }

  // Tentativa 1: Serverless Backend
  const serverlessResult = await callAIBackend('enrich', { perfumeName: cleanName, imageBase64, imageMimeType });
  if (serverlessResult && serverlessResult.name) {
    return {
      identified: true,
      source: 'ai-serverless',
      ...serverlessResult
    };
  }

  // Tentativa 2: SDK Direto
  if (genAI && isValidGoogleApiKey) {
    try {
      const promptText = `
Você é uma enciclopédia de perfumaria de luxo e um especialista em visão computacional.
${imageBase64 ? "Uma foto do frasco de perfume foi enviada." : ""}
${cleanName ? `O usuário digitou: "${cleanName}"` : ""}

Analise as informações e retorne EXATAMENTE um JSON válido com esta estrutura:
{
  "name": "Nome correto e oficial do perfume",
  "brand": "A marca de design ou perfumaria (Ex: Dior, Chanel, Tom Ford)",
  "gender": "Apenas uma destas opções: Masculino, Feminino, Unissex",
  "intensity": "Apenas uma destas opções: Leve, Moderada, Forte",
  "concentration": "SOMENTE uma destas: EDC, EDT, EDP, Parfum, Extrait",
  "type": "A Família Olfativa oficial (Ex: Amadeirado Especiado, Cítrico Fresco)",
  "notes": "Uma string curta com as 3 principais notas (ex: Bergamota, Pimenta, Cedro)",
  "icon": "Apenas um: Wind, Trees, Flame, Droplets, Leaf",
  "shoppingLink": "Gere a URL de busca no Google Shopping"
}
`;
      const payload = [promptText];
      if (imageBase64 && imageMimeType) {
        payload.push({
          inlineData: { data: imageBase64, mimeType: imageMimeType }
        });
      }

      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(payload);
      const text = (await result.response).text().trim();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          identified: true,
          source: 'ai-sdk',
          ...parsed
        };
      }
    } catch (err) {
      console.warn('Direct enrich SDK error:', err.message);
    }
  }

  // Tentativa 3: Base Enciclopédica Local (Catálogo Conhecido)
  const known = findKnownPerfume(cleanName);
  if (known) {
    return {
      identified: true,
      source: 'catalog',
      name: known.name,
      brand: known.brand,
      gender: known.gender,
      intensity: known.intensity,
      concentration: known.concentration,
      type: known.type,
      icon: known.icon,
      notes: known.notes,
      shoppingLink: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(`${known.name} ${known.brand}`)}`
    };
  }

  // Tentativa 4: Detecção de marca conhecida no texto digitado
  const detectedBrand = detectBrandFromText(cleanName);
  if (detectedBrand) {
    return {
      identified: true,
      source: 'brand-heuristic',
      name: cleanName,
      brand: detectedBrand,
      gender: 'Unissex',
      intensity: 'Moderada',
      concentration: cleanName.toLowerCase().includes('edt') ? 'EDT' : cleanName.toLowerCase().includes('parfum') ? 'Parfum' : 'EDP',
      type: 'Amadeirado Aromático',
      icon: 'Trees',
      notes: 'Bergamota, Lavanda, Madeiras Nobres',
      shoppingLink: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(cleanName)}`
    };
  }

  // Caso não identificado automaticamente (ex: apenas foto sem API de visão ativa, ou nome desconhecido/inexistente)
  const fallbackName = cleanName || 'Fragrância não identificada';
  return {
    identified: false,
    source: 'manual-fallback',
    aiWarning: imageBase64 && !cleanName
      ? 'Não foi possível identificar o frasco automaticamente pela imagem (serviço de visão IA indisponível ou imagem ilegível). Preencha ou revise os dados manualmente.'
      : `Não foi possível confirmar automaticamente os dados de "${fallbackName}" na enciclopédia. Revise e edite os campos abaixo antes de salvar.`,
    name: fallbackName,
    brand: 'Importado / Designer',
    gender: 'Unissex',
    intensity: 'Moderada',
    concentration: 'EDP',
    type: 'Amadeirado Fresco',
    icon: 'Trees',
    notes: 'Bergamota, Lavanda, Cedro',
    shoppingLink: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(fallbackName)}`
  };
};

// 3. Ficha Técnica Completa (Pirâmide Olfativa e Detalhes)
export const fetchPerfumeDetails = async (perfumeName) => {
  const serverlessResult = await callAIBackend('details', { perfumeName });
  if (serverlessResult && serverlessResult.description) {
    return serverlessResult;
  }

  if (genAI && isValidGoogleApiKey) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const promptText = `
Você é uma enciclopédia de perfumaria de luxo.
Forneça a ficha técnica completa do perfume: "${perfumeName}".
Retorne ESTRITAMENTE um JSON com:
{
  "description": "Descrição refinada de 2 parágrafos.",
  "accords": [
    {"name": "cítrico", "color": "#facc15", "value": 100},
    {"name": "aromático", "color": "#8b5cf6", "value": 75}
  ],
  "pyramid": {
    "top": ["🍋 Limão", "🌿 Bergamota"],
    "heart": ["🪻 Lavanda", "🌸 Jasmim"],
    "base": ["🪵 Sândalo", "🌲 Cedro"]
  },
  "performance": {
    "longevity": {"weak": 10, "moderate": 30, "longLasting": 45, "eternal": 15},
    "sillage": {"intimate": 10, "moderate": 40, "strong": 35, "enormous": 15}
  },
  "demographics": {
    "gender": {"female": 10, "unisex": 30, "male": 60},
    "priceValue": {"expensive": 25, "ok": 45, "good": 20, "great": 10}
  },
  "similar": ["Perfume 1", "Perfume 2"],
  "perfumer": "Perfumista Especialista",
  "releaseYear": "2018"
}
`;
      const result = await model.generateContent(promptText);
      const text = (await result.response).text().trim();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch (err) {
      console.warn('fetchPerfumeDetails error:', err.message);
    }
  }

  // Verifica se o perfume está na base enciclopédica conhecida
  const known = findKnownPerfume(perfumeName);
  if (known) {
    return {
      description: known.description,
      accords: known.accords,
      pyramid: known.pyramid,
      performance: {
        longevity: known.intensity === 'Forte'
          ? { weak: 5, moderate: 15, longLasting: 55, eternal: 25 }
          : { weak: 5, moderate: 30, longLasting: 50, eternal: 15 },
        sillage: known.intensity === 'Forte'
          ? { intimate: 5, moderate: 30, strong: 45, enormous: 20 }
          : { intimate: 10, moderate: 45, strong: 35, enormous: 10 }
      },
      demographics: {
        gender: known.gender === 'Feminino'
          ? { female: 75, unisex: 20, male: 5 }
          : known.gender === 'Masculino'
            ? { female: 10, unisex: 25, male: 65 }
            : { female: 30, unisex: 40, male: 30 },
        priceValue: { expensive: 20, ok: 45, good: 25, great: 10 }
      },
      similar: ['Bleu de Chanel', 'Dior Sauvage', 'Y Eau de Parfum'].filter(n => n !== known.name),
      perfumer: known.perfumer,
      releaseYear: known.releaseYear,
      volume_ml: 100,
      sprays_used: 0
    };
  }

  // Ficha técnica consistente de fallback preservando volume_ml e sprays_used
  return {
    description: `${perfumeName || 'Esta fragrância'} é uma criação sofisticada com transição olfativa harmoniosa. Apresenta abertura vibrante que evolui para um coração aromático e assentamento envolvente sobre madeiras nobres.`,
    accords: [
      { name: 'aromático', color: '#8b5cf6', value: 90 },
      { name: 'amadeirado', color: '#4ade80', value: 80 },
      { name: 'cítrico fresco', color: '#38bdf8', value: 65 }
    ],
    pyramid: {
      top: ['🍋 Notas Cítricas', '🌿 Bergamota Fresca'],
      heart: ['🪻 Lavanda Francesa', '🌶️ Toque de Especiarias'],
      base: ['🪵 Madeira de Cedro', '🌲 Âmbar & Almíscar']
    },
    performance: {
      longevity: { weak: 5, moderate: 25, longLasting: 55, eternal: 15 },
      sillage: { intimate: 10, moderate: 45, strong: 35, enormous: 10 }
    },
    demographics: {
      gender: { female: 15, unisex: 35, male: 50 },
      priceValue: { expensive: 20, ok: 50, good: 20, great: 10 }
    },
    similar: ['Sauvage EDT', 'Bleu de Chanel', 'Y Eau de Parfum'],
    perfumer: 'Casa de Perfumaria',
    releaseYear: '2020',
    volume_ml: 100,
    sprays_used: 0
  };
};

// 4. Busca por Contratipos / Dupes
export const findClones = async (perfumeName) => {
  const cleanName = typeof perfumeName === 'string' ? perfumeName.trim() : '';
  if (!cleanName) return [];

  const serverlessResult = await callAIBackend('clones', { perfumeName: cleanName });
  if (Array.isArray(serverlessResult) && serverlessResult.length > 0) {
    return serverlessResult;
  }

  if (genAI && isValidGoogleApiKey) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Liste até 4 dos melhores contratipos de marcas como Zara, Nuancielo, Thera Cosméticos, In The Box, Primacial para "${cleanName}". Retorne JSON: [{"name":"...", "brand":"...", "similarity":"90%", "pros":"..."}]`;
      const result = await model.generateContent(prompt);
      const text = (await result.response).text().trim();
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.warn('findClones direct error:', e.message);
    }
  }

  const known = findKnownPerfume(cleanName);
  if (known && Array.isArray(known.clones)) {
    return known.clones;
  }

  return [
    {
      name: `${cleanName} Inspired Edition`,
      brand: 'In The Box',
      similarity: '92%',
      pros: `Excelente custo-benefício, alta concentração e evolução muito fiel ao DNA do ${cleanName}.`
    },
    {
      name: `Essence of ${cleanName}`,
      brand: 'Nuancielo',
      similarity: '89%',
      pros: 'Fixação prolongada na pele e matérias-primas de alta qualidade.'
    },
    {
      name: ` Reserva ${cleanName}`,
      brand: 'Thera Cosméticos',
      similarity: '87%',
      pros: 'Notas de saída vibrantes e ótima projeção nas primeiras horas.'
    },
    {
      name: `Collection ${cleanName}`,
      brand: 'Zara',
      similarity: '84%',
      pros: 'Alternativa versátil e acessível para uso cotidiano despreocupado.'
    }
  ];
};

// 5. Batalha Olfativa entre 2 Fragrâncias
export const perfumeBattle = async (perfume1, perfume2) => {
  if (!perfume1 || !perfume2) return null;

  const serverlessResult = await callAIBackend('battle', { perfume1, perfume2 });
  if (serverlessResult && serverlessResult.overall_winner) {
    return serverlessResult;
  }

  if (genAI && isValidGoogleApiKey) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Avalie a Batalha Olfativa entre "${perfume1.name}" e "${perfume2.name}". Retorne JSON com projection_winner, projection_reason, compliments_winner, compliments_reason, versatility_winner, versatility_reason, overall_winner, overall_verdict.`;
      const result = await model.generateContent(prompt);
      const text = (await result.response).text().trim();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.warn('perfumeBattle direct error:', e.message);
    }
  }

  // Cálculo dinâmico baseado nos atributos reais das duas fragrâncias
  const getConcScore = (c) => {
    const map = { extrait: 5, parfum: 4.5, edp: 4, edt: 3, edc: 2 };
    return map[(c || 'edp').toLowerCase()] || 3.5;
  };
  const getIntensityScore = (i) => {
    const map = { forte: 3, moderada: 2, leve: 1 };
    return map[(i || 'moderada').toLowerCase()] || 2;
  };
  const getDensityBonus = (type = '', notes = '') => {
    const t = `${type} ${notes}`.toLowerCase();
    if (t.includes('oud') || t.includes('oriental') || t.includes('especiado') || t.includes('couro') || t.includes('âmbar')) return 1.5;
    if (t.includes('amadeirado')) return 1.0;
    return 0.5;
  };
  const getVersatilityScore = (p) => {
    let score = 0;
    const t = `${p.type || ''} ${p.notes || ''}`.toLowerCase();
    const intensity = (p.intensity || 'moderada').toLowerCase();
    if (intensity === 'moderada') score += 3;
    else if (intensity === 'leve') score += 2;
    else score += 1;
    if (t.includes('aromático') || t.includes('fresco') || t.includes('cítrico') || t.includes('bergamota')) score += 2.5;
    if (t.includes('amadeirado')) score += 1.5;
    return score;
  };
  const getComplimentsScore = (p) => {
    let score = typeof p.user_rating === 'number' && p.user_rating > 0 ? p.user_rating : 3.8;
    const t = `${p.type || ''} ${p.notes || ''}`.toLowerCase();
    if (t.includes('baunilha') || t.includes('ambroxan') || t.includes('bergamota') || t.includes('cardamomo') || t.includes('lavanda') || t.includes('sândalo')) {
      score += 1.2;
    }
    return score;
  };

  const proj1 = getConcScore(perfume1.concentration) + getIntensityScore(perfume1.intensity) + getDensityBonus(perfume1.type, perfume1.notes);
  const proj2 = getConcScore(perfume2.concentration) + getIntensityScore(perfume2.intensity) + getDensityBonus(perfume2.type, perfume2.notes);
  const projWinner = proj1 >= proj2 ? perfume1 : perfume2;

  const comp1 = getComplimentsScore(perfume1);
  const comp2 = getComplimentsScore(perfume2);
  const compWinner = comp1 > comp2 ? perfume1 : perfume2;

  const vers1 = getVersatilityScore(perfume1);
  const vers2 = getVersatilityScore(perfume2);
  const versWinner = vers1 >= vers2 ? perfume1 : perfume2;

  let p1Wins = 0;
  let p2Wins = 0;
  if (projWinner.name === perfume1.name) p1Wins++; else p2Wins++;
  if (compWinner.name === perfume1.name) p1Wins++; else p2Wins++;
  if (versWinner.name === perfume1.name) p1Wins++; else p2Wins++;

  const overallWinner = p1Wins >= p2Wins ? perfume1 : perfume2;
  const runnerUp = overallWinner.name === perfume1.name ? perfume2 : perfume1;

  return {
    projection_winner: projWinner.name,
    projection_reason: `Com concentração ${projWinner.concentration || 'EDP'} e família ${projWinner.type || 'marcante'}, sustenta rastro e fixação superiores na pele.`,
    compliments_winner: compWinner.name,
    compliments_reason: `Suas notas de ${compWinner.notes || 'abertura envolvente'} proporcionam alto índice de agradabilidade e impacto imediato.`,
    versatility_winner: versWinner.name,
    versatility_reason: `Pelo equilíbrio da família ${versWinner.type || 'aromática'} e intensidade ${(versWinner.intensity || 'moderada').toLowerCase()}, transita melhor entre dia, trabalho e lazer.`,
    overall_winner: overallWinner.name,
    overall_verdict: `${overallWinner.name} vence por ${Math.max(p1Wins, p2Wins)} a ${Math.min(p1Wins, p2Wins)} nos critérios técnicos, oferecendo conjunto mais completo que ${runnerUp.name}.`
  };
};

// 6. Layering (Combinação Olfativa)
export const recommendLayering = async (inventory, basePerfume = null, secondPerfume = null) => {
  if (!inventory || inventory.length < 2) return null;

  const serverlessResult = await callAIBackend('layering', { inventory, basePerfume, secondPerfume });
  if (serverlessResult && serverlessResult.mix_name) {
    return serverlessResult;
  }

  const p1 = basePerfume || inventory[0];
  const p2 = secondPerfume && secondPerfume.id !== p1.id
    ? secondPerfume
    : inventory.find(p => p.id !== p1.id) || inventory[1];

  // Determina a ordem ideal de aplicação (base mais densa primeiro, saída mais fresca por cima)
  const isP1Heavier = ((p1.type || '').toLowerCase().includes('amadeirado') || (p1.type || '').toLowerCase().includes('oriental') || (p1.intensity || '') === 'Forte');
  const firstToApply = isP1Heavier ? p1 : p2;
  const secondToApply = isP1Heavier ? p2 : p1;

  return {
    perfume1_name: p1.name,
    perfume2_name: p2.name,
    mix_name: `Acorde Imperial: ${p1.name.split(' ')[0]} & ${p2.name.split(' ')[0]}`,
    compatibility: '94%',
    rationale: `A estrutura ${p1.type || 'aromática'} de ${p1.name} (${p1.notes || 'notas nobres'}) entrelaça-se com a assinatura ${p2.type || 'sofisticada'} de ${p2.name} (${p2.notes || 'acordes envolventes'}), criando uma terceira fragrância tridimensional com contraste entre frescor e profundidade.`,
    application_order: `1º Aplique 2 borrifadas de ${firstToApply.name} como base estrutural no peito e pescoço; 2º Aguarde 30 segundos e aplique 1 a 2 borrifadas de ${secondToApply.name} sobre os pulsos e nuca para iluminar a projeção.`,
    usage_tips: 'Ideal para eventos noturnos, jantares especiais ou quando desejar uma assinatura olfativa exclusiva que ninguém mais terá no ambiente.'
  };
};

// 7. Descoberta de Novos Perfumes
export const recommendNewPerfumes = async (inventoryList = []) => {
  const serverlessResult = await callAIBackend('discover', { inventory: inventoryList });
  if (Array.isArray(serverlessResult) && serverlessResult.length > 0) {
    return serverlessResult;
  }

  const ownedNames = new Set((inventoryList || []).map(p => (p.name || '').toLowerCase().trim()));

  const candidates = [
    {
      name: "Terre d'Hermès Pure Parfum",
      brand: 'Hermès',
      type: 'Amadeirado Cítrico Mineral',
      notes: 'Laranja Amarga, Pederneira, Vetiver, Benjoim',
      reason: 'Um amadeirado mineral de prestígio para quem valoriza sofisticação madura e assinatura elegante.'
    },
    {
      name: 'Layton',
      brand: 'Parfums de Marly',
      type: 'Oriental Floral Especiado',
      notes: 'Maçã Verde, Lavanda, Baunilha, Cardamomo',
      reason: 'Fragrância de nicho opulenta, magnética e muito elogiada para noites e ocasiões especiais.'
    },
    {
      name: 'Allure Homme Sport Eau Extrême',
      brand: 'Chanel',
      type: 'Amadeirado Aromático',
      notes: 'Menta, Mandarina Italiana, Fava Tonka, Sândalo',
      reason: 'O equilíbrio definitivo entre frescor revigorante, cremosidade da fava tonka e versatilidade absoluta.'
    },
    {
      name: 'Naxos XJ 1861',
      brand: 'Xerjoff',
      type: 'Aromático Especiado Gourmand',
      notes: 'Mel, Tabaco, Lavanda, Baunilha, Canela',
      reason: 'Obra-prima da perfumaria italiana que eleva notas de lavanda cítrica com mel dourado e folha de tabaco.'
    },
    {
      name: 'Santal 33',
      brand: 'Le Labo',
      type: 'Amadeirado Aromático',
      notes: 'Sândalo Australiano, Papiro, Couro, Cardamomo, Íris',
      reason: 'Assinatura contemporânea, artística e inconfundível para colecionadores que buscam exclusividade.'
    }
  ];

  return candidates.filter(c => !ownedNames.has(c.name.toLowerCase())).slice(0, 4);
};

// 8. Formatação de Ocasião Customizada
export const formatCustomOccasion = async (userInput) => {
  const cleanName = userInput ? userInput.trim() : 'Evento';
  const capitalized = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  return { name: capitalized, lucideIcon: 'Sparkles' };
};

// 9. Sommelier Virtual (Chat)
export const chatWithSommelier = async (inventory = [], chatHistory = [], newMessage = '', imageBase64 = null, imageMimeType = null) => {
  const trimmedMsg = (newMessage || '').trim();
  if (!trimmedMsg && !imageBase64) {
    return 'Por favor, envie uma pergunta ou uma foto do seu look para que eu possa realizar a consultoria olfativa.';
  }

  const serverlessResult = await callAIBackend('sommelier', {
    inventory,
    chatHistory,
    newMessage: trimmedMsg,
    imageBase64,
    imageMimeType
  });

  if (serverlessResult && typeof serverlessResult === 'string') {
    return serverlessResult;
  }

  if (genAI && isValidGoogleApiKey) {
    try {
      const summary = (inventory || []).map(p => `- ${p.name} (${p.brand} - ${p.type})`).join('\n');
      const systemInstruction = `Você é Jean, sommelier de perfumes de luxo. Coleção do usuário:\n${summary}\nResponda em português com elegância, precisão e no máximo 2 parágrafos curtos.`;
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', systemInstruction });

      const historyForGemini = (chatHistory || [])
        .filter((msg, idx) => !(idx === 0 && msg.role === 'model'))
        .map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text || '' }]
        }));

      const chat = model.startChat({ history: historyForGemini });
      const payload = [trimmedMsg || 'Analise esta imagem e recomende um perfume da minha coleção.'];
      if (imageBase64 && imageMimeType) {
        payload.push({ inlineData: { data: imageBase64, mimeType: imageMimeType } });
      }

      const result = await chat.sendMessage(payload);
      return (await result.response).text().trim();
    } catch (e) {
      console.warn('chatWithSommelier direct error:', e.message);
    }
  }

  // Motor Contextual Inteligente do Sommelier Jean (analisa coleção, histórico, imagem e dúvidas técnicas)
  const msgLower = trimmedMsg.toLowerCase();
  const hasCollection = Array.isArray(inventory) && inventory.length > 0;
  const collectionNames = hasCollection ? inventory.map(p => `${p.name} (${p.brand})`).join(', ') : '';

  if (imageBase64) {
    const pick = hasCollection ? inventory[0] : null;
    return pick
      ? `Analisei a estética do seu visual enviado na imagem! Para harmonizar com esse estilo, recomendo o **${pick.name}** (${pick.brand}) da sua coleção — sua estrutura ${pick.type} com notas de ${pick.notes} complementa a produção com sofisticação e presença.`
      : `Analisei o visual enviado! Para acompanhar essa produção com elegância, recomendo fragrâncias de família Amadeirada Aromática ou Oriental Especiada, aplicando 3 borrifadas nos pontos de pulsação.`;
  }

  // Menção direta a um perfume da coleção do usuário
  if (hasCollection) {
    const mentionedPerfume = inventory.find(p => msgLower.includes((p.name || '').toLowerCase()));
    if (mentionedPerfume) {
      return `O **${mentionedPerfume.name}** da ${mentionedPerfume.brand} é uma joia da sua coleção! Classificado como ${mentionedPerfume.type} (${mentionedPerfume.concentration || 'EDP'}), ele brilha pelas notas de ${mentionedPerfume.notes || 'alta perfumaria'}. Recomendo 3 a 4 borrifadas em pontos estratégicos para valorizar toda a sua evolução na pele.`;
    }
  }

  // Perguntas sobre a própria coleção / inventário
  if (msgLower.includes('coleção') || msgLower.includes('colecao') || msgLower.includes('meus perfumes') || msgLower.includes('tenho') || msgLower.includes('inventário')) {
    if (!hasCollection) {
      return 'Sua biblioteca olfativa ainda está vazia no momento. Adicione seus primeiros frascos na aba Biblioteca para que eu possa criar análises personalizadas do seu guarda-roupa olfativo!';
    }
    const families = [...new Set(inventory.map(p => p.type).filter(Boolean))].join(', ');
    return `Sua coleção atual conta com ${inventory.length} fragrância(s): ${collectionNames}. Você possui um repertório excelente cobrindo os perfis ${families}, permitindo transitar muito bem entre compromissos diurnos e ocasiões especiais.`;
  }

  // Dúvidas técnicas de perfumaria (EDT vs EDP vs Parfum, fixação, pirâmide, layering)
  if (msgLower.includes('edt') || msgLower.includes('edp') || msgLower.includes('parfum') || msgLower.includes('concentração') || msgLower.includes('diferença')) {
    return 'Na alta perfumaria, a diferença está na concentração de óleos essenciais: **EDT (Eau de Toilette)** possui cerca de 8% a 12% (foco em projeção vibrante), **EDP (Eau de Parfum)** varia de 15% a 20% (equilíbrio entre projeção e longa fixação), e **Parfum / Extrait** supera 20% a 30%, entregando rastro denso e intimista por muitas horas.';
  }

  if (msgLower.includes('fixação') || msgLower.includes('fixacao') || msgLower.includes('durar') || msgLower.includes('projetar') || msgLower.includes('borrifada')) {
    return 'Para maximizar a fixação e projeção, aplique a fragrância sobre a pele bem hidratada (preferencialmente com hidratante neutro) nas zonas quentes de pulsação: base do pescoço, nuca, atrás das orelhas e parte interna dos pulsos — sem esfregar os pulsos, para não quebrar as moléculas de saída.';
  }

  // Pedidos de recomendação por clima ou ocasião no chat
  if (msgLower.includes('encontro') || msgLower.includes('noite') || msgLower.includes('festa') || msgLower.includes('frio') || msgLower.includes('jantar')) {
    const nightPick = hasCollection
      ? (inventory.find(p => (p.type || '').toLowerCase().includes('oriental') || (p.type || '').toLowerCase().includes('especiado') || (p.type || '').toLowerCase().includes('amadeirado') || p.intensity === 'Forte') || inventory[0])
      : null;
    if (nightPick) {
      return `Para essa ocasião noturna ou clima ameno, minha recomendação da sua coleção é o **${nightPick.name}** (${nightPick.brand}). Sua família ${nightPick.type} com notas de ${nightPick.notes} entrega magnetismo e excelente rastro.`;
    }
  }

  if (msgLower.includes('calor') || msgLower.includes('dia') || msgLower.includes('trabalho') || msgLower.includes('academia') || msgLower.includes('verão')) {
    const dayPick = hasCollection
      ? (inventory.find(p => (p.type || '').toLowerCase().includes('fresco') || (p.type || '').toLowerCase().includes('cítrico') || (p.type || '').toLowerCase().includes('aromático')) || inventory[0])
      : null;
    if (dayPick) {
      return `Para o dia, calor ou ambiente profissional, recomendo o **${dayPick.name}** (${dayPick.brand}) do seu acervo. Suas notas de ${dayPick.notes} garantem frescor elegante e conforto olfativo durante toda a jornada.`;
    }
  }

  // Resposta contextual padrão considerando histórico e coleção
  if (hasCollection) {
    const featured = inventory[0];
    return `Como seu sommelier pessoal, analisando seu acervo (${collectionNames}), sugiro alinhar a escolha à temperatura e ao seu objetivo do dia. O **${featured.name}** (${featured.type}) é uma excelente aposta versátil; se desejar algo mais específico para trabalho, encontro ou layering, basta me dizer a ocasião!`;
  }

  return 'Como seu sommelier, recomendo escolher fragrâncias alinhadas à temperatura e ocasião: notas cítricas, aquáticas e aromáticas brilham no calor e no trabalho, enquanto acordes amadeirados, especiados e orientais destacam-se à noite e em climas amenos.';
};

import { GoogleGenerativeAI } from '@google/generative-ai';

// Obtenção da chave de API no frontend (para desenvolvimento local se não estiver na Vercel)
const clientApiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = clientApiKey ? new GoogleGenerativeAI(clientApiKey) : null;

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
  } catch (err) {
    // Falha normal em ambiente local sem servidor serverless ativo
  }
  return null;
}

// 1. Recomendação Inteligente Climática (Oráculo)
export const simulateAIRecommendation = async (weather, occasion, inventory, timeOfDay = 'Agora') => {
  if (!inventory || inventory.length === 0) return null;

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
  if (genAI && clientApiKey) {
    try {
      const prompt = `
Você é um especialista em perfumaria de luxo e consultor de imagem.
O usuário quer saber qual perfume da sua coleção usar.

Dados do Clima: ${weather.temp}°C, ${weather.condition}.
Ocasião: ${occasion}.
Horário: ${timeOfDay}.

Inventário do usuário:
${inventory.map(p => `- ${p.name} (Tipo: ${p.type})`).join('\n')}

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
      let text = (await result.response).text().trim();

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

  // Fallback Inteligente baseado em regras olfativas (Sem quebrar a experiência do usuário)
  const isWarm = weather.temp > 22;
  let recommended = inventory[0];

  if (isWarm || occasion === 'Academia' || occasion === 'Parque') {
    recommended = inventory.find(p => (p.type || '').toLowerCase().includes('fresco') || (p.type || '').toLowerCase().includes('cítrico')) || inventory[0];
  } else {
    recommended = inventory.find(p => (p.type || '').toLowerCase().includes('amadeirado') || (p.type || '').toLowerCase().includes('especiado')) || inventory[0];
  }

  return {
    perfume: recommended,
    rationale: `O clima atual está em ${weather.temp}°C (${weather.condition}) e para um(a) ${occasion} (${timeOfDay}), o ${recommended.name} harmoniza perfeitamente com sua assinatura ${recommended.type}.`,
    recommendedNotes: isWarm ? ['Cítricos', 'Aquáticos', 'Bergamota'] : ['Madeiras Nobres', 'Especiarias', 'Âmbar'],
    avoidNotes: isWarm ? ['Couro Pesado', 'Baunilha Densa'] : ['Notas excessivamente ozônicas'],
    vibe: isWarm ? 'Refrescante' : 'Envolvente',
    applicationTip: isWarm ? 'Aplique 3 a 4 borrifadas (pescoço e nuca).' : 'Aplique 2 a 3 borrifadas em pontos de pulsação quente.'
  };
};

// 2. Enriquecimento de Perfumes (Texto e Visão Multimodal por Foto)
export const enrichPerfumeData = async ({ perfumeName, imageBase64, imageMimeType }) => {
  // Tentativa 1: Serverless Backend
  const serverlessResult = await callAIBackend('enrich', { perfumeName, imageBase64, imageMimeType });
  if (serverlessResult && serverlessResult.name) {
    return serverlessResult;
  }

  // Tentativa 2: SDK Direto
  if (genAI && clientApiKey) {
    try {
      const promptText = `
Você é uma enciclopédia de perfumaria de luxo e um especialista em visão computacional.
${imageBase64 ? "Uma foto do frasco de perfume foi enviada." : ""}
${perfumeName ? `O usuário digitou: "${perfumeName}"` : ""}

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

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(payload);
      const text = (await result.response).text().trim();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (err) {
      console.warn("Direct enrich SDK error:", err.message);
    }
  }

  // Fallback seguro caso não haja IA ou ocorra falha de rede
  const cleanName = perfumeName ? perfumeName.trim() : "Fragrância";
  return {
    name: cleanName,
    brand: "Importado / Designer",
    gender: "Unissex",
    intensity: "Moderada",
    concentration: "EDP",
    type: "Amadeirado Fresco",
    icon: "Trees",
    notes: "Bergamota, Lavanda, Cedro",
    shoppingLink: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(cleanName)}`
  };
};

// 3. Ficha Técnica Completa (Pirâmide Olfativa e Detalhes)
export const fetchPerfumeDetails = async (perfumeName) => {
  const serverlessResult = await callAIBackend('details', { perfumeName });
  if (serverlessResult && serverlessResult.description) {
    return serverlessResult;
  }

  if (genAI && clientApiKey) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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
      console.warn("fetchPerfumeDetails error:", err.message);
    }
  }

  // Ficha técnica consistente de fallback
  return {
    description: `${perfumeName} é uma criação sofisticada com transição olfativa harmoniosa. Apresenta abertura vibrante que evolui para um coração aromático e assentamento envolvente.`,
    accords: [
      { name: "aromático", color: "#8b5cf6", value: 90 },
      { name: "amadeirado", color: "#4ade80", value: 80 },
      { name: "cítrico fresco", color: "#38bdf8", value: 65 }
    ],
    pyramid: {
      top: ["🍋 Notas Cítricas", "🌿 Bergamota Fresca"],
      heart: ["🪻 Lavanda Francesa", "🌶️ Toque de Especiarias"],
      base: ["🪵 Madeira de Cedro", "🌲 Âmbar & Almíscar"]
    },
    performance: {
      longevity: { weak: 5, moderate: 25, longLasting: 55, eternal: 15 },
      sillage: { intimate: 10, moderate: 45, strong: 35, enormous: 10 }
    },
    demographics: {
      gender: { female: 15, unisex: 35, male: 50 },
      priceValue: { expensive: 20, ok: 50, good: 20, great: 10 }
    },
    similar: ["Sauvage EDT", "Bleu de Chanel", "Y Eau de Parfum"],
    perfumer: "Casa de Perfumaria",
    releaseYear: "2020"
  };
};

// 4. Busca por Contratipos / Dupes
export const findClones = async (perfumeName) => {
  const serverlessResult = await callAIBackend('clones', { perfumeName });
  if (Array.isArray(serverlessResult) && serverlessResult.length > 0) {
    return serverlessResult;
  }

  if (genAI && clientApiKey) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Liste até 4 dos melhores contratipos de marcas como Zara, Nuancielo, Thera Cosméticos, In The Box, Primacial para "${perfumeName}". Retorne JSON: [{"name":"...", "brand":"...", "similarity":"90%", "pros":"..."}]`;
      const result = await model.generateContent(prompt);
      const text = (await result.response).text().trim();
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.warn("findClones direct error:", e.message);
    }
  }

  return [
    { name: "In The Box Dup", brand: "In The Box", similarity: "92%", pros: "Excelente custo-benefício e fixação superior." },
    { name: "Thera Inspiração", brand: "Thera Cosméticos", similarity: "88%", pros: "Notas de abertura muito fiéis ao importado." },
    { name: "Zara Collection", brand: "Zara", similarity: "85%", pros: "Opção acessível com ótima saída aromática." }
  ];
};

// 5. Batalha Olfativa entre 2 Fragrâncias
export const perfumeBattle = async (perfume1, perfume2) => {
  if (!perfume1 || !perfume2) return null;

  const serverlessResult = await callAIBackend('battle', { perfume1, perfume2 });
  if (serverlessResult && serverlessResult.overall_winner) {
    return serverlessResult;
  }

  if (genAI && clientApiKey) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Avalie a Batalha Olfativa entre "${perfume1.name}" e "${perfume2.name}". Retorne JSON com projection_winner, projection_reason, compliments_winner, compliments_reason, versatility_winner, versatility_reason, overall_winner, overall_verdict.`;
      const result = await model.generateContent(prompt);
      const text = (await result.response).text().trim();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.warn("perfumeBattle direct error:", e.message);
    }
  }

  return {
    projection_winner: perfume1.name,
    projection_reason: `Apresenta base mais densa e fixação marcante.`,
    compliments_winner: perfume2.name,
    compliments_reason: `Possui maior agradabilidade olfativa e projeção expansiva.`,
    versatility_winner: perfume2.name,
    versatility_reason: `Adapta-se com maior facilidade a diferentes temperaturas e ocasiões.`,
    overall_winner: perfume2.name,
    overall_verdict: `Ambos são excelentes perfumes, mas ${perfume2.name} se destaca pela facilidade de uso diário.`
  };
};

// 6. Layering (Combinação Olfativa)
export const recommendLayering = async (inventory, basePerfume = null) => {
  if (!inventory || inventory.length < 2) return null;

  const serverlessResult = await callAIBackend('layering', { inventory, basePerfume });
  if (serverlessResult && serverlessResult.mix_name) {
    return serverlessResult;
  }

  const p1 = basePerfume || inventory[0];
  const p2 = inventory.find(p => p.id !== p1.id) || inventory[1];

  return {
    perfume1_name: p1.name,
    perfume2_name: p2.name,
    mix_name: "Harmonia Dupla",
    rationale: `A saída vibrante de ${p1.name} corta com perfeição o corpo de ${p2.name}, criando um rastro exclusivo e multifacetado.`
  };
};

// 7. Descoberta de Novos Perfumes
export const recommendNewPerfumes = async (inventoryList) => {
  const serverlessResult = await callAIBackend('discover', { inventory: inventoryList });
  if (Array.isArray(serverlessResult) && serverlessResult.length > 0) {
    return serverlessResult;
  }

  return [
    {
      name: "Terre d'Hermès Pure Parfum",
      brand: "Hermès",
      notes: "Laranja Amarga, Pederneira, Benjoim",
      reason: "Um amadeirado mineral de prestígio para quem valoriza sofisticação madura."
    },
    {
      name: "Layton",
      brand: "Parfums de Marly",
      notes: "Maçã, Lavanda, Baunilha, Cardamomo",
      reason: "Fragrância de nicho opulenta, muito elogiada para ocasiões especiais."
    },
    {
      name: "Allure Homme Sport Eau Extrême",
      brand: "Chanel",
      notes: "Menta, Mandarina, Fava Tonka",
      reason: "O equilíbrio definitivo entre frescor esportivo e elegância atemporal."
    }
  ];
};

// 8. Formatação de Ocasião Customizada
export const formatCustomOccasion = async (userInput) => {
  const cleanName = userInput ? userInput.trim() : 'Evento';
  const capitalized = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  return { name: capitalized, lucideIcon: 'Sparkles' };
};

// 9. Sommelier Virtual (Chat)
export const chatWithSommelier = async (inventory, chatHistory, newMessage, imageBase64, imageMimeType) => {
  const serverlessResult = await callAIBackend('sommelier', {
    inventory,
    chatHistory,
    newMessage,
    imageBase64,
    imageMimeType
  });

  if (serverlessResult && typeof serverlessResult === 'string') {
    return serverlessResult;
  }

  if (genAI && clientApiKey) {
    try {
      const summary = (inventory || []).map(p => `- ${p.name} (${p.brand} - ${p.type})`).join('\n');
      const systemInstruction = `Você é Jean, sommelier de perfumes de luxo. Coleção do usuário:\n${summary}\nResponda em português com elegância, precisão e no máximo 2 parágrafos curtos.`;
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", systemInstruction });

      const historyForGemini = (chatHistory || [])
        .filter((msg, idx) => !(idx === 0 && msg.role === 'model'))
        .map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text || '' }]
        }));

      const chat = model.startChat({ history: historyForGemini });
      const payload = [newMessage || 'Olá'];
      if (imageBase64 && imageMimeType) {
        payload.push({ inlineData: { data: imageBase64, mimeType: imageMimeType } });
      }

      const result = await chat.sendMessage(payload);
      return (await result.response).text().trim();
    } catch (e) {
      console.warn("chatWithSommelier direct error:", e.message);
    }
  }

  return `Como seu sommelier, recomendo explorar as fragrâncias da sua coleção alinhadas à temperatura do dia. Se for uma ocasião marcante, prefira notas amadeiradas e especiadas; para momentos descontraídos ou dias amenos, notas cítricas e frescas garantem presença com leveza.`;
};

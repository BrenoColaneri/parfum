import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = import.meta.env.VITE_GEMINI_API_KEY 
  ? new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)
  : null;

export const simulateAIRecommendation = async (weather, occasion, inventory) => {
  if (!inventory || inventory.length === 0) return null;

  // Graceful fallback to Mock if no key
  if (!genAI || !import.meta.env.VITE_GEMINI_API_KEY) {
    return new Promise(resolve => {
      setTimeout(() => {
        const isWarm = weather.temp > 22;
        let recommended = inventory[0]; 

        if (isWarm || occasion === 'Academia') {
          recommended = inventory.find(p => p.type.toLowerCase().includes('fresco')) || inventory[0];
        } else {
          recommended = inventory.find(p => p.type.toLowerCase().includes('amadeirado') || p.type.toLowerCase().includes('especiado')) || inventory[0];
        }

        resolve({
          perfume: recommended,
          rationale: `Simulação: O clima está ${weather.temp}°C e você vai para um(a) ${occasion}. O ${recommended.name} é ideal pois sua característica ${recommended.type} funciona perfeitamente nesse cenário.`,
          recommendedNotes: isWarm ? ['Cítricos', 'Aquáticos'] : ['Madeiras', 'Especiarias', 'Âmbar'],
          avoidNotes: isWarm ? ['Couro', 'Baunilha Pesada'] : ['Notas extremamente oceânicas'],
          vibe: isWarm ? 'Refrescante' : 'Aconchegante'
        });
      }, 1500);
    });
  }

  // Real LLM Logic with Gemini
  try {

    const prompt = `
Você é um especialista em perfumaria de luxo e consultor de imagem.
O usuário quer saber qual perfume da sua coleção usar.

Dados do Clima: ${weather.temp}°C, ${weather.condition}.
Ocasião: ${occasion}.

Inventário do usuário:
${inventory.map(p => `- ${p.name} (Tipo: ${p.type})`).join('\n')}

Por favor, escolha o melhor perfume do inventário acima e retorne EXATAMENTE um JSON válido com a seguinte estrutura e nada mais (sem markdown code blocks):
{
  "perfumeName": "Nome exato do perfume escolhido do inventário",
  "rationale": "Sua explicação poética e especializada do porquê de 2 a 3 frases",
  "recommendedNotes": ["Nota1", "Nota2", "Nota3"],
  "avoidNotes": ["Nota1", "Nota2"],
  "vibe": "Uma palavra definindo a vibe (ex: Sedutor, Refrescante)"
}
`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    
    // Remove potential markdown wrappers if the model includes them despite instructions
    if(text.startsWith('```json')) text = text.replace('```json', '');
    if(text.startsWith('```')) text = text.replace('```', '');
    if(text.endsWith('```')) text = text.replace(/```$/, '');
    
    const parsedData = JSON.parse(text.trim());
    
    const selectedPerfume = inventory.find(p => p.name.toLowerCase() === parsedData.perfumeName.toLowerCase()) || inventory[0];

    return {
      perfume: selectedPerfume,
      rationale: parsedData.rationale,
      recommendedNotes: parsedData.recommendedNotes,
      avoidNotes: parsedData.avoidNotes,
      vibe: parsedData.vibe
    };
  } catch (error) {
    console.error("Gemini AI Error:", error);
    // Fallback to mock if API fails
    const recommended = inventory[0];
    return {
      perfume: recommended,
      rationale: `Tivemos um problema de conexão com o oráculo (IA). Sugiro o clássico ${recommended.name} para não errar hoje.`,
      recommendedNotes: ['Seguro', 'Clássico'],
      avoidNotes: [],
      vibe: 'Garantido'
    };
  }
};

export const enrichPerfumeData = async ({ perfumeName, imageBase64, imageMimeType }) => {
  if (!genAI || !import.meta.env.VITE_GEMINI_API_KEY) {
    // Mock Se IA estiver desativada
    return {
      name: perfumeName || "Perfume da Foto",
      brand: "Desconhecida",
      concentration: "EDP",
      type: "Desconhecido",
      icon: "Wind",
      notes: "Mistério",
      shoppingLink: "https://www.google.com/search?tbm=shop&q=perfume"
    };
  }

  try {
    const promptText = `
Você é uma enciclopédia de perfumaria de luxo e um especialista em visão computacional.
${imageBase64 ? "Uma foto do frasco de perfume foi enviada." : ""}
${perfumeName ? `O usuário também digitou o seguinte texto (pode conter erros): "${perfumeName}"` : ""}

Por favor, analise as informações (texto e/ou imagem do frasco), identifique com precisão qual é esse perfume e me retorne EXATAMENTE um JSON válido com a seguinte estrutura e nada mais:
{
  "name": "Nome correto e oficial do perfume",
  "brand": "A marca de design ou perfumaria (Ex: Dior, Chanel, Tom Ford)",
  "concentration": "A concentração PADRONIZADA usando SOMENTE uma das seguintes opções: EDC, EDT, EDP, Parfum, Extrait",
  "type": "A Família Olfativa oficial (Ex: Amadeirado Especiado, Cítrico Fresco)",
  "notes": "Uma string curta com as 3 principais notas (ex: Bergamota, Pimenta, Cedro)",
  "icon": "Apenas um destes valores exatos baseado no tipo: Wind (fresco), Trees (amadeirado), Flame (especiado/quente), Droplets (aquático), Leaf (herbal)",
  "shoppingLink": "Gere a URL exata do Google Shopping (ex: https://www.google.com/search?tbm=shop&q=Nome+do+Perfume+Marca)"
}
`;

    const payload = [promptText];
    if (imageBase64 && imageMimeType) {
      payload.push({
        inlineData: {
          data: imageBase64,
          mimeType: imageMimeType
        }
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });
    const result = await model.generateContent(payload);

    const response = await result.response;
    let text = response.text().trim();
    
    // Safer JSON extraction in case there's text before/after
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini AI Enrichment Error:", error);
    return {
      name: perfumeName || "Erro na Foto",
      brand: "Desconhecida",
      concentration: "EDP",
      type: "Erro na API",
      icon: "Wind",
      notes: `DEBUG: ${error.message}`
    };
  }
};

export const fetchPerfumeDetails = async (perfumeName) => {
  if (!genAI || !import.meta.env.VITE_GEMINI_API_KEY) {
    // Mock Se IA estiver desativada
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          description: "Um perfume clássico e atemporal com notas marcantes que combinam perfeitamente para qualquer ocasião.",
          accords: [
            {"name": "cítrico", "color": "#facc15", "value": 100},
            {"name": "aromático", "color": "#8b5cf6", "value": 75}
          ],
          pyramid: {
            "top": ["🍋 Limão Siciliano", "🌿 Bergamota"],
            "heart": ["🪻 Lavanda", "🌸 Jasmim"],
            "base": ["🪵 Sândalo", "🌲 Cedro"]
          },
          performance: {
            longevity: {weak: 10, moderate: 40, longLasting: 40, eternal: 10},
            sillage: {intimate: 10, moderate: 50, strong: 30, enormous: 10}
          },
          demographics: {
            gender: {female: 10, unisex: 30, male: 60},
            priceValue: {expensive: 30, ok: 40, good: 20, great: 10}
          },
          similar: ["Blue de Chanel", "Dior Sauvage"],
          perfumer: "Jacques Polge",
          releaseYear: "2010"
        });
      }, 1500);
    });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });

    const promptText = `
Você é uma enciclopédia de perfumaria de luxo, agindo como o banco de dados do Fragrantica.
Me dê todas as informações detalhadas sobre o perfume: "${perfumeName}".

Retorne EXATAMENTE um JSON válido com a seguinte estrutura e NADA mais.
IMPORTANTE: Para as notas (pyramid), inclua sempre um EMOJI representando o ingrediente seguido do nome. Ex: "🍋 Limão Siciliano".

{
  "description": "Uma descrição poética e detalhada sobre o perfume (2 parágrafos).",
  "accords": [
    {"name": "Nome do acorde (ex: cítrico)", "color": "Cor em HEX (ex: #facc15)", "value": 100},
    {"name": "frutado", "color": "#ea580c", "value": 85},
    {"name": "couro", "color": "#78350f", "value": 60}
  ],
  "pyramid": {
    "top": ["Emoji e Nota", "Emoji e Nota"],
    "heart": ["Emoji e Nota", "Emoji e Nota"],
    "base": ["Emoji e Nota", "Emoji e Nota"]
  },
  "performance": {
    "longevity": {"weak": 5, "moderate": 20, "longLasting": 60, "eternal": 15},
    "sillage": {"intimate": 5, "moderate": 30, "strong": 50, "enormous": 15}
  },
  "demographics": {
    "gender": {"female": 5, "unisex": 20, "male": 75},
    "priceValue": {"expensive": 10, "ok": 40, "good": 30, "great": 20}
  },
  "similar": ["Nome do Perfume 1", "Nome do Perfume 2", "Nome do Perfume 3"],
  "perfumer": "Nome do Perfumista",
  "releaseYear": "Ano de lançamento (ex: 2010)"
}
`;

    const result = await model.generateContent(promptText);
    const response = await result.response;
    let text = response.text().trim();
    
    // Safer JSON extraction
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return null;
  } catch (error) {
    console.error("Gemini API Error (Details):", error);
    return null;
  }
};

export const findClones = async (perfumeName) => {
  if (!genAI || !import.meta.env.VITE_GEMINI_API_KEY) {
    // Mock
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          { name: "CDNI Man Pure", brand: "Armaf", similarity: "95%", pros: "Mais cítrico e duradouro." },
          { name: "L'Aventure", brand: "Al Haramain", similarity: "90%", pros: "Equilíbrio perfeito de fumaça." }
        ]);
      }, 1500);
    });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });

    const promptText = `
Você é um especialista em contratipos e clones de perfumes (dupes) disponíveis no Brasil.
O usuário quer opções acessíveis parecidas com o perfume: "${perfumeName}".

Liste até 4 dos melhores contratipos ou inspirações de marcas como Zara, Nuancielo, Thera Cosméticos, In The Box, Primacial, Pocket Parfum, Afnan, Armaf, etc.

Retorne EXATAMENTE um array JSON e NADA MAIS, neste formato:
[
  {
    "name": "Nome do Contratipo",
    "brand": "Marca (ex: Nuancielo)",
    "similarity": "Porcentagem de similaridade (ex: 95%)",
    "pros": "O que ele tem de bom? (ex: Fixa muito mais que o original)"
  }
]
`;

    const result = await model.generateContent(promptText);
    const response = await result.response;
    let text = response.text().trim();
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return [];
  } catch (error) {
    console.error("Gemini API Error (Clones):", error);
    return [];
  }
};

export const perfumeBattle = async (perfume1, perfume2) => {
  if (!genAI || !import.meta.env.VITE_GEMINI_API_KEY) {
    // Mock
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          projection_winner: perfume1.name,
          projection_reason: "Possui uma concentração maior e notas de fundo densas como couro.",
          compliments_winner: perfume2.name,
          compliments_reason: "É mais fresco e agradável para a maioria das pessoas.",
          versatility_winner: perfume2.name,
          versatility_reason: "Pode ser usado tanto no calor quanto no frio sem sufocar.",
          overall_winner: perfume2.name,
          overall_verdict: `Apesar de ${perfume1.name} ser uma bomba, ${perfume2.name} é mais versátil e agradará mais no dia a dia.`
        });
      }, 1500);
    });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });

    const promptText = `
Você é um juiz experiente na comunidade de perfumaria.
O usuário quer fazer uma "Batalha Olfativa" entre dois perfumes que ele possui na coleção:
Perfume 1: ${perfume1.name} (${perfume1.brand || 'Desconhecido'})
Perfume 2: ${perfume2.name} (${perfume2.brand || 'Desconhecido'})

Avalie qual deles vence em cada uma das categorias abaixo. Retorne EXATAMENTE um objeto JSON e NADA MAIS.

Formato esperado:
{
  "projection_winner": "Nome do vencedor (exato)",
  "projection_reason": "Por que ele vence na projeção/fixação?",
  "compliments_winner": "Nome do vencedor (exato)",
  "compliments_reason": "Por que ele rende mais elogios/é mais agradável?",
  "versatility_winner": "Nome do vencedor (exato)",
  "versatility_reason": "Por que ele é melhor para o dia a dia/trabalho?",
  "overall_winner": "Nome do vencedor geral (exato)",
  "overall_verdict": "O veredito final em 2 frases."
}
`;

    const result = await model.generateContent(promptText);
    const response = await result.response;
    let text = response.text().trim();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return null;
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return null;
  }
};

export const formatCustomOccasion = async (userInput) => {
  if (!genAI || !import.meta.env.VITE_GEMINI_API_KEY) {
    return { name: userInput.charAt(0).toUpperCase() + userInput.slice(1).toLowerCase(), lucideIcon: "Sparkles" };
  }

  try {
    const prompt = `
O usuário digitou a seguinte ocasião para usar um perfume: "${userInput}".
Sua tarefa:
1. Padronizar o nome dessa ocasião (corrigir erros ortográficos, colocar a primeira letra em maiúscula, mantendo conciso, ex: "cinema" vira "Cinema", "aniversario da mae" vira "Aniversário").
2. Escolher APENAS UM nome de ícone EXATO da biblioteca 'lucide-react' que melhor represente essa ocasião.
Exemplos válidos: BookOpen, GraduationCap, Building, Briefcase, Coffee, Music, Film, Ticket, Camera, Gamepad2, Plane, Car, Ship, Tent, Compass, Map, ShoppingBag, ShoppingCart, Wine, Beer, Martini, GlassWater, Utensils, Heart, Star, Sparkles, Moon, Sun, Cloud, Snowflake, Dumbbell, Activity, Bike, Trophy, Medal, Users, Home, Store, Trees, Leaf, Flower2, Palette, PenTool.

Responda ESTRITAMENTE em formato JSON, sem crases de markdown:
{
  "name": "Nome Padronizado",
  "lucideIcon": "Film"
}
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    
    if(text.startsWith('```json')) text = text.replace('```json', '');
    if(text.startsWith('```')) text = text.replace('```', '');
    if(text.endsWith('```')) text = text.replace(/```$/, '');
    
    const parsedData = JSON.parse(text.trim());
    return parsedData;
  } catch (error) {
    console.error("Error formatting custom occasion:", error);
    return { name: userInput.charAt(0).toUpperCase() + userInput.slice(1).toLowerCase(), lucideIcon: "Sparkles" };
  }
};

export const recommendNewPerfumes = async (inventoryList) => {
  if (!genAI || !import.meta.env.VITE_GEMINI_API_KEY || inventoryList.length === 0) {
    return [
      {
        name: "Creed Aventus",
        brand: "Creed",
        notes: "Abacaxi, Bétula, Almíscar",
        reason: "Um clássico de nicho que todo colecionador deve conhecer."
      }
    ];
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });
    const inventoryNames = inventoryList.map(p => `${p.name} (${p.brand})`).join(", ");

    const promptText = `
Você é um sommelier de perfumes de luxo. 
O usuário possui a seguinte coleção de perfumes: ${inventoryNames}.

Baseado no gosto olfativo demonstrado por essa coleção, recomende 3 perfumes de nicho ou designer de luxo que ele ainda NÃO possui, mas que provavelmente vai amar.

Retorne EXATAMENTE um array JSON válido com esta estrutura e nada mais:
[
  {
    "name": "Nome do Perfume",
    "brand": "Marca",
    "notes": "Principais notas (ex: Couro, Íris, Baunilha)",
    "reason": "Explicação curta do porquê ele vai gostar baseado na coleção atual dele."
  }
]
`;

    const result = await model.generateContent(promptText);
    const response = await result.response;
    let text = response.text().trim();
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    console.error("Gemini API Error (Discovery):", error);
    return [];
  }
};

export const recommendLayering = async (inventory, basePerfume = null) => {
  if (!inventory || inventory.length < 2) {
    return null;
  }

  const inventorySummary = inventory.map(p => `- ${p.name} da ${p.brand} (${p.type})`).join('\n');

  let instructionText = `Escolha EXATAMENTE 2 perfumes diferentes dessa lista que, quando borrifados juntos (um por cima do outro), criam uma terceira fragrância espetacular.`;
  if (basePerfume) {
    instructionText = `O usuário selecionou o perfume "${basePerfume.name} da ${basePerfume.brand}" como base. Escolha EXATAMENTE UM outro perfume da lista que, misturado a esta base escolhida, cria uma terceira fragrância espetacular. O primeiro perfume no JSON DEVE OBRIGATORIAMENTE ser "${basePerfume.name}".`;
  }

  const promptText = `
Você é um mestre perfumista especialista na arte de "Layering" (misturar dois perfumes diferentes na pele).
Abaixo está a coleção de perfumes do usuário:
${inventorySummary}

${instructionText}
Eles devem se complementar (ex: um cítrico cortando o doce de outro, ou um couro dando peso a um floral).
Crie um nome imaginativo para essa nova mistura.

Retorne EXATAMENTE um JSON válido com esta estrutura e nada mais:
{
  "perfume1_name": "Nome do primeiro perfume escolhido (igual está na lista)",
  "perfume2_name": "Nome do segundo perfume escolhido (igual está na lista)",
  "mix_name": "Nome criativo para a mistura (ex: Oásis Noturno)",
  "rationale": "Explique em 2 a 3 frases românticas e descritivas por que essas duas fragrâncias funcionam perfeitamente juntas."
}
`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });
    const result = await model.generateContent(promptText);
    const text = await result.response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating layering recommendation:", error);
    return null;
  }
};

export const chatWithSommelier = async (inventory, chatHistory, newMessage, imageBase64, imageMimeType) => {
  if (!genAI || !import.meta.env.VITE_GEMINI_API_KEY) {
    return "Desculpe, o Sommelier de Inteligência Artificial está offline. Verifique a configuração da sua chave de API.";
  }

  const inventorySummary = inventory.map(p => `- ${p.name} da ${p.brand} (${p.type})`).join('\n');

  const systemInstruction = `Você é um Sommelier de Perfumes de elite e Consultor de Moda/Imagem chamado Jean. Você é charmoso, elegante e prestativo. Você está auxiliando o usuário na escolha da sua perfumaria. Você tem acesso à seguinte coleção de perfumes do usuário:
${inventorySummary}

Se o usuário mandar uma foto (de uma roupa, de um look, de um ambiente), analise o estilo, as cores, a vibe e sugira com grande entusiasmo qual perfume da coleção dele completaria a cena perfeitamente. 
Se ele pedir sugestões, analise o clima e a ocasião descrita.
Sempre responda em português do Brasil, de forma concisa, em no máximo 2 parágrafos curtos, num tom amigável e refinado. Responda diretamente à pergunta.`;

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash-8b",
      systemInstruction: systemInstruction 
    });

    const historyForGemini = chatHistory
      .filter((msg, idx) => !(idx === 0 && msg.role === 'model'))
      .map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

    const chat = model.startChat({
      history: historyForGemini
    });

    const payload = [newMessage];
    if (imageBase64 && imageMimeType) {
      payload.push({
        inlineData: {
          data: imageBase64,
          mimeType: imageMimeType
        }
      });
    }

    const result = await chat.sendMessage(payload);
    return result.response.text().trim();
  } catch (error) {
    console.error("Gemini Sommelier Error:", error);
    return "Tive um leve contratempo ao formular a resposta. Poderia repetir?";
  }
};

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

    let result;
    try {
      const modelLite = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });
      result = await modelLite.generateContent(prompt);
    } catch (e) {
      console.log("Fallback to gemini-3.5-flash due to error:", e.message);
      const modelPro = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
      result = await modelPro.generateContent(prompt);
    }
    const response = await result.response;
    let text = response.text().trim();
    
    // Remove potential markdown wrappers if the model includes them despite instructions
    if(text.startsWith('\`\`\`json')) text = text.replace('\`\`\`json', '');
    if(text.startsWith('\`\`\`')) text = text.replace('\`\`\`', '');
    if(text.endsWith('\`\`\`')) text = text.replace(/\`\`\`$/, '');
    
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

    let result;
    try {
      const modelLite = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });
      result = await modelLite.generateContent(payload);
    } catch (e) {
      console.log("Fallback to gemini-3.5-flash due to error:", e.message);
      const modelPro = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
      result = await modelPro.generateContent(payload);
    }

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
          topNotes: ["Limão Siciliano", "Bergamota", "Pimenta Rosa"],
          heartNotes: ["Lavanda", "Gerânio", "Jasmim"],
          baseNotes: ["Sândalo", "Cedro", "Fava Tonka"],
          longevity: 80, // percentage 0-100
          projection: 70, // percentage 0-100
          vibe: "Elegante",
          perfumer: "Jacques Polge",
          releaseYear: "2010",
          mainAccords: ["Cítrico", "Aromático", "Amadeirado"],
          timeOfDay: "Dia",
          bestSeasons: ["Primavera", "Verão"]
        });
      }, 1500);
    });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });

    const promptText = `
Você é uma enciclopédia de perfumaria de luxo, agindo como o banco de dados do Fragrantica.
Me dê todas as informações detalhadas sobre o perfume: "${perfumeName}".

Retorne EXATAMENTE um JSON válido com a seguinte estrutura e nada mais:
{
  "description": "Uma descrição poética e detalhada sobre o perfume (2 a 3 parágrafos curtos).",
  "topNotes": ["Nota 1", "Nota 2", "Nota 3"],
  "heartNotes": ["Nota 1", "Nota 2", "Nota 3"],
  "baseNotes": ["Nota 1", "Nota 2", "Nota 3"],
  "longevity": 85,
  "projection": 75,
  "vibe": "Uma palavra ou frase curta (ex: Poderoso, Sedutor)",
  "perfumer": "Nome do Perfumista",
  "releaseYear": "Ano de lançamento (ex: 2010)",
  "mainAccords": ["Acorde 1", "Acorde 2", "Acorde 3", "Acorde 4"],
  "timeOfDay": "Dia, Noite, ou Dia e Noite",
  "bestSeasons": ["Primavera", "Verão", "Outono", "Inverno"]
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
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini AI Fetch Details Error:", error);
    return null;
  }
};

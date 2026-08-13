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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });

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

    const result = await model.generateContent(prompt);
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

export const enrichPerfumeData = async (perfumeName) => {
  if (!genAI || !import.meta.env.VITE_GEMINI_API_KEY) {
    // Mock Se IA estiver desativada
    return {
      name: perfumeName,
      type: "Desconhecido",
      icon: "Wind",
      notes: "Mistério"
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });

    const prompt = `
Você é uma enciclopédia de perfumaria de luxo. 
O usuário digitou o seguinte nome de perfume (pode conter erros de digitação): "${perfumeName}"

Por favor, identifique qual é esse perfume e me retorne EXATAMENTE um JSON válido com a seguinte estrutura e nada mais:
{
  "name": "Nome correto e oficial do perfume",
  "type": "A Família Olfativa oficial (Ex: Amadeirado Especiado, Cítrico Fresco)",
  "notes": "Uma string curta com as 3 principais notas (ex: Bergamota, Pimenta, Cedro)",
  "icon": "Apenas um destes valores exatos baseado no tipo: Wind (fresco), Trees (amadeirado), Flame (especiado/quente), Droplets (aquático), Leaf (herbal)"
}
`;

    const result = await model.generateContent(prompt);
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
      name: perfumeName,
      type: "Erro na API",
      icon: "Wind",
      notes: `DEBUG: ${error.message}`
    };
  }
};

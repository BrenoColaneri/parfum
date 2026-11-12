import { GoogleGenerativeAI } from '@google/generative-ai';

// Chave privada no backend (Vercel Environment Variable)
const API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

export default async function handler(req, res) {
  // Configuração de CORS e Headers de Segurança
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  if (!API_KEY) {
    return res.status(503).json({ 
      error: 'Chave da API do Google Gemini não configurada no servidor (GEMINI_API_KEY ausente).' 
    });
  }

  const { action, payload } = req.body || {};

  if (!action) {
    return res.status(400).json({ error: 'Parâmetro action é obrigatório.' });
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    // Modelo padrão robusto e com alta disponibilidade
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    let promptText = '';
    let contents = [];

    switch (action) {
      case 'recommendation': {
        const { weather, occasion, inventory, timeOfDay } = payload || {};
        if (!inventory || !Array.isArray(inventory) || inventory.length === 0) {
          return res.status(400).json({ error: 'Inventário vazio ou inválido.' });
        }

        promptText = `
Você é um especialista em perfumaria de luxo e consultor de imagem.
O usuário quer saber qual perfume da sua coleção usar.

Dados do Clima: ${weather?.temp || 22}°C, ${weather?.condition || 'Agradável'}.
Ocasião: ${occasion || 'Casual'}.
Horário: ${timeOfDay || 'Agora'}.

Inventário do usuário:
${inventory.map(p => `- ${p.name} (Marca: ${p.brand || 'N/A'}, Tipo: ${p.type})`).join('\n')}

Por favor, escolha o melhor perfume do inventário acima e retorne EXATAMENTE um JSON válido com a seguinte estrutura e nada mais (sem markdown code blocks):
{
  "perfumeName": "Nome exato do perfume escolhido do inventário",
  "rationale": "Sua explicação poética e especializada do porquê de 2 a 3 frases",
  "recommendedNotes": ["Nota1", "Nota2", "Nota3"],
  "avoidNotes": ["Nota1", "Nota2"],
  "vibe": "Uma palavra definindo a vibe (ex: Sedutor, Refrescante, Elegante)",
  "applicationTip": "Uma dica de aplicação profissional (ex: Dê 3 borrifadas no pescoço e pulsos)."
}
`;
        contents = [promptText];
        break;
      }

      case 'enrich': {
        const { perfumeName, imageBase64, imageMimeType } = payload || {};
        promptText = `
Você é uma enciclopédia de perfumaria de luxo e um especialista em visão computacional.
${imageBase64 ? 'Uma foto do frasco de perfume foi enviada.' : ''}
${perfumeName ? `O usuário também digitou o seguinte texto (pode conter erros): "${perfumeName}"` : ''}

Por favor, analise as informações (texto e/ou imagem do frasco), identifique com precisão qual é esse perfume e retorne EXATAMENTE um JSON válido com a seguinte estrutura e nada mais:
{
  "name": "Nome correto e oficial do perfume",
  "brand": "A marca de design ou perfumaria (Ex: Dior, Chanel, Tom Ford)",
  "gender": "Apenas uma destas opções: Masculino, Feminino, Unissex",
  "intensity": "Apenas uma destas opções: Leve, Moderada, Forte",
  "concentration": "A concentração PADRONIZADA usando SOMENTE uma das seguintes opções: EDC, EDT, EDP, Parfum, Extrait",
  "type": "A Família Olfativa oficial (Ex: Amadeirado Especiado, Cítrico Fresco)",
  "notes": "Uma string curta com as 3 principais notas (ex: Bergamota, Pimenta, Cedro)",
  "icon": "Apenas um destes valores exatos baseado no tipo: Wind (fresco), Trees (amadeirado), Flame (especiado/quente), Droplets (aquático), Leaf (herbal)",
  "shoppingLink": "Gere a URL exata do Google Shopping (ex: https://www.google.com/search?tbm=shop&q=Nome+do+Perfume+Marca)"
}
`;
        contents = [promptText];
        if (imageBase64 && imageMimeType) {
          contents.push({
            inlineData: {
              data: imageBase64,
              mimeType: imageMimeType
            }
          });
        }
        break;
      }

      case 'details': {
        const { perfumeName } = payload || {};
        if (!perfumeName) return res.status(400).json({ error: 'Nome do perfume obrigatório.' });

        promptText = `
Você é uma enciclopédia de perfumaria de luxo, agindo como o banco de dados do Fragrantica.
Me dê todas as informações detalhadas sobre o perfume: "${perfumeName}".

Retorne EXATAMENTE um JSON válido com a seguinte estrutura e NADA mais.
IMPORTANTE: Para as notas (pyramid), inclua sempre um EMOJI representando o ingrediente seguido do nome. Ex: "🍋 Limão Siciliano".

{
  "description": "Uma descrição poética e detalhada sobre o perfume (2 parágrafos).",
  "accords": [
    {"name": "cítrico", "color": "#facc15", "value": 100},
    {"name": "aromático", "color": "#8b5cf6", "value": 75}
  ],
  "pyramid": {
    "top": ["🍋 Limão Siciliano", "🌿 Bergamota"],
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
  "similar": ["Perfume 1", "Perfume 2", "Perfume 3"],
  "perfumer": "Nome do Perfumista",
  "releaseYear": "2015"
}
`;
        contents = [promptText];
        break;
      }

      case 'clones': {
        const { perfumeName } = payload || {};
        promptText = `
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
        contents = [promptText];
        break;
      }

      case 'battle': {
        const { perfume1, perfume2 } = payload || {};
        promptText = `
Você é um juiz experiente na comunidade de perfumaria.
O usuário quer fazer uma "Batalha Olfativa" entre dois perfumes que ele possui na coleção:
Perfume 1: ${perfume1?.name} (${perfume1?.brand || 'N/A'})
Perfume 2: ${perfume2?.name} (${perfume2?.brand || 'N/A'})

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
        contents = [promptText];
        break;
      }

      case 'layering': {
        const { inventory, basePerfume } = payload || {};
        const summary = (inventory || []).map(p => `- ${p.name} (${p.brand || 'N/A'} - ${p.type})`).join('\n');
        promptText = `
Você é um mestre perfumista especialista na arte de "Layering" (misturar dois perfumes diferentes na pele).
Abaixo está a coleção de perfumes do usuário:
${summary}

${basePerfume ? `O usuário selecionou "${basePerfume.name}" como base. Escolha outro perfume da lista para misturar com ele.` : 'Escolha EXATAMENTE 2 perfumes diferentes da lista que se complementam.'}

Retorne EXATAMENTE um JSON válido:
{
  "perfume1_name": "Nome do primeiro perfume",
  "perfume2_name": "Nome do segundo perfume",
  "mix_name": "Nome criativo para a mistura (ex: Oásis Noturno)",
  "rationale": "Explique em 2 a 3 frases por que essas duas fragrâncias funcionam perfeitamente juntas."
}
`;
        contents = [promptText];
        break;
      }

      case 'discover': {
        const { inventory } = payload || {};
        const inventoryNames = (inventory || []).map(p => `${p.name} (${p.brand})`).join(', ');
        promptText = `
Você é um sommelier de perfumes de luxo. 
O usuário possui a seguinte coleção de perfumes: ${inventoryNames}.

Baseado no gosto olfativo demonstrado por essa coleção, recomende 3 perfumes de nicho ou designer de luxo que ele ainda NÃO possui, mas que provavelmente vai amar.

Retorne EXATAMENTE um array JSON válido:
[
  {
    "name": "Nome do Perfume",
    "brand": "Marca",
    "notes": "Principais notas (ex: Couro, Íris, Baunilha)",
    "reason": "Explicação curta do porquê ele vai gostar baseado na coleção atual dele."
  }
]
`;
        contents = [promptText];
        break;
      }

      case 'sommelier': {
        const { inventory, chatHistory, newMessage, imageBase64, imageMimeType } = payload || {};
        const inventorySummary = (inventory || []).map(p => `- ${p.name} (${p.brand} - ${p.type})`).join('\n');
        const systemInstruction = `Você é um Sommelier de Perfumes de elite e Consultor de Imagem chamado Jean. Você é charmoso, elegante e prestativo. Coleção do usuário:\n${inventorySummary}\nResponda em português com elegância e concisão (máximo 2 parágrafos curtos).`;
        
        const chatModel = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          systemInstruction
        });

        const historyForGemini = (chatHistory || [])
          .filter((msg, idx) => !(idx === 0 && msg.role === 'model'))
          .map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text || '' }]
          }));

        const chat = chatModel.startChat({ history: historyForGemini });
        const chatPayload = [newMessage || 'Olá'];
        if (imageBase64 && imageMimeType) {
          chatPayload.push({
            inlineData: { data: imageBase64, mimeType: imageMimeType }
          });
        }

        const chatResult = await chat.sendMessage(chatPayload);
        const reply = chatResult.response.text().trim();
        return res.status(200).json({ reply });
      }

      default:
        return res.status(400).json({ error: `Ação '${action}' não reconhecida.` });
    }

    const result = await model.generateContent(contents);
    const response = await result.response;
    let text = response.text().trim();

    // Extração segura de JSON
    const jsonMatch = text.match(/[{[][\s\S]*[}\]]/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return res.status(200).json({ data: parsed });
      } catch {
        return res.status(200).json({ rawText: text });
      }
    }

    return res.status(200).json({ rawText: text });
  } catch (error) {
    console.error('Serverless Gemini Error:', error.message);
    return res.status(500).json({ 
      error: 'Erro no processamento da inteligência artificial.',
      details: error.message 
    });
  }
}

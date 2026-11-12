import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = "AQ.Ab8RN6J_c6mV64iTRDAe977VtkC-oLKP-uxDC0gM5U0YZdRG9A"; // From .env
const genAI = new GoogleGenerativeAI(apiKey);

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
Você é uma enciclopédia de perfumaria de luxo. 
O usuário digitou o seguinte nome de perfume (pode conter erros de digitação): "dior sauvage edp"

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
    console.log("Raw Response:");
    console.log(response.text());
  } catch (err) {
    console.error("Error:", err);
  }
}

test();

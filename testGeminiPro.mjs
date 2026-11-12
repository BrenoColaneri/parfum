import { GoogleGenerativeAI } from '@google/generative-ai';
const apiKey = "AQ.Ab8RN6J_c6mV64iTRDAe977VtkC-oLKP-uxDC0gM5U0YZdRG9A"; // From .env
const genAI = new GoogleGenerativeAI(apiKey);

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("hello");
    console.log("Success with gemini-pro:");
    console.log((await result.response).text());
  } catch (err) {
    console.error("Error with gemini-pro:", err);
  }
}
test();

export const getAIRecommendation = (occasion, weather, inventory) => {
  // If inventory is empty, return null
  if (!inventory || inventory.length === 0) return null;

  // Simple mock AI logic based on rules
  // Real AI would take context and generate this dynamically.
  
  const isCold = weather.temp < 20;
  const isHot = weather.temp >= 25;
  const isMild = weather.temp >= 20 && weather.temp < 25;

  let recommendedPerfume = null;
  let rationale = "";
  let recommendedNotes = [];
  let avoidedNotes = [];

  // Very rudimentary matching just for the mock
  // We prefer 'Amadeirado' for cold/night, 'Fresco' for hot/day, etc.

  if (occasion === 'Encontro' || occasion === 'Festa') {
    if (isCold || isMild) {
      recommendedPerfume = inventory.find(p => p.type.toLowerCase().includes('amadeirado')) || inventory[0];
      rationale = `A temperatura amena/fria (${weather.temp}°C) combinada com a ocasião (${occasion}) pede uma fragrância mais densa e marcante. As notas amadeiradas de ${recommendedPerfume.name} vão projetar elegância sem sufocar, criando uma aura de mistério e sofisticação ideal para o ambiente.`;
      recommendedNotes = ['Madeira', 'Âmbar', 'Especiarias'];
      avoidedNotes = ['Cítrico', 'Aquático'];
    } else {
      recommendedPerfume = inventory.find(p => p.type.toLowerCase().includes('fresco')) || inventory[0];
      rationale = `O clima quente (${weather.temp}°C) exige algo que não desande na pele durante a ${occasion}. A abertura fresca de ${recommendedPerfume.name} manterá você revigorado, enquanto o fundo garante a fixação necessária para a ocasião.`;
      recommendedNotes = ['Cítrico', 'Floral', 'Almíscar'];
      avoidedNotes = ['Couro', 'Tabaco'];
    }
  } else if (occasion === 'Trabalho') {
    recommendedPerfume = inventory.find(p => p.type.toLowerCase().includes('fresco')) || inventory[0];
    rationale = `Para o Trabalho em um dia de ${weather.temp}°C e ${weather.condition}, a discrição é fundamental. O perfil aromático/fresco de ${recommendedPerfume.name} transmite limpeza e profissionalismo, sem invadir o espaço alheio no escritório.`;
    recommendedNotes = ['Lavanda', 'Vetiver', 'Cítrico'];
    avoidedNotes = ['Baunilha Forte', 'Oud'];
  } else if (occasion === 'Academia') {
    recommendedPerfume = inventory.find(p => p.type.toLowerCase().includes('fresco')) || inventory[0];
    rationale = `Alta transpiração e ambiente fechado pedem perfumes extremamente leves. A opção mais fresca do seu inventário (${recommendedPerfume.name}) vai prolongar a sensação de banho tomado sem sufocar quem está ao seu redor treinando.`;
    recommendedNotes = ['Limão', 'Aquático', 'Hortelã'];
    avoidedNotes = ['Qualquer nota doce ou densa'];
  } else {
    // Casual
    recommendedPerfume = inventory[Math.floor(Math.random() * inventory.length)];
    rationale = `Para uma ocasião Casual com ${weather.temp}°C e tempo ${weather.condition}, ${recommendedPerfume.name} é uma escolha versátil e confortável. Equilibra bem com o clima atual e não exige muita formalidade.`;
    recommendedNotes = ['Frutado', 'Almíscar Branco', 'Madeira Leve'];
    avoidedNotes = ['Notas muito animálicas'];
  }

  return {
    perfume: recommendedPerfume,
    rationale,
    recommendedNotes,
    avoidedNotes,
    occasion,
    weather
  };
};

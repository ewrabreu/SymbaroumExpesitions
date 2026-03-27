import express from 'express';
console.log('Server script starting...');
import { createServer as createViteServer } from 'vite';
import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';
import path from 'path';
import { abilities } from './src/data/abilities';
import { traits } from './src/data/traits';
import { traditions } from './src/data/traditions';
import { powers } from './src/data/powers';
import { equipment } from './src/data/equipment';
import { races } from './src/data/races';
import { archetypes } from './src/data/archetypes';
import { locations, Location } from './src/data/locations';

const app = express();
const PORT = 3000;

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(express.json());

let botStatus = 'offline';

// Discord Bot Setup
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;

// In-memory database for characters (resets on server restart)
// Key: Discord User ID
interface Character {
  name: string;
  race?: string;
  raceVariant?: string;
  archetypeId?: string;
  occupationId?: string;
  attributes: {
    precisao: number;
    astucia: number;
    discricao: number;
    persuasao: number;
    agilidade: number;
    resolucao: number;
    forca: number;
    vigilancia: number;
  };
  armorMod: number;
  corruption: {
    temp: number;
    perm: number;
  };
  xp: {
    total: number;
    unspent: number;
  };
  learnedAbilities: {
    id: string;
    name: string;
    level: 'Novato' | 'Adepto' | 'Mestre';
  }[];
  equipment?: {
    weapon?: { name: string; damage: string; qualities: string[] };
    armor?: { name: string; protection: string; impediment: number };
    shield?: { name: string; defenseBonus: number };
  };
  status?: {
    isFurious?: boolean;
    activeAuras?: string[];
    activeSymbols?: string[];
    isTransformed?: boolean;
    transformedAttributes?: Character['attributes'];
    poisonApplied?: boolean;
    witchSightActive?: boolean;
  };
  animalCompanion?: {
    name: string;
    attributes: Character['attributes'];
    toughness: number;
    defense: number;
  };
  shadow?: string;
  money?: {
    ortegs?: number;
    xelins?: number;
    thaler?: number;
  };
  inventory?: {
    rations: number;
    hasLicense: boolean;
    licenseExpiry?: number; // Turnos restantes
    hasMount: boolean;
    starvationDays?: number; // Dias sem comer
  };
  creationStep?: number;
  currentLocation?: string; // ID da localização
  activeTravel?: {
    destinationId: string;
    totalDistance: number;
    distanceRemaining: number;
    currentDay: number;
    pace: 'normal' | 'forced' | 'death' | 'mounted';
    isRiverTravel: boolean;
    log: string;
  };
  activeExpedition?: {
    locationId: string;
    totalDays: number;
    currentDay: number;
    log: string;
  };
  chapter?: {
    currentDay: number; // 1 a 365
    theme: string;
    conflict: string;
    description: string;
    tone: string;
    history: string[];
    nature: { resources: string; corruption: string };
    culture: string;
    npcs: { name: string; goal: string; resources: string; compromise: string; risk: string }[];
    journal: string[];
  };
}
const characters = new Map<string, Character>();

const misfortunes = [
  "Suprimentos estragados (Perda de 1d4 rações)",
  "Perda de direção (Atraso de 1 dia)",
  "Equipamento danificado",
  "Fadiga extrema (-1 em todos os testes no próximo dia)",
  "Ataque de insetos/parasitas"
];

const travelEvents = {
  ruin: ["Ruína menor", "Santuário antigo", "Acampamento abandonado", "Monumento esquecido"],
  encounter: ["Mercadores", "Batedores", "Refugiados", "Caçadores de tesouros"],
  enemy: ["Bando de Goblins", "Elfos de Davokar", "Abominação faminta", "Salteadores"],
  terrain: ["Pântano traiçoeiro", "Mata de espinhos", "Ravina íngreme", "Rio caudaloso"]
};

const primaryBlocks = [
  { 
    theme: "A Luta pela Sobrevivência", 
    conflict: "Natureza vs. Civilização", 
    description: "Grupos ou indivíduos têm visões diferentes sobre como a civilização deve se relacionar com a natureza.",
    tone: "Cinza e Consequencial" 
  },
  { 
    theme: "O Preço do Progresso", 
    conflict: "Individualismo vs. Coletivismo", 
    description: "Grupos ou indivíduos têm opiniões diferentes sobre o que deve ser priorizado: direitos individuais ou o bem coletivo.",
    tone: "Sombrio e Perigoso" 
  },
  { 
    theme: "O Medo do Desconhecido", 
    conflict: "Abertura vs. Isolacionismo", 
    description: "Grupos ou indivíduos têm opiniões diferentes sobre estrangeiros em geral, particularmente sobre sua capacidade de contribuir para a sociedade.",
    tone: "Misterioso e Filosófico" 
  }
];

const historyMarcos = [
  "Civilização caída",
  "Despertar de abominação",
  "Mudança de poder",
  "Descoberta de recurso raro"
];

const cultures = ["Yndaros (Ambria)", "Karvosti (Bárbaros)", "Symbar (Ruína/Escuridão)"];

const oracleTable = [
  { max: 1, text: "Sim, e..." },
  { max: 9, text: "Sim" },
  { max: 11, text: "Complicação" },
  { max: 19, text: "Não" },
  { max: 20, text: "Não, porque..." }
];

const creativePrompts = {
  part1: ["Endereçando", "Assegurando", "Elogiando", "Enganando", "Exigindo", "Divagando", "Endossando", "Examinando"],
  part2: ["Evitando", "Concluindo", "Confrontando", "Conectando", "Detalhando", "Discutindo", "Divulgando", "Aproveitando"],
  part3: ["Crença central", "Decisão", "Desejo", "Aversão", "Medo", "Gosto", "Amor", "Posse"],
  shadow: ["Vermelho", "Laranja", "Amarelo", "Verde", "Azul", "Roxo", "Marrom", "Magenta"],
  ambria: ["Guerreiro de Clã", "Cultista", "Brigante", "Caçador de Tesouros", "Caçador de Bruxas", "Gato-égua", "Kanaran", "Violing"],
  darkDavokar: ["Caminhante de Cripta", "Necromago", "Dragoul", "Besta do Flagelo Primal", "Nascido do Flagelo", "Violing", "Libélula", "Lindworm"]
};

const travelSpeeds = {
  normal: { ambria: 20, clara: 20, escura: 10 },
  forced: { ambria: 40, clara: 30, escura: 15 },
  death: { ambria: 60, clara: 40, escura: 20 },
  mounted: { ambria: 40, clara: 30, escura: 10 }
};

const davokarTerrainTable = [
  { max: 10, name: "Nada especial", effect: "" },
  { max: 12, name: "Facilmente atravessável", effect: "O grupo percorre +10 km" },
  { max: 14, name: "Pântano/Brejo", effect: "O grupo percorre -5 km" },
  { max: 16, name: "Dolina (Sinkhole)", effect: "Teste de Vigilant ou 1D8 de dano de queda" },
  { max: 18, name: "Esporos venenosos", effect: "Teste de Strong ou 3 de dano por 3 turnos" },
  { max: 20, name: "Terreno Vingativo", effect: "Encontro com criaturas do local" },
  { max: 100, name: "Natureza Corrompida", effect: "Perigos da Natureza Corrompida" }
];

const ruinTypesTable = [
  { max: 7, type: "Nenhuma", finds: 0 },
  { max: 10, type: "Desmoronada ou Saqueada", finds: 0 },
  { max: 12, type: "Pequena, muito danificada", finds: "1d4+2" },
  { max: 16, type: "Pequena, bem preservada", finds: "1d8+2" },
  { max: 19, type: "Média, dilatada", finds: "2d8+2" },
  { max: 100, type: "Grande, bem preservada", finds: "3d12+2" }
];

const enemyScalingTable = [
  { max: 8, level: "Nenhum", count: 0 },
  { max: 10, level: "Fracos", count: 1 }, // Multiplicado por PC#
  { max: 14, level: "Ordinários", count: 1 },
  { max: 18, level: "Fortes", count: 1 },
  { max: 100, level: "Poderosos", count: 1 }
];

const hiringCosts = [
  { rank: "Fraco", cost: "1 orteg", example: "Trabalhador, Escudeiro" },
  { rank: "Ordinário", cost: "1 xelim", example: "Arqueiro, Guerreiro de Vila" },
  { rank: "Desafiador", cost: "1 taler", example: "Guarda, Oficial" },
  { rank: "Forte", cost: "5 taleres", example: "Cavaleiro, Mestre de Ordem" }
];

const corruptNatureTable = [
  { max: 1, name: "Corrupção Virulenta", effect: "Teste de Strong ou 1D4 corrupção temporária por hora/cena." },
  { max: 2, name: "Corrupção Virulenta", effect: "Teste de Strong ou 1D6 corrupção temporária por hora/cena." },
  { max: 3, name: "Corrupção Virulenta", effect: "Todos sofrem 1D4 corrupção temporária por hora/cena." },
  { max: 4, name: "Corrupção Virulenta", effect: "Todos sofrem 1D6 corrupção temporária por hora/cena; Teste de Strong falho concede 1 corrupção permanente." },
  { max: 5, name: "Retaliação", effect: "Toda corrupção temporária gerada na área é dobrada." },
  { max: 10, name: "Névoa Corruptora", effect: "Visibilidade reduzida e 1D4 corrupção temporária ao entrar." },
  { max: 15, name: "Sombra Faminta", effect: "A sombra dos personagens parece se desprender, causando 1D6 de dano temporário à Resolute." },
  { max: 20, name: "Eco de Symbar", effect: "Sussurros do passado causam 1D8 de corrupção temporária e confusão mental." }
];

function getProceduralEvent(day: number, terrain: string): { log: string, stop: boolean, distMod: number, damage?: string, corruption?: number, permCorruption?: number } {
  // Seasons
  let eventChance = 0.5;
  if (day >= 92 && day <= 182) eventChance = 0.75; // Verão
  else if (day >= 183 && day <= 273) eventChance = 0.5; // Outono
  else if (day >= 274 && day <= 365) eventChance = 0.25; // Inverno

  let log = "";
  let stop = false;
  let distMod = 0;
  let damage = "";
  let corruption = 0;
  let permCorruption = 0;

  // Terrain Roll (Tabela 29)
  if (terrain.includes("Davokar")) {
    let terrainRoll = Math.floor(Math.random() * 20) + 1;
    if (terrain === "Davokar Escura") terrainRoll += 5; // Modificador de +5 em Davokar Escura

    const terrainEvent = davokarTerrainTable.find(t => terrainRoll <= t.max) || davokarTerrainTable[0];
    log += `🌍 **Terreno:** ${terrainEvent.name}. ${terrainEvent.effect}\n`;
    
    if (terrainEvent.name === "Facilmente atravessável") distMod = 10;
    if (terrainEvent.name === "Pântano/Brejo") distMod = -5;
    if (terrainEvent.name === "Dolina (Sinkhole)") damage = "1d8";
    if (terrainEvent.name === "Esporos venenosos") damage = "3"; // 3 turns
    if (terrainEvent.name === "Terreno Vingativo") stop = true;

    if (terrainEvent.name === "Natureza Corrompida") {
      const corruptRoll = Math.floor(Math.random() * 20) + 1;
      const corruptEvent = corruptNatureTable.find(c => corruptRoll <= c.max) || corruptNatureTable[corruptNatureTable.length - 1];
      log += `💀 **PERIGO:** ${corruptEvent.name}. ${corruptEvent.effect}\n`;
      
      if (corruptRoll === 1) corruption = Math.floor(Math.random() * 4) + 1;
      else if (corruptRoll === 2) corruption = Math.floor(Math.random() * 6) + 1;
      else if (corruptRoll === 3) corruption = Math.floor(Math.random() * 4) + 1;
      else if (corruptRoll === 4) {
        corruption = Math.floor(Math.random() * 6) + 1;
        permCorruption = 1;
      }
    }
  }

  if (Math.random() > eventChance) {
    log += "🌲 Jornada tranquila.";
    return { log, stop, distMod, damage, corruption, permCorruption };
  }

  const roll = Math.floor(Math.random() * 20) + 1;
  if (roll <= 8) {
    log += `🌲 Encontraram uma **${travelEvents.ruin[Math.floor(Math.random() * travelEvents.ruin.length)]}**.`;
  } else if (roll <= 13) {
    log += `👥 Avistaram **${travelEvents.encounter[Math.floor(Math.random() * travelEvents.encounter.length)]}** ao longe.`;
  } else if (roll <= 18) {
    const enemy = travelEvents.enemy[Math.floor(Math.random() * travelEvents.enemy.length)];
    log += `⚔️ **EMBOSCADA!** ${enemy} atacam o grupo!`;
    stop = true;
  } else {
    log += `⛰️ Obstáculo: **${travelEvents.terrain[Math.floor(Math.random() * travelEvents.terrain.length)]}**.`;
  }

  return { log, stop, distMod, damage, corruption, permCorruption };
}

const commandList = [
  // ⚔️ Ações de Combate
  { name: 'golpear', description: 'Ataca o alvo mais relevante' },
  { name: 'poder', description: 'Ativa uma habilidade da ficha' },
  // 🏃 Movimento
  { name: 'avancar', description: 'Move, flanqueia ou aproxima' },
  { name: 'retirar', description: 'Sai do combate' },
  { name: 'erguer', description: 'Levanta do chão' },
  { name: 'visar', description: 'Garante linha de visão' },
  // 🛡️ Reações
  { name: 'bloquear', description: 'Defesa contra ataque' },
  { name: 'contra', description: 'Ataque Livre' },
  // 💥 Dano & Estado
  { name: 'ferir', description: 'Aplica dano' },
  { name: 'estado', description: 'Mostra Toughness e condições' },
  // ☠️ Morte
  { name: 'agonizar', description: 'Entra em estado de morte' },
  { name: 'sorte', description: 'Rola Teste de Morte' },
  // ❤️🩹 Cura
  { name: 'curar', description: 'Cura o personagem' },
  { name: 'elixir', description: 'Usa um elixir' },
  // 🌀 Ações Especiais
  { name: 'cegar', description: 'Ativa condição de cegueira' },
  { name: 'desengajar', description: 'Sai do combate sem atacar' },
  { name: 'flanquear', description: 'Move para vantagem' },
  { name: 'surpreender', description: 'Tenta emboscar' },
  { name: 'vantagem', description: 'Aplica bônus' },
  // 🧭 Fluxo do Combate
  { name: 'iniciar', description: 'Começa o combate' },
  { name: 'rodada', description: 'Passa para o próximo turno' },
  // 🎭 Interação & Roleplay
  { name: 'agir', description: 'Testes de atributo' },
  { name: 'dialogar', description: 'Inicia cena social' },
  // ⭐ Experiência
  { name: 'xp', description: 'Mostra experiência' },
  { name: 'treinar', description: 'Evolui habilidades' },
  { name: 'viajar', description: 'Viaja para uma nova localização' },
  { name: 'explorar', description: 'Explora a localização atual' },
  { name: '/poder', description: 'Consulta Poderes Místicos e Rituais' },
  { name: '/equipamento', description: 'Consulta Armas, Armaduras e Escudos' },
  { name: '/furia', description: 'Ativa ou desativa o modo Fúria (Berserker)' },
  { name: '/proteger', description: 'Protege um aliado (Honor Guard)' },
  { name: '/veneno', description: 'Aplica veneno na arma (Assassin)' },
  { name: '/explorar', description: 'Teste de exploração (Explorer)' },
  { name: '/bind', description: 'Vincula um artefato (Artifact Crafter)' },
  { name: '/transformar', description: 'Transformação animal (Witch)' },
  { name: '/witchsight', description: 'Visão de Bruxo (Witch Hunter)' },
  { name: '/beastlore', description: 'Revela fraquezas de feras (Monster Hunter)' },
  { name: '/armadilha', description: 'Prepara uma armadilha (Sapper)' },
  { name: 'capitulo', description: 'Inicia ou visualiza o Capítulo atual (365 turnos)' },
  { name: 'oraculo', description: 'Pergunta ao Oráculo (Sim/Não)' },
  { name: 'prompt', description: 'Gera um prompt criativo para a cena' },
];

function parseCharacterText(text: string): Partial<Character> {
  const char: Partial<Character> = {
    attributes: {} as any,
    learnedAbilities: [],
    equipment: {} as any
  };

  const lines = text.split('\n');
  for (const line of lines) {
    const cleanLine = line.replace(/^>\s*/, '').trim();
    if (cleanLine.toLowerCase().startsWith('nome:')) {
      char.name = cleanLine.substring(5).trim();
    } else if (cleanLine.toLowerCase().startsWith('atributos:')) {
      const attrs = cleanLine.substring(10).trim().split(',');
      for (const attr of attrs) {
        const parts = attr.trim().split(' ');
        if (parts.length < 2) continue;
        const key = parts[0].toLowerCase();
        const num = parseInt(parts[1], 10);
        if (isNaN(num)) continue;
        
        if (key.startsWith('acc')) char.attributes!.precisao = num;
        if (key.startsWith('cun')) char.attributes!.astucia = num;
        if (key.startsWith('dis')) char.attributes!.discricao = num;
        if (key.startsWith('per')) char.attributes!.persuasao = num;
        if (key.startsWith('qui')) char.attributes!.agilidade = num;
        if (key.startsWith('res')) char.attributes!.resolucao = num;
        if (key.startsWith('str')) char.attributes!.forca = num;
        if (key.startsWith('vig')) char.attributes!.vigilancia = num;
      }
    } else if (cleanLine.toLowerCase().startsWith('habilidades:')) {
      const habs = cleanLine.substring(12).trim().split(',');
      for (const hab of habs) {
        const match = hab.match(/(.+?)\((.+?)\)/);
        if (match) {
          const name = match[1].trim();
          let levelStr = match[2].trim().toLowerCase();
          let level: 'Novato' | 'Adepto' | 'Mestre' = 'Novato';
          if (levelStr.includes('adepto') || levelStr.includes('adept')) level = 'Adepto';
          if (levelStr.includes('mestre') || levelStr.includes('master')) level = 'Mestre';
          
          char.learnedAbilities!.push({ id: name.toLowerCase().replace(/\s+/g, '_'), name, level });
        }
      }
    } else if (cleanLine.toLowerCase().startsWith('arma:')) {
      const arma = cleanLine.substring(5).trim();
      const match = arma.match(/(.+?)\((.+?)\)/);
      if (match) {
        char.equipment!.weapon = { name: match[1].trim(), damage: match[2].trim(), qualities: [] };
      }
    } else if (cleanLine.toLowerCase().startsWith('armadura:')) {
      const armadura = cleanLine.substring(9).trim();
      const match = armadura.match(/(.+?)\((.+?)\)/);
      if (match) {
        const parts = match[2].split(',');
        const protection = parts[0].trim();
        let impediment = 0;
        if (parts[1] && parts[1].toLowerCase().includes('impedimento')) {
          impediment = parseInt(parts[1].replace(/[^0-9-]/g, ''), 10) || 0;
          if (impediment > 0) impediment = -impediment;
        }
        char.equipment!.armor = { name: match[1].trim(), protection, impediment };
        char.armorMod = impediment;
      }
    } else if (cleanLine.toLowerCase().startsWith('sombra:')) {
      char.shadow = cleanLine.substring(7).trim();
    } else if (cleanLine.toLowerCase().startsWith('dinheiro:')) {
      const moneyStr = cleanLine.substring(9).trim();
      const thaler = parseInt(moneyStr.match(/(\d+)\s*thaler/i)?.[1] || '0');
      const xelins = parseInt(moneyStr.match(/(\d+)\s*xelins/i)?.[1] || '0');
      const ortegs = parseInt(moneyStr.match(/(\d+)\s*ortegs/i)?.[1] || '0');
      char.money = { thaler, xelins, ortegs };
    }
  }
  
  // If attributes is empty, remove it so we don't overwrite with undefined
  if (Object.keys(char.attributes!).length === 0) {
    delete char.attributes;
  }
  if (Object.keys(char.equipment!).length === 0) {
    delete char.equipment;
  }
  
  return char;
}

interface Combatant {
  id: string;
  name: string;
  quick: number;
  vigilant: number;
  isEnemy: boolean;
}
let combatants: Combatant[] = [];

function parseAndRoll(formula: string) {
  const match = formula.match(/(\d+)?d(\d+)(?:\s*([\+\-])\s*(\d+))?/i);
  if (!match) {
    const val = parseInt(formula);
    return { total: isNaN(val) ? 0 : val, text: `**${isNaN(val) ? 0 : val}**` };
  }
  const count = parseInt(match[1]) || 1;
  const sides = parseInt(match[2]);
  const sign = match[3];
  const mod = parseInt(match[4]) || 0;

  let total = 0;
  const rolls = [];
  for (let i = 0; i < count; i++) {
    const r = Math.floor(Math.random() * sides) + 1;
    rolls.push(r);
    total += r;
  }
  if (sign === '+') total += mod;
  if (sign === '-') total -= mod;

  return {
    total: Math.max(0, total),
    text: `[${rolls.join(', ')}]${mod ? ` ${sign} ${mod}` : ''} = **${Math.max(0, total)}**`
  };
}

function getCharacter(userId: string, username: string): Character {
  let char = characters.get(userId);
  if (!char) {
    char = {
      name: username,
      attributes: { precisao: 10, astucia: 10, discricao: 10, persuasao: 10, agilidade: 10, resolucao: 10, forca: 10, vigilancia: 10 },
      armorMod: 0,
      corruption: { temp: 0, perm: 0 },
      xp: { total: 50, unspent: 50 },
      learnedAbilities: [],
      equipment: {},
      status: {},
      inventory: { rations: 10, hasLicense: false, hasMount: false },
      creationStep: 1,
      currentLocation: 'yndaros'
    };
    characters.set(userId, char);
  }
  return char;
}

async function goToStep2(interaction: any) {
  const raceSelect = new StringSelectMenuBuilder()
    .setCustomId('select_race')
    .setPlaceholder('Escolha sua Raça')
    .addOptions(races.map(r => ({ label: r.name, value: r.id, description: r.description.substring(0, 100) })));
  
  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(raceSelect);
  await interaction.update({
    content: '**Passo 2: Escolha sua Raça**\nA raça define seus Traços Raciais iniciais.',
    components: [row]
  });
}

async function goToStep3(interaction: any, char: Character) {
  const standardBtn = new ButtonBuilder()
    .setCustomId('set_standard_attributes')
    .setLabel('Usar Conjunto Padrão (15, 13, 11, 10, 10, 9, 7, 5)')
    .setStyle(ButtonStyle.Primary);
  
  const customBtn = new ButtonBuilder()
    .setCustomId('custom_attributes')
    .setLabel('Distribuir 80 pontos manualmente')
    .setStyle(ButtonStyle.Secondary);
  
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(standardBtn, customBtn);
  
  await interaction.update({
    content: `**Passo 3: Atributos**\nVocê escolheu a raça **${char.race}**.\nAgora, defina seus atributos. Você pode usar o conjunto padrão ou distribuir 80 pontos.\n\n*Dica: Sugerimos colocar 15 no atributo principal da sua ocupação.*`,
    components: [row]
  });
}

async function goToStep5(interaction: any, char: Character) {
  // Step 4 is automatic calculation, we show it here
  const hp = Math.max(10, char.attributes.forca);
  const pain = Math.ceil(char.attributes.forca / 2);
  const corruption = Math.max(1, Math.ceil(char.attributes.resolucao / 2));
  const defense = char.attributes.agilidade;

  const nextBtn = new ButtonBuilder()
    .setCustomId('go_to_equipment')
    .setLabel('Ir para Equipamento (Passo 6)')
    .setStyle(ButtonStyle.Success);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(nextBtn);

  await interaction.update({
    content: `**Passo 4: Atributos Derivados (Calculados)**\n\n❤️ **Resistência (HP):** ${hp}\n🩸 **Limiar de Dor:** ${pain}\n🌑 **Limiar de Corrupção:** ${corruption}\n🛡️ **Defesa Base:** ${defense}\n\n*Habilidades e equipamentos serão definidos a seguir.*`,
    components: [row]
  });
}

async function goToStep6(interaction: any, char: Character) {
  // Step 6: Equipment
  // Auto-assign based on archetype
  if (char.archetypeId === 'warrior') {
    char.equipment = {
      weapon: { name: 'Espada', damage: '1D8', qualities: [] },
      armor: { name: 'Cota de Malha', protection: '1D6', impediment: 2 }
    };
    char.money = { xelins: 5 };
  } else if (char.archetypeId === 'mystic') {
    char.equipment = {
      weapon: { name: 'Cajado', damage: '1D6', qualities: ['Longo'] },
      armor: { name: 'Roupas de Tecido', protection: '1D4', impediment: 0 }
    };
    char.money = { xelins: 5 };
  } else {
    char.equipment = {
      weapon: { name: 'Espada Curta', damage: '1D6', qualities: [] },
      armor: { name: 'Armadura de Couro', protection: '1D4', impediment: 0 }
    };
    char.money = { xelins: 5 };
  }
  
  const nextBtn = new ButtonBuilder()
    .setCustomId('go_to_shadow')
    .setLabel('Ir para Sombra (Passo 7)')
    .setStyle(ButtonStyle.Success);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(nextBtn);

  await interaction.update({
    content: `**Passo 6: Equipamento Inicial**\nCom base no seu arquétipo, você recebeu:\n- **Arma:** ${char.equipment.weapon?.name} (${char.equipment.weapon?.damage})\n- **Armadura:** ${char.equipment.armor?.name} (${char.equipment.armor?.protection})\n- **Dinheiro:** 5 xelins\n- **Itens:** 1 Ração de viagem, 1 Cantil`,
    components: [row]
  });
}

async function goToStep7(interaction: any, char: Character) {
  const modal = new ModalBuilder()
    .setCustomId('modal_shadow')
    .setTitle('Passo 7: Sombra e Estigmas');
  
  const input = new TextInputBuilder()
    .setCustomId('shadow_input')
    .setLabel('Descreva a aparência da sua Sombra')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Ex: Sombras douradas (Teurgistas), Verdes como musgo (Bruxas), Negras (Corrompidos)')
    .setRequired(true);
  
  modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(input));
  await interaction.showModal(modal);
}

if (token && clientId) {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  const commands = [
    new SlashCommandBuilder()
      .setName('ficha')
      .setDescription('Gerencia sua ficha de personagem')
      .addSubcommand(subcommand =>
        subcommand
          .setName('assistente')
          .setDescription('Criação de personagem interativa passo a passo')
      )
      .addSubcommand(subcommand =>
        subcommand
          .setName('raca')
          .setDescription('Define sua raça e variante (se houver)')
          .addStringOption(o => o.setName('nome').setDescription('Nome da raça').setRequired(true).setAutocomplete(true))
          .addStringOption(o => o.setName('variante').setDescription('Variante da raça (ex: Ambriano, Bárbaro)').setRequired(false).setAutocomplete(true))
      )
      .addSubcommand(subcommand =>
        subcommand
          .setName('criar')
          .setDescription('Cria ou atualiza sua ficha de personagem')
          .addIntegerOption(o => o.setName('precisao').setDescription('Accurate').setRequired(true))
          .addIntegerOption(o => o.setName('astucia').setDescription('Cunning').setRequired(true))
          .addIntegerOption(o => o.setName('discricao').setDescription('Discreet').setRequired(true))
          .addIntegerOption(o => o.setName('persuasao').setDescription('Persuasive').setRequired(true))
          .addIntegerOption(o => o.setName('agilidade').setDescription('Quick').setRequired(true))
          .addIntegerOption(o => o.setName('resolucao').setDescription('Resolute').setRequired(true))
          .addIntegerOption(o => o.setName('forca').setDescription('Strong').setRequired(true))
          .addIntegerOption(o => o.setName('vigilancia').setDescription('Vigilant').setRequired(true))
          .addIntegerOption(o => o.setName('armadura').setDescription('Modificador de Armadura (padrão 0)').setRequired(false))
      )
      .addSubcommand(subcommand =>
        subcommand
          .setName('ver')
          .setDescription('Visualiza sua ficha atual')
      )
      .addSubcommand(subcommand =>
        subcommand
          .setName('aprender')
          .setDescription('Aprende ou melhora uma habilidade (custa XP)')
          .addStringOption(o => o.setName('categoria').setDescription('Categoria').setRequired(true).addChoices(
            { name: 'Traço', value: 'Traço' },
            { name: 'Poder', value: 'Poder' },
            { name: 'Habilidade', value: 'Habilidade' },
            { name: 'Ritual', value: 'Ritual' }
          ))
          .addStringOption(o => o.setName('nome').setDescription('Nome da habilidade').setRequired(true).setAutocomplete(true))
          .addStringOption(o => o.setName('nivel').setDescription('Nível').setRequired(true).addChoices(
            { name: 'Novato (10 XP)', value: 'Novato' },
            { name: 'Adepto (20 XP)', value: 'Adepto' },
            { name: 'Mestre (30 XP)', value: 'Mestre' }
          ))
      ),
    new SlashCommandBuilder().setName('golpear').setDescription('Ataca o alvo mais relevante.'),
    new SlashCommandBuilder().setName('poder').setDescription('Ativa qualquer habilidade da ficha.').addStringOption(o => o.setName('nome').setDescription('Nome do poder').setRequired(true).setAutocomplete(true)),
    new SlashCommandBuilder().setName('avancar').setDescription('Move, flanqueia ou entra em combate.'),
    new SlashCommandBuilder().setName('retirar').setDescription('Sai do combate, sofrendo ataque livre se necessário.'),
    new SlashCommandBuilder().setName('erguer').setDescription('Levanta-se do chão (consome Movimento).'),
    new SlashCommandBuilder().setName('visar').setDescription('Garante linha de visão ou bônus de mira.'),
    new SlashCommandBuilder().setName('bloquear').setDescription('Defesa contra ataque.'),
    new SlashCommandBuilder().setName('contra').setDescription('Ataque Livre.'),
    new SlashCommandBuilder().setName('ferir').setDescription('Aplica dano ao personagem.').addIntegerOption(o => o.setName('valor').setDescription('Quantidade de dano').setRequired(true)),
    new SlashCommandBuilder().setName('estado').setDescription('Mostra Toughness e condições atuais.'),
    new SlashCommandBuilder().setName('agonizar').setDescription('Entra em estado de morte.'),
    new SlashCommandBuilder().setName('sorte').setDescription('Rola Teste de Morte.'),
    new SlashCommandBuilder().setName('curar').setDescription('Cura o personagem.').addIntegerOption(o => o.setName('valor').setDescription('Quantidade de cura').setRequired(true)),
    new SlashCommandBuilder().setName('elixir').setDescription('Usa um elixir do inventário.'),
    new SlashCommandBuilder().setName('cegar').setDescription('Ativa condição de cegueira.'),
    new SlashCommandBuilder().setName('desengajar').setDescription('Sai do combate sem atacar.'),
    new SlashCommandBuilder().setName('flanquear').setDescription('Move para vantagem.'),
    new SlashCommandBuilder().setName('surpreender').setDescription('Tenta emboscar o inimigo.'),
    new SlashCommandBuilder().setName('vantagem').setDescription('Aplica bônus de vantagem.'),
    new SlashCommandBuilder().setName('iniciar').setDescription('Começa o combate e rola iniciativa.'),
    new SlashCommandBuilder().setName('rodada').setDescription('Passa para o próximo turno.'),
    new SlashCommandBuilder().setName('agir').setDescription('Testes de atributo.').addStringOption(o => o.setName('atributo').setDescription('Atributo a ser testado').setRequired(true).addChoices(
        { name: 'Precisão', value: 'precisao' },
        { name: 'Astúcia', value: 'astucia' },
        { name: 'Discrição', value: 'discricao' },
        { name: 'Persuasão', value: 'persuasao' },
        { name: 'Agilidade', value: 'agilidade' },
        { name: 'Resolução', value: 'resolucao' },
        { name: 'Força', value: 'forca' },
        { name: 'Vigilância', value: 'vigilancia' }
    )),
    new SlashCommandBuilder().setName('dialogar').setDescription('Inicia cena social ou teste de Persuasão.'),
    new SlashCommandBuilder().setName('xp').setDescription('Mostra experiência atual.'),
    new SlashCommandBuilder().setName('treinar').setDescription('Evolui habilidades.').addStringOption(o => o.setName('nome').setDescription('Nome da habilidade').setRequired(true).setAutocomplete(true)),
    new SlashCommandBuilder().setName('viajar').setDescription('Viaja para uma nova localização.'),
    new SlashCommandBuilder().setName('explorar').setDescription('Explora a localização atual.'),
  ];

  const rest = new REST({ version: '10' }).setToken(token);

  client.on('ready', async () => {
    botStatus = 'online';
    console.log(`Logged in as ${client.user?.tag}!`);
    try {
      await rest.put(Routes.applicationCommands(clientId), { body: commands });
      console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
      console.error(error);
    }
  });

  client.on('interactionCreate', async interaction => {
    if (interaction.isAutocomplete()) {
      const focusedOption = interaction.options.getFocused(true);
      const focusedValue = focusedOption.value.toLowerCase();
      let choices: {name: string, value: string}[] = [];
      
      if (interaction.commandName === 'habilidade' || (interaction.commandName === 'ficha' && interaction.options.getSubcommand() === 'aprender') || interaction.commandName === 'treinar') {
        const categoria = interaction.options.getString('categoria');
        if (categoria === 'Traço') {
          choices = traits.filter(t => t.name.toLowerCase().includes(focusedValue)).slice(0, 25).map(choice => ({ name: choice.name, value: choice.id }));
        } else if (categoria === 'Poder' || categoria === 'Ritual') {
          choices = powers.filter(p => p.name.toLowerCase().includes(focusedValue)).slice(0, 25).map(choice => ({ name: choice.name, value: choice.id }));
        } else {
          choices = abilities.filter(a => a.name.toLowerCase().includes(focusedValue)).slice(0, 25).map(choice => ({ name: choice.name, value: choice.id }));
        }
      } else if (interaction.commandName === 'traco') {
        choices = traits.filter(t => t.name.toLowerCase().includes(focusedValue)).slice(0, 25).map(choice => ({ name: choice.name, value: choice.id }));
      } else if (interaction.commandName === 'tradicao') {
        choices = traditions.filter(t => t.name.toLowerCase().includes(focusedValue)).slice(0, 25).map(choice => ({ name: choice.name, value: choice.name }));
      } else if (interaction.commandName === 'poder' || interaction.commandName === 'conjurar') {
        choices = powers.filter(p => p.name.toLowerCase().includes(focusedValue)).slice(0, 25).map(choice => ({ name: choice.name, value: choice.id }));
      } else if (interaction.commandName === 'equipamento') {
        choices = equipment.filter(e => e.name.toLowerCase().includes(focusedValue)).slice(0, 25).map(choice => ({ name: choice.name, value: choice.id }));
      } else if (interaction.commandName === 'atacar' && focusedOption.name === 'arma') {
        choices = equipment.filter(e => e.type === 'Weapon' && e.name.toLowerCase().includes(focusedValue)).slice(0, 25).map(c => ({ name: c.name, value: c.id }));
      } else if (interaction.commandName === 'defender') {
        if (focusedOption.name === 'armadura') {
          choices = equipment.filter(e => e.type === 'Armor' && e.name.toLowerCase().includes(focusedValue)).slice(0, 25).map(c => ({ name: c.name, value: c.id }));
        } else if (focusedOption.name === 'escudo') {
          choices = equipment.filter(e => e.type === 'Shield' && e.name.toLowerCase().includes(focusedValue)).slice(0, 25).map(c => ({ name: c.name, value: c.id }));
        }
      } else if (interaction.commandName === 'ficha' && interaction.options.getSubcommand() === 'raca') {
        if (focusedOption.name === 'nome') {
          choices = races.filter(r => r.name.toLowerCase().includes(focusedValue)).slice(0, 25).map(c => ({ name: c.name, value: c.id }));
        } else if (focusedOption.name === 'variante') {
          const raceId = interaction.options.getString('nome');
          const race = races.find(r => r.id === raceId);
          if (race && race.variants) {
            choices = race.variants.filter(v => v.toLowerCase().includes(focusedValue)).slice(0, 25).map(v => ({ name: v, value: v }));
          }
        }
      }

      await interaction.respond(choices);
      return;
    }

    if (interaction.isModalSubmit()) {
      const userId = interaction.user.id;
      const userName = interaction.user.username;
      const char = getCharacter(userId, userName);

      if (interaction.customId === 'registrar_modal') {
        const dados = interaction.fields.getTextInputValue('dados_input');
        const parsed = parseCharacterText(dados);
        parsed.name = parsed.name || userName;
        
        if (parsed.attributes) char.attributes = { ...char.attributes, ...parsed.attributes };
        if (parsed.learnedAbilities) char.learnedAbilities = parsed.learnedAbilities;
        if (parsed.equipment) char.equipment = parsed.equipment;
        if (parsed.armorMod !== undefined) char.armorMod = parsed.armorMod;

        await interaction.reply({ content: `Ficha de **${char.name}** registrada com sucesso!`, ephemeral: true });
      } else if (interaction.customId === 'modal_attributes') {
        const values = interaction.fields.getTextInputValue('attr_input').split(',').map(v => parseInt(v.trim(), 10));
        if (values.length === 8 && !values.some(isNaN)) {
          char.attributes = {
            precisao: values[0], astucia: values[1], discricao: values[2], persuasao: values[3],
            agilidade: values[4], resolucao: values[5], forca: values[6], vigilancia: values[7]
          };
          await goToStep5(interaction, char);
        } else {
          await interaction.reply({ content: 'Formato inválido. Use 8 números separados por vírgula.', ephemeral: true });
        }
      } else if (interaction.customId === 'modal_shadow') {
        char.shadow = interaction.fields.getTextInputValue('shadow_input');
        
        const embed = {
          title: `Ficha de ${char.name} Concluída!`,
          description: `Parabéns! Seu personagem **${char.name}** (${char.race}) foi criado com sucesso.`,
          fields: [
            { name: 'Arquétipo/Ocupação', value: `${char.archetypeId} / ${char.occupationId}`, inline: true },
            { name: 'Sombra', value: char.shadow || 'Não definida', inline: true },
            { name: 'Resistência', value: `${Math.max(10, char.attributes.forca)}`, inline: true },
            { name: 'Limiar de Dor', value: `${Math.ceil(char.attributes.forca / 2)}`, inline: true },
            { name: 'Limiar de Corrupção', value: `${Math.max(1, Math.ceil(char.attributes.resolucao / 2))}`, inline: true }
          ],
          color: 0x2b2d31
        };

        await interaction.reply({
          content: '✅ **Criação Finalizada!**',
          embeds: [embed],
          ephemeral: true
        });
      }
      return;
    }

    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === 'select_archetype') {
        const archetypeId = interaction.values[0];
        const archetype = archetypes.find(a => a.id === archetypeId);
        if (!archetype) return;

        const char = getCharacter(interaction.user.id, interaction.user.username);
        char.archetypeId = archetypeId;
        char.creationStep = 1;

        const occupationSelect = new StringSelectMenuBuilder()
          .setCustomId(`select_occupation`)
          .setPlaceholder('Escolha sua Ocupação')
          .addOptions(
            archetype.occupations.map(o => ({
              label: o.name,
              description: o.description.substring(0, 100),
              value: o.id
            }))
          );

        const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(occupationSelect);

        await interaction.update({
          content: `**Passo 1: Arquétipo e Ocupação**\nVocê escolheu o Arquétipo **${archetype.name}**!\nAtributos Chave: ${archetype.keyAttributes.join(' ou ')}.\n\nAgora, escolha sua Ocupação:`,
          components: [row]
        });
      } else if (interaction.customId === 'select_occupation') {
        const char = getCharacter(interaction.user.id, interaction.user.username);
        const archetype = archetypes.find(a => a.id === char.archetypeId);
        const occupationId = interaction.values[0];
        const occupation = archetype?.occupations.find(o => o.id === occupationId);
        if (!archetype || !occupation) return;

        char.occupationId = occupationId;

        const confirmBtn = new ButtonBuilder()
          .setCustomId(`apply_occupation_package`)
          .setLabel('Sim, aplicar pacote padrão')
          .setStyle(ButtonStyle.Success);

        const nextBtn = new ButtonBuilder()
          .setCustomId('go_to_race')
          .setLabel('Não, vou escolher depois')
          .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(confirmBtn, nextBtn);

        await interaction.update({
          content: `Você escolheu a Ocupação **${occupation.name}**!\n\nDeseja aplicar o pacote padrão?\n**Habilidades:** ${occupation.suggestedAbilities.join(', ')} (Novato)\n**Atributo Recomendado:** ${occupation.suggestedAttributes}`,
          components: [row]
        });
      } else if (interaction.customId === 'select_race') {
        const char = getCharacter(interaction.user.id, interaction.user.username);
        const raceId = interaction.values[0];
        const race = races.find(r => r.id === raceId);
        if (!race) return;

        char.race = race.name;
        char.creationStep = 2;

        // Add racial trait (Novice)
        const traitName = race.traits[0];
        if (traitName && !char.learnedAbilities.some(a => a.name === traitName)) {
          char.learnedAbilities.push({ id: traitName.toLowerCase().replace(/\s+/g, '_'), name: traitName, level: 'Novato' });
        }

        if (race.variants) {
          const variantSelect = new StringSelectMenuBuilder()
            .setCustomId('select_race_variant')
            .setPlaceholder('Escolha sua Variante/Origem')
            .addOptions(race.variants.map(v => ({ label: v, value: v })));
          
          const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(variantSelect);
          await interaction.update({
            content: `**Passo 2: Raça**\nVocê escolheu **${race.name}**!\nTraço Racial: ${race.traits.join(', ')}.\n\nEscolha sua variante:`,
            components: [row]
          });
        } else {
          await goToStep3(interaction, char);
        }
      } else if (interaction.customId === 'select_race_variant') {
        const char = getCharacter(interaction.user.id, interaction.user.username);
        char.raceVariant = interaction.values[0];
        await goToStep3(interaction, char);
      } else if (interaction.customId === 'select_travel') {
        const char = getCharacter(interaction.user.id, interaction.user.username);
        const destinationId = interaction.values[0];
        const destination = locations.find(l => l.id === destinationId);
        const origin = locations.find(l => l.id === char.currentLocation) || locations[0];
        const travelInfo = origin.destinations.find(d => d.id === destinationId);

        if (!destination || !travelInfo) return;

        // Set up active travel state
        char.activeTravel = {
          destinationId,
          totalDistance: travelInfo.distance,
          distanceRemaining: travelInfo.distance,
          currentDay: 0,
          pace: 'normal',
          isRiverTravel: false,
          log: `🚀 **Preparando Viagem: ${origin.name} ➔ ${destination.name}**\nDistância: ${travelInfo.distance}km\n\n`
        };

        const marchSelect = new StringSelectMenuBuilder()
          .setCustomId('select_travel_options')
          .setPlaceholder('Escolha o ritmo e a via')
          .addOptions([
            { label: 'Marcha Normal (Terrestre)', value: 'normal_land', description: 'Ritmo padrão, permite cura natural.' },
            { label: 'Marcha Forçada (Terrestre)', value: 'forced_land', description: 'Ritmo acelerado, impede cura natural.' },
            { label: 'Marcha da Morte (Terrestre)', value: 'death_land', description: 'Ritmo extremo, risco de exaustão.' },
            { label: 'Via Rio (Normal)', value: 'normal_river', description: 'Navegação fluvial, terreno mais fácil.' },
            { label: 'Via Rio (Forçada)', value: 'forced_river', description: 'Navegação rápida, impede cura natural.' }
          ]);

        const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(marchSelect);

        await interaction.update({
          content: `📍 **Destino Selecionado: ${destination.name}**\nComo vocês pretendem viajar?`,
          components: [row]
        });
      } else if (interaction.customId === 'select_travel_options') {
        const char = getCharacter(interaction.user.id, interaction.user.username);
        if (!char.activeTravel) return;

        const option = interaction.values[0];
        char.activeTravel.pace = option.split('_')[0] as any;
        char.activeTravel.isRiverTravel = option.endsWith('river');

        const destination = locations.find(l => l.id === char.activeTravel!.destinationId);
        const origin = locations.find(l => l.id === char.currentLocation) || locations[0];
        const travelInfo = origin.destinations.find(d => d.id === char.activeTravel!.destinationId);

        if (!destination || !travelInfo) return;

        // --- Cálculo de Tempo de Viagem Estimado ---
        let terrainLevel = origin.terrain;
        if (char.activeTravel.isRiverTravel) {
          if (terrainLevel === 'Davokar Escura') terrainLevel = 'Davokar Clara';
          else if (terrainLevel === 'Davokar Clara') terrainLevel = 'Ambria';
        }

        const terrainKey = terrainLevel === 'Davokar Escura' ? 'escura' : (terrainLevel === 'Davokar Clara' ? 'clara' : 'ambria');
        let kmPerDay = travelSpeeds[char.activeTravel.pace][terrainKey];
        if (char.inventory?.hasMount && terrainLevel === 'Ambria' && char.activeTravel.pace === 'normal') {
          kmPerDay = travelSpeeds.mounted.ambria;
        }

        const estimatedDays = Math.ceil(travelInfo.distance / kmPerDay);
        const totalRations = estimatedDays;

        // Check license
        let licenseStatus = "Não necessária";
        if (destination.terrain !== 'Ambria') {
          licenseStatus = char.inventory?.hasLicense ? "✅ Ativa" : "❌ Ausente (Risco de Patrulha)";
        }

        const embed = {
          title: `🧭 Menu de Expedição: ${destination.name}`,
          color: 0xdaa520, // Dourado
          fields: [
            { name: '🕒 Turnos Estimados', value: `${estimatedDays} dias`, inline: true },
            { name: '🍞 Suprimentos', value: `${totalRations} rações necessárias`, inline: true },
            { name: '📜 Licença', value: licenseStatus, inline: true },
            { name: '🏃 Ritmo', value: char.activeTravel.pace.charAt(0).toUpperCase() + char.activeTravel.pace.slice(1), inline: true },
            { name: '🛶 Via', value: char.activeTravel.isRiverTravel ? 'Rio' : 'Terrestre', inline: true }
          ],
          description: char.activeTravel.log
        };

        const startBtn = new ButtonBuilder()
          .setCustomId('start_travel_turn')
          .setLabel('Iniciar Turno')
          .setStyle(ButtonStyle.Primary);

        const campBtn = new ButtonBuilder()
          .setCustomId('camp_rest')
          .setLabel('Acampar/Descansar')
          .setStyle(ButtonStyle.Secondary);

        const invBtn = new ButtonBuilder()
          .setCustomId('view_inventory')
          .setLabel('Inventário')
          .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(startBtn, campBtn, invBtn);

        await interaction.update({
          content: null,
          embeds: [embed],
          components: [row]
        });
      } else if (interaction.customId === 'select_explore') {
        const char = getCharacter(interaction.user.id, interaction.user.username);
        const option = interaction.values[0];
        const location = locations.find(l => l.id === char.currentLocation) || locations[0];

        if (option === 'Explorar Profundezas' || option === 'Explorar Ruínas Reais') {
          // --- Preparar Expedição (10 Turnos Fixos) ---
          char.activeExpedition = {
            locationId: location.id,
            totalDays: 10,
            currentDay: 0,
            log: `🌲 **Iniciando Expedição em ${location.name}**\nFase de exploração ativa (10 dias).\n\n`
          };

          const embed = {
            title: `🧭 Menu de Expedição: ${location.name}`,
            color: 0x10b981,
            fields: [
              { name: '🕒 Turnos Estimados', value: `10 dias`, inline: true },
              { name: '🍞 Suprimentos', value: `10 rações necessárias`, inline: true },
              { name: '📜 Licença', value: char.inventory?.hasLicense ? "✅ Ativa" : "❌ Ausente", inline: true }
            ],
            description: char.activeExpedition.log
          };

          const startBtn = new ButtonBuilder()
            .setCustomId('start_expedition_turn')
            .setLabel('Iniciar Turno')
            .setStyle(ButtonStyle.Primary);

          const campBtn = new ButtonBuilder()
            .setCustomId('camp_rest')
            .setLabel('Acampar/Descansar')
            .setStyle(ButtonStyle.Secondary);

          const row = new ActionRowBuilder<ButtonBuilder>().addComponents(startBtn, campBtn);

          await interaction.update({
            content: null,
            embeds: [embed],
            components: [row]
          });
        } else {
          await interaction.update({
            content: `📍 Em **${location.name}**, você escolheu: **${option}**.\n\n*(Ação narrativa em desenvolvimento...)*`,
            components: []
          });
        }
      }
      return;
    }

    if (interaction.isButton()) {
      if (interaction.customId === 'start_travel_turn') {
        const char = getCharacter(interaction.user.id, interaction.user.username);
        if (!char.activeTravel) return;

        char.activeTravel.currentDay++;
        const day = char.activeTravel.currentDay;
        const origin = locations.find(l => l.id === char.currentLocation) || locations[0];
        const destination = locations.find(l => l.id === char.activeTravel.destinationId);

        if (!destination) return;

        let dayLog = `**Dia ${day}:** `;

        // --- Consumo de Ração ---
        if ((char.inventory?.rations || 0) > 0) {
          char.inventory!.rations--;
          char.inventory!.starvationDays = 0;
        } else {
          char.inventory!.starvationDays = (char.inventory!.starvationDays || 0) + 1;
          dayLog += `⚠️ **FOME!** Sem rações. `;
        }

        // --- Corrupção Ambiental (Dark Davokar) ---
        if (origin.terrain === 'Davokar Escura') {
          const corr = Math.floor(Math.random() * 4) + 1;
          char.corruption.temp += corr;
          dayLog += `⚰️ Corrupção (+${corr}). `;
        }

        // --- Cálculo de Distância Percorrida ---
        let terrainLevel = origin.terrain;
        const pace = char.activeTravel.pace;
        if (char.activeTravel.isRiverTravel) {
          if (terrainLevel === 'Davokar Escura') terrainLevel = 'Davokar Clara';
          else if (terrainLevel === 'Davokar Clara') terrainLevel = 'Ambria';
        }

        const terrainKey = terrainLevel === 'Davokar Escura' ? 'escura' : (terrainLevel === 'Davokar Clara' ? 'clara' : 'ambria');
        let kmPerDay = travelSpeeds[char.activeTravel.pace][terrainKey];
        if (char.inventory?.hasMount && terrainLevel === 'Ambria' && char.activeTravel.pace === 'normal') {
          kmPerDay = travelSpeeds.mounted.ambria;
        }

        // --- Eventos Procedurais ---
        const event = getProceduralEvent(char.chapter?.currentDay || 1, origin.terrain);
        dayLog += event.log + '\n';
        kmPerDay += event.distMod;
        
        if (event.corruption) char.corruption.temp += event.corruption;
        if (event.permCorruption) char.corruption.perm += event.permCorruption;

        if (event.damage) {
          dayLog += `💥 Perigo: ${event.damage} de dano. `;
        }

        char.activeTravel.distanceRemaining -= kmPerDay;
        if (char.activeTravel.distanceRemaining < 0) char.activeTravel.distanceRemaining = 0;

        dayLog += `📍 Distância: **${kmPerDay} km** percorridos. Restam: **${char.activeTravel.distanceRemaining} km**.\n`;

        // Update Chapter Day
        if (char.chapter) {
          char.chapter.currentDay++;
          if (char.chapter.currentDay > 365) char.chapter.currentDay = 1;
        }

        char.activeTravel.log += dayLog;
        let stopTravel = event.stop;

        const isFinished = char.activeTravel.distanceRemaining <= 0;
        if (isFinished && !stopTravel) {
          char.currentLocation = char.activeTravel.destinationId;
          const finalEmbed = {
            title: `📍 Chegada em ${destination.name}`,
            color: 0x10b981,
            description: char.activeTravel.log + `\n✅ **Viagem concluída com sucesso!**`,
            footer: { text: `Rações: ${char.inventory?.rations} | Corrupção: ${char.corruption.temp}/${char.corruption.perm}` }
          };
          char.activeTravel = undefined;
          await interaction.update({ embeds: [finalEmbed], components: [] });
        } else {
          const embed = {
            title: stopTravel ? `⚔️ Viagem Interrompida!` : `🧭 Menu de Expedição: ${destination.name}`,
            color: stopTravel ? 0xef4444 : 0xdaa520,
            description: char.activeTravel.log,
            fields: [
              { name: '🕒 Progresso', value: `${char.activeTravel.totalDistance - char.activeTravel.distanceRemaining}/${char.activeTravel.totalDistance} km`, inline: true },
              { name: '🍞 Suprimentos', value: `${char.inventory?.rations} rações`, inline: true },
              { name: '🏃 Ritmo', value: char.activeTravel.pace.charAt(0).toUpperCase() + char.activeTravel.pace.slice(1), inline: true }
            ]
          };

          const startBtn = new ButtonBuilder()
            .setCustomId('start_travel_turn')
            .setLabel('Próximo Turno')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(stopTravel);

          const campBtn = new ButtonBuilder()
            .setCustomId('camp_rest')
            .setLabel('Acampar/Descansar')
            .setStyle(ButtonStyle.Secondary);

          const row = new ActionRowBuilder<ButtonBuilder>().addComponents(startBtn, campBtn);
          await interaction.update({ embeds: [embed], components: [row] });
        }

      } else if (interaction.customId === 'start_expedition_turn') {
        const char = getCharacter(interaction.user.id, interaction.user.username);
        if (!char.activeExpedition) return;

        char.activeExpedition.currentDay++;
        const day = char.activeExpedition.currentDay;
        const location = locations.find(l => l.id === char.activeExpedition.locationId) || locations[0];

        let dayLog = `**Dia ${day}:** `;

        // --- Consumo de Ração ---
        if ((char.inventory?.rations || 0) > 0) {
          char.inventory!.rations--;
          char.inventory!.starvationDays = 0;
        } else {
          char.inventory!.starvationDays = (char.inventory!.starvationDays || 0) + 1;
          dayLog += `⚠️ **FOME!** `;
        }

        // --- Corrupção Ambiental ---
        if (location.terrain === 'Davokar Escura') {
          const corr = Math.floor(Math.random() * 4) + 1;
          char.corruption.temp += corr;
          dayLog += `⚰️ Corrupção (+${corr}). `;
        }

        // --- Risco de Permanência (Discreet) ---
        let stopExpedition = false;
        if (day >= 2) {
          const discreetAttr = char.attributes.discricao;
          const stealthRoll = Math.floor(Math.random() * 20) + 1;
          if (stealthRoll > (discreetAttr - 2)) { // Penalidade por permanência
            dayLog += `⚠️ **DESCOBERTOS!** Predadores locais sentiram sua presença!\n`;
            stopExpedition = true;
          }
        }

        if (!stopExpedition) {
          // Eventos Procedurais
          const event = getProceduralEvent(char.chapter?.currentDay || 1, location.terrain);
          dayLog += event.log + ' ';
          if (event.stop) stopExpedition = true;
          
          if (event.corruption) char.corruption.temp += event.corruption;
          if (event.permCorruption) char.corruption.perm += event.permCorruption;

          // Teste de Orientação (Vigilant)
          const vigilantAttr = char.attributes.vigilancia;
          const orientationRoll = Math.floor(Math.random() * 20) + 1;
          
          if (orientationRoll <= (vigilantAttr + 2)) {
            // Tabela 26: Ruínas
            const ruinRoll = Math.floor(Math.random() * 20) + 1;
            const ruin = ruinTypesTable.find(r => ruinRoll <= r.max) || ruinTypesTable[0];
            dayLog += `💎 **Ruína Encontrada:** ${ruin.type}. `;
            
            if (ruin.finds !== 0) {
              const numFinds = parseAndRoll(ruin.finds as string).total;
              dayLog += `Achados: ${numFinds}. `;
              
              // Tabela 30: Itens (Simplificada)
              const itemRoll = Math.floor(Math.random() * 20) + 1;
              let category = "Detritos";
              if (location.terrain === 'Davokar Clara') {
                if (itemRoll >= 16) category = "Tesouro Místico";
                else if (itemRoll >= 6) category = "Curiosidade";
              } else if (location.terrain === 'Davokar Escura') {
                if (itemRoll >= 19) category = "Artefato";
                else if (itemRoll >= 12) category = "Tesouro Místico";
                else if (itemRoll >= 3) category = "Curiosidade";
              }
              dayLog += `📦 [${category}] `;
            }
          } else {
            dayLog += `🌲 Nada encontrado hoje.\n`;
          }
        }

        // Update Chapter Day
        if (char.chapter) {
          char.chapter.currentDay++;
          if (char.chapter.currentDay > 365) char.chapter.currentDay = 1; // Reset year
        }

        char.activeExpedition.log += dayLog;

        const isFinished = day >= char.activeExpedition.totalDays;
        if (isFinished || stopExpedition) {
          const finalEmbed = {
            title: stopExpedition ? `⚔️ Expedição Interrompida!` : `🏆 Expedição Concluída!`,
            color: stopExpedition ? 0xef4444 : 0x10b981,
            description: char.activeExpedition.log + (isFinished ? `\n✅ **Exploração finalizada.**` : `\n❌ **Fuga necessária.**`),
            footer: { text: `Rações: ${char.inventory?.rations} | Corrupção: ${char.corruption.temp}/${char.corruption.perm}` }
          };
          char.activeExpedition = undefined;
          await interaction.update({ embeds: [finalEmbed], components: [] });
        } else {
          const embed = {
            title: `🧭 Menu de Expedição: ${location.name}`,
            color: 0x10b981,
            description: char.activeExpedition.log,
            fields: [
              { name: '🕒 Progresso', value: `${day}/${char.activeExpedition.totalDays} dias`, inline: true },
              { name: '🍞 Suprimentos', value: `${char.inventory?.rations} rações`, inline: true }
            ]
          };

          const startBtn = new ButtonBuilder()
            .setCustomId('start_expedition_turn')
            .setLabel('Próximo Turno')
            .setStyle(ButtonStyle.Primary);

          const campBtn = new ButtonBuilder()
            .setCustomId('camp_rest')
            .setLabel('Acampar/Descansar')
            .setStyle(ButtonStyle.Secondary);

          const row = new ActionRowBuilder<ButtonBuilder>().addComponents(startBtn, campBtn);
          await interaction.update({ embeds: [embed], components: [row] });
        }

      } else if (interaction.customId === 'camp_rest') {
        const char = getCharacter(interaction.user.id, interaction.user.username);
        let msg = "⛺ **Acampamento montado.** ";
        
        if (char.activeTravel?.pace === 'forced' || char.activeTravel?.pace === 'death') {
          msg += "A marcha forçada impede a recuperação natural.";
        } else if ((char.inventory?.starvationDays || 0) >= 5) {
          msg += "A privação de comida impede a recuperação natural.";
        } else {
          msg += "Vocês descansam e recuperam forças (Cura natural aplicada).";
          // Logic for natural healing would go here
        }

        await interaction.reply({ content: msg, ephemeral: true });

      } else if (interaction.customId.startsWith('social_challenge_')) {
        await interaction.reply({ content: "🎭 **Desafio Social Iniciado.** Role Persuasive ou Cunning para influenciar os nobres ou mercadores locais.", ephemeral: true });
      } else if (interaction.customId.startsWith('domain_management_')) {
        await interaction.reply({ content: "🏰 **Gestão de Domínio.** Você revisa suas propriedades, impostos e influência na cidade.", ephemeral: true });

      } else if (interaction.customId === 'view_inventory') {
        const char = getCharacter(interaction.user.id, interaction.user.username);
        const inv = char.inventory;
        const embed = {
          title: `🎒 Inventário de ${char.name}`,
          color: 0x2b2d31,
          fields: [
            { name: '🍞 Rações', value: `${inv?.rations || 0}`, inline: true },
            { name: '📜 Licença', value: inv?.hasLicense ? 'Sim' : 'Não', inline: true },
            { name: '🐎 Montaria', value: inv?.hasMount ? 'Sim' : 'Não', inline: true },
            { name: '💰 Dinheiro', value: `${char.money?.thaler || 0}T, ${char.money?.xelins || 0}X, ${char.money?.ortegs || 0}O`, inline: false }
          ]
        };
        await interaction.reply({ embeds: [embed], ephemeral: true });

      } else if (interaction.customId === 'apply_occupation_package') {
        const char = getCharacter(interaction.user.id, interaction.user.username);
        const archetype = archetypes.find(a => a.id === char.archetypeId);
        const occupation = archetype?.occupations.find(o => o.id === char.occupationId);
        
        if (occupation) {
          // Apply abilities
          for (const abilityName of occupation.suggestedAbilities) {
            const ability = abilities.find(a => a.name.toLowerCase() === abilityName.toLowerCase() || a.englishName?.toLowerCase() === abilityName.toLowerCase());
            if (ability && !char.learnedAbilities.some(a => a.id === ability.id)) {
              char.learnedAbilities.push({ id: ability.id, name: ability.name, level: 'Novato' });
            }
          }

          // Try to apply attribute recommendation
          const attrMatch = occupation.suggestedAttributes.match(/(\w+)\s+(\d+)/);
          if (attrMatch) {
            const attrNameMap: Record<string, keyof typeof char.attributes> = {
              'precisao': 'precisao', 'accurate': 'precisao',
              'astucia': 'astucia', 'cunning': 'astucia',
              'discricao': 'discricao', 'discreet': 'discricao',
              'persuasao': 'persuasao', 'persuasive': 'persuasao',
              'agilidade': 'agilidade', 'quick': 'agilidade',
              'resolucao': 'resolucao', 'resolute': 'resolucao',
              'forca': 'forca', 'strong': 'forca',
              'vigilancia': 'vigilancia', 'vigilant': 'vigilancia'
            };
            const rawName = attrMatch[1].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const attrKey = attrNameMap[rawName];
            const attrValue = parseInt(attrMatch[2], 10);
            if (attrKey) {
              char.attributes[attrKey] = attrValue;
            }
          }
        }

        await goToStep2(interaction);
      } else if (interaction.customId === 'go_to_race') {
        await goToStep2(interaction);
      } else if (interaction.customId === 'go_to_attributes') {
        const char = getCharacter(interaction.user.id, interaction.user.username);
        await goToStep3(interaction, char);
      } else if (interaction.customId === 'set_standard_attributes') {
        const char = getCharacter(interaction.user.id, interaction.user.username);
        char.attributes = {
          precisao: 10, astucia: 10, discricao: 9, persuasao: 5,
          agilidade: 11, resolucao: 13, forca: 15, vigilancia: 7
        };
        await goToStep5(interaction, char);
      } else if (interaction.customId === 'custom_attributes') {
        const modal = new ModalBuilder()
          .setCustomId('modal_attributes')
          .setTitle('Passo 3: Atributos (80 pontos)');
        
        const input = new TextInputBuilder()
          .setCustomId('attr_input')
          .setLabel('Distribua 80 pontos (ex: 15,13,11,10,10,9,7,5)')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('Precisão, Astúcia, Discrição, Persuasão, Agilidade, Resolução, Força, Vigilância')
          .setRequired(true);
        
        modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(input));
        await interaction.showModal(modal);
      } else if (interaction.customId === 'go_to_equipment') {
        const char = getCharacter(interaction.user.id, interaction.user.username);
        await goToStep6(interaction, char);
      } else if (interaction.customId === 'go_to_shadow') {
        const char = getCharacter(interaction.user.id, interaction.user.username);
        await goToStep7(interaction, char);
      } else if (interaction.customId.startsWith('roll_')) {
        const parts = interaction.customId.split('_');
        const attrKey = parts[1] as keyof Character['attributes'];
        const targetUserId = parts[2];
        
        const char = characters.get(targetUserId);
        if (!char) {
          await interaction.reply({ content: 'Ficha não encontrada.', ephemeral: true });
          return;
        }

        const attrValue = char.attributes[attrKey];
        const roll = Math.floor(Math.random() * 20) + 1;
        const success = roll <= attrValue;
        
        const attrNames: Record<string, string> = {
          precisao: 'Accurate', astucia: 'Cunning', discricao: 'Discreet', persuasao: 'Persuasive',
          agilidade: 'Quick', resolucao: 'Resolute', forca: 'Strong', vigilancia: 'Vigilant'
        };

        const embed = {
          title: `🎲 Teste de ${attrNames[attrKey]}`,
          color: success ? 0x10b981 : 0xef4444,
          description: `**Resultado:** ${roll} (Alvo: ${attrValue})\n**Status:** ${success ? '✅ Sucesso' : '❌ Falha'}`,
          footer: { text: `Personagem: ${char.name}` }
        };

        await interaction.reply({ embeds: [embed] });
      }
      return;
    }

    if (!interaction.isChatInputCommand()) return;

    const userId = interaction.user.id;
    const userName = interaction.user.username;

    if (interaction.commandName === 'registrar') {
      const modal = new ModalBuilder()
        .setCustomId('registrar_modal')
        .setTitle('Registrar Personagem');

      const dadosInput = new TextInputBuilder()
        .setCustomId('dados_input')
        .setLabel('Cole os dados do personagem aqui')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Nome: Kvarek\nAtributos: Acc 15, Cun 10, Dis 10, Per 5, Qui 7, Res 13, Str 11, Vig 9\nHabilidades: Golpe de Ferro (Novato)\nArma: Espada (1D8)\nArmadura: Cota de Malha (1D6, Impedimento 2)');

      const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(dadosInput);
      modal.addComponents(actionRow);

      await interaction.showModal(modal);
      return;
    }

    if (interaction.commandName === 'ficha') {
      const subcommand = interaction.options.getSubcommand();

      if (subcommand === 'assistente') {
        const archetypeSelect = new StringSelectMenuBuilder()
          .setCustomId('select_archetype')
          .setPlaceholder('Escolha seu Arquétipo')
          .addOptions(
            archetypes.map(a => ({
              label: a.name,
              description: a.description.substring(0, 100),
              value: a.id
            }))
          );

        const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(archetypeSelect);

        await interaction.reply({
          content: 'Bem-vindo ao Assistente de Criação de Personagem!\nPara começar, escolha seu Arquétipo:',
          components: [row],
          ephemeral: true
        });
        return;
      }

      if (subcommand === 'raca') {
        const raceId = interaction.options.getString('nome', true);
        const variant = interaction.options.getString('variante');
        const race = races.find(r => r.id === raceId);

        if (!race) {
          await interaction.reply({ content: 'Raça não encontrada.', ephemeral: true });
          return;
        }

        let char = characters.get(userId);
        if (!char) {
          char = {
            name: userName,
            attributes: { precisao: 10, astucia: 10, discricao: 10, persuasao: 10, agilidade: 10, resolucao: 10, forca: 10, vigilancia: 10 },
            armorMod: 0,
            corruption: { temp: 0, perm: 0 },
            xp: { total: 50, unspent: 50 },
            learnedAbilities: [],
            equipment: {}
          };
          characters.set(userId, char);
        }

        char.race = race.name;
        char.raceVariant = variant || undefined;

        // Apply traits as level 0 abilities
        for (const traitName of race.traits) {
          const trait = traits.find(t => t.name.toLowerCase() === traitName.toLowerCase());
          if (trait && !char.learnedAbilities.some(a => a.id === trait.id)) {
            char.learnedAbilities.push({ id: trait.id, name: trait.name, level: 'Novato' }); // Using Novato as base level for traits
          }
        }

        let variantText = variant ? ` (${variant})` : '';
        await interaction.reply({ content: `Raça definida como **${race.name}**${variantText}!\nTraços raciais adicionados: ${race.traits.join(', ')}.`, ephemeral: true });
        return;
      }

      if (subcommand === 'criar') {
        const existingChar = characters.get(userId);
        const char: Character = {
          name: userName,
          attributes: {
            precisao: interaction.options.getInteger('precisao', true),
            astucia: interaction.options.getInteger('astucia', true),
            discricao: interaction.options.getInteger('discricao', true),
            persuasao: interaction.options.getInteger('persuasao', true),
            agilidade: interaction.options.getInteger('agilidade', true),
            resolucao: interaction.options.getInteger('resolucao', true),
            forca: interaction.options.getInteger('forca', true),
            vigilancia: interaction.options.getInteger('vigilancia', true),
          },
          armorMod: interaction.options.getInteger('armadura') || 0,
          corruption: existingChar ? existingChar.corruption : { temp: 0, perm: 0 },
          xp: existingChar ? existingChar.xp : { total: 50, unspent: 50 },
          learnedAbilities: existingChar ? existingChar.learnedAbilities : [],
        };

        characters.set(userId, char);

        const toughness = Math.max(char.attributes.forca, 10);
        const painThreshold = Math.ceil(char.attributes.forca / 2);
        const defense = char.attributes.agilidade + char.armorMod;
        const corruptionThreshold = Math.ceil(char.attributes.resolucao / 2);

        const embeds = [
          {
            title: `📜 Ficha de ${userName} Criada/Atualizada!`,
            color: 0x000080, // Navy Blue
            description: `A jornada em Davokar começa agora.`
          },
          {
            title: `📊 Atributos`,
            color: 0xd4af37, // Gold
            fields: [
              { name: '⚔️ Accurate', value: `${char.attributes.precisao}`, inline: true },
              { name: '🧠 Cunning', value: `${char.attributes.astucia}`, inline: true },
              { name: '🌿 Vigilant', value: `${char.attributes.vigilancia}`, inline: true },
              { name: '🛡️ Strong', value: `${char.attributes.forca}`, inline: true },
              { name: '⚡ Quick', value: `${char.attributes.agilidade}`, inline: true },
              { name: '🕯️ Resolute', value: `${char.attributes.resolucao}`, inline: true },
              { name: '🎭 Persuasive', value: `${char.attributes.persuasao}`, inline: true },
              { name: '👣 Discreet', value: `${char.attributes.discricao}`, inline: true }
            ]
          },
          {
            title: `🛡️ Status & Corrupção`,
            color: 0x000000, // Black
            fields: [
              { name: 'Resistência', value: `${toughness}`, inline: true },
              { name: 'Limiar de Dor', value: `${painThreshold}`, inline: true },
              { name: 'Defesa', value: `${defense}`, inline: true },
              { name: 'Corrupção', value: `Temp: ${char.corruption.temp} | Perm: ${char.corruption.perm}\nTotal: ${char.corruption.temp + char.corruption.perm} / ${corruptionThreshold}`, inline: false }
            ]
          },
          {
            title: `⚔️ Habilidades & XP`,
            color: 0x808080, // Gray
            fields: [
              { name: 'XP Disponível', value: `${char.xp.unspent} / ${char.xp.total}`, inline: true },
              { name: 'Habilidades', value: char.learnedAbilities.length > 0 ? char.learnedAbilities.map(a => `• ${a.name} (${a.level})`).join('\n') : 'Nenhuma aprendida.', inline: false }
            ]
          }
        ];

        const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder().setCustomId(`roll_precisao_${userId}`).setLabel('Accurate').setEmoji('⚔️').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId(`roll_astucia_${userId}`).setLabel('Cunning').setEmoji('🧠').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId(`roll_vigilancia_${userId}`).setLabel('Vigilant').setEmoji('🌿').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId(`roll_forca_${userId}`).setLabel('Strong').setEmoji('🛡️').setStyle(ButtonStyle.Secondary)
        );

        const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder().setCustomId(`roll_agilidade_${userId}`).setLabel('Quick').setEmoji('⚡').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId(`roll_resolucao_${userId}`).setLabel('Resolute').setEmoji('🕯️').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId(`roll_persuasao_${userId}`).setLabel('Persuasive').setEmoji('🎭').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId(`roll_discricao_${userId}`).setLabel('Discreet').setEmoji('👣').setStyle(ButtonStyle.Secondary)
        );

        await interaction.reply({
          embeds: embeds,
          components: [row1, row2]
        });
      } else if (subcommand === 'ver') {
        const char = characters.get(userId);
        if (!char) {
          await interaction.reply({ content: 'Você ainda não tem uma ficha. Use `/ficha criar` para fazer a sua!', ephemeral: true });
          return;
        }

        const toughness = Math.max(char.attributes.forca, 10);
        const painThreshold = Math.ceil(char.attributes.forca / 2);
        const defense = char.attributes.agilidade + char.armorMod;
        const corruptionThreshold = Math.ceil(char.attributes.resolucao / 2);

        let raceText = char.race ? `**Raça:** ${char.race}${char.raceVariant ? ` (${char.raceVariant})` : ''}` : '';
        let occupationText = char.occupationId ? `\n**Ocupação:** ${char.occupationId.charAt(0).toUpperCase() + char.occupationId.slice(1)}` : '';
        let shadowText = char.shadow ? `\n**Sombra:** ${char.shadow}` : '';
        
        const activeStatuses = [];
        if (char.status?.isFurious) activeStatuses.push('🔥 Fúria');
        if (char.status?.isTransformed) activeStatuses.push('🐾 Transformado');
        if (char.status?.witchSightActive) activeStatuses.push('👁️ Visão de Bruxo');
        if (char.status?.poisonApplied) activeStatuses.push('🧪 Veneno Aplicado');
        
        const statusText = activeStatuses.length > 0 ? `\n**Status Ativo:** ${activeStatuses.join(', ')}` : '';
        const moneyText = char.money ? `\n💰 **Dinheiro:** ${char.money.thaler || 0} Thaler, ${char.money.xelins || 0} Xelins, ${char.money.ortegs || 0} Ortegs` : '';
        const location = locations.find(l => l.id === char.currentLocation) || locations[0];
        const locationText = `\n📍 **Localização:** ${location.name}`;

        const embeds = [
          {
            title: `📜 Ficha de ${char.name}`,
            color: 0x000080, // Navy Blue
            description: `${raceText}${occupationText}${shadowText}${statusText}${moneyText}${locationText}`
          },
          {
            title: `📊 Atributos`,
            color: 0xd4af37, // Gold
            fields: [
              { name: '⚔️ Accurate', value: `${char.attributes.precisao}`, inline: true },
              { name: '🧠 Cunning', value: `${char.attributes.astucia}`, inline: true },
              { name: '🌿 Vigilant', value: `${char.attributes.vigilancia}`, inline: true },
              { name: '🛡️ Strong', value: `${char.attributes.forca}`, inline: true },
              { name: '⚡ Quick', value: `${char.attributes.agilidade}`, inline: true },
              { name: '🕯️ Resolute', value: `${char.attributes.resolucao}`, inline: true },
              { name: '🎭 Persuasive', value: `${char.attributes.persuasao}`, inline: true },
              { name: '👣 Discreet', value: `${char.attributes.discricao}`, inline: true }
            ]
          },
          {
            title: `🛡️ Status & Corrupção`,
            color: 0x000000, // Black
            fields: [
              { name: 'Resistência', value: `${toughness}`, inline: true },
              { name: 'Limiar de Dor', value: `${painThreshold}`, inline: true },
              { name: 'Defesa', value: `${defense} *(Agilidade ${char.attributes.agilidade} + Armadura ${char.armorMod})*`, inline: true },
              { name: 'Corrupção', value: `Temp: ${char.corruption.temp} | Perm: ${char.corruption.perm}\nTotal: ${char.corruption.temp + char.corruption.perm} / ${corruptionThreshold}`, inline: false }
            ]
          },
          {
            title: `⚔️ Habilidades & XP`,
            color: 0x808080, // Gray
            fields: [
              { name: 'XP Disponível', value: `${char.xp.unspent} / ${char.xp.total}`, inline: true },
              { name: 'Habilidades', value: char.learnedAbilities.length > 0 ? char.learnedAbilities.map(a => `• ${a.name} (${a.level})`).join('\n') : 'Nenhuma aprendida.', inline: false }
            ]
          }
        ];

        const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder().setCustomId(`roll_precisao_${userId}`).setLabel('Accurate').setEmoji('⚔️').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId(`roll_astucia_${userId}`).setLabel('Cunning').setEmoji('🧠').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId(`roll_vigilancia_${userId}`).setLabel('Vigilant').setEmoji('🌿').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId(`roll_forca_${userId}`).setLabel('Strong').setEmoji('🛡️').setStyle(ButtonStyle.Secondary)
        );

        const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder().setCustomId(`roll_agilidade_${userId}`).setLabel('Quick').setEmoji('⚡').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId(`roll_resolucao_${userId}`).setLabel('Resolute').setEmoji('🕯️').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId(`roll_persuasao_${userId}`).setLabel('Persuasive').setEmoji('🎭').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId(`roll_discricao_${userId}`).setLabel('Discreet').setEmoji('👣').setStyle(ButtonStyle.Secondary)
        );

        await interaction.reply({
          embeds: embeds,
          components: [row1, row2]
        });
      } else if (subcommand === 'aprender') {
        const char = characters.get(userId);
        if (!char) {
          await interaction.reply({ content: 'Você precisa de uma ficha primeiro!', ephemeral: true });
          return;
        }

        const categoria = interaction.options.getString('categoria', true);
        const nome = interaction.options.getString('nome', true);
        const nivel = interaction.options.getString('nivel', true) as 'Novato' | 'Adepto' | 'Mestre';

        const xpCosts = { 'Novato': 10, 'Adepto': 20, 'Mestre': 30 };
        const cost = xpCosts[nivel];

        if (char.xp.unspent < cost) {
          await interaction.reply({ content: `Você não tem XP suficiente! (Necessário: ${cost}, Disponível: ${char.xp.unspent})`, ephemeral: true });
          return;
        }

        // Find ability in the correct category
        let ability;
        if (categoria === 'Traço') ability = traits.find(t => t.id === nome || t.name === nome);
        else if (categoria === 'Poder') ability = powers.find(p => p.id === nome || p.name === nome);
        else if (categoria === 'Ritual') ability = powers.find(p => p.id === nome || p.name === nome); // Rituais are in powers
        else ability = abilities.find(a => a.id === nome || a.name === nome);

        if (!ability) {
          await interaction.reply({ content: `${categoria} não encontrado(a).`, ephemeral: true });
          return;
        }

        // Check if already learned
        const existing = char.learnedAbilities.find(a => a.id === ability.id);
        if (existing) {
          if (existing.level === nivel) {
            await interaction.reply({ content: `Você já possui ${ability.name} no nível ${nivel}.`, ephemeral: true });
            return;
          }
          existing.level = nivel;
        } else {
          char.learnedAbilities.push({ id: ability.id, name: ability.name, level: nivel });
        }

        char.xp.unspent -= cost;
        await interaction.reply({ content: `✨ **${char.name}** aprendeu/melhorou **${ability.name}** para **${nivel}**! (Gasto: ${cost} XP)` });
      }
    } else if (interaction.commandName === 'golpear') {
      const char = characters.get(userId);
      if (!char) {
        await interaction.reply({ content: 'Você precisa de uma ficha primeiro!', ephemeral: true });
        return;
      }
      // Simplified attack: uses the equipped weapon or a default 1d8
      const weapon = char.equipment?.weapon || { name: 'Punhos', damage: '1d4', qualities: ['Short'] };
      const attrValue = char.attributes.precisao;
      const roll = Math.floor(Math.random() * 20) + 1;
      const success = roll <= attrValue;
      const damage = success ? parseAndRoll(weapon.damage || '1d8').total : 0;

      const embed = {
        title: `⚔️ ${char.name} golpeia com ${weapon.name}`,
        color: success ? 0x10b981 : 0xef4444,
        description: `**Teste:** ${roll} (Alvo: ${attrValue})\n**Resultado:** ${success ? `✅ Sucesso! Dano: **${damage}**` : '❌ Falha'}`,
        footer: { text: `Arma: ${weapon.name} | Dano: ${weapon.damage}` }
      };
      await interaction.reply({ embeds: [embed] });

    } else if (interaction.commandName === 'poder') {
      const char = characters.get(userId);
      if (!char) {
        await interaction.reply({ content: 'Você precisa de uma ficha primeiro!', ephemeral: true });
        return;
      }
      const powerName = interaction.options.getString('nome', true);
      const power = powers.find(p => p.id === powerName || p.name.toLowerCase() === powerName.toLowerCase());
      
      if (!power) {
        await interaction.reply({ content: 'Poder não encontrado.', ephemeral: true });
        return;
      }

      // Logic similar to 'conjurar'
      const hasTradition = char.learnedAbilities.some(a => 
        ['teurgia', 'bruxaria', 'ordo_magica', 'feiticaria', 'simbolismo', 'magia_de_cajado', 'canto_dos_trolls'].includes(a.id)
      );
      let corruptionRoll = hasTradition ? { total: 1 } : parseAndRoll('1d4');
      char.corruption.temp += corruptionRoll.total;

      const embed = {
        title: `✨ ${char.name} usa ${power.name}`,
        color: 0x8b5cf6,
        description: `**Efeito:** ${power.test}\n**Corrupção:** +${corruptionRoll.total} Temp\n**Total:** ${char.corruption.temp + char.corruption.perm} / ${Math.ceil(char.attributes.resolucao / 2)} (Limiar)`,
        fields: [{ name: 'Duração', value: power.duration, inline: true }]
      };
      await interaction.reply({ embeds: [embed] });

    } else if (['avancar', 'retirar', 'erguer', 'visar', 'cegar', 'desengajar', 'flanquear', 'surpreender', 'vantagem'].includes(interaction.commandName)) {
      const char = characters.get(userId);
      const actionNames: Record<string, string> = {
        avancar: 'Avançar', retirar: 'Retirar', erguer: 'Erguer-se', visar: 'Visar',
        cegar: 'Cegar', desengajar: 'Desengajar', flanquear: 'Flanquear', surpreender: 'Surpreender', vantagem: 'Vantagem'
      };
      await interaction.reply({ content: `🎭 **${char?.name || userName}** realiza a ação: **${actionNames[interaction.commandName]}**.` });

    } else if (interaction.commandName === 'capitulo') {
      const char = characters.get(userId);
      if (!char) {
        await interaction.reply({ content: 'Você precisa de uma ficha primeiro!', ephemeral: true });
        return;
      }

      if (!char.chapter) {
        // Generate new Chapter
        const primary = primaryBlocks[Math.floor(Math.random() * primaryBlocks.length)];
        const history = [];
        for (let i = 0; i < Math.floor(Math.random() * 2) + 1; i++) {
          history.push(historyMarcos[Math.floor(Math.random() * historyMarcos.length)]);
        }
        const culture = cultures[Math.floor(Math.random() * cultures.length)];
        
        char.chapter = {
          currentDay: 1,
          theme: primary.theme,
          conflict: primary.conflict,
          description: primary.description,
          tone: primary.tone,
          history: history,
          nature: { resources: "Rico", corruption: "1D4-1D6" },
          culture: culture,
          npcs: [],
          journal: [`Dia 1: O Capítulo se inicia sob o tema ${primary.theme}.`]
        };

        const embed = {
          title: `🌟 Novo Capítulo Iniciado: ${char.name}`,
          color: 0xdaa520,
          description: `**Tema:** ${char.chapter.theme}\n**Conflito Principal:** ${char.chapter.conflict}\n**Atmosfera:** ${char.chapter.tone}\n\n*${char.chapter.description}*\n\n**Cultura Dominante:** ${char.chapter.culture}\n**Marcos Históricos:** ${char.chapter.history.join(', ')}`,
          footer: { text: `Dia 1 de 365` }
        };
        await interaction.reply({ embeds: [embed] });
      } else {
        // View current Chapter
        const embed = {
          title: `📖 Capítulo de ${char.name} (Dia ${char.chapter.currentDay}/365)`,
          color: 0xdaa520,
          description: `*${char.chapter.description}*`,
          fields: [
            { name: 'Tema', value: char.chapter.theme, inline: true },
            { name: 'Conflito', value: char.chapter.conflict, inline: true },
            { name: 'Atmosfera', value: char.chapter.tone, inline: true },
            { name: 'Cultura', value: char.chapter.culture, inline: true },
            { name: 'Diário Recente', value: char.chapter.journal.slice(-5).join('\n') || 'Nenhum.', inline: false }
          ]
        };

        const location = locations.find(l => l.id === char.currentLocation);
        const isCity = location?.id === 'yndaros' || location?.id === 'thistle_hold';

        if (isCity) {
          const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId(`social_challenge_${userId}`).setLabel('Desafio Social').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`domain_management_${userId}`).setLabel('Gestão de Domínio').setStyle(ButtonStyle.Secondary)
          );
          await interaction.reply({ embeds: [embed], components: [row] });
        } else {
          await interaction.reply({ embeds: [embed] });
        }
      }

    } else if (interaction.commandName === 'oraculo') {
      const roll = Math.floor(Math.random() * 20) + 1;
      const answer = oracleTable.find(a => roll <= a.max) || oracleTable[oracleTable.length - 1];
      
      const embed = {
        title: `🔮 O Oráculo Responde`,
        color: 0x8b5cf6,
        description: `**Pergunta:** ${interaction.options.getString('pergunta') || 'O destino reserva algo?'}\n**Resultado:** ${roll}\n**Resposta:** **${answer.text}**`,
        footer: { text: roll >= 21 ? "A Corrupção do Mundo aumenta em 1." : "" }
      };
      await interaction.reply({ embeds: [embed] });

    } else if (interaction.commandName === 'prompt') {
      const p1 = creativePrompts.part1[Math.floor(Math.random() * 8)];
      const p2 = creativePrompts.part2[Math.floor(Math.random() * 8)];
      const p3 = creativePrompts.part3[Math.floor(Math.random() * 8)];
      const shadow = creativePrompts.shadow[Math.floor(Math.random() * 8)];
      
      const embed = {
        title: `🎭 Prompt Criativo`,
        color: 0x10b981,
        description: `**Ação:** ${p1} ${p2}\n**Foco:** ${p3}\n**Sombra Sugerida:** ${shadow}`,
        footer: { text: "Use para inspirar a narração da cena." }
      };
      await interaction.reply({ embeds: [embed] });

    } else if (interaction.commandName === 'bloquear') {
      const char = characters.get(userId);
      if (!char) return;
      const defense = char.attributes.agilidade + char.armorMod;
      const roll = Math.floor(Math.random() * 20) + 1;
      const success = roll <= defense;

      const embed = {
        title: `🛡️ ${char.name} bloqueia!`,
        color: success ? 0x3b82f6 : 0xf59e0b,
        description: `**Teste:** ${roll} (Alvo: ${defense})\n**Resultado:** ${success ? '✅ Bloqueado!' : '❌ Atingido!'}`,
      };
      await interaction.reply({ embeds: [embed] });

    } else if (interaction.commandName === 'contra') {
      const char = characters.get(userId);
      if (!char) return;
      const roll = Math.floor(Math.random() * 20) + 1;
      const success = roll <= char.attributes.precisao;
      await interaction.reply({ content: `⚔️ **${char.name}** tenta um **Contra-Ataque**! (Teste: ${roll} vs ${char.attributes.precisao}) - ${success ? '✅ Sucesso!' : '❌ Falha'}` });

    } else if (interaction.commandName === 'ferir') {
      const char = characters.get(userId);
      if (!char) return;
      const valor = interaction.options.getInteger('valor', true);
      // Simplified: just a message for now, or update toughness if we had a current value
      await interaction.reply({ content: `💥 **${char.name}** sofreu **${valor}** de dano!` });

    } else if (interaction.commandName === 'estado') {
      const char = characters.get(userId);
      if (!char) return;
      const toughness = Math.max(char.attributes.forca, 10);
      const corruptionThreshold = Math.ceil(char.attributes.resolucao / 2);
      const embed = {
        title: `🌡️ Estado de ${char.name}`,
        color: 0x2b2d31,
        fields: [
          { name: 'Toughness', value: `${toughness}`, inline: true },
          { name: 'Corrupção', value: `${char.corruption.temp + char.corruption.perm} / ${corruptionThreshold}`, inline: true },
          { name: 'Sombra', value: char.shadow || 'Não definida', inline: false }
        ]
      };
      await interaction.reply({ embeds: [embed] });

    } else if (interaction.commandName === 'agonizar') {
      await interaction.reply({ content: '💀 Você caiu! Entre em estado de morte e prepare-se para os testes de sorte.' });

    } else if (interaction.commandName === 'sorte') {
      const roll = Math.floor(Math.random() * 20) + 1;
      let msg = '';
      if (roll === 1) msg = '🌟 **Milagre!** Você se estabiliza com 1 de Toughness.';
      else if (roll <= 10) msg = '❤️ Você está estável, mas inconsciente.';
      else if (roll <= 19) msg = '🩸 Sua condição piora...';
      else msg = '💀 **Morte.** Sua jornada termina aqui.';
      await interaction.reply({ content: `🎲 **Teste de Sorte:** ${roll}\n${msg}` });

    } else if (interaction.commandName === 'curar') {
      const valor = interaction.options.getInteger('valor', true);
      await interaction.reply({ content: `❤️‍🩹 **Cura aplicada:** +${valor} de Toughness.` });

    } else if (interaction.commandName === 'elixir') {
      await interaction.reply({ content: '🧪 Você usa um elixir e sente suas forças retornarem.' });

    } else if (interaction.commandName === 'iniciar') {
      const char = characters.get(userId);
      const initiative = char ? char.attributes.agilidade : 10;
      await interaction.reply({ content: `🧭 **Combate Iniciado!** Sua iniciativa é **${initiative}**.` });

    } else if (interaction.commandName === 'rodada') {
      await interaction.reply({ content: '⏳ Próxima rodada! O tempo urge em Davokar.' });

    } else if (interaction.commandName === 'agir') {
      const char = characters.get(userId);
      if (!char) return;
      const attrKey = interaction.options.getString('atributo', true) as keyof Character['attributes'];
      const attrValue = char.attributes[attrKey];
      const roll = Math.floor(Math.random() * 20) + 1;
      const success = roll <= attrValue;
      await interaction.reply({ content: `🎲 **Teste de ${attrKey}:** ${roll} vs ${attrValue} - ${success ? '✅ Sucesso!' : '❌ Falha'}` });

    } else if (interaction.commandName === 'dialogar') {
      const char = characters.get(userId);
      const attr = char?.attributes.persuasao || 10;
      const roll = Math.floor(Math.random() * 20) + 1;
      const success = roll <= attr;
      await interaction.reply({ content: `🎭 **Cena Social:** ${success ? '✅ Você convence seu interlocutor.' : '❌ Suas palavras caem em ouvidos moucos.'} (Teste: ${roll} vs ${attr})` });

    } else if (interaction.commandName === 'xp') {
      const char = characters.get(userId);
      if (!char) return;
      await interaction.reply({ content: `⭐ **Experiência de ${char.name}:** ${char.xp.unspent} disponíveis / ${char.xp.total} totais.` });

    } else if (interaction.commandName === 'treinar') {
      const char = characters.get(userId);
      if (!char) return;
      const abilityName = interaction.options.getString('nome', true);
      await interaction.reply({ content: `📖 **${char.name}** está treinando a habilidade: **${abilityName}**. (Use \`/habilidade aprender\` para confirmar o gasto de XP)` });

    } else if (interaction.commandName === 'viajar') {
      const char = characters.get(userId);
      if (!char) {
        await interaction.reply({ content: 'Você precisa de uma ficha primeiro!', ephemeral: true });
        return;
      }

      const currentLocation = locations.find(l => l.id === char.currentLocation) || locations[0];
      const availableDestinations = locations.filter(l => currentLocation.destinations.some(d => d.id === l.id));

      if (availableDestinations.length === 0) {
        await interaction.reply({ content: 'Não há destinos conhecidos a partir daqui.', ephemeral: true });
        return;
      }

      const travelSelect = new StringSelectMenuBuilder()
        .setCustomId('select_travel')
        .setPlaceholder('Escolha seu destino')
        .addOptions(availableDestinations.map(d => {
          const destInfo = currentLocation.destinations.find(dest => dest.id === d.id);
          return {
            label: d.name,
            description: `${d.type} - ${destInfo?.distance}km`,
            value: d.id
          };
        }));

      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(travelSelect);

      await interaction.reply({
        content: `📍 Você está em **${currentLocation.name}** (${currentLocation.terrain}).\nPara onde deseja viajar?`,
        components: [row]
      });

    } else if (interaction.commandName === 'explorar') {
      const char = characters.get(userId);
      if (!char) {
        await interaction.reply({ content: 'Você precisa de uma ficha primeiro!', ephemeral: true });
        return;
      }

      const currentLocation = locations.find(l => l.id === char.currentLocation) || locations[0];

      if (currentLocation.options.length === 0) {
        await interaction.reply({ content: 'Não há nada de especial para explorar aqui no momento.', ephemeral: true });
        return;
      }

      const exploreSelect = new StringSelectMenuBuilder()
        .setCustomId('select_explore')
        .setPlaceholder('O que deseja fazer?')
        .addOptions(currentLocation.options.map(o => ({
          label: o,
          value: o
        })));

      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(exploreSelect);

      await interaction.reply({
        content: `🔍 Explorando **${currentLocation.name}**...\n${currentLocation.description}\n\nO que deseja fazer?`,
        components: [row]
      });

    } else if (interaction.commandName === 'teste') {
      const char = characters.get(userId);
      if (!char) {
        await interaction.reply({ content: 'Você precisa criar uma ficha primeiro usando `/ficha criar`!', ephemeral: true });
        return;
      }

      const attrKey = interaction.options.getString('atributo', true) as keyof Character['attributes'];
      const attrValue = char.attributes[attrKey];
      const mod = interaction.options.getInteger('modificador') || 0;
      
      const roll = Math.floor(Math.random() * 20) + 1;
      const target = attrValue + mod;
      
      const isCritSuccess = roll === 1;
      const isCritFail = roll === 20;
      let isSuccess = false;
      
      if (isCritSuccess) isSuccess = true;
      else if (isCritFail) isSuccess = false;
      else isSuccess = roll <= target;

      let color = 0x2b2d31;
      let title = `Teste de ${attrKey.charAt(0).toUpperCase() + attrKey.slice(1)}`;
      let statusText = '';
      if (isCritSuccess) { color = 0x22c55e; title = 'Sucesso Crítico!'; statusText = 'Sucesso Crítico'; }
      else if (isCritFail) { color = 0xef4444; title = 'Falha Crítica!'; statusText = 'Falha Crítica'; }
      else if (isSuccess) { color = 0xeab308; title = 'Sucesso'; statusText = 'Sucesso'; }
      else { color = 0x78716c; title = 'Falha'; statusText = 'Falha'; }

      const embed = {
        title,
        color,
        description: `**Rolo de d20:** \`${roll}\`. ${statusText}! (Necessário \`${target}\` ou menos: ${attrValue} de Atributo ${mod >= 0 ? '+ ' : '- '}${Math.abs(mod)} de Modificador).`,
        author: { name: char.name }
      };

      await interaction.reply({ embeds: [embed] });
    } else if (interaction.commandName === 'roll') {
      const roll = Math.floor(Math.random() * 20) + 1;
      const isCritSuccess = roll === 1;
      const isCritFail = roll === 20;
      
      let color = 0x2b2d31;
      if (isCritSuccess) color = 0x22c55e;
      else if (isCritFail) color = 0xef4444;

      const embed = {
        title: 'Rolagem de d20',
        color,
        description: `**Resultado:** \`${roll}\``,
      };

      await interaction.reply({ embeds: [embed] });
    } else if (interaction.commandName === 'conjurar') {
      const char = characters.get(userId);
      if (!char) {
        await interaction.reply({ content: 'Você precisa criar uma ficha primeiro usando `/ficha criar`!', ephemeral: true });
        return;
      }

      const poderId = interaction.options.getString('poder', true);
      const poder = powers.find(p => p.id === poderId);
      if (!poder) {
        await interaction.reply({ content: 'Poder não encontrado.', ephemeral: true });
        return;
      }

      const hasTradition = char.learnedAbilities.some(a => 
        ['teurgia', 'bruxaria', 'ordo_magica', 'feiticaria', 'simbolismo', 'magia_de_cajado', 'canto_dos_trolls'].includes(a.id)
      );

      let corruptionRoll = hasTradition ? { total: 1, text: '1' } : parseAndRoll('1d4');
      
      // Theurge Logic: Automatic reduction
      if (char.occupationId === 'theurge' && corruptionRoll.total > 0) {
        corruptionRoll.total = 0;
        corruptionRoll.text = '0 (Teurgo)';
      }

      char.corruption.temp += corruptionRoll.total;

      const resolucao = char.attributes.resolucao;
      const limiar = Math.ceil(resolucao / 2);
      const total = char.corruption.temp + char.corruption.perm;
      
      let alertMsg = '';
      if (total >= resolucao) {
        alertMsg = '\n\n💀 **CORRUPÇÃO TOTAL!** Seu personagem foi consumido pela escuridão e se tornou uma Abominação! (Total >= Resolução)';
      } else if (total >= limiar) {
        alertMsg = '\n\n⚠️ **ESTIGMA ADQUIRIDO!** Sua corrupção total atingiu ou ultrapassou seu Limiar. Você deve escolher um Estigma (marca física/mística da corrupção).';
      }

      if (alertMsg) {
        try {
          await interaction.user.send(`**Aviso do Bot (Symbaroum):** ${alertMsg}`);
        } catch (e) {
          console.error('Não foi possível enviar DM para o usuário:', e);
        }
      }

      const embed = {
        title: `✨ ${char.name} conjura ${poder.name}`,
        color: 0x8b5cf6,
        description: `**Custo de Corrupção:** ${corruptionRoll.total} (${hasTradition ? 'Tradição Mística' : 'Sem Tradição'})\n**Corrupção Atual:** ${char.corruption.temp} Temp / ${char.corruption.perm} Perm (Total: ${total}/${resolucao})${alertMsg}`,
        fields: [
          { name: 'Teste', value: poder.test, inline: true },
          { name: 'Duração', value: poder.duration, inline: true }
        ],
        author: { name: char.name }
      };

      await interaction.reply({ embeds: [embed] });

    } else if (interaction.commandName === 'atacar') {
      const char = characters.get(userId);
      if (!char) {
        await interaction.reply({ content: 'Você precisa criar uma ficha primeiro usando `/ficha criar`!', ephemeral: true });
        return;
      }

      const armaId = interaction.options.getString('arma', true);
      const atributoInput = interaction.options.getString('atributo') || 'precisao';
      const modificador = interaction.options.getInteger('modificador') || 0;

      const arma = equipment.find(e => e.id === armaId);
      if (!arma) {
        await interaction.reply({ content: 'Arma não encontrada.', ephemeral: true });
        return;
      }

      let attrValue = char.attributes[atributoInput as keyof typeof char.attributes];
      let finalMod = modificador;
      let damageFormula = arma.damage || '1d4';
      const qualitiesApplied = [];

      // Berserker Logic
      if (char.status?.isFurious) {
        damageFormula += '+1d6';
        qualitiesApplied.push('Fúria (+1d6 Dano)');
      }

      // Duelist Logic (Twin Attack)
      const hasTwinAttack = char.learnedAbilities.some(a => a.id === 'twin_attack');
      
      if (arma.qualities.includes('Precise')) {
        finalMod += 1;
        qualitiesApplied.push('Precise (+1 Acerto)');
      }
      if (arma.qualities.includes('Deep Impact')) {
        damageFormula += '+1';
        qualitiesApplied.push('Deep Impact (+1 Dano)');
      }

      const targetNumber = attrValue + finalMod;
      const roll = Math.floor(Math.random() * 20) + 1;
      const isSuccess = roll <= targetNumber;
      const isCrit = roll === 1;
      const isFumble = roll === 20;

      let resultText = isCrit ? '**SUCESSO CRÍTICO!**' : isFumble ? '**FALHA DESASTROSA!**' : isSuccess ? '**SUCESSO**' : '**FALHA**';
      let color = isCrit ? 0x10b981 : isFumble ? 0xef4444 : isSuccess ? 0x3b82f6 : 0xf59e0b;

      const embed: any = {
        title: `⚔️ ${char.name} ataca com ${arma.name}`,
        color: color,
        fields: [
          { name: 'Teste', value: `Rolou **${roll}** (Alvo: ${targetNumber})`, inline: true },
          { name: 'Resultado', value: resultText, inline: true }
        ]
      };

      if (qualitiesApplied.length > 0) {
        embed.fields.push({ name: 'Qualidades', value: qualitiesApplied.join(', '), inline: false });
      }

      if (isSuccess && !isFumble) {
        const damageRoll = parseAndRoll(damageFormula);
        embed.fields.push({ name: 'Dano', value: `Rolou **${damageRoll.total}** (${damageFormula})`, inline: false });

        // Duelist Second Attack
        if (char.occupationId === 'duelist' && hasTwinAttack) {
          const secondRoll = Math.floor(Math.random() * 20) + 1;
          const secondSuccess = secondRoll <= targetNumber;
          const secondDamage = parseAndRoll(damageFormula);
          embed.fields.push({ 
            name: 'Segundo Ataque (Twin Attack)', 
            value: `Teste: **${secondRoll}** (${secondSuccess ? 'Sucesso' : 'Falha'})\nDano: **${secondSuccess ? secondDamage.total : 0}**`, 
            inline: false 
          });
        }
      }

      await interaction.reply({ embeds: [embed] });

    } else if (interaction.commandName === 'defender') {
      const char = characters.get(userId);
      if (!char) {
        await interaction.reply({ content: 'Você precisa criar uma ficha primeiro usando `/ficha criar`!', ephemeral: true });
        return;
      }

      const armaduraId = interaction.options.getString('armadura');
      const escudoId = interaction.options.getString('escudo');
      const atributoInput = interaction.options.getString('atributo') || 'agilidade';
      const modificador = interaction.options.getInteger('modificador') || 0;

      const armadura = armaduraId ? equipment.find(e => e.id === armaduraId) : null;
      const escudo = escudoId ? equipment.find(e => e.id === escudoId) : null;

      let attrValue = char.attributes[atributoInput as keyof typeof char.attributes];
      let finalMod = modificador;
      let protectionFormula = '';
      const itemsUsed = [];

      // Berserker Logic: Fixed Defense
      if (char.status?.isFurious) {
        attrValue = 5;
        finalMod = 0;
        itemsUsed.push('Fúria (Defesa Fixa 5)');
      }

      if (armadura) {
        let impediment = armadura.impediment || 0;
        // Knight Logic: Reduce impediment
        if (char.occupationId === 'knight' && impediment > 0) {
          impediment = Math.max(0, impediment - 1);
        }
        finalMod += impediment;
        protectionFormula = armadura.protection || '';
        itemsUsed.push(armadura.name);
      }
      if (escudo) {
        let shieldBonus = 1;
        // Knight Logic: Shield bonus +2
        if (char.occupationId === 'knight') {
          shieldBonus = 2;
        }
        finalMod += shieldBonus;
        itemsUsed.push(escudo.name);
      }

      const targetNumber = attrValue + finalMod;
      const roll = Math.floor(Math.random() * 20) + 1;
      const isSuccess = roll <= targetNumber;
      const isCrit = roll === 1;
      const isFumble = roll === 20;

      let resultText = isCrit ? '**ESQUIVA PERFEITA!**' : isFumble ? '**FALHA CRÍTICA!**' : isSuccess ? '**DEFENDEU!**' : '**FOI ATINGIDO!**';
      let color = isCrit ? 0x10b981 : isFumble ? 0xef4444 : isSuccess ? 0x3b82f6 : 0xf59e0b;

      const embed: any = {
        title: `🛡️ ${char.name} tenta se defender`,
        color: color,
        fields: [
          { name: 'Teste', value: `Rolou **${roll}** (Alvo: ${targetNumber})`, inline: true },
          { name: 'Resultado', value: resultText, inline: true }
        ]
      };

      if (itemsUsed.length > 0) {
        embed.fields.push({ name: 'Equipamento', value: itemsUsed.join(' + '), inline: false });
      }

      if (!isSuccess && !isFumble && protectionFormula) {
        const protRoll = parseAndRoll(protectionFormula);
        embed.fields.push({ name: 'Proteção', value: `Armadura absorveu **${protRoll.total}** de dano (${protectionFormula})`, inline: false });
      } else if (isFumble && protectionFormula) {
        embed.fields.push({ name: 'Proteção', value: `A armadura falhou ou foi ignorada!`, inline: false });
      }

      await interaction.reply({ embeds: [embed] });

    } else if (interaction.commandName === 'combate') {
      const subcommand = interaction.options.getSubcommand();

      if (subcommand === 'entrar') {
        const char = characters.get(userId);
        if (!char) {
          await interaction.reply({ content: 'Você precisa de uma ficha para entrar em combate!', ephemeral: true });
          return;
        }
        
        // Remove if already exists
        combatants = combatants.filter(c => c.id !== userId);
        combatants.push({
          id: userId,
          name: char.name,
          quick: char.attributes.agilidade,
          vigilant: char.attributes.vigilancia,
          isEnemy: false
        });

        await interaction.reply({ content: `**${char.name}** entrou no combate!`, ephemeral: false });

      } else if (subcommand === 'inimigo') {
        const nome = interaction.options.getString('nome', true);
        const agilidade = interaction.options.getInteger('agilidade', true);
        const vigilancia = interaction.options.getInteger('vigilancia', true);

        combatants.push({
          id: `enemy_${Date.now()}_${Math.random()}`,
          name: nome,
          quick: agilidade,
          vigilant: vigilancia,
          isEnemy: true
        });

        await interaction.reply({ content: `Inimigo **${nome}** adicionado ao combate!`, ephemeral: false });

      } else if (subcommand === 'iniciativa') {
        if (combatants.length === 0) {
          await interaction.reply({ content: 'Não há ninguém no combate atual.', ephemeral: true });
          return;
        }

        // Sort by Quick DESC, then Vigilant DESC
        const sorted = [...combatants].sort((a, b) => {
          if (b.quick !== a.quick) return b.quick - a.quick;
          return b.vigilant - a.vigilant;
        });

        const list = sorted.map((c, i) => {
          const icon = c.isEnemy ? '👹' : '🛡️';
          return `**${i + 1}.** ${icon} **${c.name}** (Agilidade: ${c.quick}, Vigilância: ${c.vigilant})`;
        }).join('\n');

        await interaction.reply({
          embeds: [{
            title: '⚔️ Ordem de Iniciativa',
            color: 0x991b1b,
            description: list
          }]
        });

      } else if (subcommand === 'limpar') {
        combatants = [];
        await interaction.reply({ content: 'O rastreador de combate foi limpo.', ephemeral: false });
      }
    } else if (interaction.commandName === 'corrupcao') {
      const char = characters.get(userId);
      if (!char) {
        await interaction.reply({ content: 'Você precisa criar uma ficha primeiro usando `/ficha criar`!', ephemeral: true });
        return;
      }

      const subcommand = interaction.options.getSubcommand();
      const resolucao = char.attributes.resolucao;
      const limiar = Math.ceil(resolucao / 2);

      if (subcommand === 'adicionar') {
        const tipo = interaction.options.getString('tipo', true) as 'temp' | 'perm';
        const valorStr = interaction.options.getString('valor', true);
        
        const rollResult = parseAndRoll(valorStr);
        const ganho = rollResult.total;

        char.corruption[tipo] += ganho;
        
        const total = char.corruption.temp + char.corruption.perm;
        
        let alertMsg = '';
        let color = 0x8b5cf6; // purple
        
        if (total >= resolucao) {
          alertMsg = '\n\n💀 **CORRUPÇÃO TOTAL!** Seu personagem foi consumido pela escuridão e se tornou uma Abominação! (Total >= Resolução)';
          color = 0x000000;
        } else if (total >= limiar) {
          alertMsg = '\n\n⚠️ **ESTIGMA ADQUIRIDO!** Sua corrupção total atingiu ou ultrapassou seu Limiar. Você deve escolher um Estigma (marca física/mística da corrupção).';
          color = 0xd946ef; // pink/magenta
        }

        if (alertMsg) {
          try {
            await interaction.user.send(`**Aviso do Bot (Symbaroum):** ${alertMsg}`);
          } catch (e) {
            console.error('Não foi possível enviar DM para o usuário:', e);
          }
        }

        const embed = {
          title: 'Corrupção Adquirida',
          color,
          description: `**Ganho:** ${rollResult.text} (${tipo === 'temp' ? 'Temporária' : 'Permanente'})\n\n**Corrupção Atual:**\nTemporária: ${char.corruption.temp}\nPermanente: ${char.corruption.perm}\n**Total: ${total}** / Limiar: ${limiar} (Máx: ${resolucao})${alertMsg}`,
          author: { name: char.name }
        };

        await interaction.reply({ embeds: [embed] });

      } else if (subcommand === 'limpar') {
        char.corruption.temp = 0;
        const total = char.corruption.perm;
        
        await interaction.reply({ 
          embeds: [{
            title: 'Fim da Cena',
            color: 0x22c55e,
            description: `A corrupção temporária de **${char.name}** foi dissipada.\n\n**Corrupção Atual:**\nTemporária: 0\nPermanente: ${char.corruption.perm}\n**Total: ${total}** / Limiar: ${limiar}`,
          }]
        });
      }
    } else if (interaction.commandName === 'habilidade') {
      const subcommand = interaction.options.getSubcommand();

      if (subcommand === 'lista') {
        const categories = [...new Set(abilities.map(a => a.category))];
        const fields = categories.map(cat => ({
          name: cat,
          value: abilities.filter(a => a.category === cat).map(a => `• ${a.name}`).join('\n'),
          inline: false
        }));

        await interaction.reply({
          embeds: [{
            title: '📚 Lista de Habilidades (Symbaroum)',
            color: 0x3b82f6,
            fields
          }]
        });
      } else if (subcommand === 'ver') {
        const habId = interaction.options.getString('nome', true);
        const hab = abilities.find(a => a.id === habId);

        if (!hab) {
          await interaction.reply({ content: 'Habilidade não encontrada.', ephemeral: true });
          return;
        }

        await interaction.reply({
          embeds: [{
            title: `📖 ${hab.name}`,
            color: 0x3b82f6,
            description: `**Categoria:** ${hab.category}`,
            fields: [
              { name: '🟢 Novato (10 XP)', value: hab.description_novice, inline: false },
              { name: '🟡 Adepto (20 XP)', value: hab.description_adequate, inline: false },
              { name: '🔴 Mestre (30 XP)', value: hab.description_master, inline: false }
            ]
          }]
        });
      } else if (subcommand === 'aprender') {
        const char = characters.get(userId);
        if (!char) {
          await interaction.reply({ content: 'Você precisa criar uma ficha primeiro usando `/ficha criar`!', ephemeral: true });
          return;
        }

        const categoria = interaction.options.getString('categoria', true);
        const habId = interaction.options.getString('nome', true);
        const nivel = interaction.options.getString('nivel', true) as 'Novato' | 'Adepto' | 'Mestre';
        const hab = abilities.find(a => a.id === habId && a.category === categoria);

        if (!hab) {
          await interaction.reply({ content: `${categoria} não encontrada: ${habId}.`, ephemeral: true });
          return;
        }

        const costMap = { 'Novato': 10, 'Adepto': 20, 'Mestre': 30 };
        const cost = costMap[nivel];

        const existingHabIndex = char.learnedAbilities.findIndex(a => a.id === habId);
        const existingHab = existingHabIndex >= 0 ? char.learnedAbilities[existingHabIndex] : null;

        // Validation logic
        if (existingHab && existingHab.level === nivel) {
          await interaction.reply({ content: `Você já possui **${hab.name}** no nível **${nivel}**!`, ephemeral: true });
          return;
        }
        if (existingHab && nivel === 'Novato') {
          await interaction.reply({ content: `Você já possui **${hab.name}** em um nível superior!`, ephemeral: true });
          return;
        }
        if (existingHab && existingHab.level === 'Mestre') {
          await interaction.reply({ content: `Sua habilidade **${hab.name}** já está no nível máximo!`, ephemeral: true });
          return;
        }
        if (!existingHab && (nivel === 'Adepto' || nivel === 'Mestre')) {
          await interaction.reply({ content: `Você precisa aprender o nível Novato de **${hab.name}** primeiro!`, ephemeral: true });
          return;
        }
        if (existingHab && existingHab.level === 'Novato' && nivel === 'Mestre') {
          await interaction.reply({ content: `Você precisa aprender o nível Adepto de **${hab.name}** antes de ir para Mestre!`, ephemeral: true });
          return;
        }

        if (char.xp.unspent < cost) {
          await interaction.reply({ content: `XP insuficiente! Você precisa de **${cost} XP** para aprender o nível **${nivel}**, mas só tem **${char.xp.unspent} XP**.`, ephemeral: true });
          return;
        }

        // Apply changes
        char.xp.unspent -= cost;
        if (existingHabIndex >= 0) {
          char.learnedAbilities[existingHabIndex].level = nivel;
        } else {
          char.learnedAbilities.push({ id: hab.id, name: hab.name, level: nivel });
        }

        await interaction.reply({
          embeds: [{
            title: '✨ Habilidade Aprendida!',
            color: 0xf59e0b,
            description: `**${char.name}** aprendeu **${hab.name}** no nível **${nivel}**!\n\n**Custo:** -${cost} XP\n**XP Restante:** ${char.xp.unspent} XP`,
          }]
        });
      }
    } else if (interaction.commandName === 'xp') {
      const char = characters.get(userId);
      if (!char) {
        await interaction.reply({ content: 'Você precisa criar uma ficha primeiro usando `/ficha criar`!', ephemeral: true });
        return;
      }

      const subcommand = interaction.options.getSubcommand();

      if (subcommand === 'adicionar') {
        const valor = interaction.options.getInteger('valor', true);
        char.xp.total += valor;
        char.xp.unspent += valor;

        await interaction.reply({
          embeds: [{
            title: '✨ Experiência Adquirida!',
            color: 0x10b981,
            description: `**${char.name}** ganhou **${valor} XP**!\n\n**XP Disponível:** ${char.xp.unspent}\n**XP Total:** ${char.xp.total}`,
          }]
        });
      } else if (subcommand === 'ver') {
        await interaction.reply({
          embeds: [{
            title: `✨ Experiência de ${char.name}`,
            color: 0x3b82f6,
            description: `**XP Disponível:** ${char.xp.unspent}\n**XP Total:** ${char.xp.total}`,
          }]
        });
      }
    } else if (interaction.commandName === 'traco') {
      const subcommand = interaction.options.getSubcommand();

      if (subcommand === 'lista') {
        const categories = [...new Set(traits.map(t => t.category))];
        const fields = categories.map(cat => ({
          name: cat,
          value: traits.filter(t => t.category === cat).map(t => `• ${t.name}`).join('\n'),
          inline: false
        }));

        await interaction.reply({
          embeds: [{
            title: '👹 Lista de Traços Monstruosos',
            color: 0xd946ef,
            fields
          }]
        });
      } else if (subcommand === 'ver') {
        const tracoId = interaction.options.getString('nome', true);
        const traco = traits.find(t => t.id === tracoId);

        if (!traco) {
          await interaction.reply({ content: 'Traço Monstruoso não encontrado.', ephemeral: true });
          return;
        }

        await interaction.reply({
          embeds: [{
            title: `👹 ${traco.name}`,
            color: 0xd946ef,
            description: `**Categoria:** ${traco.category}`,
            fields: [
              { name: 'Nível I', value: traco.description_I, inline: false },
              { name: 'Nível II', value: traco.description_II, inline: false },
              { name: 'Nível III', value: traco.description_III, inline: false }
            ]
          }]
        });
      }
    } else if (interaction.commandName === 'tradicao') {
      const subcommand = interaction.options.getSubcommand();

      if (subcommand === 'lista') {
        const categories = [...new Set(traditions.map(t => t.category))];
        const fields = categories.map(cat => ({
          name: cat,
          value: traditions.filter(t => t.category === cat).map(t => `• ${t.name}`).join('\n'),
          inline: false
        }));

        await interaction.reply({
          embeds: [{
            title: '🔮 Lista de Tradições Místicas',
            color: 0x8b5cf6,
            fields
          }]
        });
      } else if (subcommand === 'ver') {
        const tradicaoNome = interaction.options.getString('nome', true);
        const tradicao = traditions.find(t => t.name === tradicaoNome);

        if (!tradicao) {
          await interaction.reply({ content: 'Tradição Mística não encontrada.', ephemeral: true });
          return;
        }

        const fields = [
          { name: 'Perfil', value: tradicao.profile, inline: false },
          { name: 'Regra de Corrupção', value: tradicao.corruptionRule, inline: false }
        ];

        if (tradicao.levels) {
          if (tradicao.levels.novice) fields.push({ name: 'Nível Novato', value: tradicao.levels.novice, inline: false });
          if (tradicao.levels.adept) fields.push({ name: 'Nível Adepto', value: tradicao.levels.adept, inline: false });
          if (tradicao.levels.master) fields.push({ name: 'Nível Mestre', value: tradicao.levels.master, inline: false });
        }
        if (tradicao.mechanics) fields.push({ name: 'Mecânica', value: tradicao.mechanics, inline: false });
        if (tradicao.focus) fields.push({ name: 'Foco', value: tradicao.focus, inline: false });
        if (tradicao.risk) fields.push({ name: 'Risco', value: tradicao.risk, inline: false });

        await interaction.reply({
          embeds: [{
            title: `🔮 ${tradicao.name}`,
            color: 0x8b5cf6,
            description: `**Livro:** ${tradicao.category}`,
            fields
          }]
        });
      }
    } else if (interaction.commandName === 'poder') {
      const subcommand = interaction.options.getSubcommand();

      if (subcommand === 'lista') {
        const categories = [...new Set(powers.map(p => p.category))];
        const fields = categories.map(cat => ({
          name: cat,
          value: powers.filter(p => p.category === cat).map(p => `• ${p.name} (${p.englishName})`).join('\n'),
          inline: false
        }));

        await interaction.reply({
          embeds: [{
            title: '✨ Lista de Poderes Místicos e Rituais',
            color: 0x3b82f6,
            fields
          }]
        });
      } else if (subcommand === 'ver') {
        const poderId = interaction.options.getString('nome', true);
        const poder = powers.find(p => p.id === poderId);

        if (!poder) {
          await interaction.reply({ content: 'Poder Místico ou Ritual não encontrado.', ephemeral: true });
          return;
        }

        await interaction.reply({
          embeds: [{
            title: `✨ ${poder.name} (${poder.englishName})`,
            color: 0x3b82f6,
            description: `**Categoria:** ${poder.category}\n\n${poder.description}`,
            fields: [
              { name: 'Custo', value: poder.cost, inline: true },
              { name: 'Teste', value: poder.test, inline: true },
              { name: 'Duração', value: poder.duration, inline: true }
            ]
          }]
        });
      }
    } else if (interaction.commandName === 'equipamento') {
      const subcommand = interaction.options.getSubcommand();

      if (subcommand === 'lista') {
        const types = [...new Set(equipment.map(e => e.type))];
        const fields = types.map(type => ({
          name: type === 'Weapon' ? '⚔️ Armas' : type === 'Armor' ? '🛡️ Armaduras' : '🛡️ Escudos',
          value: equipment.filter(e => e.type === type).map(e => `• ${e.name} (${e.category})`).join('\n'),
          inline: false
        }));

        await interaction.reply({
          embeds: [{
            title: '🎒 Lista de Equipamentos',
            color: 0x10b981,
            fields
          }]
        });
      } else if (subcommand === 'ver') {
        const equipId = interaction.options.getString('nome', true);
        const equip = equipment.find(e => e.id === equipId);

        if (!equip) {
          await interaction.reply({ content: 'Equipamento não encontrado.', ephemeral: true });
          return;
        }

        const fields = [];
        if (equip.damage) fields.push({ name: 'Dano', value: equip.damage, inline: true });
        if (equip.protection) fields.push({ name: 'Proteção', value: equip.protection, inline: true });
        if (equip.impediment !== undefined) fields.push({ name: 'Impedimento', value: equip.impediment.toString(), inline: true });
        if (equip.qualities.length > 0) fields.push({ name: 'Qualidades', value: equip.qualities.join(', '), inline: true });
        if (equip.attribute) fields.push({ name: 'Atributo', value: equip.attribute, inline: true });

        await interaction.reply({
          embeds: [{
            title: `${equip.type === 'Weapon' ? '⚔️' : '🛡️'} ${equip.name}`,
            color: 0x10b981,
            description: `**Categoria:** ${equip.category}\n\n${equip.description}`,
            fields
          }]
        });
      }
    } else if (interaction.commandName === 'furia') {
      const char = characters.get(userId);
      if (!char) {
        await interaction.reply({ content: 'Você precisa de uma ficha para usar Fúria!', ephemeral: true });
        return;
      }
      if (!char.status) char.status = {};
      char.status.isFurious = !char.status.isFurious;
      await interaction.reply({ 
        content: char.status.isFurious ? `🔥 **${char.name}** entra em Fúria! (+1d6 Dano, Defesa Fixa 5)` : `❄️ **${char.name}** se acalma e sai da Fúria.`,
        ephemeral: false 
      });
    } else if (interaction.commandName === 'proteger') {
      const char = characters.get(userId);
      const aliado = interaction.options.getUser('aliado', true);
      if (!char) {
        await interaction.reply({ content: 'Você precisa de uma ficha para proteger alguém!', ephemeral: true });
        return;
      }
      await interaction.reply({ 
        content: `🛡️ **${char.name}** se coloca na frente de **${aliado.username}**! O próximo dano será transferido para o protetor.`,
        ephemeral: false 
      });
    } else if (interaction.commandName === 'veneno') {
      const char = characters.get(userId);
      if (!char) {
        await interaction.reply({ content: 'Você precisa de uma ficha para aplicar veneno!', ephemeral: true });
        return;
      }
      if (!char.status) char.status = {};
      char.status.poisonApplied = true;
      await interaction.reply({ 
        content: `🧪 **${char.name}** aplica veneno em sua arma! O próximo ataque bem-sucedido causará dano extra por turno.`,
        ephemeral: false 
      });
    } else if (interaction.commandName === 'explorar') {
      const char = characters.get(userId);
      if (!char) {
        await interaction.reply({ content: 'Você precisa de uma ficha para explorar!', ephemeral: true });
        return;
      }
      const roll = Math.floor(Math.random() * 20) + 1;
      const success = roll <= char.attributes.vigilancia;
      await interaction.reply({ 
        embeds: [{
          title: `🧭 ${char.name} explora o ambiente`,
          color: success ? 0x22c55e : 0x78716c,
          description: `**Teste de Vigilância:** ${roll} (Alvo: ${char.attributes.vigilancia})\n**Resultado:** ${success ? 'Sucesso! Você encontrou algo interessante ou evitou um perigo.' : 'Falha. O caminho parece incerto.'}`
        }]
      });
    } else if (interaction.commandName === 'bind') {
      const char = characters.get(userId);
      if (!char) {
        await interaction.reply({ content: 'Você precisa de uma ficha para vincular um artefato!', ephemeral: true });
        return;
      }
      await interaction.reply({ 
        content: `💎 **${char.name}** vincula sua alma a um artefato. O custo de corrupção para usar este item será reduzido.`,
        ephemeral: false 
      });
    } else if (interaction.commandName === 'transformar') {
      const char = characters.get(userId);
      if (!char) {
        await interaction.reply({ content: 'Você precisa de uma ficha para se transformar!', ephemeral: true });
        return;
      }
      if (!char.status) char.status = {};
      char.status.isTransformed = !char.status.isTransformed;
      await interaction.reply({ 
        content: char.status.isTransformed ? `🐾 **${char.name}** se transforma em uma fera selvagem! Seus atributos físicos foram alterados.` : `👤 **${char.name}** retorna à sua forma original.`,
        ephemeral: false 
      });
    } else if (interaction.commandName === 'witchsight') {
      const char = characters.get(userId);
      if (!char) {
        await interaction.reply({ content: 'Você precisa de uma ficha para usar Visão de Bruxo!', ephemeral: true });
        return;
      }
      if (!char.status) char.status = {};
      char.status.witchSightActive = !char.status.witchSightActive;
      await interaction.reply({ 
        content: char.status.witchSightActive ? `👁️ **${char.name}** ativa a Visão de Bruxo! As sombras ao redor se tornam visíveis.` : `👁️ **${char.name}** desativa a Visão de Bruxo.`,
        ephemeral: false 
      });
    } else if (interaction.commandName === 'beastlore') {
      const char = characters.get(userId);
      const inimigo = interaction.options.getString('inimigo', true);
      if (!char) {
        await interaction.reply({ content: 'Você precisa de uma ficha para usar Conhecimento de Feras!', ephemeral: true });
        return;
      }
      const roll = Math.floor(Math.random() * 20) + 1;
      const success = roll <= char.attributes.astucia;
      await interaction.reply({ 
        embeds: [{
          title: `📜 Conhecimento de Feras: ${inimigo}`,
          color: success ? 0x3b82f6 : 0x78716c,
          description: `**Teste de Astúcia:** ${roll} (Alvo: ${char.attributes.astucia})\n**Resultado:** ${success ? `Você identifica as fraquezas de **${inimigo}**! +1d4 de dano contra este alvo.` : `Você não reconhece as características específicas de **${inimigo}**.`}`
        }]
      });
    } else if (interaction.commandName === 'armadilha') {
      const char = characters.get(userId);
      if (!char) {
        await interaction.reply({ content: 'Você precisa de uma ficha para preparar armadilhas!', ephemeral: true });
        return;
      }
      await interaction.reply({ 
        content: `⚙️ **${char.name}** prepara uma armadilha mortal no terreno! O primeiro inimigo que passar por aqui sofrerá as consequências.`,
        ephemeral: false 
      });
    }
  });

  client.login(token).catch(err => {
    console.error('Failed to login to Discord:', err);
    botStatus = 'error';
  });
} else {
  console.log('DISCORD_TOKEN or DISCORD_CLIENT_ID not provided. Bot is offline.');
  botStatus = 'missing_credentials';
}

// Vite integration
async function startServer() {
  console.log('Starting server initialization...');
  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/bot-status', (req, res) => {
    console.log('GET /api/bot-status requested');
    console.log('Current botStatus:', botStatus);
    
    const charList = Array.from(characters.values()).map(c => ({
      name: c.name,
      race: c.race,
      occupation: c.occupationId
    }));

    res.json({ 
      status: botStatus,
      clientId: clientId || null,
      characterCount: characters.size,
      characters: charList.slice(0, 10), // Limit to 10 for dashboard
      commands: commandList
    });
  });

  app.get('/api/library', (req, res) => {
    console.log('GET /api/library requested');
    res.json({
      races,
      abilities,
      traits,
      traditions,
      powers,
      equipment,
      archetypes
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

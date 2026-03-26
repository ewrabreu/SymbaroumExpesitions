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
  creationStep?: number;
}
const characters = new Map<string, Character>();

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
      creationStep: 1
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
      .setName('registrar')
      .setDescription('Registra sua ficha colando o template de texto'),
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
      ),
    new SlashCommandBuilder()
      .setName('teste')
      .setDescription('Rola um teste usando um atributo da sua ficha')
      .addStringOption(option =>
        option.setName('atributo')
          .setDescription('Atributo a ser testado')
          .setRequired(true)
          .addChoices(
            { name: 'Precisão (Accurate)', value: 'precisao' },
            { name: 'Astúcia (Cunning)', value: 'astucia' },
            { name: 'Discrição (Discreet)', value: 'discricao' },
            { name: 'Persuasão (Persuasive)', value: 'persuasao' },
            { name: 'Agilidade (Quick)', value: 'agilidade' },
            { name: 'Resolução (Resolute)', value: 'resolucao' },
            { name: 'Força (Strong)', value: 'forca' },
            { name: 'Vigilância (Vigilant)', value: 'vigilancia' }
          ))
      .addIntegerOption(option =>
        option.setName('modificador')
          .setDescription('Modificador do oponente (ex: -2)')
          .setRequired(false)),
    new SlashCommandBuilder()
      .setName('roll')
      .setDescription('Rola um d20 puro'),
    new SlashCommandBuilder()
      .setName('conjurar')
      .setDescription('Conjura um poder místico ou ritual')
      .addStringOption(o => o.setName('poder').setDescription('Nome do poder').setRequired(true).setAutocomplete(true)),
    new SlashCommandBuilder()
      .setName('atacar')
      .setDescription('Realiza um ataque usando uma arma do inventário')
      .addStringOption(o => o.setName('arma').setDescription('Arma utilizada').setRequired(true).setAutocomplete(true))
      .addStringOption(o => o.setName('atributo').setDescription('Atributo base (padrão: Precisão)').setRequired(false).addChoices(
        { name: 'Precisão', value: 'precisao' },
        { name: 'Força (Punho de Ferro)', value: 'forca' },
        { name: 'Agilidade (Lâmina Curta)', value: 'agilidade' },
        { name: 'Astúcia (Tático)', value: 'astucia' },
        { name: 'Persuasão (Dominar/Finta)', value: 'persuasao' }
      ))
      .addIntegerOption(o => o.setName('modificador').setDescription('Modificador do inimigo (ex: -2)').setRequired(false)),
    new SlashCommandBuilder()
      .setName('defender')
      .setDescription('Realiza um teste de defesa')
      .addStringOption(o => o.setName('armadura').setDescription('Armadura utilizada').setRequired(false).setAutocomplete(true))
      .addStringOption(o => o.setName('escudo').setDescription('Escudo utilizado').setRequired(false).setAutocomplete(true))
      .addStringOption(o => o.setName('atributo').setDescription('Atributo base (padrão: Agilidade)').setRequired(false).addChoices(
        { name: 'Agilidade', value: 'agilidade' },
        { name: 'Vigilância (Sexto Sentido)', value: 'vigilancia' },
        { name: 'Força (Corpo de Ferro)', value: 'forca' },
        { name: 'Resolução (Magia de Cajado)', value: 'resolucao' }
      ))
      .addIntegerOption(o => o.setName('modificador').setDescription('Modificador do inimigo (ex: -2)').setRequired(false)),
    new SlashCommandBuilder()
      .setName('combate')
      .setDescription('Gerencia a ordem de iniciativa do combate')
      .addSubcommand(s => s.setName('entrar').setDescription('Adiciona seu personagem ao combate atual'))
      .addSubcommand(s => s.setName('inimigo')
        .setDescription('Adiciona um inimigo ao combate')
        .addStringOption(o => o.setName('nome').setDescription('Nome do inimigo').setRequired(true))
        .addIntegerOption(o => o.setName('agilidade').setDescription('Agilidade do inimigo').setRequired(true))
        .addIntegerOption(o => o.setName('vigilancia').setDescription('Vigilância do inimigo').setRequired(true))
      )
      .addSubcommand(s => s.setName('iniciativa').setDescription('Mostra a ordem de iniciativa atual'))
      .addSubcommand(s => s.setName('limpar').setDescription('Limpa o rastreador de combate')),
    new SlashCommandBuilder()
      .setName('corrupcao')
      .setDescription('Gerencia a corrupção do seu personagem')
      .addSubcommand(s => s.setName('adicionar')
        .setDescription('Adiciona corrupção (rola dados ou valor fixo)')
        .addStringOption(o => o.setName('tipo').setDescription('Temporária ou Permanente').setRequired(true).addChoices({name: 'Temporária', value: 'temp'}, {name: 'Permanente', value: 'perm'}))
        .addStringOption(o => o.setName('valor').setDescription('Valor ou rolagem (ex: 1, 1d4)').setRequired(true))
      )
      .addSubcommand(s => s.setName('limpar')
        .setDescription('Zera a corrupção temporária (fim da cena)')
      ),
    new SlashCommandBuilder()
      .setName('habilidade')
      .setDescription('Gerencia as habilidades do seu personagem')
      .addSubcommand(s => s.setName('aprender')
        .setDescription('Aprende ou melhora uma habilidade (custa XP)')
        .addStringOption(o => o.setName('categoria').setDescription('Categoria (Traço, Poder, Habilidade, Ritual)').setRequired(true).addChoices(
          { name: 'Traço', value: 'Traço' },
          { name: 'Poder', value: 'Poder' },
          { name: 'Habilidade', value: 'Habilidade' },
          { name: 'Ritual', value: 'Ritual' }
        ))
        .addStringOption(o => o.setName('nome').setDescription('Nome da habilidade').setRequired(true).setAutocomplete(true))
        .addStringOption(o => o.setName('nivel').setDescription('Nível da habilidade').setRequired(true).addChoices(
          { name: 'Novato (10 XP)', value: 'Novato' },
          { name: 'Adepto (20 XP)', value: 'Adepto' },
          { name: 'Mestre (30 XP)', value: 'Mestre' }
        ))
      )
      .addSubcommand(s => s.setName('ver')
        .setDescription('Ver detalhes de uma habilidade')
        .addStringOption(o => o.setName('nome').setDescription('Nome da habilidade').setRequired(true).setAutocomplete(true))
      )
      .addSubcommand(s => s.setName('lista')
        .setDescription('Lista todas as habilidades do jogo')
      ),
    new SlashCommandBuilder()
      .setName('xp')
      .setDescription('Gerencia seus Pontos de Experiência')
      .addSubcommand(s => s.setName('adicionar').setDescription('Ganha XP').addIntegerOption(o => o.setName('valor').setDescription('Quantidade de XP').setRequired(true)))
      .addSubcommand(s => s.setName('ver').setDescription('Mostra seu XP atual')),
    new SlashCommandBuilder()
      .setName('traco')
      .setDescription('Consulta Traços Monstruosos do jogo')
      .addSubcommand(s => s.setName('ver')
        .setDescription('Ver detalhes de um Traço Monstruoso')
        .addStringOption(o => o.setName('nome').setDescription('Nome do traço').setRequired(true).setAutocomplete(true))
      )
      .addSubcommand(s => s.setName('lista')
        .setDescription('Lista todos os Traços Monstruosos')
      ),
    new SlashCommandBuilder()
      .setName('tradicao')
      .setDescription('Consulta Tradições Místicas do jogo')
      .addSubcommand(s => s.setName('ver')
        .setDescription('Ver detalhes de uma Tradição Mística')
        .addStringOption(o => o.setName('nome').setDescription('Nome da tradição').setRequired(true).setAutocomplete(true))
      )
      .addSubcommand(s => s.setName('lista')
        .setDescription('Lista todas as Tradições Místicas')
      ),
    new SlashCommandBuilder()
      .setName('poder')
      .setDescription('Consulta Poderes Místicos e Rituais do jogo')
      .addSubcommand(s => s.setName('ver')
        .setDescription('Ver detalhes de um Poder Místico ou Ritual')
        .addStringOption(o => o.setName('nome').setDescription('Nome do poder').setRequired(true).setAutocomplete(true))
      )
      .addSubcommand(s => s.setName('lista')
        .setDescription('Lista todos os Poderes Místicos e Rituais')
      ),
    new SlashCommandBuilder()
      .setName('equipamento')
      .setDescription('Consulta Armas, Armaduras e Escudos do jogo')
      .addSubcommand(s => s.setName('ver')
        .setDescription('Ver detalhes de um equipamento')
        .addStringOption(o => o.setName('nome').setDescription('Nome do equipamento').setRequired(true).setAutocomplete(true))
      )
      .addSubcommand(s => s.setName('lista')
        .setDescription('Lista todos os equipamentos por categoria')
      ),
    new SlashCommandBuilder()
      .setName('furia')
      .setDescription('Ativa ou desativa o modo Fúria (Berserker)'),
    new SlashCommandBuilder()
      .setName('proteger')
      .setDescription('Protege um aliado, transferindo dano para você (Honor Guard)')
      .addUserOption(o => o.setName('aliado').setDescription('Aliado a ser protegido').setRequired(true)),
    new SlashCommandBuilder()
      .setName('veneno')
      .setDescription('Aplica veneno na arma (Assassin)'),
    new SlashCommandBuilder()
      .setName('explorar')
      .setDescription('Realiza um teste de exploração (Explorer)'),
    new SlashCommandBuilder()
      .setName('bind')
      .setDescription('Vincula um artefato para reduzir corrupção (Artifact Crafter)'),
    new SlashCommandBuilder()
      .setName('transformar')
      .setDescription('Transforma-se em uma forma animal (Witch)'),
    new SlashCommandBuilder()
      .setName('witchsight')
      .setDescription('Ativa a Visão de Bruxo para revelar a Sombra (Witch Hunter)'),
    new SlashCommandBuilder()
      .setName('beastlore')
      .setDescription('Revela informações sobre uma fera (Monster Hunter)')
      .addStringOption(o => o.setName('inimigo').setDescription('Nome do inimigo').setRequired(true)),
    new SlashCommandBuilder()
      .setName('armadilha')
      .setDescription('Prepara uma armadilha (Sapper)'),
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
      
      if (interaction.commandName === 'habilidade') {
        choices = abilities.filter(a => a.name.toLowerCase().includes(focusedValue)).slice(0, 25).map(choice => ({ name: choice.name, value: choice.id }));
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
      }
      return;
    }

    if (interaction.isButton()) {
      if (interaction.customId === 'apply_occupation_package') {
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

        await interaction.reply({
          embeds: [{
            title: `Ficha de ${userName} Criada/Atualizada!`,
            color: 0xd97706, // amber-600
            fields: [
              { name: '🛡️ Derivados', value: `**Resistência (Toughness):** ${toughness}\n**Limiar de Dor:** ${painThreshold}\n**Defesa:** ${defense}\n**Limiar de Corrupção:** ${corruptionThreshold}`, inline: false },
              { name: '🌑 Corrupção', value: `**Temporária:** ${char.corruption.temp} | **Permanente:** ${char.corruption.perm}\n**Total:** ${char.corruption.temp + char.corruption.perm} / ${corruptionThreshold}`, inline: false },
              { name: '✨ Experiência', value: `**XP Disponível:** ${char.xp.unspent} / ${char.xp.total}`, inline: false },
              { name: '📊 Atributos', value: `Precisão: ${char.attributes.precisao} | Astúcia: ${char.attributes.astucia}\nDiscrição: ${char.attributes.discricao} | Persuasão: ${char.attributes.persuasao}\nAgilidade: ${char.attributes.agilidade} | Resolução: ${char.attributes.resolucao}\nForça: ${char.attributes.forca} | Vigilância: ${char.attributes.vigilancia}`, inline: false },
              { name: '⚔️ Habilidades', value: char.learnedAbilities.length > 0 ? char.learnedAbilities.map(a => `• ${a.name} (${a.level})`).join('\n') : 'Nenhuma habilidade aprendida.', inline: false }
            ]
          }]
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

        await interaction.reply({
          embeds: [{
            title: `Ficha de ${char.name}`,
            color: 0x2b2d31,
            description: `${raceText}${occupationText}${shadowText}${statusText}${moneyText}`,
            fields: [
              { name: '🛡️ Derivados', value: `**Resistência (Toughness):** ${toughness}\n**Limiar de Dor:** ${painThreshold}\n**Defesa:** ${defense} *(Agilidade ${char.attributes.agilidade} + Armadura ${char.armorMod})*\n**Limiar de Corrupção:** ${corruptionThreshold}`, inline: false },
              { name: '🌑 Corrupção', value: `**Temporária:** ${char.corruption.temp} | **Permanente:** ${char.corruption.perm}\n**Total:** ${char.corruption.temp + char.corruption.perm} / ${corruptionThreshold}`, inline: false },
              { name: '✨ Experiência', value: `**XP Disponível:** ${char.xp.unspent} / ${char.xp.total}`, inline: false },
              { name: '📊 Atributos', value: `Precisão: ${char.attributes.precisao} | Astúcia: ${char.attributes.astucia}\nDiscrição: ${char.attributes.discricao} | Persuasão: ${char.attributes.persuasao}\nAgilidade: ${char.attributes.agilidade} | Resolução: ${char.attributes.resolucao}\nForça: ${char.attributes.forca} | Vigilância: ${char.attributes.vigilancia}`, inline: false },
              { name: '⚔️ Habilidades', value: char.learnedAbilities.length > 0 ? char.learnedAbilities.map(a => `• ${a.name} (${a.level})`).join('\n') : 'Nenhuma habilidade aprendida.', inline: false }
            ]
          }]
        });
      }
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

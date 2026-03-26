export interface Occupation {
  id: string;
  name: string;
  description: string;
  suggestedAbilities: string[];
  suggestedAttributes: string;
}

export interface Archetype {
  id: string;
  name: string;
  description: string;
  keyAttributes: string[];
  occupations: Occupation[];
}

export const archetypes: Archetype[] = [
  {
    id: 'hunter',
    name: 'Caçador (Hunter)',
    description: 'Mistura a letalidade do Guerreiro com a utilidade e os sentidos aguçados do Ladino.',
    keyAttributes: ['Vigilância', 'Precisão'],
    occupations: [
      {
        id: 'witch_hunter',
        name: 'Caçador de Bruxas',
        description: 'Especialistas em rastrear e eliminar místicos corrompidos e heresias.',
        suggestedAbilities: ['Witchsight', 'Marksman', 'Man-at-arms', 'Steadfast'],
        suggestedAttributes: 'Vigilância 15, Resolução 13'
      },
      {
        id: 'ironsworn',
        name: 'Batedor de Ferro',
        description: 'Membros do Pacto de Ferro, dedicados a impedir que o mundo seja engolido pela corrupção.',
        suggestedAbilities: ['Ironsworn', 'Polearm Mastery', 'Sixth Sense', 'Bushcraft'],
        suggestedAttributes: 'Vigilância 15, Agilidade 13'
      },
      {
        id: 'monster_hunter',
        name: 'Rastreador de Monstros',
        description: 'Profissionais que vivem de abater as feras mais perigosas do Davokar.',
        suggestedAbilities: ['Beast Lore', 'Trapper', 'Tactician', 'Marksman'],
        suggestedAttributes: 'Astúcia 15, Precisão 13'
      }
    ]
  },
  {
    id: 'warrior',
    name: 'Guerreiro (Warrior)',
    description: 'A força de combate de Ambria e das tribos bárbaras, focada em resistência e maestria de armas.',
    keyAttributes: ['Força', 'Agilidade'],
    occupations: [
      {
        id: 'berserker',
        name: 'Berserker',
        description: 'Guerreiros que buscam a fúria ruidosa para ignorar a dor e maximizar o dano.',
        suggestedAbilities: ['Berserker', 'Two-handed Force', 'Iron Fist', 'Recovery'],
        suggestedAttributes: 'Força 15'
      },
      {
        id: 'duelist',
        name: 'Duelista',
        description: 'Mestres da esgrima que dependem de técnica, reflexos e precisão mortal.',
        suggestedAbilities: ['Twin Attack', 'Feint', 'Acrobatics', 'Quick Draw', 'Tactician'],
        suggestedAttributes: 'Precisão 15 ou Agilidade 15'
      },
      {
        id: 'knight',
        name: 'Cavaleiro',
        description: 'A elite blindada de Ambria. Especialistas em liderar e lutar montados.',
        suggestedAbilities: ['Dominate', 'Leader', 'Man-at-arms', 'Shield Fighter', 'Iron Fist'],
        suggestedAttributes: 'Persuasão 15 ou Força 15'
      },
      {
        id: 'honor_guard',
        name: 'Guarda de Honra',
        description: 'O protetor supremo, treinado para ser a barreira entre o perigo e seus protegidos.',
        suggestedAbilities: ['Bodyguard', 'Shield Fighter', 'Robust', 'Polearm Mastery'],
        suggestedAttributes: 'Força 15, Agilidade 13'
      }
    ]
  },
  {
    id: 'mystic',
    name: 'Místico (Mystic)',
    description: 'Aqueles que manipulam o tecido do mundo e enfrentam (ou abraçam) a Sombra.',
    keyAttributes: ['Resolução'],
    occupations: [
      {
        id: 'artifact_crafter',
        name: 'Artefactista',
        description: 'Místicos focados na criação e manipulação de itens imbuídos de poder.',
        suggestedAbilities: ['Artifact Crafting', 'Loremaster', 'Alchemy', 'Medicus'],
        suggestedAttributes: 'Astúcia 15, Resolução 13'
      },
      {
        id: 'staff_mage',
        name: 'Mestre de Cajado',
        description: 'Guerreiros-místicos que utilizam seus cajados rúnicos para canalizar feitiços e combater.',
        suggestedAbilities: ['Staff Fighter', 'Staff Magic', 'Iron Fist', 'Two-handed Force'],
        suggestedAttributes: 'Resolução 15, Precisão 13'
      },
      {
        id: 'symbolist',
        name: 'Simbolista',
        description: 'Magos que desenham símbolos e runas. Magia lenta, mas segura.',
        suggestedAbilities: ['Symbolism', 'Rune Tattoo', 'Lore', 'Infiltrator'],
        suggestedAttributes: 'Astúcia 15, Resolução 13'
      },
      {
        id: 'troll_singer',
        name: 'Cantor Troll',
        description: 'Utilizam o poder da voz e das canções ancestrais para alterar a realidade.',
        suggestedAbilities: ['Troll Singing', 'Skald', 'Leader', 'Robust'],
        suggestedAttributes: 'Resolução 15, Persuasão 13'
      },
      {
        id: 'theurge',
        name: 'Teurgista',
        description: 'Os escolhidos de Prios, o Sol. Focados em purificação e luz.',
        suggestedAbilities: ['Theurgy', 'Holy Glow', 'Witchsight', 'Leader'],
        suggestedAttributes: 'Resolução 15'
      },
      {
        id: 'witch',
        name: 'Bruxa/Bruxo',
        description: 'Seguem o caminho da natureza e do Davokar. Mestres em metamorfose.',
        suggestedAbilities: ['Witchcraft', 'Shapeshift', 'Ensnaring Vines', 'Beast Bond'],
        suggestedAttributes: 'Resolução 15, Vigilância 13'
      }
    ]
  },
  {
    id: 'rogue',
    name: 'Ladino (Rogue)',
    description: 'Mestres da perícia, furtividade e da "luta suja".',
    keyAttributes: ['Discrição', 'Astúcia'],
    occupations: [
      {
        id: 'assassin',
        name: 'Assassino',
        description: 'O mestre da eliminação precisa e silenciosa.',
        suggestedAbilities: ['Backstab', 'Poisoner', 'Feint', 'Twin Attack', 'Alchemy'],
        suggestedAttributes: 'Discrição 15, Astúcia 13'
      },
      {
        id: 'charlatan',
        name: 'Charlatão',
        description: 'Mestre da manipulação social que usa mentiras e disfarces como armas.',
        suggestedAbilities: ['Dominate', 'Leader', 'Feint', 'Disguise', 'Loremaster'],
        suggestedAttributes: 'Persuasão 15, Astúcia 13'
      },
      {
        id: 'explorer',
        name: 'Explorador',
        description: 'Especialista em navegar as ruínas perigosas de Symbaroum.',
        suggestedAbilities: ['Pathfinder', 'Artifact Crafting', 'Acrobatics', 'Sixth Sense', 'Recovery'],
        suggestedAttributes: 'Vigilância 15, Astúcia 13'
      },
      {
        id: 'beast_master',
        name: 'Mestre de Bestas',
        description: 'Ladino que luta em conjunto com um companheiro animal altamente treinado.',
        suggestedAbilities: ['Beast Bond', 'Tactician', 'Sixth Sense', 'Marksman'],
        suggestedAttributes: 'Persuasão 15 ou Resolução 15'
      },
      {
        id: 'sapper',
        name: 'Sapador',
        description: 'Especialista técnico em demolições, armadilhas e engenharia de cerco.',
        suggestedAbilities: ['Trap Layer', 'Sapper', 'Alchemy', 'Marksman', 'Siege Expert'],
        suggestedAttributes: 'Astúcia 15'
      }
    ]
  }
];

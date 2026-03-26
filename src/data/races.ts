export interface Race {
  id: string;
  name: string;
  description: string;
  traits: string[];
  variants?: string[];
}

export const races: Race[] = [
  {
    id: 'elf',
    name: 'Elfo',
    description: 'Guardiões severos do Davokar.',
    traits: ['Ancestralidade Élfica'],
    variants: ['Criança de Verão', 'Outono', 'Inverno']
  },
  {
    id: 'troll',
    name: 'Troll de Sangue',
    description: 'Trolls que decidiram viver entre os humanos ou que mantêm sua sanidade através da cultura.',
    traits: ['Armadura Natural (Natural Armor)', 'Regeneração (Regeneration)']
  },
  {
    id: 'undead',
    name: 'Morto-Vivo',
    description: 'Humanos que voltaram da morte, mas mantiveram a consciência.',
    traits: ['Sem Vida']
  },
  {
    id: 'dwarf',
    name: 'Anão',
    description: 'Criados pelos elfos a partir de pedras, não possuem alma (Sombra).',
    traits: ['Memória Hereditária']
  },
  {
    id: 'human',
    name: 'Humano',
    description: 'A raça mais versátil, dividida entre os civilizados Ambrianos e os clãs Bárbaros.',
    traits: ['Contatos Privilegiados'],
    variants: ['Ambriano', 'Bárbaro']
  },
  {
    id: 'ogre',
    name: 'Ogro',
    description: 'Gigantes solitários que emergem do Davokar sem memória de seu passado.',
    traits: ['Robusto (Robust)']
  },
  {
    id: 'goblin',
    name: 'Goblin',
    description: 'Pequenos, ágeis e de vida curta, vivem em comunidades barulhentas.',
    traits: ['Vida Curta', 'Sobrevivente']
  }
];

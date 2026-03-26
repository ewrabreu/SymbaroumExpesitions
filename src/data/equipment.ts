export interface Equipment {
  id: string;
  name: string;
  type: 'Weapon' | 'Armor' | 'Shield';
  category: string;
  damage?: string;
  protection?: string;
  impediment?: number;
  qualities: string[];
  attribute?: string;
  description: string;
}

export const equipment: Equipment[] = [
  {
    id: 'adaga',
    name: 'Adaga',
    type: 'Weapon',
    category: 'Pequena',
    damage: '1D6',
    qualities: ['Concealed'],
    attribute: 'Accurate',
    description: 'Uma arma curta, fácil de esconder.'
  },
  {
    id: 'espada',
    name: 'Espada',
    type: 'Weapon',
    category: 'Média',
    damage: '1D8',
    qualities: [],
    attribute: 'Accurate',
    description: 'Uma arma de lâmina de tamanho médio, versátil em combate.'
  },
  {
    id: 'espada-longa',
    name: 'Espada Longa',
    type: 'Weapon',
    category: 'Média',
    damage: '1D8',
    qualities: ['Precise'],
    attribute: 'Accurate',
    description: 'Uma espada bem balanceada que oferece maior precisão.'
  },
  {
    id: 'espada-duas-maos',
    name: 'Espada de Duas Mãos',
    type: 'Weapon',
    category: 'Pesada',
    damage: '1D10',
    qualities: ['Heavy'],
    attribute: 'Accurate',
    description: 'Uma espada massiva que requer as duas mãos para ser empunhada.'
  },
  {
    id: 'arco',
    name: 'Arco',
    type: 'Weapon',
    category: 'Projétil',
    damage: '1D10',
    qualities: ['Precise'],
    attribute: 'Accurate',
    description: 'Arma de ataque à distância que requer duas mãos.'
  },
  {
    id: 'besta',
    name: 'Besta',
    type: 'Weapon',
    category: 'Projétil',
    damage: '1D12',
    qualities: ['Loading'],
    attribute: 'Accurate',
    description: 'Arma de ataque à distância potente, mas lenta para recarregar.'
  },
  {
    id: 'lanca',
    name: 'Lança',
    type: 'Weapon',
    category: 'Média',
    damage: '1D8',
    qualities: ['Long'],
    attribute: 'Accurate',
    description: 'Arma de haste que permite atacar inimigos antes que se aproximem.'
  },
  {
    id: 'maca',
    name: 'Maça',
    type: 'Weapon',
    category: 'Média',
    damage: '1D8',
    qualities: ['Blunt'],
    attribute: 'Accurate',
    description: 'Arma contundente capaz de derrubar inimigos.'
  },
  {
    id: 'machado-batalha',
    name: 'Machado de Batalha',
    type: 'Weapon',
    category: 'Média',
    damage: '1D8',
    qualities: ['Deep Impact'],
    attribute: 'Accurate',
    description: 'Machado pesado que corta profundamente.'
  },
  {
    id: 'mangual',
    name: 'Mangual',
    type: 'Weapon',
    category: 'Média',
    damage: '1D8',
    qualities: ['Jointed'],
    attribute: 'Accurate',
    description: 'Arma articulada que ignora parte da defesa.'
  },
  {
    id: 'armadura-leve',
    name: 'Armadura Leve',
    type: 'Armor',
    category: 'Leve',
    protection: '1D4',
    impediment: 0,
    qualities: [],
    description: 'Armadura de couro ou tecido grosso. Não atrapalha os movimentos.'
  },
  {
    id: 'armadura-media',
    name: 'Armadura Média',
    type: 'Armor',
    category: 'Média',
    protection: '1D6',
    impediment: -2,
    qualities: [],
    description: 'Cota de malha ou couro reforçado. Atrapalha levemente os movimentos.'
  },
  {
    id: 'armadura-pesada',
    name: 'Armadura Pesada',
    type: 'Armor',
    category: 'Pesada',
    protection: '1D8',
    impediment: -3,
    qualities: [],
    description: 'Armadura de placas de metal. Oferece grande proteção, mas restringe bastante os movimentos.'
  },
  {
    id: 'escudo',
    name: 'Escudo',
    type: 'Shield',
    category: 'Escudo',
    damage: '1D4',
    qualities: [],
    description: 'Adiciona +1 fixo na Defesa (não na proteção) e pode ser usado para dar pancadas.'
  }
];

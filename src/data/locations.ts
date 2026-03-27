export interface Location {
  id: string;
  name: string;
  description: string;
  type: 'Region' | 'City' | 'Ruin';
  terrain: 'Ambria' | 'Davokar Clara' | 'Davokar Escura';
  hasRiver?: boolean;
  options: string[];
  destinations: { id: string, distance: number }[]; // Distância em km
}

export const locations: Location[] = [
  {
    id: 'ambria',
    name: 'Ambria',
    description: 'O reino fundado pelos sobreviventes de Alberetor ao sul da floresta de Davokar.',
    type: 'Region',
    terrain: 'Ambria',
    options: ['Explorar Ducados', 'Visitar Igreja de Prios'],
    destinations: [
      { id: 'yndaros', distance: 50 },
      { id: 'thistle_hold', distance: 100 },
      { id: 'templewall', distance: 80 },
      { id: 'agrella', distance: 120 }
    ]
  },
  {
    id: 'davokar_clara',
    name: 'Davokar Clara',
    description: 'Parte patrulhada da vasta floresta, abrigando recursos e ruínas externas.',
    type: 'Region',
    terrain: 'Davokar Clara',
    options: ['Patrulhar com Batedores', 'Procurar Ervas'],
    destinations: [
      { id: 'thistle_hold', distance: 20 },
      { id: 'karvosti', distance: 150 },
      { id: 'davokar_escura', distance: 100 }
    ]
  },
  {
    id: 'davokar_escura',
    name: 'Davokar Escura',
    description: 'Um abismo de corrupção, abominações e perigos mortais no coração da floresta.',
    type: 'Region',
    terrain: 'Davokar Escura',
    options: ['Explorar Profundezas', 'Caçar Abominações'],
    destinations: [
      { id: 'davokar_clara', distance: 100 },
      { id: 'karvosti', distance: 80 },
      { id: 'symbar', distance: 200 }
    ]
  },
  {
    id: 'yndaros',
    name: 'Yndaros',
    description: 'A capital de Ambria, centro de contrastes entre palácios e favelas.',
    type: 'City',
    terrain: 'Ambria',
    hasRiver: true,
    options: ['Visitar o Palácio', 'Comercializar nas Docas', 'Explorar o Acampamento de Refugiados'],
    destinations: [
      { id: 'thistle_hold', distance: 120 },
      { id: 'templewall', distance: 60 },
      { id: 'agrella', distance: 140 }
    ]
  },
  {
    id: 'thistle_hold',
    name: 'Thistle Hold (Forte de Cardos)',
    description: 'Cidade murada na borda de Davokar, porto principal para exploradores.',
    type: 'City',
    terrain: 'Ambria',
    hasRiver: true,
    options: ['Contratar Guia', 'Vender Artefatos', 'Visitar a Estalagem'],
    destinations: [
      { id: 'yndaros', distance: 120 },
      { id: 'davokar_clara', distance: 20 },
      { id: 'karvosti', distance: 170 }
    ]
  },
  {
    id: 'karvosti',
    name: 'Karvosti',
    description: 'Planalto sagrado no coração de Davokar, sede do Alto Chefe bárbaro.',
    type: 'City',
    terrain: 'Davokar Clara',
    options: ['Falar com o Alto Chefe', 'Visitar Templo do Sol', 'Observar Colunas de Haganor'],
    destinations: [
      { id: 'davokar_clara', distance: 150 },
      { id: 'davokar_escura', distance: 80 },
      { id: 'thistle_hold', distance: 170 }
    ]
  },
  {
    id: 'templewall',
    name: 'Templewall',
    description: 'Sede do poder da Igreja de Prios, o Deus Sol.',
    type: 'City',
    terrain: 'Ambria',
    options: ['Rezar no Templo', 'Falar com Inquisidores', 'Estudar Textos Sagrados'],
    destinations: [
      { id: 'yndaros', distance: 60 },
      { id: 'ambria', distance: 80 }
    ]
  },
  {
    id: 'agrella',
    name: 'Agrella',
    description: 'Quartel-general da Ordo Magica, dedicada ao estudo erudito.',
    type: 'City',
    terrain: 'Ambria',
    options: ['Estudar na Biblioteca', 'Falar com Mestres', 'Comprar Ingredientes Alquímicos'],
    destinations: [
      { id: 'yndaros', distance: 140 },
      { id: 'ambria', distance: 120 }
    ]
  },
  {
    id: 'vojvodar',
    name: 'Vojvodar',
    description: 'Fortaleza no sudeste de Davokar, lar do clã Vajvod.',
    type: 'City',
    terrain: 'Davokar Clara',
    options: ['Aprender Simbolismo', 'Falar com Patrulheiros'],
    destinations: [
      { id: 'ambria', distance: 200 },
      { id: 'davokar_clara', distance: 100 }
    ]
  },
  {
    id: 'symbar',
    name: 'Symbar',
    description: 'Lendária capital do antigo império, escondida na Davokar Escura.',
    type: 'Ruin',
    terrain: 'Davokar Escura',
    options: ['Explorar Ruínas Reais', 'Enfrentar a Corrupção'],
    destinations: [
      { id: 'davokar_escura', distance: 200 }
    ]
  }
];

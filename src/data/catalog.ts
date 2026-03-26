export interface Item {
  id: string;
  name: string;
  cost: string;
  description?: string;
}

export interface Weapon extends Item {
  damage: string;
  quality: string;
}

export interface Armor extends Item {
  protection: string;
  quality: string;
}

export interface AlchemicalItem extends Item {}

export interface Building extends Item {}

export interface Transport extends Item {}

export interface Container extends Item {}

export interface FarmAnimal extends Item {}

export interface Income {
  occupation: string;
  dailyIncome: string;
}

export interface Clothing extends Item {}

export interface Expense {
  service: string;
  cost: string;
}

export interface Service extends Item {}

export interface Tool extends Item {}

export const weapons: Weapon[] = [
  { id: 'heavy-weapon', name: 'Heavy Weapon', damage: '1D10', quality: '-', cost: '10 thaler' },
  { id: 'bastard-sword', name: 'Bastard Sword, two-handed', damage: '1D10', quality: 'Precise', cost: '50 thaler' },
  { id: 'double-axe', name: 'Double-axe', damage: '1D10+1', quality: 'Deep Impact', cost: '50 thaler' },
  { id: 'heavy-flail', name: 'Heavy Flail', damage: '1D10', quality: 'Jointed', cost: '50 thaler' },
  { id: 'long-weapon', name: 'Long Weapon', damage: '1D8', quality: 'Long', cost: '3 thaler' },
  { id: 'halberd', name: 'Halberd', damage: '1D8+1', quality: 'Deep Impact', cost: '15 thaler' },
  { id: 'pike', name: 'Pike', damage: '1D8', quality: 'Precise', cost: '15 thaler' },
  { id: 'quarterstaff', name: 'Quarterstaff', damage: '1D6', quality: 'Blunt', cost: '1 shilling' },
  { id: 'crossbow', name: 'Crossbow', damage: '1D10', quality: '-', cost: '8 thaler' },
  { id: 'arbalest', name: 'Arbalest', damage: '1D10+1', quality: 'Deep Impact', cost: '40 thaler' },
  { id: 'bow', name: 'Bow', damage: '1D8', quality: '-', cost: '5 thaler' },
  { id: 'longbow', name: 'Longbow', damage: '1D8', quality: 'Precise', cost: '25 thaler' },
  { id: 'arrows-bolts', name: '10 arrows or bolts', damage: '-', quality: '-', cost: '1 thaler' },
  { id: 'single-handed-weapon', name: 'Single-Handed Weapon', damage: '1D8', quality: '-', cost: '5 thaler' },
  { id: 'crows-beak', name: 'Crow’s Beak', damage: '1D8+1', quality: 'Deep Impact', cost: '25 thaler' },
  { id: 'fencing-sword', name: 'Fencing Sword', damage: '1D8', quality: 'Precise', cost: '25 thaler' },
  { id: 'flail', name: 'Flail', damage: '1D8', quality: 'Jointed', cost: '25 thaler' },
  { id: 'shield', name: 'Shield', damage: '1D4', quality: '-', cost: '3 thaler' },
  { id: 'buckler', name: 'Buckler', damage: '1D4', quality: 'Flexible', cost: '15 thaler' },
  { id: 'steel-shield', name: 'Steel Shield', damage: '1D4', quality: 'Balanced', cost: '15 thaler' },
  { id: 'short-weapon', name: 'Short Weapon', damage: '1D6', quality: 'Short', cost: '1 thaler' },
  { id: 'parrying-dagger', name: 'Parrying Dagger', damage: '1D6', quality: 'Balanced', cost: '5 thaler' },
  { id: 'stiletto', name: 'Stiletto', damage: '1D6+1', quality: 'Deep Impact', cost: '5 thaler' },
  { id: 'throwing-weapon', name: 'Throwing Weapon', damage: '1D6', quality: '-', cost: '2 thaler' },
  { id: 'spear-sling', name: 'Spear Sling', damage: '1D6+1', quality: 'Deep Impact', cost: '10 thaler' },
  { id: 'unarmed-attack', name: 'Unarmed Attack', damage: '1D4', quality: 'Short', cost: '-' },
  { id: 'battle-claw', name: 'Battle Claw', damage: '1D4+1', quality: 'Deep Impact', cost: '1 thaler' },
];

export const armor: Armor[] = [
  { id: 'light-armor', name: 'Light Armor', protection: '1D4', quality: 'Impeding (−2)', cost: '2 thaler' },
  { id: 'blessed-robe', name: 'Blessed Robe', protection: '1D4', quality: 'Flexible', cost: '10 thaler' },
  { id: 'order-cloak', name: 'Order Cloak', protection: '1D4', quality: 'Flexible', cost: '10 thaler' },
  { id: 'witch-gown', name: 'Witch Gown', protection: '1D4', quality: 'Flexible', cost: '10 thaler' },
  { id: 'wolf-skin', name: 'Wolf Skin', protection: '1D4', quality: 'Cumbersome', cost: '1 thaler' },
  { id: 'woven-silk', name: 'Woven Silk', protection: '1D4', quality: 'Flexible', cost: '10 thaler' },
  { id: 'medium-armor', name: 'Medium Armor', protection: '1D6', quality: 'Impeding (−3)', cost: '5 thaler' },
  { id: 'crow-armor', name: 'Crow Armor', protection: '1D6', quality: 'Cumbersome', cost: '2 thaler' },
  { id: 'lacquered-silk-cuirass', name: 'Lacquered Silk Cuirass', protection: '1D6', quality: 'Flexible', cost: '25 thaler' },
  { id: 'heavy-armor', name: 'Heavy Armor', protection: '1D8', quality: 'Impeding (−4)', cost: '10 thaler' },
  { id: 'full-plate', name: 'Full Plate', protection: '1D8', quality: 'Flexible', cost: '50 thaler' },
];

export const alchemicalItems: AlchemicalItem[] = [
  { id: 'antidote-weak', name: 'Antidote (Weak)', cost: '1 thaler' },
  { id: 'antidote-moderate', name: 'Antidote (Moderate)', cost: '2 thaler' },
  { id: 'antidote-strong', name: 'Antidote (Strong)', cost: '3 thaler' },
  { id: 'choking-spores', name: 'Choking Spores', cost: '2 thaler' },
  { id: 'concentrated-magic', name: 'Concentrated Magic', cost: '1 thaler' },
  { id: 'eye-drops', name: 'Eye Drops', cost: '2 thaler' },
  { id: 'elemental-essence', name: 'Elemental Essence', cost: '2 thaler' },
  { id: 'elixir-of-life', name: 'Elixir of Life', cost: '6 thaler' },
  { id: 'ghost-candle', name: 'Ghost Candle', cost: '2 thaler' },
  { id: 'herbal-cure', name: 'Herbal Cure', cost: '1 thaler' },
  { id: 'poison-weak', name: 'Poison (Weak)', cost: '2 thaler' },
  { id: 'poison-moderate', name: 'Poison (Moderate)', cost: '4 thaler' },
  { id: 'poison-strong', name: 'Poison (Strong)', cost: '6 thaler' },
  { id: 'protective-oil', name: 'Protective Oil', cost: '2 thaler' },
  { id: 'spore-bomb', name: 'Spore Bomb', cost: '3 thaler' },
  { id: 'waybread', name: 'Waybread', cost: '1 thaler' },
  { id: 'wraith-dust', name: 'Wraith Dust', cost: '2 thaler' },
];

export const equipment: Item[] = [
  { id: 'bandages', name: 'Bandages', cost: '5 ortegs' },
  { id: 'bear-trap', name: 'Bear trap', cost: '5 shillings' },
  { id: 'blanket', name: 'Blanket', cost: '2 ortegs' },
  { id: 'brass-bell', name: 'Brass bell', cost: '6 shillings' },
  { id: 'climbing-equipment', name: 'Climbing equipment', cost: '1 thaler' },
  { id: 'crayons', name: 'Crayons', cost: '1 orteg' },
  { id: 'drinking-horn', name: 'Drinking horn', cost: '2 ortegs' },
  { id: 'drum', name: 'Drum', cost: '3 shillings' },
  { id: 'field-equipment', name: 'Field equipment', cost: '5 shillings' },
  { id: 'fishing-line-hook', name: 'Fishing line and hook', cost: '3 ortegs' },
  { id: 'fishing-net', name: 'Fishing net', cost: '1 shilling' },
  { id: 'flute', name: 'Flute', cost: '3 shillings' },
  { id: 'grappling-hook', name: 'Grappling hook', cost: '1 thaler' },
  { id: 'horn', name: 'Horn', cost: '4 ortegs' },
  { id: 'hour-glass', name: 'Hour glass', cost: '4 thaler' },
  { id: 'ink-feather', name: 'Ink and feather', cost: '1 shilling' },
  { id: 'ladder', name: 'Ladder', cost: '7 ortegs' },
  { id: 'lamp-oil', name: 'Lamp oil', cost: '1 orteg' },
  { id: 'lantern', name: 'Lantern', cost: '4 ortegs' },
  { id: 'lockpicks', name: 'Lockpicks', cost: '1 thaler' },
  { id: 'needle-thread', name: 'Needle and thread', cost: '1 orteg' },
  { id: 'paper', name: 'Paper', cost: '3 ortegs' },
  { id: 'parchment', name: 'Parchment', cost: '2 ortegs' },
  { id: 'pocket-mirror', name: 'Pocket mirror', cost: '7 thaler' },
  { id: 'rope-ladder', name: 'Rope ladder', cost: '3 shillings' },
  { id: 'snares', name: 'Snares', cost: '3 shillings' },
  { id: 'snow-shoes', name: 'Snow shoes', cost: '5 shillings' },
  { id: 'soap', name: 'Soap', cost: '5 ortegs' },
  { id: 'spy-glass', name: 'Spy glass', cost: '10 thaler' },
  { id: 'tankard', name: 'Tankard', cost: '1 orteg' },
  { id: 'tent', name: 'Tent', cost: '3 shillings' },
  { id: 'torch', name: 'Torch', cost: '1 orteg' },
  { id: 'wax-candle', name: 'Wax candle', cost: '4 ortegs' },
  { id: 'weapon-maintenance-kit', name: 'Weapon maintenance kit', cost: '5 shillings' },
  { id: 'whetstone', name: 'Whetstone', cost: '4 ortegs' },
  { id: 'whistle', name: 'Whistle', cost: '2 shillings' },
];

export interface Power {
  id: string;
  name: string;
  englishName: string;
  category: string;
  description: string;
  cost: string;
  test: string;
  duration: string;
}

export const powers: Power[] = [
  {
    id: 'cascata_de_enxofre',
    name: 'Cascata de Enxofre',
    englishName: 'Brimstone Cascade',
    category: 'Poderes de Dano e Ataque',
    description: 'Dano de fogo que pode saltar para múltiplos alvos.',
    cost: '1D4 de Corrupção Temporária (ou 1 ponto com Tradição)',
    test: '[Resolute ← Resolute]',
    duration: 'Instantâneo'
  },
  {
    id: 'flecha_mental',
    name: 'Flecha Mental',
    englishName: 'Mind Arrow',
    category: 'Poderes de Dano e Ataque',
    description: 'Dano que ignora armadura física (focado em Resolute).',
    cost: '1D4 de Corrupção Temporária (ou 1 ponto com Tradição)',
    test: '[Resolute ← Resolute]',
    duration: 'Instantâneo'
  },
  {
    id: 'toque_de_corrupcao',
    name: 'Toque de Corrupção',
    englishName: 'Larvae Boil',
    category: 'Poderes de Dano e Ataque',
    description: 'Infesta o inimigo com larvas que causam dano interno contínuo.',
    cost: '1D4 de Corrupção Temporária (ou 1 ponto com Tradição)',
    test: '[Resolute ← Resolute]',
    duration: 'Concentração'
  },
  {
    id: 'golpe_de_retribuicao',
    name: 'Golpe de Retribuição',
    englishName: 'Retribution',
    category: 'Poderes de Dano e Ataque',
    description: 'Reflete o dano recebido de volta para o atacante.',
    cost: '1D4 de Corrupção Temporária (ou 1 ponto com Tradição)',
    test: '[Resolute ← Resolute]',
    duration: 'Instantâneo'
  },
  {
    id: 'punho_de_erast',
    name: 'Punho de Erast',
    englishName: 'Unholy Form',
    category: 'Poderes de Dano e Ataque',
    description: 'Transforma o braço em uma arma monstruosa.',
    cost: '1D4 de Corrupção Temporária (ou 1 ponto com Tradição)',
    test: '[Resolute ← Resolute]',
    duration: 'Até o fim da cena'
  },
  {
    id: 'dobrar_vontade',
    name: 'Dobrar Vontade',
    englishName: 'Bend Will',
    category: 'Poderes de Controle e Manipulação',
    description: 'Assume o controle das ações do alvo.',
    cost: '1D4 de Corrupção Temporária (ou 1 ponto com Tradição)',
    test: '[Resolute ← Resolute]',
    duration: 'Concentração'
  },
  {
    id: 'confusao',
    name: 'Confusão',
    englishName: 'Confusion',
    category: 'Poderes de Controle e Manipulação',
    description: 'Faz o alvo atacar aliados ou ficar atordoado.',
    cost: '1D4 de Corrupção Temporária (ou 1 ponto com Tradição)',
    test: '[Resolute ← Resolute]',
    duration: 'Concentração'
  },
  {
    id: 'prisao_de_teias',
    name: 'Prisão de Teias',
    englishName: 'Ensnaring Vines',
    category: 'Poderes de Controle e Manipulação',
    description: 'Plantas surgem do chão para prender os inimigos.',
    cost: '1D4 de Corrupção Temporária (ou 1 ponto com Tradição)',
    test: '[Resolute ← Resolute]',
    duration: 'Concentração'
  },
  {
    id: 'voz_do_mal',
    name: 'Voz do Mal',
    englishName: 'Maltransformation',
    category: 'Poderes de Controle e Manipulação',
    description: 'Transforma o alvo em um animal inofensivo.',
    cost: '1D4 de Corrupção Temporária (ou 1 ponto com Tradição)',
    test: '[Resolute ← Resolute]',
    duration: 'Concentração'
  },
  {
    id: 'muralha_de_chamas',
    name: 'Muralha de Chamas',
    englishName: 'Wall of Fire',
    category: 'Poderes de Controle e Manipulação',
    description: 'Cria uma barreira física que causa dano a quem atravessa.',
    cost: '1D4 de Corrupção Temporária (ou 1 ponto com Tradição)',
    test: '[Resolute ← Resolute]',
    duration: 'Concentração'
  },
  {
    id: 'armadura_abencoada',
    name: 'Armadura Abençoada',
    englishName: 'Blessed Shield',
    category: 'Poderes de Proteção e Suporte',
    description: 'Cria um escudo de luz que aumenta a Defesa e protege contra corrupção.',
    cost: '1D4 de Corrupção Temporária (ou 1 ponto com Tradição)',
    test: '[Resolute ← Resolute]',
    duration: 'Até o fim da cena'
  },
  {
    id: 'manto_de_sombras',
    name: 'Manto de Sombras',
    englishName: 'Shadow Cloak',
    category: 'Poderes de Proteção e Suporte',
    description: 'Torna o usuário difícil de ver, aumentando a Defesa e Discrição.',
    cost: '1D4 de Corrupção Temporária (ou 1 ponto com Tradição)',
    test: '[Resolute ← Resolute]',
    duration: 'Até o fim da cena'
  },
  {
    id: 'corpo_de_ferro',
    name: 'Corpo de Ferro',
    englishName: 'Iron Fist - Power Version',
    category: 'Poderes de Proteção e Suporte',
    description: 'Endurece a pele para aumentar a Armadura.',
    cost: '1D4 de Corrupção Temporária (ou 1 ponto com Tradição)',
    test: '[Resolute ← Resolute]',
    duration: 'Até o fim da cena'
  },
  {
    id: 'santuario',
    name: 'Santuário',
    englishName: 'Sanctuary',
    category: 'Poderes de Proteção e Suporte',
    description: 'Impede que inimigos ataquem o místico enquanto ele não atacar.',
    cost: '1D4 de Corrupção Temporária (ou 1 ponto com Tradição)',
    test: '[Resolute ← Resolute]',
    duration: 'Concentração'
  },
  {
    id: 'sorte_do_peregrino',
    name: 'Sorte do Peregrino',
    englishName: 'Inherit Essence',
    category: 'Poderes de Proteção e Suporte',
    description: 'Permite trocar temporariamente valores de atributos.',
    cost: '1D4 de Corrupção Temporária (ou 1 ponto com Tradição)',
    test: '[Resolute ← Resolute]',
    duration: 'Até o fim da cena'
  },
  {
    id: 'toque_sagrado',
    name: 'Toque Sagrado',
    englishName: 'Holy Glow',
    category: 'Poderes de Cura e Utilidade',
    description: 'Cura Resistência e pode causar dano a mortos-vivos.',
    cost: '1D4 de Corrupção Temporária (ou 1 ponto com Tradição)',
    test: '[Resolute ← Resolute]',
    duration: 'Instantâneo'
  },
  {
    id: 'cura_pelas_ervas',
    name: 'Cura pelas Ervas',
    englishName: 'Anathema',
    category: 'Poderes de Cura e Utilidade',
    description: 'Remove efeitos negativos ou corrupção temporária de aliados.',
    cost: '1D4 de Corrupção Temporária (ou 1 ponto com Tradição)',
    test: '[Resolute ← Resolute]',
    duration: 'Instantâneo'
  },
  {
    id: 'po_de_purificacao',
    name: 'Pó de Purificação',
    englishName: 'Purifying Mist',
    category: 'Poderes de Cura e Utilidade',
    description: 'Uma névoa que cura todos os aliados na área.',
    cost: '1D4 de Corrupção Temporária (ou 1 ponto com Tradição)',
    test: '[Resolute ← Resolute]',
    duration: 'Instantâneo'
  },
  {
    id: 'levitacao',
    name: 'Levitação',
    englishName: 'Levitation',
    category: 'Poderes de Cura e Utilidade',
    description: 'Permite flutuar ou mover objetos com a mente.',
    cost: '1D4 de Corrupção Temporária (ou 1 ponto com Tradição)',
    test: '[Resolute ← Resolute]',
    duration: 'Concentração'
  },
  {
    id: 'projecao_astral',
    name: 'Projeção Astral',
    englishName: 'Telethought',
    category: 'Poderes de Cura e Utilidade',
    description: 'Comunicação mental à distância.',
    cost: '1D4 de Corrupção Temporária (ou 1 ponto com Tradição)',
    test: '[Resolute ← Resolute]',
    duration: 'Concentração'
  },
  // Rituais
  {
    id: 'circulo_magico',
    name: 'Círculo Mágico',
    englishName: 'Magic Circle',
    category: 'Rituais',
    description: 'Proteção contra criaturas específicas.',
    cost: '1D4 de Corrupção Temporária (ou 1 ponto com Tradição)',
    test: '[Resolute ← Resolute]',
    duration: 'Cena/Especial'
  },
  {
    id: 'comungar_com_espiritos',
    name: 'Comungar com Espíritos',
    englishName: 'Commune with Spirits',
    category: 'Rituais',
    description: 'Falar com os mortos.',
    cost: '1D4 de Corrupção Temporária (ou 1 ponto com Tradição)',
    test: '[Resolute ← Resolute]',
    duration: 'Cena/Especial'
  },
  {
    id: 'vinculo_de_sangue',
    name: 'Vínculo de Sangue',
    englishName: 'Blood Bond',
    category: 'Rituais',
    description: 'Compartilhar sentidos com um animal.',
    cost: '1D4 de Corrupção Temporária (ou 1 ponto com Tradição)',
    test: '[Resolute ← Resolute]',
    duration: 'Cena/Especial'
  },
  {
    id: 'clarividencia',
    name: 'Clarividência',
    englishName: 'Oracle',
    category: 'Rituais',
    description: 'Receber visões do futuro ou de lugares distantes.',
    cost: '1D4 de Corrupção Temporária (ou 1 ponto com Tradição)',
    test: '[Resolute ← Resolute]',
    duration: 'Cena/Especial'
  },
  {
    id: 'sete_vidas',
    name: 'Sete Vidas',
    englishName: 'Seven Lives',
    category: 'Rituais',
    description: 'Liga a alma a um objeto para evitar a morte.',
    cost: '1D4 de Corrupção Temporária (ou 1 ponto com Tradição)',
    test: '[Resolute ← Resolute]',
    duration: 'Cena/Especial'
  },
  {
    id: 'exorcismo',
    name: 'Exorcismo',
    englishName: 'Exorcism',
    category: 'Rituais',
    description: 'Expulsa espíritos ou possessões.',
    cost: '1D4 de Corrupção Temporária (ou 1 ponto com Tradição)',
    test: '[Resolute ← Resolute]',
    duration: 'Cena/Especial'
  }
];

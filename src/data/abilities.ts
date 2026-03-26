export interface Ability {
  id: string;
  name: string;
  englishName?: string;
  category: string;
  description_novice: string;
  description_adequate: string;
  description_master: string;
}

export const abilities: Ability[] = [
  {
    id: 'ataque_furtivo',
    name: 'Ataque Furtivo (Backstab)',
    category: 'Combate',
    description_novice: 'Dano extra (+1d4) ao atacar com vantagem.',
    description_adequate: 'Usa Discrição em vez de Precisão para ataques com vantagem. Dano extra (+1d4).',
    description_master: 'Dano extra aumenta para +1d8 ao atacar com vantagem e usar Discrição.'
  },
  {
    id: 'arqueiro',
    name: 'Arqueiro (Marksman)',
    category: 'Combate',
    description_novice: 'Dano extra (+1d4) com arcos e bestas.',
    description_adequate: 'Pode realizar ataques que causam fustigamento (sangramento/imobilização).',
    description_master: 'Dano extra aumenta para +1d8 e ignora parte da armadura do alvo.'
  },
  {
    id: 'arremesso',
    name: 'Arremesso (Throwing Weapons)',
    category: 'Combate',
    description_novice: 'Aumenta o dano de armas de arremesso em +1d4.',
    description_adequate: 'Pode arremessar duas armas na mesma ação com penalidade.',
    description_master: 'Arremessa duas armas sem penalidade e com dano extra.'
  },
  {
    id: 'berserker',
    name: 'Berserker',
    category: 'Combate',
    description_novice: 'Entra em fúria: +1d6 de dano corpo a corpo, mas Defesa passa a ser baseada em Força (sem armadura).',
    description_adequate: 'Em fúria, ignora efeitos de dor e recebe armadura natural +1d4.',
    description_master: 'Em fúria, os ataques causam +1d8 de dano e a armadura natural aumenta.'
  },
  {
    id: 'combate_duas_armas',
    name: 'Combate com Duas Armas (Twin Attack)',
    category: 'Combate',
    description_novice: 'Pode atacar com duas armas de uma mão na mesma ação (dano das duas armas, rola o pior de dois d20).',
    description_adequate: 'Ataca com duas armas rolando normalmente (um d20 para cada).',
    description_master: 'Ataques com duas armas causam dano aumentado e melhoram a Defesa.'
  },
  {
    id: 'combate_escudo',
    name: 'Combate com Escudo (Shield Fighter)',
    category: 'Combate',
    description_novice: 'O escudo concede +1 de Defesa adicional.',
    description_adequate: 'Pode usar o escudo para derrubar o oponente após um ataque bem-sucedido.',
    description_master: 'O escudo pode ser usado para atacar (1d4 dano) e derrubar simultaneamente.'
  },
  {
    id: 'estilo_esgrima',
    name: 'Estilo de Esgrima (Feint)',
    category: 'Combate',
    description_novice: 'Pode usar Discrição em vez de Precisão para ataques corpo a corpo com armas curtas/leves.',
    description_adequate: 'Ganha vantagem em ataques corpo a corpo se o alvo falhar em um teste de Vigilância.',
    description_master: 'Ataques com vantagem usando Discrição causam dano extra (+1d4).'
  },
  {
    id: 'forca_duas_maos',
    name: 'Força de Duas Mãos (Two-handed Force)',
    category: 'Combate',
    description_novice: 'Ataques com armas de duas mãos causam +1d4 de dano.',
    description_adequate: 'Pode ignorar a armadura do alvo em um ataque, mas perde a própria Defesa no turno.',
    description_master: 'Ataques com armas de duas mãos causam +1d8 de dano e podem empurrar o alvo.'
  },
  {
    id: 'golpe_ferro',
    name: 'Golpe de Ferro (Iron Fist)',
    category: 'Combate',
    description_novice: 'Pode usar Força em vez de Precisão para ataques corpo a corpo.',
    description_adequate: 'Ataques corpo a corpo causam +1d4 de dano passivo.',
    description_master: 'Dano extra aumenta para +1d8 em ataques corpo a corpo.'
  },
  {
    id: 'armas_haste',
    name: 'Lutar com Armas de Haste (Polearm Mastery)',
    category: 'Combate',
    description_novice: 'Ganha um ataque livre contra inimigos que entrarem no seu alcance corpo a corpo.',
    description_adequate: 'Inimigos atingidos pelo ataque livre devem testar Agilidade ou parar o movimento.',
    description_master: 'Ataques com armas de haste causam +1d4 de dano e mantêm o inimigo afastado.'
  },
  {
    id: 'mestre_armas',
    name: 'Mestre de Armas (Man-at-arms)',
    category: 'Combate',
    description_novice: 'Reduz a penalidade de Impedimento da armadura em 2.',
    description_adequate: 'A armadura concede +1d4 de proteção adicional.',
    description_master: 'Reduz a penalidade de Impedimento em 4 e a armadura concede +1d6 de proteção.'
  },
  {
    id: 'provocar',
    name: 'Provocar (Dominate)',
    category: 'Combate',
    description_novice: 'Pode usar Persuasão em vez de Precisão para ataques corpo a corpo.',
    description_adequate: 'Pode forçar um inimigo a hesitar (perder a ação) com um teste de Persuasão vs Resolução.',
    description_master: 'Inimigos que hesitam também concedem vantagem aos ataques contra eles.'
  },
  {
    id: 'punho_ferro',
    name: 'Punho de Ferro (Unarmed Duelist)',
    category: 'Combate',
    description_novice: 'Ataques desarmados causam 1d4 de dano (em vez de 1).',
    description_adequate: 'Ataques desarmados causam 1d6 de dano e não provocam ataques de oportunidade.',
    description_master: 'Ataques desarmados causam 1d8 de dano e podem nocautear o alvo.'
  },
  {
    id: 'alquimia',
    name: 'Alquimia (Alchemy)',
    category: 'Mística e Corrupção',
    description_novice: 'Pode identificar poções e venenos. Pode criar elixires básicos.',
    description_adequate: 'Pode criar poções curativas e venenos moderados.',
    description_master: 'Pode criar elixires raros e venenos mortais.'
  },
  {
    id: 'bruxaria',
    name: 'Bruxaria (Witchcraft)',
    category: 'Mística e Corrupção',
    description_novice: 'Acesso a rituais e feitiços de Bruxaria. Sofre 1d4 de Corrupção Temporária ao lançar.',
    description_adequate: 'Pode escolher um feitiço de Bruxaria para lançar com apenas 1 de Corrupção Temporária.',
    description_master: 'Pode escolher dois feitiços para lançar com apenas 1 de Corrupção Temporária.'
  },
  {
    id: 'feiticaria',
    name: 'Feitiçaria (Sorcery)',
    category: 'Mística e Corrupção',
    description_novice: 'Acesso a feitiços de Feitiçaria. Sofre 1d4 de Corrupção Temporária ao lançar.',
    description_adequate: 'Pode rolar a Corrupção Temporária duas vezes e escolher o menor valor.',
    description_master: 'Pode sacrificar Resistência em vez de ganhar Corrupção Temporária.'
  },
  {
    id: 'luz_sagrada',
    name: 'Luz Sagrada (Theurgy)',
    category: 'Mística e Corrupção',
    description_novice: 'Acesso a feitiços de Teurgia. Sofre 1d4 de Corrupção Temporária ao lançar.',
    description_adequate: 'Pode escolher um feitiço de Teurgia para lançar com apenas 1 de Corrupção Temporária.',
    description_master: 'Pode escolher dois feitiços para lançar com apenas 1 de Corrupção Temporária.'
  },
  {
    id: 'mago',
    name: 'Mago (Wizardry)',
    category: 'Mística e Corrupção',
    description_novice: 'Acesso a feitiços de Magia. Sofre 1d4 de Corrupção Temporária ao lançar.',
    description_adequate: 'Pode escolher um feitiço de Magia para lançar com apenas 1 de Corrupção Temporária.',
    description_master: 'Pode escolher dois feitiços para lançar com apenas 1 de Corrupção Temporária.'
  },
  {
    id: 'poder_mistico',
    name: 'Poder Místico (Mystical Power)',
    category: 'Mística e Corrupção',
    description_novice: 'Aprende um poder místico específico em nível Novato.',
    description_adequate: 'Aprimora o poder místico para o nível Adepto.',
    description_master: 'Aprimora o poder místico para o nível Mestre.'
  },
  {
    id: 'visao_bruxa',
    name: 'Visão de Bruxa (Witchsight)',
    category: 'Mística e Corrupção',
    description_novice: 'Pode ver a Sombra (corrupção) de seres e objetos com um teste de Vigilância.',
    description_adequate: 'Pode identificar a natureza exata da corrupção e feitiços ativos.',
    description_master: 'Pode ver através de ilusões e invisibilidade baseadas em magia.'
  },
  {
    id: 'acrobacia',
    name: 'Acrobacia (Acrobatics)',
    category: 'Movimento e Defesa',
    description_novice: 'Pode usar Agilidade para evitar ataques de oportunidade ao se mover.',
    description_adequate: 'Pode usar Agilidade para se levantar como ação livre.',
    description_master: 'Pode usar Agilidade para Defesa mesmo quando flanqueado ou surpreso.'
  },
  {
    id: 'guarda_costas',
    name: 'Guarda-Costas (Bodyguard)',
    category: 'Movimento e Defesa',
    description_novice: 'Pode receber um ataque direcionado a um aliado adjacente (usa sua própria Defesa).',
    description_adequate: 'Ganha +1d4 de Armadura contra o ataque interceptado.',
    description_master: 'Pode interceptar ataques mesmo se não estiver adjacente (movimento livre curto).'
  },
  {
    id: 'recuperacao',
    name: 'Recuperação (Recovery)',
    category: 'Movimento e Defesa',
    description_novice: 'Pode gastar uma ação para recuperar 1d4 de Resistência (uma vez por cena).',
    description_adequate: 'A recuperação aumenta para 1d6 de Resistência.',
    description_master: 'A recuperação aumenta para 1d8 de Resistência e pode ser usada duas vezes por cena.'
  },
  {
    id: 'saque_rapido',
    name: 'Saque Rápido (Quick Draw)',
    category: 'Movimento e Defesa',
    description_novice: 'Pode sacar uma arma como ação livre.',
    description_adequate: 'Pode recarregar bestas e armas de fogo mais rapidamente.',
    description_master: 'Pode trocar de armas e atacar na mesma ação sem penalidade.'
  },
  {
    id: 'sexto_sentido',
    name: 'Sexto Sentido (Sixth Sense)',
    category: 'Movimento e Defesa',
    description_novice: 'Pode usar Vigilância em vez de Agilidade para Iniciativa.',
    description_adequate: 'Pode usar Vigilância em vez de Precisão para ataques à distância.',
    description_master: 'Pode usar Vigilância em vez de Agilidade para Defesa.'
  },
  {
    id: 'adestrador_bestas',
    name: 'Adestrador de Bestas (Beast Lore)',
    category: 'Conhecimento e Sociais',
    description_novice: 'Pode identificar monstros e bestas com um teste de Astúcia.',
    description_adequate: 'Conhece as fraquezas e resistências das criaturas identificadas.',
    description_master: 'Ataques contra criaturas identificadas causam +1d4 de dano.'
  },
  {
    id: 'estrategista',
    name: 'Estrategista (Tactician)',
    category: 'Conhecimento e Sociais',
    description_novice: 'Pode usar Astúcia em vez de Agilidade para Iniciativa.',
    description_adequate: 'Pode usar Astúcia em vez de Agilidade para Defesa.',
    description_master: 'Concede vantagem a um aliado por turno com comandos táticos.'
  },
  {
    id: 'erudito',
    name: 'Erudito (Loremaster)',
    category: 'Conhecimento e Sociais',
    description_novice: 'Pode ler línguas antigas e identificar artefactos básicos.',
    description_adequate: 'Pode identificar propriedades mágicas de artefactos.',
    description_master: 'Pode usar pergaminhos e itens mágicos de qualquer tradição.'
  },
  {
    id: 'lider',
    name: 'Líder (Leader)',
    category: 'Conhecimento e Sociais',
    description_novice: 'Pode usar Persuasão em vez de Resolução para resistir a medo e efeitos mentais.',
    description_adequate: 'Aliados próximos podem usar a sua Persuasão para resistir a medo.',
    description_master: 'Pode conceder uma ação extra a um aliado por cena.'
  },
  {
    id: 'medico',
    name: 'Médico (Medicus)',
    category: 'Conhecimento e Sociais',
    description_novice: 'Pode curar 1d4 de Resistência de um aliado (uma vez por dia por alvo).',
    description_adequate: 'A cura aumenta para 1d6 e pode curar venenos básicos.',
    description_master: 'A cura aumenta para 1d8 e pode curar doenças graves.'
  },
  {
    id: 'venenoso',
    name: 'Venenoso (Poisoner)',
    category: 'Conhecimento e Sociais',
    description_novice: 'Pode aplicar veneno em armas sem risco de se envenenar.',
    description_adequate: 'Venenos aplicados duram por mais ataques.',
    description_master: 'Pode criar venenos concentrados que causam dano extra.'
  },
  {
    id: 'batedor',
    name: 'Batedor (Pathfinder)',
    category: 'Furtividade e Astúcia',
    description_novice: 'Ganha vantagem em testes de Vigilância para evitar emboscadas.',
    description_adequate: 'O grupo viaja mais rápido e com menos encontros aleatórios no Davokar.',
    description_master: 'Pode encontrar refúgios seguros mesmo nas partes mais sombrias da floresta.'
  },
  {
    id: 'estrangulador',
    name: 'Estrangulador (Strangler)',
    category: 'Furtividade e Astúcia',
    description_novice: 'Ataques furtivos com cordas/mãos nuas causam 1d6 de dano e silenciam o alvo.',
    description_adequate: 'O alvo fica imobilizado enquanto estiver sendo estrangulado.',
    description_master: 'Pode nocautear o alvo instantaneamente se ele falhar em um teste de Resistência.'
  },
  {
    id: 'infiltrado',
    name: 'Infiltrado (Infiltrator)',
    category: 'Furtividade e Astúcia',
    description_novice: 'Pode usar armaduras médias sem penalidade em testes de Discrição.',
    description_adequate: 'Pode usar armaduras pesadas sem penalidade em testes de Discrição.',
    description_master: 'Ataques furtivos ignoram parte da armadura do alvo.'
  }
];

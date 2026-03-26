export interface Trait {
  id: string;
  name: string;
  englishName?: string;
  category: string;
  description_I: string;
  description_II: string;
  description_III: string;
}

export const traits: Trait[] = [
  {
    id: 'ancestralidade_elfica',
    name: 'Ancestralidade Élfica',
    englishName: 'Elven Ancestry',
    category: 'Racial',
    description_I: 'Não precisa dormir (apenas transe). Imunidade a paralisia e sono mágico.',
    description_II: 'Sentido Élfico – Vantagem em testes de Vigilância para detectar corrupção.',
    description_III: 'Mente de Inverno – Pode escolher ignorar uma falha em teste de Resolução por cena.'
  },
  {
    id: 'sem_vida',
    name: 'Sem Vida',
    englishName: 'Undead',
    category: 'Racial',
    description_I: 'Não respira, não come e não sofre dano de veneno ou doenças. Corrupção permanente nunca pode ser removida, mas não morre ao exceder o limite (torna-se uma abominação controlada pelo mestre).',
    description_II: 'Mão da Morte – Seus ataques desarmados ou com armas de metal causam Corrupção Temporária ao alvo.',
    description_III: 'Pode sobreviver mesmo se a Resistência chegar a 0, precisando de um teste de Resolução para não "desligar".'
  },
  {
    id: 'memoria_hereditaria',
    name: 'Memória Hereditária',
    englishName: 'Hereditary Memory',
    category: 'Racial',
    description_I: 'Pode fazer um teste de Astúcia para "lembrar" de uma habilidade que não possui por uma cena.',
    description_II: 'Ganha bônus em testes de Erudição (Loremaster) e identificação de artefatos.',
    description_III: 'Pode usar a memória de seus ancestrais para ganhar vantagem em qualquer teste de Atributo.'
  },
  {
    id: 'contatos_privilegiados',
    name: 'Contatos Privilegiados',
    englishName: 'Privileged Contacts',
    category: 'Racial',
    description_I: 'O personagem tem um aliado ou rede de contatos que fornece informações ou recursos.',
    description_II: 'Os contatos podem fornecer equipamentos raros ou acesso a locais proibidos.',
    description_III: 'O personagem pode convocar uma pequena unidade de aliados para ajudar em um combate ou missão.'
  },
  {
    id: 'armadura_natural',
    name: 'Armadura Natural (Natural Armor)',
    category: 'Combate e Dano',
    description_I: 'Fornece 1D4 de proteção natural que acumula com armaduras.',
    description_II: 'Fornece 1D6 de proteção natural que acumula com armaduras.',
    description_III: 'Fornece 1D8 de proteção natural que acumula com armaduras.'
  },
  {
    id: 'armas_naturais',
    name: 'Armas Naturais (Natural Weapons)',
    category: 'Combate e Dano',
    description_I: 'Garras, dentes ou chifres causam 1D4 de dano.',
    description_II: 'Garras, dentes ou chifres causam 1D6 de dano.',
    description_III: 'Garras, dentes ou chifres causam 1D8 de dano.'
  },
  {
    id: 'asfixiante',
    name: 'Asfixiante (Strangler)',
    category: 'Combate e Dano',
    description_I: 'Permite sufocar o alvo. Causa 1D4 de dano por turno ignorando armadura.',
    description_II: 'Permite sufocar o alvo. Causa 1D6 de dano por turno ignorando armadura.',
    description_III: 'Permite sufocar o alvo. Causa 1D8 de dano por turno ignorando armadura.'
  },
  {
    id: 'ataque_area',
    name: 'Ataque de Área (Area Attack)',
    category: 'Combate e Dano',
    description_I: 'Ataca todos os inimigos em uma zona pequena (cone ou círculo).',
    description_II: 'Ataca todos os inimigos em uma zona média.',
    description_III: 'Ataca todos os inimigos em uma zona grande.'
  },
  {
    id: 'ataque_longa_distancia',
    name: 'Ataque de Longa Distância (Long-reach Attack)',
    category: 'Combate e Dano',
    description_I: 'Permite atacar a uma distância maior (alcance de armas longas).',
    description_II: 'Permite atacar a uma distância ainda maior, ganhando ataques livres contra quem se aproxima.',
    description_III: 'Alcance extremo, mantendo múltiplos inimigos afastados.'
  },
  {
    id: 'combate_grupo',
    name: 'Combate em Grupo (Group-living)',
    category: 'Combate e Dano',
    description_I: 'Ganha vantagem no ataque se houver pelo menos um aliado adjacente ao alvo.',
    description_II: 'Ganha vantagem e +1d4 de dano se houver aliados adjacentes.',
    description_III: 'Ganha vantagem e +1d6 de dano se houver aliados adjacentes.'
  },
  {
    id: 'destruidor',
    name: 'Destruidor (Wrecker)',
    category: 'Combate e Dano',
    description_I: 'Causa dano extra contra estruturas e escudos.',
    description_II: 'Pode destruir escudos ou armas do oponente com um ataque bem-sucedido.',
    description_III: 'Ignora e destrói armaduras e escudos com facilidade.'
  },
  {
    id: 'envenenado',
    name: 'Envenenado (Poisonous)',
    category: 'Combate e Dano',
    description_I: 'Aplica veneno fraco (1D4 dano por turno) após um ataque bem-sucedido.',
    description_II: 'Aplica veneno moderado (1D6 dano por turno).',
    description_III: 'Aplica veneno forte (1D8 dano por turno).'
  },
  {
    id: 'ferimento_infeccioso',
    name: 'Ferimento Infeccioso (Infectious)',
    category: 'Combate e Dano',
    description_I: 'Feridas causam doença leve se não tratadas.',
    description_II: 'Feridas causam doença moderada, impedindo cura natural.',
    description_III: 'Feridas causam doença grave e letal a longo prazo.'
  },
  {
    id: 'pancada',
    name: 'Pancada (Slam)',
    category: 'Combate e Dano',
    description_I: 'Pode derrubar o alvo após o impacto (teste de Força).',
    description_II: 'Pode derrubar e empurrar o alvo para longe.',
    description_III: 'Derruba, empurra e atordoa o alvo.'
  },
  {
    id: 'sifao_vida',
    name: 'Sifão de Vida (Life Drain)',
    category: 'Combate e Dano',
    description_I: 'Cura 1 ponto de Resistência ao causar dano.',
    description_II: 'Cura metade do dano causado em Resistência.',
    description_III: 'Cura o valor total do dano causado em Resistência.'
  },
  {
    id: 'abominacao',
    name: 'Abominação (Abomination)',
    category: 'Defensivos e Resistência',
    description_I: 'Imunidade a controle mental básico. Corrupção não a afeta.',
    description_II: 'Imunidade a venenos e doenças. Sofre dano extra de rituais sagrados.',
    description_III: 'Regenera em áreas corrompidas. Imunidade total a alterações mentais.'
  },
  {
    id: 'armadura_espiritos',
    name: 'Armadura de Espíritos (Spirit Armor)',
    category: 'Defensivos e Resistência',
    description_I: 'Sofre apenas metade do dano de armas normais. Armas mágicas causam dano total.',
    description_II: 'Imune a armas normais. Armas mágicas e fogo causam dano total.',
    description_III: 'Imune a armas normais e fogo comum. Apenas magia e fogo místico causam dano.'
  },
  {
    id: 'colossal',
    name: 'Colossal (Colossal)',
    category: 'Defensivos e Resistência',
    description_I: 'Ignora ataques que causem 3 ou menos de dano total.',
    description_II: 'Ignora ataques que causem 5 ou menos de dano total.',
    description_III: 'Ignora ataques que causem 7 ou menos de dano total.'
  },
  {
    id: 'corpo_enxame',
    name: 'Corpo de Enxame (Swarm)',
    category: 'Defensivos e Resistência',
    description_I: 'Armas comuns causam apenas 1 de dano. Ataques de área causam dano normal.',
    description_II: 'Armas comuns não causam dano. Apenas ataques de área ou fogo afetam o enxame.',
    description_III: 'O enxame se divide, exigindo múltiplos ataques de área para ser destruído.'
  },
  {
    id: 'indestrutivel',
    name: 'Indestrutível (Robust)',
    category: 'Defensivos e Resistência',
    description_I: 'Aumenta o dano físico em +1D4 e a proteção natural em +1D4. Defesa baseada em Força.',
    description_II: 'Aumenta o dano físico em +1D6 e a proteção natural em +1D6.',
    description_III: 'Aumenta o dano físico em +1D8 e a proteção natural em +1D8.'
  },
  {
    id: 'imortal',
    name: 'Imortal (Undead)',
    category: 'Defensivos e Resistência',
    description_I: 'Não respira, não se cansa. Imune a venenos e doenças.',
    description_II: 'Só morre se a Resistência chegar a zero por fogo ou magia sagrada.',
    description_III: 'Se destruído, retorna após alguns dias a menos que um ritual específico seja realizado.'
  },
  {
    id: 'regeneracao',
    name: 'Regeneração (Regeneration)',
    category: 'Defensivos e Resistência',
    description_I: 'Recupera 1D4 de Resistência a cada turno.',
    description_II: 'Recupera 1D6 de Resistência a cada turno.',
    description_III: 'Recupera 1D8 de Resistência a cada turno.'
  },
  {
    id: 'resistencia_magica',
    name: 'Resistência Mágica (Manifestation)',
    category: 'Defensivos e Resistência',
    description_I: 'Ganha vantagem em testes para resistir a poderes místicos.',
    description_II: 'Ignora efeitos secundários de feitiços e recebe metade do dano mágico.',
    description_III: 'Pode anular um feitiço direcionado a ela por turno.'
  },
  {
    id: 'alado',
    name: 'Alado (Winged)',
    category: 'Movimentação e Sentidos',
    description_I: 'Pode voar a curtas distâncias.',
    description_II: 'Pode voar livremente, ganhando vantagem contra alvos no chão.',
    description_III: 'Voo extremamente rápido, pode realizar ataques de mergulho devastadores.'
  },
  {
    id: 'anfibio',
    name: 'Anfíbio (Amphibian)',
    category: 'Movimentação e Sentidos',
    description_I: 'Pode prender a respiração por longos períodos e nadar bem.',
    description_II: 'Respira debaixo d\'água e se move sem penalidades.',
    description_III: 'Ganha vantagem em ataques e defesa enquanto estiver submerso.'
  },
  {
    id: 'cavador',
    name: 'Cavador (Tunneler)',
    category: 'Movimentação e Sentidos',
    description_I: 'Pode cavar através de terra solta.',
    description_II: 'Move-se por baixo da terra rapidamente, podendo surgir para ataques surpresa.',
    description_III: 'Pode cavar através de rocha sólida e criar túneis permanentes.'
  },
  {
    id: 'rapido',
    name: 'Rápido (Fleet-footed)',
    category: 'Movimentação e Sentidos',
    description_I: 'Velocidade de movimento aumentada em 50%.',
    description_II: 'Velocidade de movimento dobrada. Pode desengajar como ação livre.',
    description_III: 'Move-se tão rápido que ataques de oportunidade têm desvantagem.'
  },
  {
    id: 'sentidos_agucados',
    name: 'Sentidos Aguçados (Acute Senses)',
    category: 'Movimentação e Sentidos',
    description_I: 'Ganha vantagem em testes de Vigilância.',
    description_II: 'Pode ver no escuro e farejar inimigos ocultos.',
    description_III: 'Impossível de ser surpreendido ou flanqueado.'
  },
  {
    id: 'teia',
    name: 'Teia (Web)',
    category: 'Movimentação e Sentidos',
    description_I: 'Lança teias que reduzem a velocidade do alvo.',
    description_II: 'Lança teias que imobilizam o alvo (exige teste de Força para escapar).',
    description_III: 'Teias causam dano ácido contínuo enquanto o alvo estiver preso.'
  },
  {
    id: 'aura_corrupcao',
    name: 'Aura de Corrupção (Corrupting Attack)',
    category: 'Místicos e Corrupção',
    description_I: 'O ataque causa 1 ponto de Corrupção Temporária além do dano físico.',
    description_II: 'O ataque causa 1D4 de Corrupção Temporária.',
    description_III: 'O ataque causa 1D6 de Corrupção Temporária e cura a criatura.'
  },
  {
    id: 'drenar_sombra',
    name: 'Drenar Sombra (Shadow Drench)',
    category: 'Místicos e Corrupção',
    description_I: 'Escurece a área ao redor, dificultando a visão dos inimigos (penalidade de -2).',
    description_II: 'Cria escuridão mágica profunda. Apenas visão mística pode penetrar.',
    description_III: 'Inimigos na escuridão sofrem dano contínuo de frio/corrupção.'
  },
  {
    id: 'olhar_aterrorizante',
    name: 'Olhar Aterrorizante (Terrorspell)',
    category: 'Místicos e Corrupção',
    description_I: 'Força um teste de Resolução. Se falhar, o alvo não pode se aproximar.',
    description_II: 'Se falhar no teste, o alvo foge em pânico por 1D4 turnos.',
    description_III: 'O terror é tão grande que causa dano à Resistência se o alvo falhar no teste.'
  },
  {
    id: 'possessao',
    name: 'Possessão (Possession)',
    category: 'Místicos e Corrupção',
    description_I: 'O espírito tenta assumir o controle. Teste de Resolução vs Resolução.',
    description_II: 'Se bem-sucedido, controla o corpo do alvo por 1D4 turnos.',
    description_III: 'Controle permanente até que o espírito seja exorcizado.'
  },
  {
    id: 'sopro_fogo_gelo',
    name: 'Sopro de Fogo/Gelo (Breath Weapon)',
    category: 'Místicos e Corrupção',
    description_I: 'Ataque em cone causando 1D4 de dano elemental (teste de Agilidade para metade).',
    description_II: 'Ataque em cone causando 1D8 de dano elemental.',
    description_III: 'Ataque em cone causando 1D12 de dano elemental e efeitos secundários (queimar/congelar).'
  }
];

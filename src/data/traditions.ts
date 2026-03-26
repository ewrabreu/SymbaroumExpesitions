export interface Tradition {
  name: string;
  category: string;
  profile: string;
  corruptionRule: string;
  levels?: {
    novice?: string;
    adept?: string;
    master?: string;
  };
  mechanics?: string;
  risk?: string;
  focus?: string;
}

export const traditions: Tradition[] = [
  {
    name: "Teurgia",
    category: "Livro Básico",
    profile: "Cavaleiros do Sol e monges de Prios.",
    corruptionRule: "O personagem reduz a Corrupção Temporária sofrida em 1 ponto (mínimo 0) sempre que conjura um poder da tradição.",
    levels: {
      novice: "Pode aprender poderes de Teurgia e rituais.",
      adept: "Reduz a Corrupção em 1D4 (em vez de apenas 1) ao aprender um novo poder da tradição.",
      master: "A Corrupção Permanente por aprender novos poderes de Teurgia é reduzida a 1."
    }
  },
  {
    name: "Bruxaria",
    category: "Livro Básico",
    profile: "Animistas, guias espirituais e bruxas do Davokar.",
    corruptionRule: "Pode realizar um teste de Resolute para ignorar a corrupção temporária de um feitiço (sofre apenas 1 ponto se falhar no teste, ou 0 se passar, dependendo do nível).",
    focus: "Rituais de natureza, metamorfose e maldições."
  },
  {
    name: "Ordo Magica",
    category: "Livro Básico",
    profile: "Estudiosos, acadêmicos e magos teóricos.",
    corruptionRule: "Utilizam 'focos rítmicos'. A Corrupção Temporária é limitada a 1 ponto por conjuração se o teste de Resolute for bem-sucedido.",
    levels: {
      novice: "A progressão foca em reduzir a carga mental e permitir o uso de rituais complexos sem custo de corrupção permanente."
    }
  },
  {
    name: "Feitiçaria",
    category: "Livro Básico",
    profile: "Aqueles que buscam atalhos perigosos ou servem a entidades sombrias.",
    corruptionRule: "Ao contrário das outras, a Feitiçaria muitas vezes usa a Corrupção como combustível. O feiticeiro pode passar Corrupção para outros ou ganhar bônus por estar corrompido.",
    risk: "É a tradição que mais rápido leva à transformação em Blight-born (Abominação)."
  },
  {
    name: "Simbolismo",
    category: "Livro Avançado",
    profile: "Mestres de runas e glifos gravados em objetos/pele.",
    corruptionRule: "A corrupção é sofrida no momento da criação da runa, não no disparo.",
    mechanics: "Os poderes são preparados com antecedência (runas)."
  },
  {
    name: "Magia de Cajado",
    category: "Livro Avançado",
    profile: "Guerreiros-magos que utilizam cajados rúnicos.",
    corruptionRule: "O cajado funciona como um receptáculo para a corrupção e como uma arma poderosa em combate corpo a corpo."
  },
  {
    name: "Canto dos Trolls",
    category: "Livro Avançado",
    profile: "Magia baseada em voz e som, típica dos Trolls civilizados.",
    corruptionRule: "Efeitos de área persistentes (enquanto o personagem continuar cantando)."
  }
];

export type Category =
  | "Datas Comemorativas"
  | "Conscientização & Cuidado"
  | "Volta às Aulas"
  | "Jogos"
  | "Kits para Sala"
  | "Criações Artísticas"
  | "Arte que Acolhe"
  | "Leitura & Aconchego"
  | "Yoga & Bem-estar"
  | "Livros";

export interface Product {
  id: string;
  title: string;
  price: number;
  category: Category;
  month: number; // 1-12
  theme: string;
  audience: string;
  image: string;
  hotmartUrl: string;
}

export const CATEGORIES: Category[] = [
  "Datas Comemorativas",
  "Conscientização & Cuidado",
  "Volta às Aulas",
  "Jogos",
  "Kits para Sala",
  "Arte que Acolhe",
  "Leitura & Aconchego",
  "Yoga & Bem-estar",
  "Livros",
];

export const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

// Imagens placeholder leves do Unsplash (com lazy loading nos cards)
const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=70`;

export const PRODUCTS: Product[] = [
  // Janeiro
  { id: "p1", title: "Kit Boas-Vindas Coloridas", price: 19.9, category: "Volta às Aulas", month: 1, theme: "Acolhida", audience: "Educação Infantil", image: img("photo-1503676260728-1c00da094a0b"), hotmartUrl: "#" },
  { id: "p2", title: "Painel de Combinados da Turma", price: 14.9, category: "Kits para Sala", month: 1, theme: "Rotina", audience: "Fundamental I", image: img("photo-1513151233558-d860c5398176"), hotmartUrl: "#" },

  // Fevereiro
  { id: "p3", title: "Atividades de Carnaval", price: 17.5, category: "Datas Comemorativas", month: 2, theme: "Carnaval", audience: "Educação Infantil", image: img("photo-1514525253161-7a46d19cd819"), hotmartUrl: "#" },
  { id: "p4", title: "Máscaras para Pintar", price: 12.0, category: "Criações Artísticas", month: 2, theme: "Carnaval", audience: "Educação Infantil", image: img("photo-1513151233558-d860c5398176"), hotmartUrl: "#" },

  // Março
  { id: "p5", title: "Outono em Folhas", price: 15.0, category: "Criações Artísticas", month: 3, theme: "Estações", audience: "Fundamental I", image: img("photo-1507371341162-763b5e419408"), hotmartUrl: "#" },

  // Abril
  { id: "p6", title: "Páscoa com Arte", price: 19.9, category: "Datas Comemorativas", month: 4, theme: "Páscoa", audience: "Educação Infantil", image: img("photo-1521967906867-14ec9d64bee8"), hotmartUrl: "#" },

  // Maio
  { id: "p7", title: "Cartões para o Dia das Mães", price: 16.9, category: "Datas Comemorativas", month: 5, theme: "Dia das Mães", audience: "Educação Infantil", image: img("photo-1490750967868-88aa4486c946"), hotmartUrl: "#" },
  { id: "p8", title: "Quadro Coração de Mamãe", price: 21.0, category: "Criações Artísticas", month: 5, theme: "Dia das Mães", audience: "Fundamental I", image: img("photo-1502086223501-7ea6ecd79368"), hotmartUrl: "#" },
  { id: "p9", title: "Maio Amarelo na Escola", price: 14.5, category: "Conscientização & Cuidado", month: 5, theme: "Maio Amarelo", audience: "Fundamental I", image: img("photo-1517242810446-cc8951b2be40"), hotmartUrl: "#" },

  // Junho
  { id: "p10", title: "Festa Junina Completa", price: 24.9, category: "Datas Comemorativas", month: 6, theme: "Festa Junina", audience: "Educação Infantil", image: img("photo-1530549387789-4c1017266635"), hotmartUrl: "#" },
  { id: "p11", title: "Bandeirinhas Criativas", price: 11.9, category: "Criações Artísticas", month: 6, theme: "Festa Junina", audience: "Educação Infantil", image: img("photo-1499728603263-13726abce5fd"), hotmartUrl: "#" },
  { id: "p12", title: "Jogo da Quadrilha", price: 13.5, category: "Jogos", month: 6, theme: "Festa Junina", audience: "Fundamental I", image: img("photo-1513151233558-d860c5398176"), hotmartUrl: "#" },

  // Julho
  { id: "p13", title: "Férias com Arte", price: 18.0, category: "Criações Artísticas", month: 7, theme: "Férias", audience: "Educação Infantil", image: img("photo-1471107340929-a87cd0f5b5f3"), hotmartUrl: "#" },

  // Agosto
  { id: "p14", title: "Dia dos Pais Afetuoso", price: 16.9, category: "Datas Comemorativas", month: 8, theme: "Dia dos Pais", audience: "Educação Infantil", image: img("photo-1503454537195-1dcabb73ffb9"), hotmartUrl: "#" },
  { id: "p15", title: "Folclore Brasileiro", price: 22.0, category: "Datas Comemorativas", month: 8, theme: "Folclore", audience: "Fundamental I", image: img("photo-1528459801416-a9e53bbf4e17"), hotmartUrl: "#" },

  // Setembro
  { id: "p16", title: "Setembro Amarelo na Escola", price: 15.0, category: "Conscientização & Cuidado", month: 9, theme: "Setembro Amarelo", audience: "Fundamental I", image: img("photo-1465101046530-73398c7f28ca"), hotmartUrl: "#" },

  // Outubro
  { id: "p17", title: "Dia das Crianças Encantado", price: 19.9, category: "Datas Comemorativas", month: 10, theme: "Dia das Crianças", audience: "Educação Infantil", image: img("photo-1503454537195-1dcabb73ffb9"), hotmartUrl: "#" },

  // Novembro
  { id: "p18", title: "Consciência Negra com Arte", price: 21.0, category: "Conscientização & Cuidado", month: 11, theme: "Consciência Negra", audience: "Fundamental I", image: img("photo-1531058020387-3be344556be6"), hotmartUrl: "#" },

  // Dezembro
  { id: "p19", title: "Natal Mágico", price: 24.9, category: "Datas Comemorativas", month: 12, theme: "Natal", audience: "Educação Infantil", image: img("photo-1512389142860-9c449e58a543"), hotmartUrl: "#" },
  { id: "p20", title: "Cartões de Final de Ano", price: 13.5, category: "Criações Artísticas", month: 12, theme: "Natal", audience: "Fundamental I", image: img("photo-1481349518771-20055b2a7b24"), hotmartUrl: "#" },
];

export interface ActivityPost {
  id: string;
  title: string;
  videoId: string; // YouTube ID
  blurb: string;
}

export const ACTIVITIES: ActivityPost[] = [
  {
    id: "a1",
    title: "Pintura com elementos da natureza",
    videoId: "dQw4w9WgXcQ",
    blurb: "Uma forma simples de envolver as crianças com texturas, folhas e tinta. Inspiração para começar.",
  },
  {
    id: "a2",
    title: "Painel coletivo de boas-vindas",
    videoId: "M7lc1UVf-VE",
    blurb: "Ideia rápida para acolher a turma no início do mês com cores e letras criativas.",
  },
  {
    id: "a3",
    title: "Carimbos artesanais",
    videoId: "aqz-KE-bpKQ",
    blurb: "Um convite à criação livre — perfeito como aquecimento antes de uma atividade impressa.",
  },
];

export interface Author {
  name: string;
  avatar: string;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  date: string;
  image: string;
  author: Author;
  tags: string[];
  views?: number;
  shares?: number;
  publishedAt?: string; // ISO date
  isLive?: boolean;
  isBreaking?: boolean;
  isFeatured?: boolean;
  videoUrl?: string | null;
}

const mockArticles: Article[] = [
  {
    id: 1,
    title: "RDC : Le gouvernement lance un nouveau programme de développement",
    slug: "rdc-gouvernement-programme-developpement",
    excerpt: "Le gouvernement de la République Démocratique du Congo a annoncé aujourd'hui le lancement d'un ambitieux programme de développement...",
    content: "Le gouvernement de la République Démocratique du Congo a dévoilé aujourd'hui un ambitieux programme de développement visant à moderniser les infrastructures du pays et à stimuler la croissance économique. Ce plan quinquennal prévoit des investissements majeurs dans les secteurs clés de l'économie, notamment les transports, l'énergie et l'agriculture.",
    category: "Politique",
    date: "29 Oct 2025",
    image: "/images/articles/politique-reforme.jpg",
    author: {
      name: "Jean Mukendi",
      avatar: "/images/avatars/avatar1.jpg"
    },
    tags: ["Politique", "Développement", "RDC", "Gouvernement"],
    views: 1245,
    shares: 56,
    publishedAt: new Date().toISOString(),
    isLive: false,
    isBreaking: true,
    isFeatured: true,
    videoUrl: null,
  },
  {
    id: 2,
    title: "Kinshasa : Inauguration d'un nouveau centre culturel",
    slug: "kinshasa-inauguration-centre-culturel",
    excerpt: "Un nouveau centre culturel ouvre ses portes à Kinshasa, offrant un espace dédié aux artistes locaux et à la promotion de la culture congolaise...",
    content: "Le centre culturel de Kinshasa a officiellement ouvert ses portes aujourd'hui, marquant une étape importante dans le développement culturel de la capitale. Cette infrastructure moderne, qui s'étend sur plus de 2000 mètres carrés, comprend des galeries d'art, un auditorium pour les spectacles vivants, et des espaces de formation pour les jeunes artistes.",
    category: "Culture",
    date: "28 Oct 2025",
    image: "/images/articles/festival-culture.jpg",
    author: {
      name: "Marie Lutondo",
      avatar: "/images/avatars/avatar2.jpg"
    },
    tags: ["Culture", "Art", "Kinshasa", "Infrastructure"],
    views: 845,
    shares: 12,
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    isLive: false,
    isBreaking: false,
    isFeatured: true,
    videoUrl: null
  },
  {
    id: 3,
    title: "Économie : La RDC enregistre une croissance de 5,8%",
    slug: "economie-rdc-croissance",
    excerpt: "Les derniers chiffres économiques montrent une croissance significative de l'économie congolaise au troisième trimestre...",
    content: "Les indicateurs économiques du troisième trimestre révèlent une croissance robuste de 5,8% pour l'économie congolaise. Cette performance remarquable est attribuée à la diversification économique, à l'augmentation des investissements étrangers et à la stabilité macroéconomique maintenue par la Banque Centrale.",
    category: "Économie",
    date: "27 Oct 2025",
    image: "/images/articles/economie-plan.jpg",
    author: {
      name: "Paul Kabongo",
      avatar: "/images/avatars/avatar3.jpg"
    },
    tags: ["Économie", "Croissance", "Finance", "Développement"],
    views: 2340,
    shares: 210,
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    isLive: true,
    isBreaking: false,
    isFeatured: false,
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  },
  {
    id: 4,
    title: "Victoire historique des Léopards en qualification",
    slug: "victoire-historique-leopards",
    excerpt: "L'équipe nationale de football de la RDC réalise une performance exceptionnelle lors des qualifications...",
    content: "Les Léopards de la RDC ont écrit une nouvelle page de leur histoire en remportant une victoire décisive dans le cadre des qualifications. Cette performance exceptionnelle, fruit d'une préparation intensive et d'une stratégie bien élaborée, rapproche l'équipe de son objectif de qualification.",
    category: "Sport",
    date: "26 Oct 2025",
    image: "/images/articles/victoire-sport.jpg",
    author: {
      name: "David Mwamba",
      avatar: "/images/avatars/avatar4.jpg"
    },
    tags: ["Sport", "Football", "Léopards", "Qualification"],
    views: 5120,
    shares: 420,
    publishedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    isLive: true,
    isBreaking: false,
    isFeatured: false,
    videoUrl: null
  },
  {
    id: 5,
    title: "Les femmes entrepreneures à l'honneur",
    slug: "femmes-entrepreneures-honneur",
    excerpt: "Un programme national met en lumière les succès des femmes entrepreneures congolaises...",
    content: "Une initiative nationale célèbre les réussites des femmes entrepreneures congolaises qui transforment le paysage économique du pays. Ces femmes leaders innovent dans divers secteurs, de la technologie à l'agriculture, créant des emplois et inspirant la prochaine génération d'entrepreneures.",
    category: "Femme",
    date: "25 Oct 2025",
    image: "/images/articles/femmes-tech.jpg",
    author: {
      name: "Sarah Mbombo",
      avatar: "/images/avatars/avatar5.jpg"
    },
    tags: ["Femmes", "Entrepreneuriat", "Innovation", "Économie"],
    views: 980,
    shares: 80,
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    isLive: false,
    isBreaking: false,
    isFeatured: false,
    videoUrl: null
  }
];

export default mockArticles;
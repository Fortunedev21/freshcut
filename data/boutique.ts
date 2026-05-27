export interface Product {
  id: string;
  nom: string;
  categorie: "BARBE" | "CHEVEUX" | "ACCESSOIRES" | "MERCHANDISING";
  prix: number;
  description: string;
  image?: string;
  stock: number;
}

export const PRODUCTS: Product[] = [
  {
    id: "oil-1",
    nom: "Huile Barbe Premium",
    categorie: "BARBE",
    prix: 12500,
    description: "Une huile artisanale enrichie à l'huile de baobab pour une barbe douce et nourrie. Parfum cèdre et santal.",
    stock: 15,
  },
  {
    id: "wax-1",
    nom: "Cire Mate Coiffante",
    categorie: "CHEVEUX",
    prix: 8000,
    description: "Fixation forte, rendu naturel. Idéale pour les dégradés et les styles texturés. Résiste à l'humidité de Cotonou.",
    stock: 12,
  },
  {
    id: "merch-1",
    nom: "T-Shirt Freshcut 229",
    categorie: "MERCHANDISING",
    prix: 15000,
    description: "Coton 220g haut de gamme. Coupe oversize. Logo sérigraphié poitrine et dos.",
    stock: 20,
  },
  {
    id: "acc-1",
    nom: "Peigne en Corne",
    categorie: "ACCESSOIRES",
    prix: 5000,
    description: "Peigne antistatique taillé dans la masse. Respecte la fibre capillaire.",
    stock: 5,
  },
];

export interface Coupe {
  id: string;
  nom: string;
  description: string;
  tempsEstimation: string;
  difficulte: 1 | 2 | 3 | 4 | 5;
  image: string;
  conseils: string[];
}

export const COUPES: Coupe[] = [
  {
    id: "low-fade",
    nom: "Low Fade",
    description: "Un dégradé subtil qui commence bas près des oreilles et de la nuque. Un classique indémodable.",
    tempsEstimation: "45 min",
    difficulte: 3,
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop",
    conseils: ["Utilisez une cire mate", "Entretien toutes les 2 semaines"],
  },
  {
    id: "skin-fade",
    nom: "Skin Fade Burst",
    description: "Un dégradé à blanc prononcé autour de l'oreille, idéal pour mettre en avant une texture naturelle sur le dessus.",
    tempsEstimation: "60 min",
    difficulte: 5,
    image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=2070&auto=format&fit=crop",
    conseils: ["Hydratez le cuir chevelu", "Parfait avec un contour net"],
  },
  {
    id: "taper-fade",
    nom: "Classic Taper",
    description: "Dégradé léger uniquement sur les favoris et la nuque. Garde une longueur naturelle sur les côtés.",
    tempsEstimation: "40 min",
    difficulte: 2,
    image: "https://images.unsplash.com/photo-1599351431247-f10b21ce5012?q=80&w=1974&auto=format&fit=crop",
    conseils: ["Peignez quotidiennement", "Utilisez un baume hydratant"],
  },
  {
    id: "waves",
    nom: "360 Waves",
    description: "Style iconique nécessitant une technique de brossage précise pour créer des ondulations circulaires.",
    tempsEstimation: "30 min",
    difficulte: 4,
    image: "https://images.unsplash.com/photo-1622286332307-0c76572cgf0a?q=80&w=1974&auto=format&fit=crop",
    conseils: ["Port d'un durag la nuit obligatoire", "Brossage régulier"],
  },
];

# Freshcut 229 — Barbershop Premium Cotonou

Bienvenue sur le dépôt officiel du site web de **Freshcut 229**, le salon de coiffure et barbier de référence à Cotonou (Bénin). Cette application web moderne, fluide et élégante est conçue pour offrir une expérience utilisateur haut de gamme (lookbook, boutique en ligne, réservation en ligne et carte de fidélité).

---

## 🌟 Fonctionnalités principales

*   **Page d'accueil immersive** : Design sombre premium (*glassmorphism*) avec animations micro-interactives au défilement et au survol.
*   **Catalogue de styles (Lookbook)** : Présentation des coupes signatures de l'équipe avec indicateurs de temps, de difficulté, conseils d'experts et zoom d'image.
*   **Boutique en ligne (E-commerce)** : Vente de produits capillaires et d'accessoires de soins avec chargement progressif (*skeletons*), filtrage par catégorie et panier interactif persistant.
*   **Espace Fidélité client** : Suivi des points de fidélité via numéro de téléphone (la 10ème coupe est gratuite !) et historique des rendez-vous.
*   **Réservation de services en ligne** : Parcours d'inscription par étapes avec MTN/Moov/Celtiis mobile money (simulé).

---

## 🛠️ Stack Technique

*   **Framework** : [Next.js 16 (App Router)](https://nextjs.org/) avec Turbopack.
*   **Langage** : [TypeScript](https://www.typescriptlang.org/) pour la robustesse et le typage strict.
*   **Styles & UI** : [Tailwind CSS v4](https://tailwindcss.com/) & [PostCSS](https://postcss.org/).
*   **Animations** : [Motion v12 (Framer Motion)](https://motion.dev/) pour des transitions fluides.
*   **Iconographie** : [Lucide React](https://lucide.dev/) pour des icônes vectorielles nettes.

---

## 🚀 Démarrage rapide

### Prérequis

Assurez-vous d'avoir installé [Node.js](https://nodejs.org/) (version 18 ou supérieure recommandée).

### Installation

1. Clonez le dépôt du projet :
   ```bash
   git clone https://github.com/votre-compte/freshcut229.git
   cd freshcut229
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

### Commandes utiles

*   **Lancer le serveur de développement** :
    ```bash
    npm run dev
    ```
    Le site est alors accessible sur [http://localhost:3000](http://localhost:3000).

*   **Compiler le site pour la production** :
    ```bash
    npm run build
    ```

*   **Lancer le site en mode production localement** (après compilation) :
    ```bash
    npm run start
    ```

*   **Vérifier le formatage et les erreurs de code** (Linter) :
    ```bash
    npm run lint
    ```

---

## 📁 Architecture du projet

```text
├── app/                  # Pages Next.js, layouts et points d'accès API
│   ├── about/            # Section "À propos"
│   ├── admin/            # Dashboard administrateur
│   ├── boutique/         # Catalogue produit & pages produits dynamiques
│   ├── contact/          # Formulaire de contact et coordonnées
│   ├── coupes/           # Lookbook & détails de styles dynamiques
│   ├── profile/          # Espace fidélité client
│   ├── reserver/         # Tunnel de réservation par étapes
│   ├── services/         # Liste complète des prestations & FAQs
│   ├── globals.css       # Fichier CSS global (Variables Tailwind v4)
│   ├── layout.tsx        # Layout racine de l'application
│   └── page.tsx          # Page d'accueil principale
├── components/           # Composants React partagés (Header, CartDrawer, UI elements)
├── contexts/             # Contextes d'état React (CartContext, LoyaltyContext)
├── data/                 # Données statiques (produits, témoignages, coupes)
├── utils/                # Utilitaires de formatage de prix et helpers
└── public/               # Ressources statiques (logos, images, icônes)
```

---

## 🛡️ Sécurité (Security Policy)

La sécurité du projet Freshcut 229 est une priorité absolue.

### Signalement de vulnérabilités

Si vous découvrez une faille de sécurité dans cette application, veuillez ne pas l'exposer publiquement via les tickets d'incidents (issues). Envoyez plutôt un e-mail détaillé à : [security@freshcut229.com](mailto:security@freshcut229.com).

Nous accuserons réception de votre signalement sous 48 heures et proposerons un correctif dans les plus brefs délais.

### Bonnes pratiques internes

*   Ne poussez **jamais** de fichiers `.env` contenant des clés API privées sur les dépôts distants.
*   Utilisez des variables d'environnement de production sur votre plateforme de déploiement (ex: Vercel).
*   Maintenez régulièrement les packages à jour via `npm update` pour éviter les dépendances faillibles.

---

## 📅 Historique des changements (Changelog)

### [1.1.0] - 2026-05-27
#### Ajouté
*   Création d'un **Header global premium** avec intégration dynamique du panier (`CartDrawer`), accès au profil utilisateur et bouton d'action de réservation.
*   Ajout d'un utilitaire `formatPrice` dans `utils/format.ts` pour uniformiser l'affichage des monnaies (FCFA) sur le serveur et le client.

#### Corrigé
*   **Hydration Mismatch** : Résolution des alertes de réhydratation React dues aux différences de locales de `.toLocaleString()`.
*   **Nommage de route dynamique** : Renommé `app/coupes/[id]/pages.tsx` en `page.tsx` pour activer correctement la route dynamique du Lookbook sous Next.js.
*   **Erreur API 404** : Suppression de l'ancienne API de PS5 obsolète et nettoyage du tunnel de réservation.

#### Supprimé
*   Suppression complète du support et de la réservation des sessions gaming PS5 sur tout le site (sections d'accueil, témoignages, services, pages de réservation et route `/api/ps5`).

### [1.0.0] - 2026-05-15
*   Lancement initial du site vitrine avec le template brut.

---

## 📄 Licence

Ce projet est sous licence **MIT**. Vous êtes libre de l'utiliser, le copier, le modifier et le distribuer à des fins personnelles ou commerciales. Voir le fichier `LICENSE` pour plus d'informations.

---

© 2026 **Freshcut 229** — Zone Résidentielle, Cotonou.

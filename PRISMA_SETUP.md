# 🚀 Configuration Prisma - Guide Complet

## ✅ Qu'est-ce qui a été préparé

- ✅ Schéma Prisma mis à jour avec modèle **`Coupe`** pour les styles de coiffures
- ✅ Routes API pour gérer les coupes (CRUD): `/api/coupes`, `/api/coupes/[id]`
- ✅ Routes API pour tous les services existants
- ✅ Seed.ts complet avec 4 coupes + photos Unsplash
- ✅ Package.json avec tous les scripts

---

## 📋 Étape 1: Obtenir une Base de Données PostgreSQL

### Option A: Neon Cloud ⚡ (RECOMMANDÉ - 2 minutes)
1. Aller sur https://neon.tech
2. S'inscrire (gratuit)
3. Créer un projet
4. Copier la connection string (ressemble à):
   ```
   postgresql://user:password@region.neon.tech/dbname
   ```

### Option B: Docker Local (Si installé)
```bash
docker run -d --name freshcut-pg \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=freshcut_db \
  -p 5432:5432 \
  postgres:latest
```

### Option C: Railway.app ou Supabase
- Railway: https://railway.app (5$ crédit gratuit)
- Supabase: https://supabase.com (1 BD gratuite)

---

## 🔑 Étape 2: Mettre à jour `.env.local`

Remplacer la DATABASE_URL avec la vraie connection string:

```env
# Base de données PostgreSQL
DATABASE_URL="postgresql://user:password@host:port/database_name"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# API
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

**Exemple avec Neon:**
```env
DATABASE_URL="postgresql://neondb_owner:xxxxxxxxxxxx@ep-xxxxxxx.neon.tech/neondb"
```

---

## 🗄️ Étape 3: Exécuter les Migrations

```bash
# Générer le client Prisma
npx prisma generate

# Créer les tables (crée aussi le dossier migrations/)
npm run db:migrate

# OU alternative
npx prisma migrate dev --name init
```

### Qu'est-ce qui se passe:
- ✅ Crée le dossier `prisma/migrations/`
- ✅ Crée la première migration `001_init`
- ✅ Exécute la migration sur la BD
- ✅ Génère le client Prisma

---

## 🌱 Étape 4: Remplir la BD avec les Données (Seed)

```bash
npm run db:seed
```

### Cela crée:
- ✅ 2 comptes de test (Boss + Coiffeur)
- ✅ 4 **coupes avec photos** (Low Fade, Skin Fade, Classic Taper, 360 Waves)
- ✅ 6 services (Dégradé, Combo, Barbe, etc.)
- ✅ 4 produits (Huile, Cire, T-Shirt, Peigne)
- ✅ 2 clients de test
- ✅ 2 réservations de test

---

## 🎯 Étape 5: Vérifier & Tester

### Visualiser la BD (GUI Prisma Studio)
```bash
npm run db:studio
# Ouvre une interface à http://localhost:5555
# Tu peux voir/modifier tous les modèles
```

### Démarrer le serveur dev
```bash
npm run dev
```

### Accéder aux Pages:
- 🏠 **Site public**: http://localhost:3000
- 📸 **Coupes (Lookbook)**: http://localhost:3000/coupes
- 👔 **Admin Boss**: http://localhost:3000/admin/boss
- 🪡 **Admin Coiffeur**: http://localhost:3000/admin/coiffeur

### Comptes de Test:
| Rôle | Email | Mot de passe |
|------|-------|------------|
| Boss | boss@freshcut.com | password |
| Coiffeur | coiffeur@freshcut.com | password |

---

## 🎨 Gérer les Coupes (Styles de Coiffures)

### L'Admin peut:
1. **Ajouter une coupe** (POST `/api/coupes`)
   ```json
   {
     "nom": "Fade Moderne",
     "description": "Dégradé moderne avec contour net",
     "tempsEstimation": "45 min",
     "difficulte": 3,
     "image": "https://images.unsplash.com/...",
     "conseils": ["Brossage régulier", "Hydratation importante"]
   }
   ```

2. **Modifier une coupe** (PUT `/api/coupes/[id]`)
3. **Supprimer une coupe** (DELETE `/api/coupes/[id]`)
4. **Voir toutes les coupes** (GET `/api/coupes`)

### Les Utilisateurs voient:
- 📸 Toutes les coupes avec photos sur `/coupes`
- ⭐ Niveau de difficulté (1-5)
- ⏱️ Temps estimé
- 💡 Conseils de soin

---

## 📦 Structure des Données

### Modèles Créés:

1. **User** - Authentification (BOSS, COIFFEUR, ADMIN)
2. **Coupe** - Styles de coiffures avec photos ⭐ NEW
3. **Service** - Services réservables (Dégradé, Combo, etc.)
4. **Booking** - Réservations clients
5. **Client** - Programme de fidélité
6. **Product** - Boutique (Huile, Cire, etc.)
7. **InventoryLog** - Historique de stock
8. **Invoice** - Factures et paiements

---

## 🔄 Workflow Admin pour Ajouter une Coupe

### Via l'API (cURL):
```bash
curl -X POST http://localhost:3000/api/coupes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "nom": "Nouvelle Coupe",
    "description": "Description",
    "tempsEstimation": "50 min",
    "difficulte": 3,
    "image": "https://images.unsplash.com/...",
    "conseils": ["Conseil 1", "Conseil 2"]
  }'
```

### Via Prisma Studio:
1. Lancer `npm run db:studio`
2. Aller à l'onglet "Coupe"
3. Cliquer "Add record"
4. Remplir les champs
5. Les changements apparaissent immédiatement sur le site

---

## 🚨 Troubleshooting

### "Error: connect ECONNREFUSED"
→ PostgreSQL n'est pas accessible. Vérifier:
- La BD est en ligne (Docker/Cloud)
- DATABASE_URL est correct
- Port 5432 (ou autre) est ouvert

### "ERR_MODULE_NOT_FOUND @prisma/client"
→ Prisma client n'est pas généré:
```bash
npx prisma generate
```

### "relation 'User' does not exist"
→ Les migrations n'ont pas été exécutées:
```bash
npm run db:migrate
```

### Je veux réinitialiser la BD
```bash
# ⚠️ ATTENTION: Supprime tout!
npx prisma migrate reset
```

---

## 📊 Commandes Utiles

```bash
# Développement
npm run dev                    # Lancer le serveur
npm run db:studio             # Ouvrir Prisma Studio
npm run db:migrate            # Créer/exécuter migrations
npm run db:seed               # Remplir la BD
npm run db:push               # Pousser schéma (sans migration)

# Production
npm run build                 # Compiler
npm start                     # Lancer production

# Nettoyage
npx prisma migrate reset      # ⚠️ Réinitialise tout
npx prisma generate           # Régénérer client
```

---

## ✨ Prochaines Étapes

1. **Intégrer le Frontend**
   - Mettre à jour `/app/coupes/page.tsx` pour fetch `/api/coupes`
   - Afficher les photos des coupes depuis la BD
   
2. **Créer l'Interface Admin pour Coupes**
   - Ajouter page `/admin/coupes` pour gérer les styles
   - Upload de photos
   
3. **Ajouter Page de Détail**
   - `/coupes/[id]/page.tsx` dynamique
   - Afficher détails + conseils de chaque coupe

---

## 🎓 Ressources

- Prisma Docs: https://www.prisma.io/docs/
- PostgreSQL Docs: https://www.postgresql.org/docs/
- NextAuth Docs: https://next-auth.js.org/

---

**Ready to go! 🚀 Choisis une BD et lance `npm run db:migrate`**

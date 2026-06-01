# ⚡ QUICK START - Prisma Fonctionnel

## 🎯 En 5 minutes: Faire fonctionner Prisma

### ÉTAPE 1: Choisir une BD PostgreSQL (2 min)

**Option rapide: Neon Cloud ☁️**
1. Aller à https://neon.tech
2. S'inscrire (gratuit, pas de carte)
3. Créer un projet
4. Copier la connection string (ressemble à):
   ```
   postgresql://neondb_owner:xxxx@ep-xxx.neon.tech/neondb
   ```

### ÉTAPE 2: Mettre à jour `.env.local` (1 min)

Remplacer `DATABASE_URL` par ta vraie connection string:

```env
DATABASE_URL="postgresql://neondb_owner:xxxx@ep-xxx.neon.tech/neondb"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### ÉTAPE 3: Exécuter les migrations (1 min)

```bash
npm run db:migrate
```

Cela:
- ✅ Crée le dossier `prisma/migrations/`
- ✅ Crée la première migration
- ✅ Crée toutes les tables dans la BD

### ÉTAPE 4: Remplir la BD avec données test (1 min)

```bash
npm run db:seed
```

Cela crée:
- ✅ 2 comptes admin (Boss + Coiffeur)
- ✅ 4 coupes avec photos
- ✅ 6 services réservables
- ✅ 4 produits boutique
- ✅ Clients et réservations de test

### ÉTAPE 5: Lancer le serveur (1 min)

```bash
npm run dev
```

Accéder à:
- 🏠 http://localhost:3000 (site public)
- 📸 http://localhost:3000/coupes (coupes avec photos de la BD!)
- 👔 http://localhost:3000/admin/boss (boss@freshcut.com / password)
- 🪡 http://localhost:3000/admin/coiffeur (coiffeur@freshcut.com / password)

---

## ✨ Résultat

✅ **Prisma fonctionne!**
- La BD PostgreSQL est connectée
- Schéma avec 8 modèles créé
- Données de test chargées
- API routes prêtes
- Admin dashboards prêts
- Pages publiques affichent les coupes depuis la BD

---

## 🎨 L'Admin Peut Maintenant

### Ajouter une nouvelle coupe:

```bash
# Ouvrir Prisma Studio
npm run db:studio
```

Dans Prisma Studio:
1. Aller à l'onglet "Coupe"
2. Cliquer "Add record"
3. Remplir:
   - **nom**: "Ma Coupe"
   - **description**: "Description"
   - **tempsEstimation**: "45 min"
   - **difficulte**: 3 (1-5)
   - **image**: "https://images.unsplash.com/..."
   - **conseils**: ["Conseil 1", "Conseil 2"]
4. Sauvegarder

La nouvelle coupe apparaît **immédiatement** sur:
- 📸 http://localhost:3000/coupes (page publique)
- 👔 Admin dashboard

---

## 🚨 Si ça ne marche pas

### "Error: connect ECONNREFUSED"
```bash
# Vérifier que la BD est en ligne
# Si Neon: attendre 30s, la BD "réveille"
# Si Docker: docker ps | grep postgres
```

### "ERR_MODULE_NOT_FOUND @prisma/client"
```bash
# Régénérer le client
npx prisma generate
```

### "relation 'User' does not exist"
```bash
# Les migrations n'ont pas roulé
npm run db:migrate
```

### Réinitialiser complètement
```bash
# ⚠️ Supprime tout et recommence
npx prisma migrate reset
npm run db:seed
```

---

## 📊 Structure Finale

```
Base de données PostgreSQL (Neon/Docker/AWS)
├── 8 modèles Prisma
│   ├── User (authentification)
│   ├── Coupe ⭐ (styles avec photos)
│   ├── Service (services réservables)
│   ├── Booking (réservations)
│   ├── Client (fidélité)
│   ├── Product (boutique)
│   ├── InventoryLog (stock)
│   └── Invoice (factures)
│
├── API Routes
│   ├── /api/coupes (GET, POST, PUT, DELETE)
│   ├── /api/services
│   ├── /api/bookings
│   ├── /api/clients
│   └── ... (14 routes au total)
│
├── Frontend
│   ├── /coupes - affiche les coupes de la BD
│   ├── /admin/boss - dashboard patron
│   ├── /admin/coiffeur - dashboard coiffeur
│   └── ... (pages publiques)
```

---

## 🎓 Prochaines Étapes

Après ces 5 minutes:

1. **Tester l'admin**
   - Ajouter 2-3 coupes custom
   - Voir les photos s'afficher

2. **Ajouter la gestion d'upload de photos**
   - Intégrer Cloudinary ou Vercel Blob Storage
   - Permettre upload de photos custom

3. **Intégrer le reste du frontend**
   - `/boutique` - fetch `/api/products`
   - `/services` - fetch `/api/services`
   - `/reserver` - POST `/api/bookings`

4. **Déployer**
   - Vercel pour Next.js
   - Neon (ou Render/Railway) pour PostgreSQL

---

**Tu es 5 minutes de avoir Prisma et PostgreSQL full opérationnel! 🚀**

Lis `PRISMA_SETUP.md` pour plus de détails.

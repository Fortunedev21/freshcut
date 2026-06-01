# Freshcut 229 - Setup Complet Backend

## ✨ Qu'est-ce qui a été mis en place?

### 1. **Base de Données + Prisma**
- ✅ Schéma Prisma complet (`prisma/schema.prisma`)
- ✅ Modèles: User, Product, Service, Booking, Client, Inventory, Invoice
- ✅ Relations et indexes optimisés

### 2. **Authentification (NextAuth.js)**
- ✅ Authentification par email + password
- ✅ Rôles: COIFFEUR, BOSS, ADMIN
- ✅ Routes: `/login`, `/register`
- ✅ Middleware de protection des routes

### 3. **Routes API RESTful**
```
/api/products/              (GET all, POST create - BOSS)
/api/products/[id]          (GET, PUT, DELETE - BOSS)
/api/services/              (GET all, POST create - BOSS)
/api/bookings/              (GET all, POST create - PUBLIC)
/api/bookings/[id]          (GET, PUT, PATCH - COIFFEUR/BOSS)
/api/clients/               (POST create, GET by phone - PUBLIC)
/api/clients/[id]           (GET profile, PUT update)
/api/clients/[id]/points    (GET loyalty points)
/api/clients/[id]/history   (GET booking history)
/api/admin/dashboard        (GET stats - BOSS)
```

### 4. **Dashboards Admin**
- **🪡 Coiffeur (`/admin/coiffeur`)**
  - Rendez-vous du jour
  - Statuts: Confirmé, En cours, Terminé, Annulé
  - Actions: Confirmer, Commencer, Terminer, Annuler
  - Infos client et téléphone

- **👔 Boss (`/admin/boss`)**
  - Statistiques: RDV, revenus, clients, stock
  - Alertes bas stock
  - Résumé financier
  - Onglets: Aperçu, Rendez-vous, Inventaire, Finances

### 5. **Utilitaires**
- ✅ `lib/prisma.ts` - Singleton Prisma
- ✅ `lib/auth.ts` - Utilitaires d'authentification
- ✅ `lib/api-response.ts` - Format réponses API
- ✅ `middleware.ts` - Protection des routes

---

## 🚀 Démarrage Rapide

### Prérequis
- PostgreSQL en local ou cloud (AWS RDS, DigitalOcean, Render, etc.)
- Node.js 18+
- npm ou yarn

### 1. Configurer la base de données

Créer un fichier `.env.local`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/freshcut_db"
NEXTAUTH_SECRET="openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Créer la base de données
```bash
npm run db:push
```

### 4. Remplir avec les données de test
```bash
npm run db:seed
```

### 5. Lancer le serveur dev
```bash
npm run dev
```

Accédez à:
- **Site**: http://localhost:3000
- **Admin Boss**: http://localhost:3000/admin/boss (boss@freshcut.com / password)
- **Admin Coiffeur**: http://localhost:3000/admin/coiffeur (coiffeur@freshcut.com / password)

---

## 📊 Comptes de Test

| Rôle | Email | Mot de passe |
|------|-------|------------|
| Patron (Boss) | boss@freshcut.com | password |
| Coiffeur | coiffeur@freshcut.com | password |

---

## 🔌 Intégration Frontend (Prochaine étape)

Les pages publiques doivent être mises à jour pour utiliser les API:
- `app/boutique/page.tsx` → Fetch `/api/products`
- `app/services/page.tsx` → Fetch `/api/services`
- `app/reserver/page.tsx` → POST `/api/bookings`
- `app/profile/page.tsx` → Fetch `/api/clients`

---

## 🗄️ Structure des Données

### Booking Status Flow
```
PENDING → CONFIRMED → IN_PROGRESS → COMPLETED
            ↓              ↓
          CANCELLED    NO_SHOW
```

### Loyalty Points
- 1 point par réservation
- 10 points = 1 service gratuit
- Auto-réinitialisation à 0 après 10

---

## 🔐 Sécurité

- ✅ Passwords hashés avec bcryptjs
- ✅ Authentification NextAuth.js (JWT)
- ✅ Middleware de vérification des rôles
- ✅ Routes protégées par authentification

---

## 📝 Scripts Disponibles

```bash
npm run dev              # Lancer développement
npm run build            # Compiler pour production
npm run start            # Lancer production
npm run db:push          # Pousser schéma vers DB
npm run db:migrate       # Créer nouvelle migration
npm run db:seed          # Remplir avec données test
npm run db:studio        # Ouvrir Prisma Studio
```

---

## 🎯 Prochaines Étapes (À Faire)

1. **Intégrer Frontend avec API**
   - Remplacer imports statiques par fetch API
   - Ajouter gestion d'erreur et loading states

2. **Améliorer Admin Dashboards**
   - Ajouter calendrier complet
   - Gestion d'inventaire avancée
   - Rapports financiers détaillés

3. **Ajouter Paiements**
   - Intégration Kkiapay
   - Gestion des factures

4. **Notifications**
   - Email de confirmation de réservation
   - SMS de rappel

5. **Déploiement**
   - Vercel pour le frontend
   - Hosted PostgreSQL
   - Variables d'environnement sécurisées

---

## ❓ Questions Fréquentes

**Q: Comment créer un nouveau service?**
A: Via l'API `/api/services` (POST) ou via Prisma Studio

**Q: Comment gérer les disponibilités des coiffeurs?**
A: À implémenter avec une table `BarberSchedule` dans Prisma

**Q: Comment envoyer des emails?**
A: Intégrer SendGrid, Mailgun, ou Resend

---

## 📞 Support

Contactez l'équipe Freshcut 229 pour assistance.

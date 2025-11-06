# As de la presse

Site d'actualités pour la République Démocratique du Congo - Les As de la presse

## 🚀 Technologies

- **Next.js 14** - Framework React
- **TypeScript** - Typage statique
- **Prisma** - ORM pour PostgreSQL
- **Tailwind CSS** - Framework CSS
- **bcryptjs** - Hashage des mots de passe
- **JWT (jose)** - Authentification

## 📋 Prérequis

- Node.js 18+
- PostgreSQL
- npm ou yarn

## 🛠️ Installation

```bash
# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma db push

# Créer le premier utilisateur admin
npx tsx scripts/create-admin-user.ts Hermes Zumr
```

## 🏃 Développement

```bash
npm run dev
```

Le site sera accessible sur [http://localhost:3000](http://localhost:3000)

## 🏗️ Build de production

```bash
npm run build
npm run start
```

## 🔐 Accès Admin

- **URL** : `/actualite/admin/login`
- **Identifiants par défaut** :
  - Username: `Hermes`
  - Password: `Zumr`

⚠️ **Important** : Changez le mot de passe après le premier déploiement !

## 📦 Déploiement

### Sur Vercel

1. Connectez votre repository GitHub à Vercel
2. Configurez les variables d'environnement :
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `JWT_SECRET` (changez-le en production !)
   - `NODE_ENV=production`
3. Vercel détectera automatiquement Next.js et déploiera

Voir [DEPLOYMENT.md](./DEPLOYMENT.md) pour plus de détails.

## 📁 Structure du projet

```
├── app/                    # Routes Next.js App Router
│   ├── actualite/         # Application principale
│   ├── admin/             # Panel admin
│   └── api/               # API routes
├── components/            # Composants partagés
├── lib/                   # Utilitaires
├── prisma/                # Schéma Prisma
└── scripts/               # Scripts utilitaires
```

## 🔒 Sécurité

- Mots de passe hashés avec bcrypt (10 rounds)
- Sessions JWT avec expiration de 24h
- Cookies httpOnly et sécurisés
- Protection des routes admin via middleware

## 📝 Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guide de déploiement
- [ADMIN_SETUP.md](./ADMIN_SETUP.md) - Configuration admin

## 📄 Licence

Propriétaire - Les As de la presse

---

Développé avec ❤️ par HermesX

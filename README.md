# Les As de la Presse
Les As de la Presse — site d'actualité construit avec Next.js (App Router), Prisma et Tailwind CSS.
Ce dépôt contient l'application Next.js principale, la configuration Prisma/migrations et des outils d'administration locaux.

## Démarrage local

Prérequis:
- Node.js v18+ (recommandé)
- npm

Installation et lancement:

```powershell
npm install
npm run dev
```

Si vous rencontrez des erreurs liées au cache ou à `.next`, supprimez le dossier puis relancez:

```powershell
# depuis la racine du projet
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run dev
```

## Gestion Git & publication

Vous avez déjà créé un dépôt GitHub. Pour pousser votre copie locale vers ce dépôt (exemple):

```powershell
# remplacez <username> et <repo> si nécessaire
git remote add origin https://github.com/<username>/<repo>.git
git branch -M main
git push -u origin main

Si le dépôt distant contient déjà un fichier README (comme ici), vous devrez intégrer les changements distants avant de pousser (pull/rebase), résoudre les éventuels conflits et continuer.

## Déploiement recommandé (Vercel / Render)

Hébergement recommandé : Vercel (Next.js) ou Render. Base de données : Supabase (Postgres) ou autre provider compatible avec Prisma.

Paramètres usuels (Vercel/Render) :
- Build Command: `npm ci && npm run build`
- Start Command: `npm run start` (le serveur doit utiliser la variable `$PORT`, ex. `next start -p $PORT`)
- Branche : `main`

Variables d'environnement importantes :
- `DATABASE_URL` (Postgres, nécessaire pour Prisma)
- `NEXT_PUBLIC_*` pour les clés publiques côté client

Prisma — exécution des migrations (PowerShell exemple) :

```powershell
$env:DATABASE_URL = 'postgresql://postgres:password@db.xxx.supabase.co:5432/postgres?schema=public'

# Générer le client Prisma
npx prisma generate

# Appliquer les migrations (recommandé en production)
npx prisma migrate deploy --schema=prisma/schema.prisma

# Option rapide pour synchroniser le schéma (utile pour tests uniquement)
npx prisma db push --schema=prisma/schema.prisma
```

Notes :
- `migrate deploy` applique l'historique de migrations (recommandé pour prod).
- `db push` synchronise le schéma sans historique (utile pour dev/debug).


## Vérifier le build de production localement

```powershell
npm run build
npm run start
```

## Fichier d'exemple d'environnement

Un fichier d'exemple `.env.example` a été ajouté à la racine du projet. Copiez-le en `.env` et remplissez les valeurs avant d'exécuter l'application localement.

Exemple :

```env
DATABASE_URL=postgresql://user:password@host:5432/db?schema=public
NAME_OF_VARIABLE=ma_valeur_secrete
NEXT_PUBLIC_ANALYTICS_ID=pk_live_xxx
```

Ne commitez jamais votre fichier `.env`. Le dépôt contient `.env.example` (sécurisé) et `.gitignore` est configuré pour ignorer les fichiers `.env`.

## Prochaines étapes suggérées

- Vérifier que `prisma/migrations` contient bien les migrations attendues.
- Préparer les variables d'environnement sur Vercel/Render avant le déploiement.
- Après déploiement, valider que les endpoints d'administration et de synchronisation fonctionnent.

Si vous voulez, je peux :
- préparer un `vercel.json` et un `deploy.md` détaillé pour Supabase/Vercel,
- exécuter les commandes de migration si vous fournissez temporairement `DATABASE_URL` (ou vous guider pas à pas),
- ou générer un `render.yaml` pour déployer sur Render.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# Les As de la Presse

Les As de la Presse — site d'actualité construit avec Next.js, Prisma et Tailwind CSS.

This repository contains a Next.js (App Router) application for the Les As de la Presse news site.

## Quickstart / Démarrage local

Prerequisites / Prérequis:
- Node.js v18+ and npm

Install dependencies:

```powershell
npm install
```

Run the development server:

```powershell
npm run dev
```

If you see build cache errors related to `.next`, remove the folder and retry:

```powershell
Remove-Item -Recurse -Force .next
npm run dev
```

## Database (Prisma) — Production notes / Notes production

This project uses Prisma with migration files under `prisma/migrations`.
For production use a managed Postgres (Supabase, PlanetScale, Neon, etc.).

Example (Supabase) — run locally in PowerShell with your DATABASE_URL set:
# Les As de la Presse

Site d'actualité construit avec Next.js (App Router), Prisma et Tailwind CSS.

Résumé
-------
Ce dépôt contient l'application Next.js pour "Les As de la Presse". Le site utilise Prisma pour l'accès à la base de données et Tailwind pour le style.

Prérequis locaux
-----------------
- Node.js v18+ recommandé
- npm

Démarrage local
----------------
1. Installer les dépendances :

```powershell
npm install
```

2. Lancer le serveur de développement :

```powershell
npm run dev
```

3. (Optionnel) Build production local :

```powershell
npm run build
npm run start
```

Git & publication
------------------
Si vous n'avez pas encore créé le repository distant, créez-le sur GitHub (nom recommandé : `Les-As-de-la-Presse`). Puis poussez la branche `main` :

```powershell
# remplacer <username> par votre nom GitHub
## Vérifier le build de production localement
```powershell
npm run build
```

Déploiement recommandé
----------------------
Hébergement : Vercel (recommandé pour Next.js)
Base de données : Supabase (Postgres) ou autre provider compatible avec Prisma.

1. Créez la base (Supabase) et récupérez le `DATABASE_URL`.
2. Dans Vercel, ajoutez la variable d'environnement `DATABASE_URL` pour le projet.
3. Dans la CI/production, appliquez les migrations Prisma :

```powershell
# définir DATABASE_URL temporairement dans PowerShell
$env:DATABASE_URL = '<votre_database_url>'

# générer le client prisma
npx prisma generate

# appliquer les migrations en production
npx prisma migrate deploy --schema=prisma/schema.prisma
```

Remarques
--------
- Utilisez `npx prisma migrate deploy` en production pour appliquer les migrations stockées dans `prisma/migrations`.
- Pour des tests rapides (non recommandé pour la prod), `npx prisma db push` synchronise le schéma sans l'historique de migration.

Besoin d'aide ?
---------------
Si vous voulez, je peux :
- préparer un `vercel.json` et une note `deploy.md` pour Supabase/Vercel
- exécuter les commandes de migration ici si vous me fournissez temporairement `DATABASE_URL` (ou vous guider pas à pas)

---

Project bootstrapped with Create Next App (App Router).

Voir aussi : `prisma/`, `app/` et `actualite/` pour la structure du projet.


npm run start
```

## Support et prochaines étapes suggérées
- Ajouter un script `vercel-build` si vous avez des étapes Prisma supplémentaires.
- Mettre en place PlanetScale/Neon et configurer `prisma migrate deploy` sur Vercel.
- Configurer un service d'email (SendGrid) pour notifications de demandes d'interview.

Si tu veux, je peux préparer automatiquement un `vercel.json` et un petit `deploy.md` plus détaillé pour PlanetScale.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
>>>>>>> 6d993b5 (chore: initial commit)

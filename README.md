# Les As de la presse — Déploiement

This repository contains a Next.js app for "Les As de la presse" (App Router).

## Prérequis locaux
- Node.js (v18+ recommended)
- npm

## Démarrage local
1. Installer les dépendances:

```powershell
npm install
```

2. Lancer le serveur de développement:

```powershell
npm run dev
```

Si vous rencontrez une erreur liée au cache Webpack (`ENOENT ... .next\cache\webpack ...`), supprimez le dossier `.next` puis relancez:

```powershell
# depuis la racine du projet
Remove-Item -Recurse -Force .next
npm run dev
```

## Gestion Git & publication (GitHub)
1. Créer un repository sur GitHub (via web).
2. Depuis votre machine (renseignez YOUR_USERNAME/YOUR_REPO):

```powershell
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Remarque: vous pouvez aussi utiliser SSH si vous avez configuré votre clé.

## Déployer (recommandé) — Vercel (free)
1. Créez un compte sur https://vercel.com et connectez votre compte GitHub.
2. Importez le repository.
3. Vercel détecte automatiquement Next.js. Paramètres usuels:
	- Build Command: `npm run build`
	- Install Command: `npm ci` (ou `npm install`)
	- Output Directory: (laisser vide)
4. Ajoutez les variables d'environnement (Project → Settings → Environment Variables) :
	- `DATABASE_URL` (si vous utilisez Prisma/DB)
	- `SMTP_*` / `SENDGRID_API_KEY` etc. si vous envoyez des emails
5. Déployez. À chaque push sur `main` Vercel rebuild et redéploie.

## Base de données (Prisma)
Le projet inclut `prisma/` et migrations. Pour la production utilisez un provider cloud (PlanetScale, Neon, Supabase).

Exemple rapide (PlanetScale):
1. Créez la base PlanetScale.
2. Récupérez le `DATABASE_URL` et ajoutez-le dans Vercel.
3. Dans Vercel, ajoutez une commande post-deploy pour exécuter les migrations:
	- `npx prisma migrate deploy`

## Stockage des demandes d'interview
En local, les demandes sont stockées dans `data/interview_requests.json`. En production, remplacez par une solution persistante (Prisma DB ou envoi d'email).

## Vérifier le build de production localement
```powershell
npm run build
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

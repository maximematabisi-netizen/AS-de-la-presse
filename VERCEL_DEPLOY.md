# 🚀 Guide de Déploiement sur Vercel

Votre code est maintenant sur GitHub : **https://github.com/maximematabisi-netizen/AS-de-la-presse**

## 📋 Étapes pour déployer sur Vercel

### 1. Créer un compte Vercel (si vous n'en avez pas)

1. Allez sur https://vercel.com
2. Cliquez sur **"Sign Up"**
3. Choisissez **"Continue with GitHub"** pour connecter votre compte GitHub

### 2. Importer votre projet

1. Une fois connecté, cliquez sur **"Add New Project"**
2. Vous verrez la liste de vos repositories GitHub
3. Trouvez **"AS-de-la-presse"** et cliquez sur **"Import"**

### 3. Configurer le projet

Vercel détectera automatiquement Next.js. Les paramètres par défaut sont :
- **Framework Preset** : Next.js
- **Root Directory** : `./` (racine)
- **Build Command** : `npm run build`
- **Output Directory** : `.next` (automatique)
- **Install Command** : `npm install`

✅ **Laissez ces paramètres par défaut** - ils sont corrects !

### 4. ⚠️ IMPORTANT : Configurer les variables d'environnement

Avant de déployer, vous **DEVEZ** ajouter ces variables d'environnement :

1. Dans la section **"Environment Variables"**, ajoutez :

   ```
   DATABASE_URL = votre-url-postgresql
   DIRECT_URL = votre-url-postgresql-direct
   JWT_SECRET = un-secret-tres-securise-et-unique-changez-moi
   NODE_ENV = production
   ```

2. **Pour chaque variable** :
   - Cliquez sur **"Add"**
   - Entrez le nom de la variable
   - Entrez la valeur
   - Sélectionnez **"Production"** (et optionnellement "Preview" et "Development")
   - Cliquez sur **"Save"**

### 5. Déployer

1. Cliquez sur **"Deploy"**
2. Vercel va :
   - Installer les dépendances
   - Générer le client Prisma (grâce au script `postinstall`)
   - Builder l'application
   - Déployer

### 6. Après le déploiement

Une fois le déploiement terminé :

1. **Appliquer les migrations Prisma** :
   - Allez dans l'onglet **"Deployments"**
   - Cliquez sur le dernier déploiement
   - Ouvrez la console (ou utilisez Vercel CLI)
   - Exécutez : `npx prisma migrate deploy`

   Ou via Vercel CLI :
   ```bash
   vercel env pull
   npx prisma migrate deploy
   ```

2. **Créer le premier utilisateur admin** :
   - Connectez-vous via SSH à votre instance Vercel
   - Ou utilisez Vercel CLI :
   ```bash
   vercel env pull
   npx tsx scripts/create-admin-user.ts Hermes Zumr
   ```

### 7. Configuration automatique (Optionnel)

Pour automatiser les migrations, ajoutez dans `package.json` :

```json
{
  "scripts": {
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

## 🔗 URLs

Après le déploiement, vous aurez :
- **URL de production** : `https://votre-projet.vercel.app`
- **URL admin** : `https://votre-projet.vercel.app/actualite/admin/login`

## 🔄 Déploiements automatiques

Vercel déploiera automatiquement à chaque push sur la branche `main` de GitHub.

## 📝 Vérifications post-déploiement

1. ✅ Vérifiez que le site charge correctement
2. ✅ Testez la connexion admin : `/actualite/admin/login`
3. ✅ Vérifiez que la base de données fonctionne
4. ✅ Testez la création d'articles

## 🆘 En cas de problème

1. **Erreur de build** : Vérifiez les logs dans Vercel
2. **Erreur de base de données** : Vérifiez que `DATABASE_URL` est correct
3. **Erreur Prisma** : Vérifiez que les migrations sont appliquées

## 📞 Support

- Documentation Vercel : https://vercel.com/docs
- Documentation Next.js : https://nextjs.org/docs

---

**Bon déploiement ! 🎉**


# Guide de Déploiement - Les As de la presse

## ✅ Checklist avant déploiement

### 1. Variables d'environnement

Assurez-vous d'avoir ces variables d'environnement configurées :

```env
# Base de données PostgreSQL
DATABASE_URL="postgresql://user:password@host:port/database"
DIRECT_URL="postgresql://user:password@host:port/database"

# JWT Secret (IMPORTANT: Changez en production !)
JWT_SECRET="votre-secret-jwt-tres-securise-et-unique"

# Environnement
NODE_ENV="production"
```

⚠️ **IMPORTANT** : Changez le `JWT_SECRET` en production avec une valeur aléatoire sécurisée !

### 2. Base de données

1. **Migration de la base de données** :
   ```bash
   npx prisma migrate deploy
   ```
   Ou si vous utilisez `db push` :
   ```bash
   npx prisma db push
   ```

2. **Génération du client Prisma** :
   ```bash
   npx prisma generate
   ```

3. **Créer le premier utilisateur admin** :
   ```bash
   npx tsx scripts/create-admin-user.ts Hermes Zumr
   ```

### 3. Build de production

```bash
npm run build
```

Vérifiez qu'il n'y a pas d'erreurs de build.

### 4. Test local en production

```bash
npm run start
```

Testez que tout fonctionne correctement.

## 🚀 Déploiement

### Sur Vercel (Recommandé pour Next.js)

1. **Connecter votre repository** sur Vercel
2. **Configurer les variables d'environnement** dans les paramètres du projet
3. **Build Command** : `npm run build` (par défaut)
4. **Output Directory** : `.next` (par défaut)
5. **Install Command** : `npm install` (par défaut)

### Sur d'autres plateformes

Assurez-vous que :
- Node.js version 18+ est installé
- Les variables d'environnement sont configurées
- La commande `npm run build` fonctionne
- La commande `npm run start` démarre le serveur

## 📋 Informations importantes

### Identifiants Admin

- **URL de connexion** : `/actualite/admin/login`
- **Nom d'utilisateur** : `Hermes`
- **Mot de passe** : `Zumr`

⚠️ **Sécurité** : Changez le mot de passe après le premier déploiement !

### Structure des routes

- **Site principal** : `/actualite`
- **Admin** : `/actualite/admin`
- **Login admin** : `/actualite/admin/login`
- **API** : `/api/*`

### Fonctionnalités implémentées

✅ Système d'authentification admin sécurisé
✅ Gestion des utilisateurs admin
✅ Panel d'administration complet
✅ Gestion des articles
✅ Gestion des bannières
✅ Gestion des vidéos
✅ Gestion de la galerie
✅ Newsletter
✅ Animations des icônes sociales
✅ Design responsive

## 🔒 Sécurité

1. **JWT Secret** : Utilisez un secret fort et unique en production
2. **Mots de passe** : Hashés avec bcrypt (10 rounds)
3. **Cookies** : HttpOnly et sécurisés en production
4. **HTTPS** : Assurez-vous d'utiliser HTTPS en production

## 📝 Notes

- Le script `postinstall` génère automatiquement le client Prisma
- Les images sont optimisées par Next.js
- Le site est optimisé pour le SEO
- Support du mode sombre (dark mode)

## 🆘 En cas de problème

1. Vérifiez les logs du serveur
2. Vérifiez les variables d'environnement
3. Vérifiez la connexion à la base de données
4. Vérifiez que Prisma Client est généré : `npx prisma generate`

## 📞 Support

Pour toute question ou problème, consultez :
- Documentation Next.js : https://nextjs.org/docs
- Documentation Prisma : https://www.prisma.io/docs

---

**Bon déploiement ! 🚀**


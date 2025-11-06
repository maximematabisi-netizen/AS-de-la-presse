# 🔧 Configuration Vercel Blob Storage

## Problème

L'erreur 500 lors de l'upload d'images est causée par l'absence de configuration de Vercel Blob Storage sur votre projet Vercel.

## Solution : Activer Vercel Blob Storage

### Étape 1 : Activer Vercel Blob dans votre projet

1. Allez sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet **AS-de-la-presse**
3. Allez dans l'onglet **Storage**
4. Cliquez sur **Create Database** ou **Add Storage**
5. Sélectionnez **Blob**
6. Cliquez sur **Create**

### Étape 2 : Vérifier les variables d'environnement

Vercel Blob devrait automatiquement créer les variables d'environnement nécessaires :
- `BLOB_READ_WRITE_TOKEN` (automatique)

Si ce n'est pas le cas, vous pouvez les ajouter manuellement dans **Settings** → **Environment Variables**.

### Étape 3 : Redéployer

Après avoir créé le Blob Storage :
1. Vercel redéploiera automatiquement votre projet
2. Ou vous pouvez déclencher un nouveau déploiement manuellement

### Étape 4 : Tester

Une fois redéployé, testez l'upload d'images dans la galerie admin. Cela devrait maintenant fonctionner.

## Limites du plan gratuit

- **1 GB de stockage** gratuit
- **Bandwidth** : illimité (avec certaines limites)
- Parfait pour commencer

## Alternative : Utiliser Cloudinary (si vous préférez)

Si vous préférez utiliser Cloudinary au lieu de Vercel Blob :

1. Créez un compte sur [Cloudinary](https://cloudinary.com)
2. Récupérez vos credentials
3. Ajoutez les variables d'environnement dans Vercel :
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
4. Modifiez `app/api/upload/route.ts` pour utiliser Cloudinary

## Vérification

Pour vérifier que Vercel Blob est bien configuré :

1. Allez dans **Settings** → **Storage** de votre projet Vercel
2. Vous devriez voir **Blob** listé
3. Vérifiez que les variables d'environnement sont présentes dans **Settings** → **Environment Variables**

## Support

Si le problème persiste après avoir activé Vercel Blob :
1. Vérifiez les logs de déploiement sur Vercel
2. Consultez la console du navigateur pour les erreurs détaillées
3. Vérifiez que `@vercel/blob` est bien installé dans `package.json`


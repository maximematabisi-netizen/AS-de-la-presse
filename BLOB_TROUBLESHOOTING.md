# 🔧 Guide de Dépannage - Vercel Blob Storage

## Problème : Erreur 500 sur `/api/upload` après avoir créé Blob Storage

Si vous avez créé le Blob Storage sur Vercel mais que l'upload retourne toujours une erreur 500, suivez ces étapes :

## ✅ Vérifications à faire

### 1. Vérifier que Blob Storage est bien créé

1. Allez sur https://vercel.com/dashboard
2. Sélectionnez votre projet
3. Allez dans l'onglet **Storage**
4. Vérifiez que **Blob** est listé et actif

### 2. Vérifier la variable d'environnement `BLOB_READ_WRITE_TOKEN`

1. Dans votre projet Vercel, allez dans **Settings** → **Environment Variables**
2. Cherchez `BLOB_READ_WRITE_TOKEN`
3. Vérifiez qu'elle est présente et configurée pour **Production**, **Preview**, et **Development**

⚠️ **Important** : Si la variable n'existe pas, Vercel Blob n'est pas correctement configuré.

### 3. Redéployer le projet

**C'est crucial !** Après avoir créé Blob Storage, vous devez redéployer votre projet pour que la variable d'environnement soit disponible :

1. Allez dans l'onglet **Deployments**
2. Cliquez sur les **3 points** (⋯) du dernier déploiement
3. Sélectionnez **Redeploy**
4. Ou déclenchez un nouveau déploiement en poussant un commit sur GitHub

### 4. Vérifier les logs du déploiement

1. Allez dans l'onglet **Deployments**
2. Cliquez sur le dernier déploiement
3. Allez dans l'onglet **Functions** → `/api/upload`
4. Vérifiez les logs pour voir les messages d'erreur détaillés

Les nouveaux logs incluent :
- `BLOB_READ_WRITE_TOKEN present: true/false`
- Messages d'erreur détaillés avec codes d'erreur

## 🔄 Solution : Recréer Blob Storage (si nécessaire)

Si la variable d'environnement n'existe toujours pas après redéploiement :

1. **Supprimer le Blob Storage existant** (si nécessaire) :
   - Allez dans **Storage**
   - Cliquez sur le Blob Storage
   - Supprimez-le (⚠️ Attention : cela supprimera toutes les données)

2. **Recréer Blob Storage** :
   - Cliquez sur **Create Database** ou **Add Storage**
   - Sélectionnez **Blob**
   - Cliquez sur **Create**

3. **Redéployer immédiatement** :
   - Allez dans **Deployments**
   - Cliquez sur **Redeploy** du dernier déploiement

## 📋 Vérification après redéploiement

Une fois redéployé, testez l'upload :

1. Allez sur votre site en production
2. Essayez d'uploader une image via l'interface admin
3. Ouvrez la console du navigateur (F12)
4. Vérifiez les messages d'erreur dans la réponse de l'API

Les nouveaux messages d'erreur incluront :
- `code`: Code d'erreur spécifique (`BLOB_NOT_CONFIGURED`, `BLOB_AUTH_ERROR`, etc.)
- `help`: Instructions pour résoudre le problème
- `details`: Informations de diagnostic (hasToken, errorMessage, etc.)

## 🆘 Si le problème persiste

1. **Vérifiez les logs Vercel** :
   - Allez dans **Deployments** → Dernier déploiement → **Functions** → `/api/upload`
   - Regardez les logs pour voir les messages d'erreur détaillés

2. **Vérifiez la taille du fichier** :
   - Vercel limite les uploads à 4.5MB pour les fonctions serverless
   - Si votre fichier est plus grand, l'erreur sera `FILE_TOO_LARGE`

3. **Contactez le support Vercel** :
   - Si le problème persiste après avoir suivi toutes ces étapes
   - Fournissez les logs d'erreur et les détails de configuration

## ✅ Vérification finale

Une fois que tout fonctionne, vous devriez voir dans les logs :
```
Uploading file: uploads/2025-01-XX/...
BLOB_READ_WRITE_TOKEN present: true
Attempting to upload to Vercel Blob...
File uploaded successfully: https://...
```

Et l'API retournera :
```json
{
  "url": "https://[votre-blob-url].vercel-storage.com/..."
}
```



# 🔧 Correction de l'Upload d'Images sur Vercel

## Problème

L'API `/api/upload` utilisait `fs.writeFileSync` pour sauvegarder les fichiers sur le système de fichiers local. Sur Vercel, le système de fichiers est en **lecture seule** (sauf `/tmp` qui est temporaire), ce qui cause une erreur 500.

## Solution

Migration vers **Vercel Blob Storage** pour stocker les images de manière persistante dans le cloud.

## Changements appliqués

1. ✅ Ajout de `@vercel/blob` dans les dépendances
2. ✅ Modification de `/api/upload/route.ts` pour utiliser Vercel Blob
3. ✅ Les images sont maintenant stockées dans Vercel Blob avec accès public

## Configuration requise sur Vercel

### 1. Activer Vercel Blob Storage

1. Allez sur votre projet Vercel
2. Allez dans **Settings** → **Storage**
3. Cliquez sur **Create Database/Storage**
4. Sélectionnez **Blob**
5. Créez le storage (gratuit jusqu'à 1 GB)

### 2. Variable d'environnement (optionnelle)

Vercel Blob s'active automatiquement quand vous utilisez `@vercel/blob` dans votre code. Aucune variable d'environnement n'est nécessaire si vous utilisez la méthode `put()` avec les credentials automatiques.

## Fonctionnement

- Les images uploadées sont stockées dans Vercel Blob Storage
- Les URLs générées sont publiques et permanentes
- Plus de problème de système de fichiers en lecture seule
- Les images persistent entre les déploiements

## Migration des images existantes

Si vous avez des images existantes dans `public/uploads/`, vous devrez :
1. Les uploader manuellement via l'interface admin
2. Ou créer un script de migration pour les transférer vers Vercel Blob

## Notes importantes

- Vercel Blob gratuit : 1 GB de stockage
- Les URLs sont publiques par défaut avec `access: 'public'`
- Pour la sécurité, vous pouvez utiliser `access: 'private'` et générer des URLs signées


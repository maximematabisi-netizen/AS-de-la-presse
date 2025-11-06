# 🔧 Correction des erreurs 404 pour les images

## Problèmes identifiés

1. ✅ **Route `/actualite/securite` manquante** - Corrigé
2. ⚠️ **Images 404** - Les images uploadées localement ne sont pas disponibles en production

## Solutions appliquées

### 1. Route Sécurité créée
- ✅ Création de `actualite/app/(categories)/securite/page.tsx`
- ✅ Ajout de la catégorie "Sécurité" avec couleur jaune dans `ArticleCard`
- ✅ Gestion des articles vides avec message approprié

### 2. Gestion des images manquantes
- ✅ Ajout d'un placeholder par défaut (`/images/video-placeholder.png`)
- ✅ Gestion d'erreur avec `onError` pour charger le placeholder si l'image échoue
- ✅ État local pour gérer le changement d'image

## ⚠️ Problème des images en production (Vercel)

**Le problème :**
- Les images sont stockées dans `public/uploads/` 
- Ce dossier est dans `.gitignore`, donc les images ne sont pas sur GitHub
- Vercel n'a pas accès aux fichiers uploadés localement
- Les fichiers système Vercel sont read-only (sauf `/tmp`)

**Solutions recommandées :**

### Option 1 : Vercel Blob (Recommandé)
```bash
npm install @vercel/blob
```

Modifier `app/api/upload/route.ts` pour utiliser Vercel Blob :
```typescript
import { put } from '@vercel/blob';

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  
  const blob = await put(file.name, file, {
    access: 'public',
  });
  
  return NextResponse.json({ url: blob.url });
}
```

### Option 2 : Cloudinary
1. Créer un compte sur Cloudinary
2. Installer `cloudinary`
3. Configurer les variables d'environnement dans Vercel
4. Modifier l'API upload pour utiliser Cloudinary

### Option 3 : AWS S3
1. Créer un bucket S3
2. Installer `@aws-sdk/client-s3`
3. Configurer les credentials AWS
4. Modifier l'API upload pour utiliser S3

## Actions immédiates

Pour l'instant, les images manquantes afficheront un placeholder. Cela permet au site de fonctionner même si les images ne sont pas disponibles.

## Prochaines étapes

1. Choisir un service de stockage cloud (Vercel Blob recommandé)
2. Migrer l'API upload vers le service choisi
3. Migrer les images existantes si nécessaire
4. Tester en production

## Note importante

Les images actuellement dans `public/uploads/` ne seront **jamais** disponibles sur Vercel car :
- Elles ne sont pas versionnées (dans `.gitignore`)
- Le système de fichiers Vercel est éphémère
- Chaque déploiement repart avec une version propre

Il est donc **essentiel** d'utiliser un service de stockage cloud pour la production.


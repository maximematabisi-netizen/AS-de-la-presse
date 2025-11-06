# 📧 Configuration Resend pour les notifications par email

## Vue d'ensemble

Le système de notification par email est maintenant configuré pour envoyer automatiquement des emails aux abonnés de la newsletter lorsqu'un nouvel article est publié.

## Configuration requise

### 1. Créer un compte Resend

1. Allez sur https://resend.com
2. Créez un compte gratuit (100 emails/jour gratuits)
3. Vérifiez votre email

### 2. Obtenir la clé API

1. Une fois connecté, allez dans **API Keys**
2. Cliquez sur **Create API Key**
3. Donnez un nom à votre clé (ex: "AS-de-la-presse")
4. Copiez la clé API (elle commence par `re_`)

### 3. Configurer le domaine d'envoi (optionnel mais recommandé)

Pour utiliser votre propre domaine d'email (ex: `noreply@asdelepresse.com`) :

1. Allez dans **Domains**
2. Cliquez sur **Add Domain**
3. Entrez votre domaine (ex: `asdelepresse.com`)
4. Suivez les instructions pour configurer les enregistrements DNS

**Note** : Pour les tests, vous pouvez utiliser l'email par défaut de Resend sans configurer de domaine.

### 4. Ajouter les variables d'environnement sur Vercel

1. Allez sur https://vercel.com/dashboard
2. Sélectionnez votre projet
3. Allez dans **Settings** → **Environment Variables**
4. Ajoutez les variables suivantes :

```
RESEND_API_KEY = re_votre_cle_api_ici
RESEND_FROM_EMAIL = Les As de la Presse <noreply@asdelepresse.com>
NEXT_PUBLIC_SITE_URL = https://asdelepresse.vercel.app
```

**Pour chaque variable** :
- Cliquez sur **Add**
- Entrez le nom de la variable
- Entrez la valeur
- Sélectionnez **Production**, **Preview**, et **Development**
- Cliquez sur **Save**

### 5. Redéployer le projet

Après avoir ajouté les variables d'environnement :

1. Allez dans **Deployments**
2. Cliquez sur les **3 points** (⋯) du dernier déploiement
3. Sélectionnez **Redeploy**

## Fonctionnement

### Quand les emails sont envoyés

Les emails sont automatiquement envoyés aux abonnés de la newsletter lorsque :
- Un nouvel article est créé **ET** publié (avec `publishedAt` défini)
- L'article est sauvegardé via l'API `/api/articles` (POST)

### Contenu de l'email

L'email contient :
- Le titre de l'article
- L'image de l'article (si disponible)
- La catégorie
- L'extrait (excerpt)
- Un lien pour lire l'article complet
- Un lien pour se désabonner

### Gestion des erreurs

- Si Resend n'est pas configuré, les emails ne sont pas envoyés mais l'article est quand même créé
- Les erreurs d'envoi sont loggées mais n'empêchent pas la création d'article
- Les emails sont envoyés en arrière-plan (asynchrone) pour ne pas ralentir la création d'article

## Limites du plan gratuit Resend

- **100 emails/jour** gratuits
- **3,000 emails/mois** gratuits
- Parfait pour commencer

## Test

Pour tester le système :

1. Créez un compte de test sur votre site
2. Abonnez-vous à la newsletter avec cet email
3. Créez un nouvel article via l'interface admin
4. Vérifiez que l'email de notification est reçu

## Vérification des logs

Pour vérifier que les emails sont envoyés :

1. Allez dans **Deployments** → Dernier déploiement → **Functions** → `/api/articles`
2. Regardez les logs pour voir :
   - `[email] Sending notification to X subscribers`
   - `[email] Notification sent: X successful, Y failed`

## Dépannage

### Les emails ne sont pas envoyés

1. **Vérifiez que `RESEND_API_KEY` est configuré** :
   - Allez dans Vercel → Settings → Environment Variables
   - Vérifiez que `RESEND_API_KEY` existe et est correct

2. **Vérifiez les logs** :
   - Regardez les logs Vercel pour voir les erreurs
   - Cherchez les messages `[email]` dans les logs

3. **Vérifiez que l'article est publié** :
   - Les emails ne sont envoyés que si `publishedAt` est défini

4. **Vérifiez qu'il y a des abonnés** :
   - Les emails ne sont envoyés que s'il y a des abonnés dans la base de données

### Erreur "Invalid API key"

- Vérifiez que la clé API est correcte
- Vérifiez que la clé API n'a pas expiré
- Créez une nouvelle clé API si nécessaire

### Erreur "Domain not verified"

- Si vous utilisez un domaine personnalisé, vérifiez que les enregistrements DNS sont correctement configurés
- Ou utilisez l'email par défaut de Resend pour les tests

## Support

- Documentation Resend : https://resend.com/docs
- Support Resend : support@resend.com


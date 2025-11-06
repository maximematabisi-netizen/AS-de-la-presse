# Configuration de l'espace Admin

## Installation

1. **Installer les dépendances** (déjà fait) :
   ```bash
   npm install
   ```

2. **Mettre à jour la base de données Prisma** :
   ```bash
   npx prisma migrate dev --name add_user_auth
   ```
   Ou si vous préférez simplement synchroniser le schéma :
   ```bash
   npx prisma db push
   ```

3. **Créer le premier utilisateur admin** :
   ```bash
   npx tsx scripts/create-admin-user.ts admin votreMotDePasse admin@example.com
   ```
   
   Ou sans email :
   ```bash
   npx tsx scripts/create-admin-user.ts admin votreMotDePasse
   ```

## Utilisation

### Connexion à l'espace admin

1. Accédez à : `http://localhost:3000/actualite/admin/login`
2. Entrez votre nom d'utilisateur et mot de passe
3. Vous serez redirigé vers le panel d'administration

### Gestion des utilisateurs

Une fois connecté en tant qu'admin :

1. Allez dans l'onglet **"Utilisateurs"** du panel admin
2. Cliquez sur **"+ Ajouter un utilisateur"**
3. Remplissez le formulaire :
   - Nom d'utilisateur (requis)
   - Email (optionnel)
   - Mot de passe (minimum 6 caractères)
   - Rôle (Admin, Éditeur, ou Rédacteur)
4. Cliquez sur **"Créer l'utilisateur"**

### Fonctionnalités

- ✅ Authentification sécurisée avec JWT
- ✅ Mots de passe hashés avec bcrypt
- ✅ Gestion des utilisateurs autorisés
- ✅ Interface admin sans header/footer
- ✅ Page de login avec design moderne et photo d'arrière-plan
- ✅ Protection des routes admin via middleware

## Sécurité

- Les mots de passe sont hashés avec bcrypt (10 rounds)
- Les sessions utilisent JWT avec expiration de 24h
- Les cookies sont httpOnly et sécurisés en production
- Le middleware protège toutes les routes `/actualite/admin/*`

## Variables d'environnement

Assurez-vous d'avoir une variable `JWT_SECRET` dans votre fichier `.env` :

```env
JWT_SECRET=votre-secret-jwt-tres-securise
```

En développement, un secret par défaut est utilisé, mais **changez-le en production** !


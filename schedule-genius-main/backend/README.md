# Schedule Genius Backend API

Backend API pour l'application Schedule Genius, construit avec Express.js, TypeScript et MySQL.

## 🚀 Installation

1. Installer les dépendances :
```bash
npm install
```

2. Configurer les variables d'environnement :
```bash
cp env.example .env
```

Puis éditer `.env` avec vos valeurs MySQL :
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=ensa_timetable

PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:8080
```

3. Créer la base de données :
```bash
mysql -u root -p < database/schema.sql
```

Ou exécuter le fichier SQL dans votre client MySQL préféré.

## 📝 Scripts

- `npm run dev` - Démarrer le serveur en mode développement avec hot-reload
- `npm run build` - Compiler TypeScript en JavaScript
- `npm start` - Démarrer le serveur en production
- `npm run lint` - Linter le code

## 🏗️ Structure

```
backend/
├── src/
│   ├── config/          # Configuration (database)
│   ├── middleware/      # Middleware (auth, error handling)
│   ├── routes/          # Routes API
│   ├── services/       # Logique métier
│   ├── types/          # Types TypeScript
│   └── index.ts        # Point d'entrée
├── database/
│   └── schema.sql      # Schéma de base de données
└── package.json
```

## 🔐 Authentification

Pour le développement, l'authentification est simplifiée :
- Token `admin` pour les administrateurs
- Token `student` pour les étudiants

**⚠️ Important** : En production, remplacer par JWT ou un système d'authentification sécurisé.

Utilisation :
```
Authorization: Bearer admin
```

Les routes d'administration nécessitent le rôle `admin`.

## 📡 Endpoints API

### Modules
- `GET /api/modules` - Liste tous les modules
- `GET /api/modules/:id` - Détails d'un module
- `POST /api/modules` - Créer un module (admin)
- `PUT /api/modules/:id` - Mettre à jour un module (admin)
- `DELETE /api/modules/:id` - Supprimer un module (admin)

### Professeurs
- `GET /api/professors` - Liste tous les professeurs
- `GET /api/professors/:id` - Détails d'un professeur
- `GET /api/professors/:id/availability` - Disponibilité d'un professeur
- `POST /api/professors` - Créer un professeur (admin)
- `PUT /api/professors/:id` - Mettre à jour un professeur (admin)
- `PUT /api/professors/:id/availability` - Mettre à jour la disponibilité (admin)
- `DELETE /api/professors/:id` - Supprimer un professeur (admin)

### Salles
- `GET /api/rooms` - Liste toutes les salles
- `GET /api/rooms/:id` - Détails d'une salle
- `POST /api/rooms` - Créer une salle (admin)
- `PUT /api/rooms/:id` - Mettre à jour une salle (admin)
- `DELETE /api/rooms/:id` - Supprimer une salle (admin)

### Programmes
- `GET /api/programs` - Liste tous les programmes
- `GET /api/programs/:id` - Détails d'un programme
- `POST /api/programs` - Créer un programme (admin)
- `PUT /api/programs/:id` - Mettre à jour un programme (admin)
- `DELETE /api/programs/:id` - Supprimer un programme (admin)

### Groupes
- `GET /api/groups` - Liste tous les groupes (optionnel: `?program_id=1`)
- `GET /api/groups/:id` - Détails d'un groupe
- `POST /api/groups` - Créer un groupe (admin)
- `PUT /api/groups/:id` - Mettre à jour un groupe (admin)
- `DELETE /api/groups/:id` - Supprimer un groupe (admin)

## 🔧 Développement

Le serveur démarre sur `http://localhost:3001` par défaut.

Pour le développement, utilisez `npm run dev` qui active le hot-reload avec `tsx`.

## 📦 Production

1. Compiler le code :
```bash
npm run build
```

2. Démarrer le serveur :
```bash
npm start
```

## 🗄️ Base de données

La base de données MySQL utilise le schéma défini dans `database/schema.sql`.

### Tables principales :
- `modules` - Modules d'enseignement
- `professors` - Professeurs
- `rooms` - Salles
- `programs` - Programmes (filières)
- `groups` - Groupes d'étudiants
- `availability` - Disponibilités des professeurs
- `timetable_entries` - Entrées d'emploi du temps
- `constraints_rules` - Règles de contraintes

## 🛡️ Sécurité

- Toutes les routes sont protégées par authentification
- Les routes d'administration vérifient le rôle utilisateur
- Validation des données d'entrée avec `express-validator`
- Gestion centralisée des erreurs
- Protection contre les injections SQL avec des requêtes préparées

## 📝 Notes

- Les IDs sont des entiers (INT) et non des UUIDs
- Les disponibilités utilisent `day_of_week` de 1 à 7 (lundi à dimanche)
- Les créneaux horaires sont indexés à partir de 0

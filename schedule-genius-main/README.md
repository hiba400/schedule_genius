# Schedule Genius

Application de génération automatique d'emplois du temps pour les établissements d'enseignement supérieur.

## 📁 Structure du Projet

```
schedule-genius/
├── frontend/          # Application React/TypeScript (Vite)
│   ├── src/          # Code source frontend
│   ├── public/       # Fichiers statiques
│   └── supabase/     # Configuration Supabase (Edge Functions, Migrations)
│
└── backend/          # API REST Express.js/TypeScript
    ├── src/          # Code source backend
    │   ├── config/   # Configuration
    │   ├── middleware/ # Middleware (auth, errors)
    │   ├── routes/   # Routes API
    │   ├── services/ # Logique métier
    │   └── types/    # Types TypeScript
    └── dist/         # Code compilé (généré)
```

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 18+ et npm
- Compte Supabase avec projet configuré

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Le frontend sera accessible sur `http://localhost:8080`

### Backend

```bash
cd backend
npm install
cp env.example .env
# Éditer .env avec vos clés Supabase
npm run dev
```

Le backend sera accessible sur `http://localhost:3001`

## 📚 Documentation

- [Documentation Frontend](./frontend/README.md) - Guide du frontend
- [Documentation Backend](./backend/README.md) - Guide du backend API

## 🛠️ Technologies

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Supabase Client

### Backend
- Node.js
- Express.js
- TypeScript
- Supabase (Database)
- Express Validator

## 📝 Scripts Disponibles

### Frontend
- `npm run dev` - Démarrer le serveur de développement
- `npm run build` - Build de production
- `npm run lint` - Linter le code

### Backend
- `npm run dev` - Démarrer le serveur avec hot-reload
- `npm run build` - Compiler TypeScript
- `npm start` - Démarrer en production

## 🔐 Configuration

### Variables d'environnement Frontend

Créer un fichier `.env` dans `frontend/` :
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

### Variables d'environnement Backend

Créer un fichier `.env` dans `backend/` :
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
PORT=3001
CORS_ORIGIN=http://localhost:8080
```

## 📡 API Backend

Le backend expose une API REST sur `http://localhost:3001/api` :

- `/api/modules` - Gestion des modules
- `/api/professors` - Gestion des professeurs
- `/api/rooms` - Gestion des salles
- `/api/programs` - Gestion des programmes
- `/api/groups` - Gestion des groupes

Toutes les routes nécessitent une authentification via token Bearer.

## 🎯 Fonctionnalités

- ✅ Gestion des modules, professeurs, salles, programmes et groupes
- ✅ Génération automatique d'emplois du temps avec algorithme génétique
- ✅ Gestion des contraintes et disponibilités
- ✅ Interface multilingue (FR, EN, AR)
- ✅ Authentification et autorisation par rôles
- ✅ API REST complète avec validation

## 📄 Licence

ISC

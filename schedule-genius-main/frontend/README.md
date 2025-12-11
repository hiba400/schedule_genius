# Schedule Genius - Frontend

Application React/TypeScript pour la gestion et génération d'emplois du temps.

## 🚀 Installation

```bash
npm install
```

## 📝 Configuration

Créer un fichier `.env` à la racine du dossier `frontend/` :

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

## 🛠️ Scripts Disponibles

- `npm run dev` - Démarrer le serveur de développement (port 8080)
- `npm run build` - Build de production
- `npm run build:dev` - Build en mode développement
- `npm run preview` - Prévisualiser le build de production
- `npm run lint` - Linter le code

## 📁 Structure

```
frontend/
├── src/
│   ├── components/     # Composants React
│   │   ├── layout/    # Composants de mise en page
│   │   └── ui/        # Composants UI (shadcn/ui)
│   ├── contexts/      # Contextes React (Auth, Language)
│   ├── hooks/         # Hooks personnalisés
│   ├── integrations/  # Intégrations (Supabase)
│   ├── lib/           # Utilitaires
│   ├── locales/       # Fichiers de traduction
│   ├── pages/         # Pages de l'application
│   └── main.tsx       # Point d'entrée
├── public/            # Fichiers statiques
└── supabase/          # Configuration Supabase
    ├── functions/     # Edge Functions
    └── migrations/    # Migrations de base de données
```

## 🎨 Technologies

- **React 18** - Bibliothèque UI
- **TypeScript** - Typage statique
- **Vite** - Build tool et dev server
- **Tailwind CSS** - Framework CSS
- **shadcn/ui** - Composants UI
- **React Router** - Routing
- **Supabase** - Backend as a Service
- **React Query** - Gestion d'état serveur

## 🌐 Pages

- `/` - Page d'accueil
- `/auth` - Authentification
- `/dashboard` - Tableau de bord
- `/modules` - Gestion des modules
- `/professors` - Gestion des professeurs
- `/rooms` - Gestion des salles
- `/programs` - Gestion des programmes
- `/groups` - Gestion des groupes
- `/constraints` - Gestion des contraintes
- `/generate` - Génération d'emploi du temps
- `/timetables` - Visualisation des emplois du temps

## 🔐 Authentification

L'application utilise Supabase Auth pour l'authentification. Seuls les emails `@uae.ac.ma` et `@etu.uae.ac.ma` sont autorisés.

## 🌍 Internationalisation

L'application supporte 3 langues :
- Français (FR)
- Anglais (EN)
- Arabe (AR)

Les traductions sont dans `src/locales/`.

## 📡 API

Le frontend peut utiliser soit :
1. **Supabase Client** directement (actuellement)
2. **Backend API** (à configurer) - Voir `backend/README.md`

Pour utiliser le backend API, créer un client API dans `src/lib/api.ts` et mettre à jour les pages pour utiliser ce client au lieu de Supabase directement.


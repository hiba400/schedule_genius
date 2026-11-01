# Schedule Genius

Automatic timetable generation application for higher education institutions.

## 📁 Project Structure

```
schedule-genius/
├── frontend/          # React/TypeScript Application (Vite)
│   ├── src/          # Frontend source code
│   ├── public/       # Static files
│   └── supabase/     # Supabase Configuration (Edge Functions, Migrations)
│
└── backend/          # Express.js/TypeScript REST API
    ├── src/          # Backend source code
    │   ├── config/   # Configuration
    │   ├── middleware/ # Middleware (auth, errors)
    │   ├── routes/   # API routes
    │   ├── services/ # Business logic
    │   └── types/    # TypeScript types
    └── dist/         # Compiled code (generated)
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account with configured project

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will be accessible at `http://localhost:8080`

### Backend

```bash
cd backend
npm install
cp env.example .env
# Edit .env with your Supabase keys
npm run dev
```

Backend will be accessible at `http://localhost:3001`

## 📚 Documentation

- [Frontend Documentation](./frontend/README.md) - Frontend guide
- [Backend Documentation](./backend/README.md) - Backend API guide

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

## 📝 Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run lint` - Lint code

### Backend
- `npm run dev` - Start server with hot-reload
- `npm run build` - Compile TypeScript
- `npm start` - Start in production

## 🔐 Configuration

### Frontend Environment Variables

Create a `.env` file in `frontend/`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

### Backend Environment Variables

Create a `.env` file in `backend/`:
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
PORT=3001
CORS_ORIGIN=http://localhost:8080
```

## 📡 Backend API

The backend exposes a REST API at `http://localhost:3001/api`:

- `/api/modules` - Module management
- `/api/professors` - Professor management
- `/api/rooms` - Room management
- `/api/programs` - Program management
- `/api/groups` - Group management

All routes require authentication via Bearer token.

## 🎯 Features

- ✅ Management of modules, professors, rooms, programs, and groups
- ✅ Automatic timetable generation with genetic algorithm
- ✅ Constraint and availability management
- ✅ Multilingual interface (FR, EN, AR)
- ✅ Authentication and role-based authorization
- ✅ Complete REST API with validation

## 📄 License

ISC

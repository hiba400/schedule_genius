# Guide de Test du Backend

## 🚀 Démarrage du Serveur

```bash
cd backend
npm run dev
```

Le serveur démarre sur `http://localhost:3001`

## 🧪 Tests Manuels

### 1. Health Check (sans authentification)

```bash
curl http://localhost:3001/health
```

Réponse attendue:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 2. Test avec Authentification

Tous les autres endpoints nécessitent un token d'authentification.

**Token admin**: `admin`
**Token student**: `student`

```bash
curl -H "Authorization: Bearer admin" http://localhost:3001/api/modules
```

### 3. Tests avec PowerShell

Utiliser le script de test:
```powershell
cd backend
.\test-api.ps1
```

## 📡 Endpoints à Tester

### Modules
- `GET /api/modules` - Liste tous les modules
- `GET /api/modules/:id` - Détails d'un module
- `POST /api/modules` - Créer un module (admin)
- `PUT /api/modules/:id` - Mettre à jour (admin)
- `DELETE /api/modules/:id` - Supprimer (admin)

### Professeurs
- `GET /api/professors` - Liste tous les professeurs
- `GET /api/professors/:id` - Détails
- `GET /api/professors/:id/availability` - Disponibilité
- `POST /api/professors` - Créer (admin)
- `PUT /api/professors/:id` - Mettre à jour (admin)
- `PUT /api/professors/:id/availability` - Mettre à jour disponibilité (admin)
- `DELETE /api/professors/:id` - Supprimer (admin)

### Salles
- `GET /api/rooms` - Liste toutes les salles
- `GET /api/rooms/:id` - Détails
- `POST /api/rooms` - Créer (admin)
- `PUT /api/rooms/:id` - Mettre à jour (admin)
- `DELETE /api/rooms/:id` - Supprimer (admin)

### Programmes
- `GET /api/programs` - Liste tous les programmes
- `GET /api/programs/:id` - Détails
- `POST /api/programs` - Créer (admin)
- `PUT /api/programs/:id` - Mettre à jour (admin)
- `DELETE /api/programs/:id` - Supprimer (admin)

### Groupes
- `GET /api/groups` - Liste tous les groupes
- `GET /api/groups?program_id=1` - Groupes par programme
- `GET /api/groups/:id` - Détails
- `POST /api/groups` - Créer (admin)
- `PUT /api/groups/:id` - Mettre à jour (admin)
- `DELETE /api/groups/:id` - Supprimer (admin)

## 📝 Exemples de Requêtes

### Créer un Module
```bash
curl -X POST http://localhost:3001/api/modules \
  -H "Authorization: Bearer admin" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Analyse 1",
    "code": "MATH101",
    "type": "CM",
    "nature": "mathematiques",
    "hours_cm": 24,
    "hours_td": 16,
    "hours_tp": 0
  }'
```

### Créer un Professeur
```bash
curl -X POST http://localhost:3001/api/professors \
  -H "Authorization: Bearer admin" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pr. El Amrani",
    "email": "elamrani@ensa.ma",
    "specialties": "Maths, Stats",
    "max_hours": 12
  }'
```

### Créer une Salle
```bash
curl -X POST http://localhost:3001/api/rooms \
  -H "Authorization: Bearer admin" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Amphi A",
    "type": "AMPHI",
    "capacity": 120,
    "equipment": "Vidéo-projecteur"
  }'
```

## ⚠️ Notes Importantes

1. **Base de données MySQL** : Assurez-vous que MySQL est démarré et que la base de données `ensa_timetable` existe.

2. **Création de la base** : Exécutez le script SQL :
   ```bash
   mysql -u root -p < database/schema.sql
   ```

3. **Authentification** : Pour le développement, utilisez les tokens `admin` ou `student`. En production, remplacez par JWT.

4. **Erreurs courantes** :
   - `ECONNREFUSED` : MySQL n'est pas démarré
   - `ER_BAD_DB_ERROR` : La base de données n'existe pas
   - `401 Unauthorized` : Token manquant ou invalide
   - `403 Forbidden` : Token student utilisé sur une route admin


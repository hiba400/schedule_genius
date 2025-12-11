import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: 'admin' | 'student';
  };
}

// Pour l'instant, authentification simplifiée
// TODO: Implémenter JWT ou autre système d'authentification
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7);
    
    // TODO: Vérifier le token JWT ou autre méthode
    // Pour l'instant, on accepte n'importe quel token (à remplacer)
    // En production, utiliser JWT ou une autre méthode sécurisée
    
    // Exemple avec une table users (à créer si nécessaire)
    // const users = await query('SELECT * FROM users WHERE token = ?', [token]);
    // if (users.length === 0) {
    //   return res.status(401).json({ error: 'Invalid token' });
    // }
    
    // Pour le développement, on accepte le token "admin" ou "student"
    if (token === 'admin') {
      req.user = {
        id: 1,
        email: 'admin@ensa.ma',
        role: 'admin',
      };
    } else if (token === 'student') {
      req.user = {
        id: 2,
        email: 'student@ensa.ma',
        role: 'student',
      };
    } else {
      return res.status(401).json({ error: 'Invalid token' });
    }

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
};

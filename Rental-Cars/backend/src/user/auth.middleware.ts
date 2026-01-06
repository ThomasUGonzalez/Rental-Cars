import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

type JwtUser = {
  id: string;
  role: string;
  mail: string;
};

declare module 'express' {
  interface Request {
    user?: JwtUser;
  }
}


export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);

  if (err.name === 'CastError') {
    res.status(400).json({ error: 'Formato de ID inválido' });
  } else if (err.name === 'ValidationError') {
    res.status(400).json({ error: err.message });
  } else if (err.name === 'MongoServerError' && err.message.includes('E11000 duplicate key error')) {
    res.status(400).json({ error: 'No es posible registrar el usuario con ese correo electrónico' });
  } else if (err.name === 'JsonWebTokenError') {
    res.status(401).json({ error: 'Token inválido' });
  } else if (err.name === 'TokenExpiredError') {
    res.status(401).json({ error: 'Token expirado' });
  } else {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const userExtractor = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.get('authorization');
  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    res.status(401).json({ error: 'Token faltante o inválido' });
    return; 
  }

  const token = authHeader.substring(7);
  try {
    if (!process.env.SECRET) {
      res.status(500).json({ error: 'Configuración del servidor incompleta: SECRET no definido en el .env' });
      return;
    }

    const decodedToken = jwt.verify(token, process.env.SECRET) as JwtUser;
    
    if (!decodedToken.id) {
      res.status(401).json({ error: 'Token inválido' });
      return; 
    }
    
    req.user = decodedToken; 
    next();
  } catch (error) {
    next(error);
  }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Acceso denegado. Requiere permisos de administrador.' });
    return;
  }
  next();
};
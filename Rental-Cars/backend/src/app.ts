import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import carRoutes from './car/car.routes.js'
import userRoutes from './user/user.routes.js';
import rentalRoutes from './rental/rental.routes.js';
import { errorHandler } from './user/auth.middleware.js';
import { connectDB } from './user/user.db.js';
import httpLogger from './middleware/logger/pino.logger.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200
};
console.log("--- DEBUGGING VARIABLES ---");
console.log("MONGODB_URI:", process.env.MONGODB_URI);
console.log("MONGO_URL:", process.env.MONGO_URL);
console.log("-------------------------");
async function startServer() {
  // 1. Conectar a MongoDB y esperar a que esté lista
  await connectDB();

  // 2. USAR MIDDLEWARES (CORS debe ir antes de las rutas)
  app.use(cors(corsOptions));
  app.use(httpLogger);
  app.use(express.json());

  // 4. Montar rutas
  app.use('/api/users', userRoutes);
  app.use('/api/cars', carRoutes);
  app.use('/api/rentals', rentalRoutes);

  // 5. Manejo de errores global
  app.use(errorHandler);

  // 6. Documentación Swagger
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // 7. Iniciar el servidor
  app.listen(PORT, () => {
    httpLogger.logger.info(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

startServer();
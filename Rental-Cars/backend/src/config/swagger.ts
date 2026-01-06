import swaggerJsdoc, { Options } from 'swagger-jsdoc';

const options: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Rental Car API',
      version: '1.0.0',
      description: 'Documentación de la API para la gestión de alquiler de vehículos',
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Servidor de Desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/car/**/*.ts', './src/user/**/*.ts', './src/rental/**/*.ts'], 
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
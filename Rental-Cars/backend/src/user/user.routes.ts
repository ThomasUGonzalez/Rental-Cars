import { Router, Request, Response, NextFunction } from 'express';
import { registerUser, listUsers, getUserById, deleteUser} from './user.controller.js';
import { login } from './auth.controller.js';
import { userExtractor, isAdmin } from './auth.middleware.js'

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: Gestión de usuarios y autenticación
 */

const router = Router();

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mail
 *               - name
 *               - password
 *             properties:
 *               mail:
 *                 type: string
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '400':
 *         description: Error en los datos o usuario ya existente
 */
// Registro de usuario (Público)
router.post('/register', registerUser);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mail
 *               - password
 *             properties:
 *               mail:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 mail:
 *                   type: string
 *                 name:
 *                   type: string
 *                 role:
 *                   type: string
 *                 token:
 *                   type: string
 *                   description: JWT para autenticación
 *       '401':
 *         description: Credenciales inválidas
 */

// Login (Público)
router.post('/login', (req: Request, res: Response, next: NextFunction) => {
  login(req, res).catch(next);
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Listar todos los usuarios
 *     description: Requiere rol de ADMIN.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista de usuarios recuperada
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       '403':
 *         description: No tiene permisos de administrador
 */
// Listar usuarios (Requiere autenticación y ser ADMIN)
router.get('/', userExtractor, isAdmin, (req: Request, res: Response, next: NextFunction) => {
  listUsers(req, res).catch(next);
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obtener usuario por ID
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       '200':
 *         description: Datos del usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '404':
 *         description: Usuario no encontrado
 */
// Obtener usuario único por ID (Lógica de seguridad en el controlador)
router.get('/:id', userExtractor, (req: Request, res: Response, next: NextFunction) => {
  getUserById(req, res).catch(next); 
});

/**
 * @swagger
 * /users/delete/{id}:
 *   delete:
 *     summary: Eliminar un usuario
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Usuario eliminado correctamente
 *       '403':
 *         description: No autorizado
 */
// Eliminar usuario por id (Lógica de seguridad en el controlador)
router.delete('/delete/:id', userExtractor, async (req: Request, res: Response, next: NextFunction) => {
  deleteUser(req,res).catch(next);
});

export default router;
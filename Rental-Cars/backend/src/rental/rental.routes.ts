import { Router } from 'express';
import { RentalController } from './rental.controller.js';
/**
 * @swagger
 * tags:
 *   - name: Rentals
 *     description: Operaciones de alquiler
 */
const rentalRouter = Router();
const rentalController = new RentalController();
/**
 * @swagger
 * /rentals:
 *   get:
 *     summary: Listar alquileres
 *     tags:
 *       - Rentals
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Rental'
 */
rentalRouter.get('/', rentalController.findAllRentals);
/**
 * @swagger
 * /rentals/{id}:
 *   get:
 *     summary: Obtener alquiler por ID
 *     tags:
 *       - Rentals
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rental'
 */
rentalRouter.get('/:id', rentalController.findRentalById);
/**
 * @swagger
 * /rentals/new:
 *   post:
 *     summary: Crear nuevo alquiler
 *     tags:
 *       - Rentals
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               carId:
 *                 type: integer
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       '201':
 *         description: Alquiler creado exitosamente
 */
rentalRouter.post('/new', sanitizeRentalInput, rentalController.addRental);
/**
 * @swagger
 * /rentals/put/{id}:
 *   put:
 *     summary: Modificar alquiler completamente
 *     tags:
 *       - Rentals
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       '200':
 *         description: Modificado
 */
rentalRouter.put('/edit/:id', sanitizeRentalInput, rentalController.updateRental);
/**
 * @swagger
 * /rentals/patch/{id}:
 *   patch:
 *     summary: Modificar alquiler parcialmente (ej. fechas)
 *     tags:
 *       - Rentals
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       '200':
 *         description: Modificado
 */
rentalRouter.patch('/patch/:id', sanitizeRentalInput, rentalController.partiallyUpdateRental);
/**
 * @swagger
 * /rentals/delete/{id}:
 *   delete:
 *     summary: Eliminar un alquiler
 *     tags:
 *       - Rentals
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Eliminado
 */
rentalRouter.delete('/delete/:id', rentalController.deleteRental);

function sanitizeRentalInput(req:any, _res:any, next:any) {
  req.body.sanitizedInput = {
    userId: req.body.userId,
    carId: req.body.carId,
    startDate: req.body.startDate,
    endDate: req.body.endDate
  };

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });

  next();
}

export default rentalRouter;
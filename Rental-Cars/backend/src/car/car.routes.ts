import { Router } from "express";
import { CarController } from './car.controller.js';
/**
 * @swagger
 * tags:
 *   - name: Cars
 *     description: Catálogo de vehículos
 */
const carRouter = Router();
const carController = new CarController();
/**
 * @swagger
 * /cars:
 *   get:
 *     summary: Obtener listado de autos
 *     tags:
 *       - Cars
 *     responses:
 *       '200':
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   brand:
 *                     type: string
 *                   model:
 *                     type: string
 *                   year:
 *                     type: integer
 *                   color:
 *                     type: string
 *                   price:
 *                     type: number
 */
carRouter.get('/', carController.findAllCars);
/**
 * @swagger
 * /cars/{id}:
 *   get:
 *     summary: Obtener detalle de un auto
 *     tags:
 *       - Cars
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   brand:
 *                     type: string
 *                   model:
 *                     type: string
 *                   year:
 *                     type: integer
 *                   color:
 *                     type: string
 *                   price:
 *                     type: number
 */
carRouter.get('/:id', carController.findCarById);
/**
 * @swagger
 * /cars/new:
 *   post:
 *     summary: Agregar vehículo (Admin)
 *     tags:
 *       - Cars
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - brand
 *               - model
 *               - year
 *               - color
 *               - price
 *             properties:
 *               brand:
 *                 type: string
 *               model:
 *                 type: string
 *               year:
 *                 type: integer
 *               color:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       '201':
 *         description: Creado
 */
carRouter.post('/new', sanitizeCarInput, carController.addCar);
/**
 * @swagger
 * /cars/edit/{id}:
 *   put:
 *     summary: Editar vehículo (Admin)
 *     tags:
 *       - Cars
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - brand
 *               - model
 *               - year
 *               - color
 *               - price
 *             properties:
 *               brand:
 *                 type: string
 *               model:  
 *                 type: string
 *               year:
 *                 type: integer
 *               color:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       '200':
 *         description: Actualizado
 */
carRouter.put('/edit/:id', sanitizeCarInput, carController.updateCar);
/**
 * @swagger
 * /cars/patch/{id}:
 *   patch:
 *     summary: Editar vehículo parcialmente (Admin)
 *     tags:
 *       - Cars
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               brand:
 *                 type: string
 *               model:
 *                 type: string
 *               year:
 *                 type: integer
 *               color:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       '200':
 *         description: Actualizado
 */
carRouter.patch('/patch/:id', sanitizeCarInput, carController.partialUpdateCar);
/**
 * @swagger
 * /cars/delete/{id}:
 *   delete:
 *     summary: Eliminar vehículo (Admin)
 *     tags:
 *       - Cars
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
carRouter.delete('/delete/:id', carController.deleteCar);

function sanitizeCarInput(req:any, res:any, next:any) {

  req.body.sanitizedInput = {
    brand: req.body.brand,
    model: req.body.model,
    year: req.body.year,
    color: req.body.color,
    price: req.body.price,
    imageUrl: req.body.imageUrl
  }

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key]
    }
  })

  next()
}

export default carRouter;
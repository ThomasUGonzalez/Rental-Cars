import { Request, Response } from "express";
import { Rental, calculateDays } from "./rental.entity.js";
import { RentalPostgresRepository } from "./rental.postgres.repository.js";
import { CarPostgresRepository } from "../car/car.postgres.repository.js";
import { findUserById } from "../user/user.service.js";
import { parseSQLDate } from "../utils/date.utils.js";

const rentalRepository = new RentalPostgresRepository();
const carRepository = new CarPostgresRepository();

export class RentalController {

    async findAllRentals(_req: Request, res: Response) {
        try {
            const rentals = await rentalRepository.findAll();
            res.json(rentals); 
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener alquileres' });
        }
    }

    async findRentalById(req: Request, res: Response) {
        try {
            const rentalId = Number(req.params.id);
            if (isNaN(rentalId)) {
                res.status(400).json({ error: 'ID de alquiler inválido' });
                return;
            }
            const rental = await rentalRepository.findOne(rentalId);
            if (!rental) {
                res.status(404).json({
                    errorMessage: 'Rental not found',
                    errorCode: 'RENTAL_NOT_FOUND'
                });
                return;
            }
            res.json(rental); 
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al buscar el alquiler' });
        }
    }

    async addRental(req: Request, res: Response) {
        try {
            const input = req.body; 

            // 1. Validar Fechas
            const startDate = parseSQLDate(input.startDate);
            const endDate = parseSQLDate(input.endDate);

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                res.status(400).json({ error: 'Formato de fecha inválido' });
                return;
            }
            
            if (endDate <= startDate) {
                res.status(400).json({ error: 'La fecha final debe ser posterior a la fecha de inicio' });
                return;
            }

            // 2. Validar Auto
            const car = await carRepository.findOne(input.carId);
            if (!car) {
                res.status(404).json({
                    errorMessage: 'Car not found',
                    errorCode: 'CAR_NOT_FOUND'
                });
                return;
            }

            // 3. Validar Usuario
            const user = await findUserById(input.userId);
            if (!user) {
                res.status(404).json({
                    errorMessage: 'User not found',
                    errorCode: 'USER_NOT_FOUND'
                });
                return;
            }

            // 4. Comprobación de disponibilidad (Overlap)
            const isAvailable = await rentalRepository.checkAvailability(car.id!, startDate, endDate);
            if (!isAvailable) {
                res.status(400).json({
                    errorMessage: 'El vehículo no está disponible para las fechas seleccionadas',
                    errorCode: 'CAR_NOT_AVAILABLE'
                });
                return;
            }

            // 5. Crear entidad (el precio se calcula en el constructor)
            const newRental = new Rental(
                user,
                car,
                startDate,
                endDate
            );

            // 6. Guardar
            const savedRental = await rentalRepository.add(newRental);
            res.status(201).json(savedRental);
        
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al añadir el alquiler' });
        }
    }

    async updateRental(req: Request, res: Response): Promise<void> {
        try {
            const rentalId = Number(req.params.id);
            if (isNaN(rentalId)) {
                res.status(400).json({ error: 'ID de alquiler inválido' });
                return;
            }
            
            const input = req.body;

            // 1. Validar Fechas
            const startDate = parseSQLDate(input.startDate);
            const endDate = parseSQLDate(input.endDate);

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                res.status(400).json({ error: 'Formato de fecha inválido' });
                return;
            }
            
            if (endDate <= startDate) {
                res.status(400).json({ error: 'La fecha final debe ser posterior a la fecha de inicio' });
                return;
            }

            // 2. Validar Auto
            const car = await carRepository.findOne(input.carId);
            if (!car) {
                res.status(404).json({
                    errorMessage: 'Car not found',
                    errorCode: 'CAR_NOT_FOUND'
                });
                return;
            }

            // 3. Validar Usuario
            const user = await findUserById(input.userId);
            if (!user) {
                res.status(404).json({
                    errorMessage: 'User not found',
                    errorCode: 'USER_NOT_FOUND'
                });
                return;
            }

            // 4. Comprobación de disponibilidad (excluyendo este mismo alquiler)
            const isAvailable = await rentalRepository.checkAvailability(car.id!, startDate, endDate, rentalId);
            if (!isAvailable) {
                res.status(400).json({
                    errorMessage: 'El vehículo no está disponible para las fechas seleccionadas',
                    errorCode: 'CAR_NOT_AVAILABLE'
                });
                return;
            }

            // 5. Crear entidad actualizada (el precio se calcula)
            const updatedRental = new Rental(
                user,
                car,
                startDate,
                endDate,
                rentalId
            );

            // 6. Actualizar
            const savedRental = await rentalRepository.update(rentalId, updatedRental);
            res.status(200).json(savedRental); 

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al actualizar el alquiler' });
        }
    }
    
    async partiallyUpdateRental(req: Request, res: Response): Promise<void> {
        try {
            const rentalId = Number(req.params.id);
            if (isNaN(rentalId)) {
                res.status(400).json({ error: 'ID de alquiler inválido' });
                return;
            }

            const existingRental = await rentalRepository.findOne(rentalId);
            if (!existingRental) {
                res.status(404).json({
                    errorMessage: 'Rental not found',
                    errorCode: 'RENTAL_NOT_FOUND'
                });
                return;
            }

            const input = req.body.sanitizedInput;

            const carId = input.carId ?? existingRental.car.id;
            const userId = input.userId ?? existingRental.user.id;
            const startDate = parseSQLDate(input.startDate ?? existingRental.startDate);
            const endDate = parseSQLDate(input.endDate ?? existingRental.endDate);

            // 1. Validar Fechas
            if (endDate <= startDate) {
                res.status(400).json({ error: 'La fecha final debe ser posterior a la fecha de inicio' });
                return;
            }

            // 2. Cargar Entidades (solo si cambiaron)
            const car = (input.carId) ? await carRepository.findOne(input.carId) : existingRental.car;
            if (!car) {
                res.status(404).json({ errorMessage: 'Car not found', errorCode: 'CAR_NOT_FOUND' });
                return;
            }

            const user = (input.userId) ? await findUserById(input.userId) : existingRental.user;
            if (!user) {
                res.status(404).json({ errorMessage: 'User not found', errorCode: 'USER_NOT_FOUND' });
                return;
            }

            // 3. Comprobar disponibilidad (excluyendo este alquiler)
            const isAvailable = await rentalRepository.checkAvailability(car.id!, startDate, endDate, rentalId);
            if (!isAvailable) {
                res.status(400).json({
                    errorMessage: 'El vehículo no está disponible para las fechas seleccionadas',
                    errorCode: 'CAR_NOT_AVAILABLE'
                });
                return;
            }

            // 4. Recalcular precio
            const days = calculateDays(startDate, endDate);
            const calculatedPrice = days * car.price;

            const patchData: Partial<Rental> = {
                ...input,
                userId: user.id,
                carId: car.id,
                price: calculatedPrice,
            };
            
            delete (patchData as any).status;

            const updatedRental = await rentalRepository.partialUpdate(rentalId, patchData);
            res.status(200).json(updatedRental);

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al actualizar parcialmente el alquiler' });
        }
    }

    async deleteRental(req: Request, res: Response): Promise<void> {
        try {
            const rentalId = Number(req.params.id);
            if (isNaN(rentalId)) {
                res.status(400).json({ error: 'ID de alquiler inválido' });
                return;
            }

            const deleted = await rentalRepository.delete(rentalId);

            if (!deleted) {
                res.status(404).json({
                    errorMessage: 'Rental not found',
                    errorCode: 'RENTAL_NOT_FOUND'
                });
                return;
            }

            res.status(204).send();
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al eliminar el alquiler' });
        }
    }
}
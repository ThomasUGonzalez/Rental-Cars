import { Request, Response } from 'express';
import { Car } from './car.entity.js';
import { CarPostgresRepository } from './car.postgres.repository.js';

const carRepository = new CarPostgresRepository();

export class CarController {

    async findAllCars(_req: Request, res: Response) {
        try {
            const cars = await carRepository.findAll();
            res.json(cars);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server error retrieving cars' });
        }
    }

    async findCarById(req: Request, res: Response) {
        try {
            const carId = Number(req.params.id);
            
            if (isNaN(carId)) {
                res.status(400).json({ error: 'Invalid car ID' });
                return;
            }

            const car = await carRepository.findOne(carId);
            if (!car) {
                res.status(404).json({
                    errorMessage: 'Car not found',
                    errorCode: 'CAR_NOT_FOUND'
                });
                return;
            }
            res.json(car);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server error finding car' });
        }
    }

    async addCar(req: Request, res: Response) {
        try {
            const input = req.body.sanitizedInput; 
            
            const newCar = new Car(
                undefined,
                input.brand,
                input.model,
                input.year,
                input.color,
                input.price,
                true,
                input.imageUrl
            );

            const savedCar = await carRepository.add(newCar);

            res.status(201).json(savedCar);

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server error adding car' });
        }
    }

    async updateCar(req: Request, res: Response): Promise<void> {
        try {
            const carId = Number(req.params.id);
            
            if (isNaN(carId)) {
                res.status(400).json({ error: 'Invalid car ID' });
                return;
            }

            const existingCar = await carRepository.findOne(carId);
            if (!existingCar) {
                res.status(404).json({ error: 'Car not found for update' });
                return;
            }

            const input = req.body.sanitizedInput; 

            const updatedCar = new Car(
                carId,
                input.brand,
                input.model,
                input.year,
                input.color,
                input.price,
                existingCar.available, 
                input.imageUrl
            );

            const returnedCar = await carRepository.update(carId, updatedCar);

            res.status(200).json(returnedCar);

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server error updating car' });
        }
    }

    async partialUpdateCar(req: Request, res: Response): Promise<void> {
      try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            res.status(400).json({ error: 'Invalid car ID' });
            return;
        }

        const updates = req.body.sanitizedInput;

        if (!updates || Object.keys(updates).length === 0) {
          res.status(400).json({ error: 'No update data provided' });
          return;
        }

        const updated = await carRepository.partialUpdate(id, updates);

        if (!updated) {
          res.status(404).json({ error: 'Car not found or update failed' });
          return;
        }

        res.status(200).json(updated);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
      }
    }

    async deleteCar(req: Request, res: Response): Promise<void> {
        try {
            const id = Number(req.params.id);

            if (isNaN(id)) {
                res.status(400).json({ error: 'Invalid car ID' });
                return;
            }

            const deleted = await carRepository.delete(id);

            if (!deleted) {
                res.status(404).json({ error: 'Car not found' });
                return;
            }

            res.status(204).send(); 
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server error' });
        }
    }
}
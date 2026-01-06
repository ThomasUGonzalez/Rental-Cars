import { Car } from "./car.entity.js";

export interface CarRepository {
    findAll(): Promise<Car[] | undefined>;
    findOne(id: number): Promise<Car | undefined>;
    add(car: Car): Promise<Car | undefined>;
    update(id: number, car: Car): Promise<Car | undefined>;
    partialUpdate(id: number, updates: Partial<Car>): Promise<Car | undefined>;
    delete(id: number): Promise<Car | undefined>;
}
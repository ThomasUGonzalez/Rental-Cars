import { Rental } from './rental.entity';

export interface RentalRepository {
    findAll(): Promise<Rental[] | undefined>;
    findOne(id: number): Promise<Rental | undefined>;
    add(rental: Rental): Promise<Rental | undefined>;
    update(id: number, rental: Rental): Promise<Rental | undefined>;
    partialUpdate(id: number, updates: Partial<Rental>): Promise<Rental | undefined>;
    delete(id: number): Promise<Rental | undefined>;
}
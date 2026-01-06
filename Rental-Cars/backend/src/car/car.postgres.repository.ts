import { CarRepository } from "./car.repository.interface.js";
import { Car } from "./car.entity.js";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const {
    PG_USER,
    PG_HOST,
    PG_DATABASE,
    PG_PASSWORD,
    PG_PORT
} = process.env;

if (!PG_USER || !PG_HOST || !PG_DATABASE || !PG_PASSWORD || !PG_PORT) {
    throw new Error("Missing required PostgreSQL environment variables (PG_USER, PG_HOST, PG_DATABASE, PG_PASSWORD, PG_PORT)");
}

const pool = new Pool({
    user: PG_USER,
    host: PG_HOST,
    database: PG_DATABASE,
    password: PG_PASSWORD,
    port: parseInt(PG_PORT, 10)
});

export class CarPostgresRepository implements CarRepository {

    constructor() {}

    async findAll(): Promise<Car[] | undefined> {
        const res = await pool.query('SELECT * FROM cars');
        return res.rows.map(row => new Car(
            row.id,
            row.brand,
            row.model,
            row.year,
            row.color,
            normalizePrice(row.price),
            row.available,
            row.imageUrl
        ));
    }

    async findOne(id: number): Promise<Car | undefined> {
        const res = await pool.query('SELECT * FROM cars WHERE id = $1', [id]);
        if (res.rows.length === 0) {
            return undefined;
        }
        const row = res.rows[0];
        return new Car(
            row.id,
            row.brand,
            row.model,
            row.year,
            row.color,
            normalizePrice(row.price),
            row.available,
            row.imageUrl
        );
    }

    async add(car: Car): Promise<Car | undefined> {
        try {
            const res = await pool.query(
                'INSERT INTO cars (brand, model, year, color, price, available, "imageUrl") VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
                [car.brand, car.model, car.year, car.color, car.price, car.available, car.imageUrl]
            );
            const row = res.rows[0];
            return new Car(
                row.id,
                row.brand,
                row.model,
                row.year,
                row.color,
                normalizePrice(row.price),
                row.available,
                row.imageUrl
            );
        } catch (error) {
            console.error('Error adding car:', error);
            return undefined;
        }
    }

    async update(id: number, car: Car): Promise<Car | undefined> {
        try {
            const res = await pool.query(
                'UPDATE cars SET brand = $1, model = $2, year = $3, color = $4, price = $5, available = $6, "imageUrl" = $7 WHERE id = $8 RETURNING *',
                [car.brand, car.model, car.year, car.color, car.price, car.available, car.imageUrl, id]
            );
            if (res.rows.length === 0) return undefined;
            const row = res.rows[0];
            return new Car(
                row.id,
                row.brand,
                row.model,
                row.year,
                row.color,
                normalizePrice(row.price),
                row.available,
                row.imageUrl
            );
        } catch (error) {
            console.error('Error updating car:', error);
            return undefined;
        }
    }

    async partialUpdate(id: number, updates: Partial<Car>): Promise<Car | undefined> {
        try {
            const keys = Object.keys(updates);
            const values = Object.values(updates);
            const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
            const query = `UPDATE cars SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;

            const res = await pool.query(query, [...values, id]);
            if (res.rows.length === 0) return undefined;
            const row = res.rows[0];
            return new Car(
                row.id,
                row.brand,
                row.model,
                row.year,
                row.color,
                normalizePrice(row.price),
                row.available,
                row.imageUrl
            );
        } catch (error) {
            console.error('Error partially updating car:', error);
            return undefined;
        }
    }

    async delete(id: number): Promise<Car | undefined> { 
        try {
            const res = await pool.query('DELETE FROM cars WHERE id = $1 RETURNING *', [id]);
            if (res.rows.length === 0) return undefined;
            const row = res.rows[0];
            return new Car(
                row.id,
                row.brand,
                row.model,
                row.year,
                row.color,
                normalizePrice(row.price),
                row.available,
                row.imageUrl
            );
        } catch (error) {
            console.error('Error deleting car:', error);
            return undefined;
        }
    }
}

function normalizePrice(raw: any): number {
    const n = Number(raw);
    if (!isFinite(n) || isNaN(n)) return 0;
    return Math.round(n * 100) / 100;
}   
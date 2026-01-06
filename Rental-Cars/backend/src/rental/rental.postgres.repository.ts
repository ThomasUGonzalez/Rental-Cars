import { Rental } from "./rental.entity.js";
import { RentalRepository } from "./rental.repository.interface.js";
import { findUserById } from "../user/user.service.js";
import { Pool } from "pg";
import { Car } from "../car/car.entity.js";
import { formatDateToSQL, parseSQLDate } from "../utils/date.utils.js";
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

export class RentalPostgresRepository implements RentalRepository {
    public async checkAvailability(carId: number, startDate: Date, endDate: Date, excludeRentalId?: number): Promise<boolean> {
        const query = `
                SELECT 1
                FROM rentals
                WHERE carid = $1
                    AND (startdate, enddate) OVERLAPS ($2::date, $3::date)
                      AND ($4::integer IS NULL OR id != $4::integer)
                LIMIT 1;
        `;
        const params = [
            carId,
            formatDateToSQL(startDate),
            formatDateToSQL(endDate),
            excludeRentalId ?? null,
        ];
        
        try {
            const res = await pool.query(query, params);
            if (process.env.DEBUG_RENTAL_AVAIL !== '0') {
                console.log('checkAvailability debug', { query: query.replace(/\s+/g, ' '), params, rows: res.rows });
            }
            return res.rows.length === 0;
        } catch (error) {
            console.error('Error checking availability:', error);
            return false;
        }
    }

    constructor() {}

    async findAll(): Promise<Rental[] | undefined> {
        const res = await pool.query(`
            SELECT r.*, 
                json_build_object(
                    'id', c.id, 'brand', c.brand, 'model', c.model, 'year', c.year, 'color', c.color, 'price', c.price, 'available', c.available
                ) AS car
            FROM rentals r
            JOIN cars c ON r.carId = c.id
        `);
        const rentals = [];
        for (const row of res.rows) {
            const user = await findUserById(row.userid);
            if (user) {
                const carObj = row.car;
                const car = new Car(carObj.id, carObj.brand, carObj.model, carObj.year, carObj.color, parseFloat(carObj.price), carObj.available);
                const start = row.startdate ? parseSQLDate(row.startdate) : undefined;
                const end = row.enddate ? parseSQLDate(row.enddate) : undefined;
                const rental = new Rental(user, car, start as Date, end as Date, row.id, parseFloat(row.price));
                rentals.push(rental);
            }
        }
        return rentals.length ? rentals : undefined;
    }

    async findOne(id: number): Promise<Rental | undefined> {
        try {
            const rentalQuery = `
                SELECT 
                    r.*, 
                    json_build_object(
                        'id', c.id, 
                        'brand', c.brand, 
                        'model', c.model, 
                        'year', c.year, 
                        'color', c.color, 
                        'price', c.price, 
                        'available', c.available
                    ) AS car 
                FROM rentals r 
                JOIN cars c ON r.carId = c.id 
                WHERE r.id = $1
            `;
            const rentalResult = await pool.query(rentalQuery, [id]);
            if (rentalResult.rows.length === 0) {
                return undefined;
            }
            const row = rentalResult.rows[0];
            const user = await findUserById(row.userid);
            if (!user) {
                return undefined;
            }
            const carObj = row.car;
            const car = new Car(carObj.id, carObj.brand, carObj.model, carObj.year, carObj.color, parseFloat(carObj.price), carObj.available);
            const start = row.startdate ? parseSQLDate(row.startdate) : new Date();
            const end = row.enddate ? parseSQLDate(row.enddate) : new Date();

            return new Rental(user, car, start, end, row.id, parseFloat(row.price));
        } catch (error) {
            console.error('Error finding rental with user and car:', error);
            return undefined;
        }
    }

    async add(rental: Rental): Promise<Rental | undefined> {
        try {
            const rawPrice = Number(rental.price);
            const roundedPrice = Math.round(rawPrice * 100) / 100; // 2 decimales

            if (!isFinite(roundedPrice) || Math.abs(roundedPrice) >= 1e8) {
                console.error('Price out of bounds for NUMERIC(10,2):', { rawPrice, roundedPrice });
                return undefined;
            }

            await pool.query('BEGIN');
            try {
                const res = await pool.query(
                    'INSERT INTO rentals (userId, carId, startDate, endDate, price) VALUES ($1, $2, $3::date, $4::date, $5) RETURNING *',
                    [
                        rental.user.id,
                        rental.car.id,
                        formatDateToSQL(rental.startDate),
                        formatDateToSQL(rental.endDate),
                        roundedPrice,
                    ]
                );
                if (res.rows.length > 0) {
                    rental.id = res.rows[0].id;
                    await pool.query('UPDATE cars SET available = $1 WHERE id = $2', [false, rental.car.id]);
                }
                await pool.query('COMMIT');
                return rental;
            } catch (err) {
                await pool.query('ROLLBACK');
                console.error('Transaction error adding rental:', err);
                return undefined;
            }
        } catch (error) {
            console.error('Error adding rental:', error);
            return undefined;
        }
    }

    async update(id: number, rental: Rental): Promise<Rental | undefined> {
        try {
            const res = await pool.query(
                'UPDATE rentals SET userId = $1, carId = $2, startDate = $3::date, endDate = $4::date, price = $5 WHERE id = $6 RETURNING *',
                [
                    rental.user.id,
                    rental.car.id,
                    formatDateToSQL(rental.startDate),
                    formatDateToSQL(rental.endDate),
                    Math.round(Number(rental.price) * 100) / 100,
                    id,
                ]
            );
            if (res.rows.length === 0) {
                return undefined;
            }
            return this.findOne(id);
        } catch (error) {
            console.error('Error updating rental:', error);
            return undefined;
        }
    }

    async partialUpdate(id: number, updates: Partial<Rental>): Promise<Rental | undefined> {
        try {
         
            if ('status' in updates) {
                delete (updates as any).status;
            }

            if ('available' in updates) delete (updates as any).available;

            const working: Record<string, any> = {};
            for (const [k, v] of Object.entries(updates as Record<string, any>)) {
                if (k === 'user' && v && typeof v === 'object' && 'id' in v) {
                    working['userId'] = v.id;
                    continue;
                }
                if (k === 'car' && v && typeof v === 'object' && 'id' in v) {
                    working['carId'] = v.id;
                    continue;
                }

                if (k === 'userId' || k === 'carId' || k === 'startDate' || k === 'endDate' || k === 'price') {
                    working[k] = v;
                }
            }

            const allowed = ['userId', 'carId', 'startDate', 'endDate', 'price'];
            const filtered: Record<string, any> = {};
            for (const key of Object.keys(working)) {
                if (allowed.includes(key)) filtered[key] = working[key];
            }

            const keys = Object.keys(filtered);
            if (keys.length === 0) return this.findOne(id);

            const values = Object.values(filtered);
            const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
            const query = `UPDATE rentals SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;

            const normalizeValue = (key: string, val: any) => {
                if ((key === 'startDate' || key === 'endDate') && val) return formatDateToSQL(val);
                if (key === 'price' && val !== undefined) return Math.round(Number(val) * 100) / 100;
                return val;
            };

            const normalizedValues = keys.map((k, i) => normalizeValue(k, values[i]));

            const res = await pool.query(query, [...normalizedValues, id]);
            if (res.rows.length === 0) return undefined;

            return this.findOne(id);

        } catch (error) {
            console.error('Error partially updating rental:', error);
            return undefined;
        }
    }

    async delete(id: number): Promise<Rental | undefined> {
        try {
            await pool.query('BEGIN');
            try {
                const res = await pool.query('DELETE FROM rentals WHERE id = $1 RETURNING *', [id]);
                if (res.rows.length === 0) {
                    await pool.query('ROLLBACK');
                    return undefined;
                }
                const row = res.rows[0];
                const carId = (row.carid ?? row.carId ?? row.car_id) as number;
                if (carId) {
                    await pool.query('UPDATE cars SET available = $1 WHERE id = $2', [true, carId]);
                }
                await pool.query('COMMIT');
                return { id: row.id } as Rental;
            } catch (err) {
                await pool.query('ROLLBACK');
                console.error('Transaction error deleting rental:', err);
                return undefined;
            }
        } catch (error) {
            console.error('Error deleting rental:', error);
            return undefined;
        }
    }
}
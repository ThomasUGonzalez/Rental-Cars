/**
 * @swagger
 * components:
 *   schemas:
 *     Car:
 *       type: object
 *       required:
 *         - brand
 *         - model
 *         - price
 *         - year
 *         - color
 *       properties:
 *         id:
 *           type: integer
 *           description: ID autogenerado del auto
 *         brand:
 *           type: string
 *           description: Marca
 *         model:
 *           type: string
 *           description: Modelo
 *         year:
 *           type: integer
 *           description: Año del vehículo
 *         color:
 *           type: string
 *           description: Color
 *         price:
 *           type: number
 *           description: Precio por día
 *         available:
 *           type: boolean
 *           description: Disponibilidad
 *         imageUrl:
 *           type: string
 *           description: URL de la imagen
 *       example:
 *         id: 10
 *         brand: "Toyota"
 *         model: "Corolla"
 *         year: 2023
 *         color: "Blanco"
 *         price: 5000
 *         available: true
 *         imageUrl: "http://example.com/image.jpg"
 */

export class Car {

    constructor(
        public id: number | undefined,
        public brand: string,
        public model: string,
        public year: number,
        public color: string,
        public price: number,
        public available: boolean,
        public imageUrl?: string
    ) {}

    toJSON() {
        return {
            id: this.id,
            brand: this.brand,
            model: this.model,
            year: this.year,
            color: this.color,
            price: Math.round((this.price ?? 0) * 100) / 100,
            available: this.available,
            imageUrl: this.imageUrl
        };
    }

}
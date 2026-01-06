# 🚗 Gestor de Alquiler de Vehículos (Frontend)

Bienvenido al repositorio del frontend para el sistema de gestión de alquiler de vehículos. Esta aplicación permite a los usuarios explorar una flota de autos, registrarse y realizar reservas, mientras ofrece a los administradores herramientas para gestionar el inventario y los alquileres.

## 🛠️ Tecnologías Utilizadas

Este proyecto está construido con las últimas tecnologías web:

* **Framework:** [Angular 19](https://angular.io/)
* **Lenguaje:** TypeScript
* **Diseño y UI:**
    * [Angular Material](https://material.angular.io/) (Componentes visuales)
    * [Bootstrap 5](https://getbootstrap.com/) (Sistema de grillas y utilidades)
* **Gestión de Formularios:** Reactive Forms
* **Cliente HTTP:** Angular HttpClient con Interceptores

## 📋 Funcionalidades

### 👤 Usuarios Públicos y Registrados
* **Inicio:** Landing page de bienvenida.
* **Autenticación:** Login y Registro de nuevos usuarios.
* **Catálogo:** Visualización de autos disponibles con filtros por texto y disponibilidad.
* **Detalle:** Vista detallada del vehículo con fotos, características y cálculo de precio estimado.
* **Mis Alquileres:** Historial de las reservas realizadas por el usuario.

### 🛡️ Administradores
* **Gestión de Autos:** Crear, Editar y Eliminar vehículos del inventario.
* **Gestión de Alquileres:** Ver todos los alquileres del sistema, editar fechas o cancelar reservas.
* **Protección de Rutas:** Guards específicos para asegurar que solo los administradores accedan a las funciones de gestión.

## 🚀 Instalación y Ejecución

Asegúrate de tener instalado [Node.js](https://nodejs.org/) (versión LTS recomendada) y [Angular CLI](https://github.com/angular/angular-cli).

1.  **Clonar el repositorio:**
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd proyecto-dsw-rental-car-frontend
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar entorno:**
    Verifica el archivo `src/app/environments/environment.ts`. Por defecto, la aplicación espera que el backend corra en:
    ```typescript
    apiUrl: 'http://localhost:3000/api'
    ```

4.  **Ejecutar servidor de desarrollo:**
    ```bash
    npm run start
    ```
    La aplicación se abrirá automáticamente en `http://localhost:4200/`.

## 📂 Estructura del Proyecto

* `src/app/auth`: Guards e Interceptores para manejo de seguridad y tokens.
* `src/app/components`: Componentes principales (Login, Registro, Listados, Formularios).
* `src/app/shared`: Servicios (API calls) y Entidades (Modelos de datos).
* `src/app/environments`: Variables de configuración.

## 🤝 Contribución

1.  Haz un Fork del proyecto.
2.  Crea una rama para tu funcionalidad (`git checkout -b feature/nueva-funcionalidad`).
3.  Haz Commit de tus cambios (`git commit -m 'Agrega nueva funcionalidad'`).
4.  Haz Push a la rama (`git push origin feature/nueva-funcionalidad`).
5.  Abre un Pull Request.

---

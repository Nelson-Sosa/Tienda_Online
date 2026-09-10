# TiendaOnline

Sistema de gestión comercial para administrar tu tienda, productos, ventas e inventario.

## Stack

- **React 19** + **Vite 8**
- **Tailwind CSS v4**
- **Firebase** (Auth, Firestore, Hosting)
- **Cloudinary** (gestión de imágenes)
- **React Hook Form** + **Zod** (formularios)
- **React Router DOM v7**
- **Framer Motion** (animaciones)
- **Recharts** (gráficos)

## Módulos

| Módulo | Descripción |
|--------|-------------|
| Dashboard | Resumen de ventas, pedidos y métricas del negocio |
| Ventas | Punto de venta (POS) |
| Historial | Historial de transacciones |
| Pedidos | Gestión de pedidos con ciclo de vida completo |
| Clientes | Gestión de clientes |
| Gastos Operativos | Control de gastos del negocio |
| Productos | Gestión de productos con imágenes (Cloudinary) |
| Categorías | Organización de productos por categorías |
| Inventario | Control de stock |
| Catálogo Público | Vitrina pública de productos con WhatsApp |

## Inicio rápido

### 1. Clonar e instalar

```bash
npm install
```

### 2. Configurar variables de entorno

Copia `.env` y completa con tus credenciales:

```bash
# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=

# WhatsApp
VITE_WHATSAPP_NUMBER=
```

### 3. Iniciar en desarrollo

```bash
npm run dev
```

## Despliegue en Firebase Hosting

```bash
npx firebase-tools use YOUR_PROJECT_ID
npm run build
npx firebase-tools deploy --only hosting
```

## Arquitectura

Ver [`ARCHITECTURE.md`](./ARCHITECTURE.md) para las reglas del proyecto.

Ver [`docs/MOBILE_FIRST.md`](./docs/MOBILE_FIRST.md) para lineamientos de diseño responsive.

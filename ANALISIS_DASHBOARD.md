# ANÁLISIS: DASHBOARD FINAL - UNIFICAR CON PEDIDOS

## PASO A: ANÁLISIS DEL ESTADO ACTUAL

### 1. ESTADOS REALES EN EL CÓDIGO DE PEDIDOS

**Archivo**: `src/services/pedidoService.js` líneas 31-36

```javascript
export const PEDIDO_STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};
```

**Total: 4 estados**

### 2. TARJETAS EN PEDIDOS HOY

**Archivo**: `src/pages/admin/Pedidos.jsx` líneas 946-964

| Tarjeta | Nombre exacto | Estados que cuenta | Valor |
|---------|---------------|-------------------|-------|
| 1 | **"Pendientes"** | `pending` | `summary.pending` |
| 2 | **"En preparación"** | `in_progress` | `summary.inProgress` |
| 3 | **"Activos total"** | `pending` + `in_progress` | `summary.total` |

**Total: 3 tarjetas**

**Función de conteo**: `pedidoService.getPedidosSummary()` (líneas 447-458 de pedidoService.js)

```javascript
export async function getPedidosSummary() {
  const q = query(
    collection(db, PEDIDOS_COLLECTION),
    where("status", "in", [PEDIDO_STATUS.PENDING, PEDIDO_STATUS.IN_PROGRESS])
  );
  const snapshot = await getDocs(q);
  const active = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  return {
    pending: active.filter((p) => p.status === PEDIDO_STATUS.PENDING).length,
    inProgress: active.filter((p) => p.status === PEDIDO_STATUS.IN_PROGRESS).length,
    total: active.length,
  };
}
```

**NO hay tarjeta "Entregados" en Pedidos actualmente**.

### 3. TARJETAS EN DASHBOARD HOY

**Archivo**: `src/pages/admin/Dashboard.jsx` líneas 92-96

| Tarjeta | Nombre actual | Tipo | Valor |
|---------|---------------|------|-------|
| 1 | "Ventas del día" | currency | `m.ventas.dia` |
| 2 | "Ventas del mes" | currency | `m.ventas.mes` |
| 3 | "Prod. vendidos (mes)" | number | `m.inventario.productosVendidos` |
| 4 | "Stock bajo" | number | `m.inventario.stockBajo` |
| 5 | "Productos agotados" | number | `m.inventario.agotados` |

**Total: 5 tarjetas** (no alineadas con Pedidos)

### 4. SECCIÓN "ÚLTIMAS VENTAS" EN DASHBOARD

**Archivo**: `src/pages/admin/Dashboard.jsx` líneas 195-235

- Lee de `orders` collection (NO de `pedidos`)
- Muestra: fecha, productos, cliente, **método de pago**, total, estado
- Columnas: Fecha | Productos | Cliente | **Pago** | Total | Estado | Acciones

**Debe cambiar a "Pedidos recientes" leyendo de `pedidos`**

### 5. USO DE clearDashboardCache Y getPeriodDates

**clearDashboardCache**:
- Definido: `dashboardService.js` línea 20
- Usado por: `pedidoService.js` línea 367 (cuando se entrega un pedido)
- **SE QUEDA** (necesario para invalidar caché cuando cambian orders)

**getPeriodDates**:
- Definido: `dashboardService.js` línea 25
- Usado por: `dashboardService.js` línea 91 (solo internamente)
- **SE QUEDA** (usado internamente por getDashboardData)

---

## PLAN DE ACCIÓN

### OBJETIVO:
Dashboard y Pedidos deben mostrar los MISMOS nombres y MISMOS números para conceptos equivalentes.

### CAMBIOS NECESARIOS:

#### 1. FUENTE ÚNICA: Crear constantes compartidas

**Nuevo archivo**: `src/constants/pedidoStatus.js`

```javascript
import { Clock, Loader2, CheckCircle2, XCircle } from "lucide-react";

export const PEDIDO_STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

export const STATUS_CONFIG = {
  pending: {
    label: "Pendiente",
    plural: "Pendientes",
    color: "bg-amber-50 text-amber-700 ring-amber-200",
    icon: Clock,
  },
  in_progress: {
    label: "En preparación",
    plural: "En preparación",
    color: "bg-blue-50 text-blue-700 ring-blue-200",
    icon: Loader2,
  },
  delivered: {
    label: "Entregado",
    plural: "Entregados",
    color: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelado",
    plural: "Cancelados",
    color: "bg-red-50 text-red-600 ring-red-200",
    icon: XCircle,
  },
};
```

#### 2. DASHBOARD: Nuevas 4 tarjetas (sin montos)

| # | Nombre | Qué cuenta | Icono | Link |
|---|--------|------------|-------|------|
| 1 | **Pendientes** | `pending` | Clock | `/admin/pedidos?status=pending` |
| 2 | **En preparación** | `in_progress` | Loader2 | `/admin/pedidos?status=in_progress` |
| 3 | **Entregados** | `delivered` del mes actual (America/Asuncion) | CheckCircle2 | `/admin/pedidos?status=delivered` |
| 4 | **Stock bajo** | productos con `stock <= minimumStock` (incluye agotados) | AlertTriangle | `/admin/productos?filter=low_stock` |

**Subtítulo de Stock bajo**: "{agotados} agotados"

#### 3. PEDIDOS: Agregar tarjeta "Entregados"

Nueva tarjeta en Pedidos (total: 4 tarjetas):
- Pendientes (ya existe)
- En preparación (ya existe)
- **Entregados** (NUEVA - todos los delivered, sin filtro de fecha)
- Activos total (ya existe - SE QUEDA con su definición: pending + in_progress)

#### 4. "Pedidos recientes" en Dashboard

Cambiar de `orders` a `pedidos`:
- Título: "Pedidos recientes" (antes "Últimas ventas")
- Fuente: Colección `pedidos` (últimos 5 por `createdAt desc`)
- Columnas: Fecha | Cliente | Total | Estado | Acción
- **Eliminar columna "Pago"**
- Estado con color según STATUS_CONFIG
- Botón: lleva a `/admin/pedidos` (o al pedido específico si implementamos)

#### 5. Función de conteo actualizada

**pedidoService.js - actualizar getPedidosSummary()**:

```javascript
export async function getPedidosSummary() {
  // Activos (pending + in_progress)
  const activeQ = query(
    collection(db, PEDIDOS_COLLECTION),
    where("status", "in", [PEDIDO_STATUS.PENDING, PEDIDO_STATUS.IN_PROGRESS])
  );
  const activeSnapshot = await getDocs(activeQ);
  const active = activeSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  // Entregados (todos, sin filtro de fecha)
  const deliveredQ = query(
    collection(db, PEDIDOS_COLLECTION),
    where("status", "==", PEDIDO_STATUS.DELIVERED)
  );
  const deliveredSnapshot = await getDocs(deliveredQ);

  return {
    pending: active.filter((p) => p.status === PEDIDO_STATUS.PENDING).length,
    inProgress: active.filter((p) => p.status === PEDIDO_STATUS.IN_PROGRESS).length,
    total: active.length,
    delivered: deliveredSnapshot.docs.length, // NUEVO
  };
}
```

#### 6. Función para Dashboard

**Nueva función en dashboardService.js**:

```javascript
export async function getDashboardStats() {
  const pedidosData = await getPedidosSummary(); // reusa la existente
  
  // Stock bajo
  const productsSnapshot = await getDocs(collection(db, "products"));
  const allProducts = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const lowStock = allProducts.filter(p => p.stock <= (p.minimumStock || 5));
  const outOfStock = lowStock.filter(p => p.stock === 0);
  
  return {
    pedidos: {
      pending: pedidosData.pending,
      inProgress: pedidosData.inProgress,
      delivered: pedidosData.delivered,
    },
    stock: {
      low: lowStock.length,
      outOfStock: outOfStock.length,
    },
  };
}
```

---

## ARCHIVOS A MODIFICAR

1. **NUEVO**: `src/constants/pedidoStatus.js` - constantes compartidas
2. **src/services/pedidoService.js** - actualizar getPedidosSummary() para incluir `delivered`
3. **src/services/dashboardService.js** - nueva función getDashboardStats()
4. **src/pages/admin/Pedidos.jsx** - importar constantes, agregar tarjeta "Entregados"
5. **src/pages/admin/Dashboard.jsx** - reemplazar tarjetas y cambiar "Últimas ventas" a "Pedidos recientes"

---

## VERIFICACIONES ANTES DE EJECUTAR

- ✅ clearDashboardCache se queda (usado por pedidoService)
- ✅ getPeriodDates se queda (usado por dashboardService internamente)
- ✅ No crear estados nuevos (usar los 4 existentes)
- ✅ Nombres idénticos entre Dashboard y Pedidos

---

## ESTADOS FINALES

### Pedidos (4 tarjetas):
1. Pendientes (pending)
2. En preparación (in_progress)
3. **Entregados (delivered)** ← NUEVA
4. Activos total (pending + in_progress)

### Dashboard (4 tarjetas):
1. Pendientes (pending)
2. En preparación (in_progress)
3. Entregados (delivered del mes - misma query que Pedidos sin filtro temporal)
4. Stock bajo (con subtítulo de agotados)

**LISTO PARA APROBACIÓN**

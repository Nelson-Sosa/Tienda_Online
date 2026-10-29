import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const ORDERS_COLLECTION = "orders";
const PRODUCTS_COLLECTION = "products";

// Simple in-memory cache
let dashboardCache = null;
let cacheTimestamp = null;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export function clearDashboardCache() {
  dashboardCache = null;
  cacheTimestamp = null;
}

export function getPeriodDates(now = new Date()) {
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();
  const dayOfWeek = now.getDay();

  // Today
  const todayStart = new Date(y, m, d);
  const todayEnd = new Date(y, m, d, 23, 59, 59, 999);

  // Month
  const monthStart = new Date(y, m, 1);
  const monthEnd = new Date(y, m + 1, 0, 23, 59, 59, 999);

  // Week (Monday as first day)
  const diff = d - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const weekStart = new Date(y, m, diff);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return { todayStart, todayEnd, weekStart, weekEnd, monthStart, monthEnd };
}

async function fetchOrdersSince(since) {
  const q = query(
    collection(db, ORDERS_COLLECTION),
    where("createdAt", ">=", Timestamp.fromDate(since)),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function fetchAllProducts() {
  const snapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function fetchRecentOrders(limitCount = 10) {
  const q = query(
    collection(db, ORDERS_COLLECTION),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

function filterActive(orders) {
  return orders.filter((o) => (o.status || "completed") !== "cancelled");
}

function isDateInRange(timestamp, start, end) {
  if (!timestamp) return false;
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
}

export async function getDashboardData(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && dashboardCache && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION_MS)) {
    return dashboardCache;
  }

  const { todayStart, todayEnd, weekStart, weekEnd, monthStart, monthEnd } = getPeriodDates();
  
  // Calculate the earliest date to fetch
  const queryStart = new Date(Math.min(weekStart.getTime(), monthStart.getTime()));

  const [rawOrders, allProducts, recentOrders] = await Promise.all([
    fetchOrdersSince(queryStart),
    fetchAllProducts(),
    fetchRecentOrders(10),
  ]);

  const activeOrders = filterActive(rawOrders);

  // Orders splitting
  const ordersToday = [];
  const ordersWeek = [];
  const ordersMonth = [];

  for (const o of activeOrders) {
    if (isDateInRange(o.createdAt, todayStart, todayEnd)) ordersToday.push(o);
    if (isDateInRange(o.createdAt, weekStart, weekEnd)) ordersWeek.push(o);
    if (isDateInRange(o.createdAt, monthStart, monthEnd)) ordersMonth.push(o);
  }

  // Calculations
  const ventasDiaTotal = ordersToday.reduce((sum, o) => sum + (o.total || 0), 0);
  const ventasSemanaTotal = ordersWeek.reduce((sum, o) => sum + (o.total || 0), 0);
  const ventasMesTotal = ordersMonth.reduce((sum, o) => sum + (o.total || 0), 0);

  const productosVendidos = ordersMonth.reduce((sum, o) => {
    return sum + (o.items || []).reduce((s, item) => s + (item.quantity || 0), 0);
  }, 0);

  const stockBajo = allProducts.filter((p) => p.stock > 0 && p.stock <= (p.minimumStock || 5)).length;
  const agotados = allProducts.filter((p) => p.stock <= 0).length;

  const result = {
    metrics: {
      ventas: {
        dia: ventasDiaTotal,
        semana: ventasSemanaTotal,
        mes: ventasMesTotal,
      },
      inventario: {
        productosVendidos,
        stockBajo,
        agotados,
      },
    },
    recentOrders,
    allProducts,
  };

  dashboardCache = result;
  cacheTimestamp = now;

  return result;
}

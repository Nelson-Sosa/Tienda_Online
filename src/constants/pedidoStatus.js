import { Clock, Loader2, CheckCircle2, XCircle } from "lucide-react";

// ─────────────────────────────────────────────────────────────
// PEDIDO STATUS - Single source of truth
// Used by both Pedidos.jsx and Dashboard.jsx
// ─────────────────────────────────────────────────────────────

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

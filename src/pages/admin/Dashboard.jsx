import { useState, useEffect } from "react";
import {
  AlertTriangle,
  XCircle,
  Inbox,
  Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageContainer from "../../components/layout/PageContainer";
import StatCard from "../../components/ui/StatCard";
import SectionHeader from "../../components/ui/SectionHeader";
import EmptyState from "../../components/ui/EmptyState";
import { STATUS_CONFIG } from "../../constants/pedidoStatus";
import { formatCurrency } from "../../utils/formatCurrency";
import { getDashboardData } from "../../services/dashboardService";
import { getPedidosSummary } from "../../services/pedidoService";

function formatDate(ts) {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("es-PY", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function productsSummary(items) {
  if (!items || items.length === 0) return "Sin productos";
  const first = items[0].name;
  const rest = items.length - 1;
  return rest > 0 ? `${first} +${rest} más` : first;
}

function PaymentBadge({ method }) {
  if (method === "transfer") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-primary-light px-2 py-0.5 text-[10px] font-medium text-primary">
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        Transferencia
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      Efectivo
    </span>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${cfg.color}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Vista mobile de pedido — card apilada por fila
// ---------------------------------------------------------------------------
function PedidoCard({ pedido, onView }) {
  return (
    <div className="flex flex-col gap-2 xs:gap-3 rounded-xl border border-border bg-white p-3 xs:p-4 shadow-sm">
      {/* Fila 1: fecha + estado */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-gray-500">
          {formatDate(pedido.createdAt)}
        </span>
        <StatusBadge status={pedido.status} />
      </div>

      {/* Fila 2: productos */}
      <p className="truncate text-sm font-semibold text-gray-800">
        {productsSummary(pedido.items)}
      </p>

      {/* Fila 3: cliente */}
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xs text-gray-500">
          {pedido.clientName || "Cliente general"}
        </span>
      </div>

      {/* Fila 4: total + acción */}
      <div className="flex items-center justify-between border-t border-border pt-3">
        <span className="text-sm font-bold text-gray-800">
          {formatCurrency(pedido.total)}
        </span>
        <button
          onClick={onView}
          className="flex items-center gap-1.5 rounded-lg bg-primary-light px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-white"
          title="Ver en pedidos"
        >
          <Eye className="h-3.5 w-3.5" />
          Ver
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [inventoryData, setInventoryData] = useState(null);
  const [pedidosStats, setPedidosStats] = useState(null);
  const [recentPedidos, setRecentPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    
    Promise.all([
      getDashboardData(),
      getPedidosSummary(),
    ])
      .then(([dashData, pedSummary]) => {
        if (!cancelled) {
          setInventoryData(dashData?.metrics?.inventario || null);
          setPedidosStats(pedSummary);
          setRecentPedidos(dashData?.recentPedidos || []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setInventoryData(null);
          setPedidosStats(null);
          setRecentPedidos([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    
    return () => { cancelled = true; };
  }, []);

  const hasRecentPedidos = recentPedidos && recentPedidos.length > 0;

  return (
    <PageContainer title="Dashboard" description="Resumen general del negocio">

      {/* ------------------------------------------------------------------ */}
      {/* Stat cards: Pedidos + Stock                                         */}
      {/* Mobile: 2 columnas | Tablet: 3 columnas | Desktop: 4 columnas      */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Pendientes"
          icon={STATUS_CONFIG.pending.icon}
          accent="amber"
          kind="number"
          value={loading ? null : pedidosStats?.pending ?? 0}
        />
        <StatCard
          title="En preparación"
          icon={STATUS_CONFIG.in_progress.icon}
          accent="blue"
          kind="number"
          value={loading ? null : pedidosStats?.inProgress ?? 0}
        />
        <StatCard
          title="Entregados"
          icon={STATUS_CONFIG.delivered.icon}
          accent="emerald"
          kind="number"
          value={loading ? null : pedidosStats?.delivered ?? 0}
        />
        <StatCard
          title="Stock bajo"
          subtitle={
            loading || !inventoryData
              ? undefined
              : `${inventoryData.agotados || 0} agotados`
          }
          icon={AlertTriangle}
          accent="rose"
          kind="number"
          value={loading ? null : inventoryData?.stockBajo ?? 0}
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Pedidos recientes                                                   */}
      {/* ------------------------------------------------------------------ */}
      <div className="mt-6 sm:mt-8">
        <SectionHeader
          title="Pedidos recientes"
          description={
            hasRecentPedidos
              ? `${recentPedidos.length} pedidos recientes`
              : "Transacciones recientes"
          }
        />

        <div className="mt-4 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-border">
          {/* Skeleton de carga */}
          {loading ? (
            <div className="space-y-2 xs:space-y-3 p-3 xs:p-4 sm:p-5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100" />
              ))}
            </div>
          ) : !hasRecentPedidos ? (
            <EmptyState
              icon={Inbox}
              title="No existen ventas registradas"
              description="Las ventas aparecerán aquí cuando comiences a utilizar el sistema."
              action={null}
            />
          ) : (
            <>
              {/*
                MOBILE / TABLET (< lg): cards apiladas, una por venta.
                Evita el scroll horizontal y mejora la legibilidad táctil.
              */}
              <div className="flex flex-col divide-y divide-gray-100 p-2 xs:p-3 sm:p-4 lg:hidden">
                {data.recentOrders.map((order) => (
                  <div key={order.id} className="py-3 first:pt-0 last:pb-0">
                    <OrderCard
                      order={order}
                      onView={() => navigate("/admin/pedidos")}
                    />
                  </div>
                ))}
              </div>

              {/*
                DESKTOP (≥ lg): tabla completa con todas las columnas.
                Se mantiene idéntica a la versión original.
              */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-gray-50/50">
                      <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Fecha</th>
                      <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Productos</th>
                      <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Cliente</th>
                      <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Pago</th>
                      <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Total</th>
                      <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Estado</th>
                      <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.recentOrders.map((order) => (
                      <tr key={order.id} className="transition-colors hover:bg-gray-50/50">
                        <td className="whitespace-nowrap px-4 py-3 text-gray-700 text-xs">{formatDate(order.createdAt)}</td>
                        <td className="max-w-[160px] truncate px-4 py-3 text-gray-700 text-xs">{productsSummary(order.items)}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-500 text-xs">{order.clientName || "Cliente general"}</td>
                        <td className="whitespace-nowrap px-4 py-3"><PaymentBadge method={order.paymentMethod} /></td>
                        <td className="whitespace-nowrap px-4 py-3 font-semibold text-gray-800 text-xs">{formatCurrency(order.total)}</td>
                        <td className="whitespace-nowrap px-4 py-3"><StatusBadge status={order.status} /></td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <button
                            onClick={() => navigate("/admin/pedidos")}
                            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-primary-light hover:text-primary"
                            title="Ver en pedidos"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

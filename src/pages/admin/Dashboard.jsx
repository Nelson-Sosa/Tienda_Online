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
              {/* MOBILE / TABLET: cards apiladas */}
              <div className="flex flex-col divide-y divide-gray-100 p-2 xs:p-3 sm:p-4 lg:hidden">
                {recentPedidos.map((pedido) => (
                  <div key={pedido.id} className="py-3 first:pt-0 last:pb-0">
                    <PedidoCard
                      pedido={pedido}
                      onView={() => navigate("/admin/pedidos")}
                    />
                  </div>
                ))}
              </div>

              {/* DESKTOP: tabla */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full table-auto text-left text-sm">
                  <thead className="border-b border-gray-100 bg-gray-50/50">
                    <tr>
                      <th className="whitespace-nowrap px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Fecha</th>
                      <th className="whitespace-nowrap px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Cliente</th>
                      <th className="whitespace-nowrap px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Total</th>
                      <th className="whitespace-nowrap px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Estado</th>
                      <th className="whitespace-nowrap px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentPedidos.map((pedido) => (
                      <tr key={pedido.id} className="transition-colors hover:bg-gray-50/50">
                        <td className="whitespace-nowrap px-5 py-3 text-xs text-gray-600">
                          {formatDate(pedido.createdAt)}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-sm font-medium text-gray-800">
                          {pedido.clientName || "Cliente general"}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-sm font-semibold text-gray-900">
                          {formatCurrency(pedido.total)}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3">
                          <StatusBadge status={pedido.status} />
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-right">
                          <button
                            onClick={() => navigate("/admin/pedidos")}
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary-light"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Ver
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

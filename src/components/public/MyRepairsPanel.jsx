/**
 * MyRepairsPanel.jsx
 *
 * Panel desplegable en el header que muestra las solicitudes de
 * servicio técnico guardadas en localStorage del dispositivo.
 * No requiere login.
 */

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Wrench, X, ChevronRight, PlusCircle, Clock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getTechnicalServiceByCode } from "../../services/technicalService";
import { TECH_STATUS_CONFIG, DEVICE_CONFIG } from "../../constants/technicalService";

const LS_KEY = "tiendaonline_repairs";

function getRepairsFromStorage() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
}

function StatusDot({ status }) {
  const cfg = TECH_STATUS_CONFIG[status];
  if (!cfg) return null;
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${cfg.dotColor}`}
      title={cfg.label}
    />
  );
}

export default function MyRepairsPanel() {
  const [open, setOpen] = useState(false);
  const [repairs, setRepairs] = useState([]);
  const [statuses, setStatuses] = useState({}); // { trackingCode: status }
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);
  const navigate = useNavigate();

  // Cerrar al hacer click afuera
  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Cargar reparaciones del localStorage cuando abre
  useEffect(() => {
    if (!open) return;
    const stored = getRepairsFromStorage();
    setRepairs(stored);

    // Fetchear estado actual de cada reparación
    if (stored.length === 0) return;
    setLoading(true);
    Promise.all(
      stored.map((r) =>
        getTechnicalServiceByCode(r.trackingCode)
          .then((svc) => ({ code: r.trackingCode, status: svc?.status || null, exists: !!svc }))
          .catch(() => ({ code: r.trackingCode, status: null, exists: false }))
      )
    ).then((results) => {
      const map = {};
      const validRepairs = [];
      let storageChanged = false;

      results.forEach(({ code, status, exists }) => {
        if (exists) {
          map[code] = status;
          validRepairs.push(stored.find(r => r.trackingCode === code));
        } else {
          storageChanged = true; // Si fue borrada de la DB, la marcamos para eliminar del navegador
        }
      });
      
      setStatuses(map);
      
      // Si alguna solicitud ya no existe en la DB, limpiamos el localStorage
      if (storageChanged) {
        localStorage.setItem(LS_KEY, JSON.stringify(validRepairs));
        setRepairs(validRepairs);
      }
      
      setLoading(false);
    });
  }, [open]);

  const repairCount = getRepairsFromStorage().length;

  return (
    <div className="relative" ref={panelRef}>
      {/* Botón del header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors
          ${open
            ? "bg-primary-light text-primary ring-1 ring-primary/20"
            : "bg-gray-50 text-gray-600 hover:bg-primary-light/60 hover:text-primary"
          }`}
        title="Mis reparaciones"
        aria-label="Mis reparaciones"
      >
        <Wrench className="h-5 w-5" />
        {repairCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white ring-2 ring-white">
            {repairCount}
          </span>
        )}
      </button>

      {/* Panel desplegable */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed left-4 right-4 top-[70px] z-50 sm:absolute sm:left-auto sm:right-0 sm:top-12 sm:w-80 rounded-2xl border border-border bg-white shadow-xl ring-1 ring-black/5"
          >
            {/* Header del panel */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-primary" />
                <p className="text-sm font-bold text-gray-800">Mis reparaciones</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Contenido */}
            <div className="max-h-72 overflow-y-auto">
              {repairs.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light">
                    <Wrench className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      Sin solicitudes aún
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Tus reparaciones aparecerán aquí
                    </p>
                  </div>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {repairs.map((repair) => {
                    const deviceCfg = DEVICE_CONFIG[repair.deviceType];
                    const status = statuses[repair.trackingCode];
                    const statusCfg = status ? TECH_STATUS_CONFIG[status] : null;

                    return (
                      <li key={repair.trackingCode}>
                        <Link
                          to={`/servicio-tecnico/seguimiento/${repair.trackingCode}`}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <span className="text-2xl leading-none select-none">
                            {deviceCfg?.icon || "🔧"}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-primary">
                                {repair.trackingCode}
                              </p>
                              {loading ? (
                                <span className="h-1.5 w-1.5 rounded-full bg-gray-300 animate-pulse" />
                              ) : statusCfg ? (
                                <StatusDot status={status} />
                              ) : null}
                            </div>
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {repair.brand} {repair.model}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {loading
                                ? "Cargando estado..."
                                : statusCfg
                                ? statusCfg.label
                                : repair.serviceLabel}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Footer del panel */}
            <div className="border-t border-border p-3">
              <Link
                to="/servicio-tecnico"
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-hover active:scale-95"
              >
                <PlusCircle className="h-4 w-4" />
                Nueva solicitud
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

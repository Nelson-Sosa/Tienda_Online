import { CheckCircle2, Copy, ArrowRight, Store } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { DEVICE_CONFIG } from "../../../constants/technicalService";

const LS_KEY = "tiendaonline_repairs";

function saveRepairToLocalStorage(result, formData) {
  try {
    const existing = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
    const newEntry = {
      trackingCode: result.trackingCode,
      id: result.id,
      deviceType: formData.deviceType,
      brand: formData.brand,
      model: formData.model,
      serviceLabel: formData.serviceLabel,
      createdAt: new Date().toISOString(),
    };
    // Evitar duplicados
    const filtered = existing.filter((r) => r.trackingCode !== result.trackingCode);
    localStorage.setItem(LS_KEY, JSON.stringify([newEntry, ...filtered].slice(0, 10)));
  } catch (_) {}
}

export default function StepConfirmation({ result, formData }) {
  const [copied, setCopied] = useState(false);
  const deviceCfg = DEVICE_CONFIG[formData.deviceType];

  // Guardar en localStorage al montar la confirmación
  useEffect(() => {
    saveRepairToLocalStorage(result, formData);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.trackingCode);
      setCopied(true);
      toast.success("Código copiado");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("No se pudo copiar");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="max-w-lg mx-auto text-center"
    >
      {/* Icono de éxito */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10 sm:h-20 sm:w-20"
      >
        <CheckCircle2 className="h-9 w-9 text-success sm:h-11 sm:w-11" />
      </motion.div>

      <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">
        ¡Solicitud recibida!
      </h2>
      <p className="mt-1.5 text-sm text-gray-500">
        Registramos tu pedido correctamente.
      </p>

      {/* Tracking code */}
      <div className="mt-6 rounded-2xl border-2 border-primary/20 bg-primary-light p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary/70 mb-1">
          Tu código de seguimiento
        </p>
        <div className="flex items-center justify-center gap-3">
          <span className="text-3xl font-extrabold tracking-widest text-primary sm:text-4xl">
            {result.trackingCode}
          </span>
          <button
            onClick={handleCopy}
            title="Copiar código"
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all
              ${copied
                ? "border-success bg-success/10 text-success"
                : "border-primary/30 bg-white text-primary hover:bg-primary hover:text-white"
              }`}
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1.5 text-xs text-primary/60">
          Guardalo para consultar el estado de tu reparación
        </p>
      </div>

      {/* Resumen */}
      <div className="mt-5 rounded-xl border border-border bg-white p-4 text-left space-y-1.5">
        <div className="flex gap-2 text-sm">
          <span className="w-20 shrink-0 text-gray-400">Equipo</span>
          <span className="font-medium text-gray-700">
            {deviceCfg?.icon} {formData.brand} {formData.model}
          </span>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="w-20 shrink-0 text-gray-400">Servicio</span>
          <span className="font-medium text-gray-700">{formData.serviceLabel}</span>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="w-20 shrink-0 text-gray-400">Estado</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
            🟡 Pendiente de revisión
          </span>
        </div>
      </div>

      {/* Mensaje */}
      <p className="mt-4 text-sm text-gray-500 leading-relaxed">
        Te contactaremos por WhatsApp cuando revisemos tu equipo.
      </p>

      {/* CTA */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          to={`/servicio-tecnico/seguimiento/${result.trackingCode}`}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-hover active:scale-95"
        >
          <ArrowRight className="h-4 w-4" />
          Ver estado
        </Link>
        <Link
          to="/catalogo"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50 active:scale-95"
        >
          <Store className="h-4 w-4" />
          Volver a la tienda
        </Link>
      </div>
    </motion.div>
  );
}

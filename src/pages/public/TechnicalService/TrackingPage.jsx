import { useState } from "react";
import { Search, Loader2, ArrowRight } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getTechnicalServiceByCode } from "../../../services/technicalService";

export default function TrackingPage() {
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState(() => (searchParams.get("code") || "").toUpperCase());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError("Ingresá tu código de seguimiento");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const service = await getTechnicalServiceByCode(trimmed);
      if (!service) {
        setError("No encontramos una solicitud con ese código. Verificá que esté bien escrito.");
        return;
      }
      navigate(`/servicio-tecnico/seguimiento/${trimmed}`);
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error de conexión al buscar. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-4">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary-light mb-4">
          <Search className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">
          Consultar reparación
        </h2>
        <p className="mt-1.5 text-sm text-gray-500">
          Ingresá tu código de seguimiento para ver el estado de tu equipo
        </p>
      </div>

      <form onSubmit={handleSearch} noValidate>
        <div className="relative">
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError("");
            }}
            placeholder="Ej: ST-00482"
            maxLength={10}
            autoCapitalize="characters"
            className={`w-full rounded-xl border-2 bg-white px-5 py-4 text-center text-xl font-bold tracking-widest text-gray-800 uppercase placeholder-gray-300 outline-none transition-all
              focus:border-primary focus:ring-2 focus:ring-primary/20
              ${error ? "border-danger" : "border-border"}`}
          />
        </div>
        {error && (
          <div className="mt-2 text-center">
            <p className="text-sm text-danger">{error}</p>
            {error.includes("error de conexión") && (
              <button
                type="button"
                onClick={handleSearch}
                className="mt-1 text-xs font-semibold text-primary hover:underline"
              >
                Reintentar búsqueda
              </button>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-hover disabled:opacity-60 active:scale-95"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Buscando...
            </>
          ) : (
            <>
              <ArrowRight className="h-4 w-4" />
              Consultar estado
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-gray-400">
        El código lo recibiste al momento de registrar tu solicitud (Ej: ST-00482)
      </p>
    </div>
  );
}

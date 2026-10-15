import { Link, useNavigate } from "react-router-dom";
import { Store, ArrowLeft, HelpCircle } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      {/* Badge / Icon */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary-light text-primary shadow-sm ring-1 ring-primary/20">
        <HelpCircle className="h-10 w-10" />
      </div>

      <span className="mb-2 text-sm font-bold uppercase tracking-widest text-primary">
        Error 404
      </span>

      <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
        Página no encontrada
      </h1>

      <p className="mt-3 max-w-md text-sm text-gray-500 sm:text-base">
        La dirección a la que intentás acceder no existe, fue eliminada o cambió de ubicación.
      </p>

      {/* Acciones */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link
          to="/catalogo"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-hover active:scale-95"
        >
          <Store className="h-4 w-4" />
          Volver a la tienda
        </Link>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-white px-6 py-3.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
          Regresar a la página anterior
        </button>
      </div>
    </div>
  );
}

/**
 * BrandLogo — Componente centralizado del logo oficial de TiendaOnline.
 *
 * Responsabilidades:
 *  - Renderiza el logo oficial con proporciones correctas (object-fit: contain).
 *  - Envuelve el logo en un enlace accesible al inicio.
 *  - Aplica tamaños responsive mediante clamp() sin deformar la imagen.
 *  - Soporta variantes de tamaño: "sm", "md", "lg" y "auto".
 *  - Nunca modifica el diseño ni los colores del logo original.
 */

import { Link } from "react-router-dom";
import { BRAND } from "../../config/brand";

/**
 * @param {"sm"|"md"|"lg"|"sidebar-collapsed"|"none"} size
 *   sm  → auth pages, footer: ~120px
 *   md  → public header mobile: clamp(130px, 20vw, 170px)
 *   lg  → public header desktop: clamp(150px, 14vw, 200px)
 *   sidebar-collapsed → solo ícono cuadrado: 48px
 *   none → sin enlace (renderiza <img> directamente)
 * @param {string} className  Clases adicionales para el <img>
 * @param {boolean} noLink   Si true, no envuelve en <Link>
 * @param {string} to        Ruta del enlace (por defecto "/catalogo")
 */
export default function BrandLogo({
  size = "md",
  className = "",
  noLink = false,
  to = "/catalogo",
  dark = false,
}) {
  const sizeStyles = {
    sm:                "w-[clamp(120px,16vw,150px)] max-h-full",
    md:                "w-[clamp(130px,18vw,165px)] max-h-full",
    lg:                "w-[clamp(165px,15vw,195px)] max-h-[80px]",
    "sidebar-collapsed": "h-12 w-12 object-contain",
    none:              "w-[clamp(130px,18vw,165px)] max-h-full",
  };

  const img = (
    <img
      src={BRAND.logo}
      alt={`${BRAND.name} — Inicio`}
      width={200}
      height={80}
      className={[
        "object-contain shrink-0 select-none",
        "transition-opacity duration-200 hover:opacity-90",
        sizeStyles[size] ?? sizeStyles.md,
        dark ? "brightness-0 invert" : "",
        className,
      ].filter(Boolean).join(" ")}
      draggable={false}
    />
  );

  if (noLink) return img;

  return (
    <Link
      to={to}
      aria-label={`${BRAND.name} — Inicio`}
      className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
    >
      {img}
    </Link>
  );
}

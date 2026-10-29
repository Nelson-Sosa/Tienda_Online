import { Outlet, Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { LogIn, LogOut, ShoppingCart, Heart, Search, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";
import { useCategories } from "../../hooks/useCategories";
import WhatsappFloat from "./WhatsappFloat";
import CategoryNavigation from "./catalog/CategoryNavigation";
import MobileMenuDrawer from "./catalog/MobileMenuDrawer";
import MyRepairsPanel from "./MyRepairsPanel";
import BrandLogo from "../ui/BrandLogo";
import Footer from "./Footer";

export default function PublicLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, logout } = useAuth();
  const { categories } = useCategories();
  
  const [searchValue, setSearchValue] = useState(searchParams.get("q") || "");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isWishlistRoute = location.pathname.includes("/favoritos");
  const isCartRoute = location.pathname.includes("/carrito");
  // Determinar si estamos en la ruta exacta del catálogo para marcar la categoría seleccionada
  const isCatalogRoot = location.pathname === "/catalogo" || location.pathname === "/catalogo/";
  const currentCategory = isCatalogRoot ? (searchParams.get("category") || "all") : null;

  const handleLogout = async () => {
    await logout();
    navigate("/catalogo");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/catalogo?q=${encodeURIComponent(searchValue.trim())}`);
    } else {
      navigate(`/catalogo`);
    }
  };

  const handleSelectCategory = (cat) => {
    if (cat === "all") {
      navigate("/catalogo");
    } else {
      navigate(`/catalogo?category=${encodeURIComponent(cat)}`);
    }
  };

  // Extraer solo los nombres de las categorías activas (o todas)
  const categoryNames = categories.map(c => c.name).sort();

  // Obtener la inicial del usuario para el avatar
  const userInitial = user?.displayName
    ? user.displayName.charAt(0).toUpperCase()
    : user?.email
    ? user.email.charAt(0).toUpperCase()
    : "U";
  
  return (
    <div className="min-h-screen bg-background-secondary">
      <header className="sticky top-0 z-40 border-b border-border bg-white/80 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex h-16 sm:h-24 max-w-[1600px] items-center justify-between px-3 sm:px-6 lg:px-8">
          
          <div className="flex items-center gap-1 sm:gap-4">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="lg:hidden flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-700 transition-colors hover:bg-gray-100 sm:h-10 sm:w-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            </button>
            <BrandLogo size="sm" className="lg:hidden" />
            <BrandLogo size="lg" className="hidden lg:block" />
          </div>

          {/* Buscador central prominente (solo Desktop) */}
          <div className="hidden lg:flex flex-1 max-w-xl mx-8">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, descripción o categoría..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full rounded-xl border border-border bg-gray-50 py-2.5 pl-10 pr-4 text-[15px] text-gray-800 placeholder-gray-400 outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
              />
            </form>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Panel de Mis Reparaciones */}
            <MyRepairsPanel />

            <Link 
              to="/catalogo/favoritos"
              className={`relative flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full transition-colors cursor-pointer ${isWishlistRoute ? 'bg-red-50 text-danger ring-1 ring-danger/20' : 'bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-danger'}`}
            >
              <Heart className={`h-4 w-4 sm:h-5 sm:w-5 ${isWishlistRoute ? 'fill-danger/20' : ''}`} />
              <AnimatePresence>
                {wishlistCount > 0 && (
                  <motion.span 
                    key={wishlistCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white shadow-sm ring-2 ring-white"
                  >
                    {wishlistCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            <Link 
              to="/catalogo/carrito"
              className={`relative flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full transition-colors cursor-pointer ${isCartRoute ? 'bg-primary-light text-primary ring-1 ring-primary/20' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
            >
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span 
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-sm ring-2 ring-white"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
            
            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white shadow-sm">
                  {userInitial}
                </div>
                {user.role === "admin" && (
                  <Link
                    to="/admin/dashboard"
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm transition-all hover:border-primary hover:text-primary hover:shadow-md"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="hidden sm:inline">Panel</span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="hidden md:inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-border bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition-all hover:border-danger hover:text-danger hover:shadow-md"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Cerrar</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex shrink-0 items-center gap-1 sm:gap-1.5 rounded-xl border border-border bg-white px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-600 shadow-sm transition-all hover:border-primary hover:text-primary hover:shadow-md"
              >
                <LogIn className="h-4 w-4 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Entrar</span>
              </Link>
            )}
          </div>
        </div>

        {/* Buscador móvil (solo visible en pantallas pequeñas) */}
        <div className="mx-auto px-4 pb-3 sm:px-6 lg:hidden">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full rounded-xl border border-border bg-gray-50 py-2.5 pl-10 pr-4 text-[15px] text-gray-800 placeholder-gray-400 outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
            />
          </form>
        </div>
      </header>

      {/* Navegación de Categorías Horizontal */}
      <CategoryNavigation 
        categories={categoryNames} 
        selectedCategory={currentCategory} 
        onSelectCategory={handleSelectCategory}
      />

      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Outlet />
      </main>

      <WhatsappFloat />

      <Footer />

      <MobileMenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        categories={categoryNames}
        selectedCategory={currentCategory}
        onSelectCategory={handleSelectCategory}
      />
    </div>
  );
}

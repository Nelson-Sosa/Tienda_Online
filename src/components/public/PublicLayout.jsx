import { Outlet, Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { LogIn, LogOut, ShoppingCart, Heart, Search, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
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
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const isWishlistRoute = location.pathname.includes("/favoritos");
  const isCartRoute = location.pathname.includes("/carrito");
  // Determinar si estamos en la ruta exacta del catálogo para marcar la categoría seleccionada
  const isCatalogRoot = location.pathname === "/catalogo" || location.pathname === "/catalogo/";
  const currentCategory = isCatalogRoot ? (searchParams.get("category") || "all") : null;

  // Cerrar menú de usuario al hacer click fuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    }
    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isUserMenuOpen]);

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
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
        <div className="mx-auto flex h-14 md:h-16 lg:h-20 max-w-[1600px] items-center justify-between px-3 md:px-6 lg:px-8">
          
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="lg:hidden flex h-8 w-8 md:h-9 md:w-9 shrink-0 items-center justify-center rounded-xl text-gray-700 transition-colors hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
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

          <div className="flex items-center gap-1 md:gap-2">
            {/* Panel de Mis Reparaciones - oculto en móvil */}
            <div className="hidden md:flex">
              <MyRepairsPanel />
            </div>

            <Link 
              to="/catalogo/favoritos"
              className={`relative flex h-8 w-8 md:h-9 md:w-9 shrink-0 items-center justify-center rounded-full transition-colors cursor-pointer ${isWishlistRoute ? 'bg-red-50 text-danger ring-1 ring-danger/20' : 'bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-danger'}`}
            >
              <Heart className={`h-4 w-4 ${isWishlistRoute ? 'fill-danger/20' : ''}`} />
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
              className={`relative flex h-8 w-8 md:h-9 md:w-9 shrink-0 items-center justify-center rounded-full transition-colors cursor-pointer ${isCartRoute ? 'bg-primary-light text-primary ring-1 ring-primary/20' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
            >
              <ShoppingCart className="h-4 w-4" />
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
              <div className="relative flex items-center gap-2" ref={userMenuRef}>
                {/* Avatar con menú desplegable en móvil, botones visibles en desktop */}
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex h-8 w-8 md:hidden shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white shadow-sm"
                >
                  {userInitial}
                </button>

                {/* Desktop: avatar + botones visibles */}
                <div className="hidden md:flex items-center gap-2">
                  <div className="flex h-9 w-9 lg:h-10 lg:w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white shadow-sm">
                    {userInitial}
                  </div>
                  {user.role === "admin" && (
                    <Link
                      to="/admin/dashboard"
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm transition-all hover:border-primary hover:text-primary hover:shadow-md"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span className="hidden lg:inline">Panel</span>
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-border bg-white px-3 lg:px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition-all hover:border-danger hover:text-danger hover:shadow-md"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden lg:inline">Cerrar</span>
                  </button>
                </div>

                {/* Menú desplegable móvil */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-10 z-50 w-56 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-border md:hidden">
                    <div className="p-2">
                      {user.role === "admin" && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-primary-light hover:text-primary"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Panel de administración
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-danger transition-colors hover:bg-danger/10"
                      >
                        <LogOut className="h-4 w-4" />
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex shrink-0 items-center gap-1 md:gap-1.5 rounded-xl border border-border bg-white px-2.5 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-gray-600 shadow-sm transition-all hover:border-primary hover:text-primary hover:shadow-md"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Entrar</span>
              </Link>
            )}
          </div>
        </div>

        {/* Buscador móvil (solo visible en pantallas pequeñas) */}
        <div className="mx-auto px-3 pb-3 md:px-6 lg:hidden">
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

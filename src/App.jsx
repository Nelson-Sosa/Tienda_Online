import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import AdminRoute from "./routes/AdminRoute";
import ScrollToTop from "./components/ScrollToTop";

const AdminLayout = lazy(() => import("./components/layout/AdminLayout"));
const PublicLayout = lazy(() => import("./components/public/PublicLayout"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const Products = lazy(() => import("./pages/admin/Products"));
const ProductDetail = lazy(() => import("./pages/admin/ProductDetail"));
const Categories = lazy(() => import("./pages/admin/Categories"));

const Clients = lazy(() => import("./pages/admin/Clients"));
const ClientDetail = lazy(() => import("./pages/admin/ClientDetail"));
const Pedidos = lazy(() => import("./pages/admin/Pedidos"));
const Catalog = lazy(() => import("./pages/public/Catalog"));
const ProductPublicDetail = lazy(() => import("./pages/public/ProductPublicDetail"));
const CartPublic = lazy(() => import("./pages/public/CartPublic"));
const Wishlist = lazy(() => import("./pages/public/Wishlist"));
const TechnicalServices = lazy(() => import("./pages/admin/TechnicalServices"));
const TechnicalServiceDetail = lazy(() => import("./pages/admin/TechnicalServiceDetail"));
const TechnicalServiceWizard = lazy(() => import("./pages/public/TechnicalService"));
const TrackingPage = lazy(() => import("./pages/public/TechnicalService/TrackingPage"));
const TrackingDetail = lazy(() => import("./pages/public/TechnicalService/TrackingDetail"));
const NotFound = lazy(() => import("./pages/public/NotFound"));

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <Toaster position="top-right" />
            <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Navigate to="/catalogo" replace />} />

            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="productos" element={<Products />} />
              <Route path="productos/:id" element={<ProductDetail />} />
              <Route path="categorias" element={<Categories />} />
              <Route path="ventas" element={<Navigate to="/admin/pedidos" replace />} />
              <Route path="historial" element={<Navigate to="/admin/pedidos" replace />} />
              <Route path="clientes" element={<Clients />} />
              <Route path="clientes/:id" element={<ClientDetail />} />
              <Route path="pedidos" element={<Pedidos />} />
              <Route path="servicio-tecnico" element={<TechnicalServices />} />
              <Route path="servicio-tecnico/:id" element={<TechnicalServiceDetail />} />
            </Route>

            <Route path="/catalogo" element={<PublicLayout />}>
              <Route index element={<Catalog />} />
              <Route path="carrito" element={<CartPublic />} />
              <Route path="favoritos" element={<Wishlist />} />
              <Route path=":id" element={<ProductPublicDetail />} />
            </Route>

            <Route path="/servicio-tecnico" element={<PublicLayout />}>
              <Route index element={<TechnicalServiceWizard />} />
              <Route path="seguimiento" element={<TrackingPage />} />
              <Route path="seguimiento/:code" element={<TrackingDetail />} />
            </Route>

            <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/dashboard/*" element={<Navigate to="/admin/dashboard" replace />} />

            {/* Página 404 para cualquier ruta inexistente */}
            <Route element={<PublicLayout />}>
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
            </Suspense>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

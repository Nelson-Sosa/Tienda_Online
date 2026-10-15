import { collection, getDocs, query, orderBy, doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const PRODUCTS_COLLECTION = "products";
const CATEGORIES_COLLECTION = "categories";

/**
 * Transforma un documento de Firestore a una representación pública autorizada.
 * Utiliza una whitelist estricta con los atributos necesarios para el catálogo,
 * detalle, búsqueda, filtrado y carrito.
 * Excluye rigurosamente `purchasePrice` y metadatos administrativos internos.
 */
function toPublicProduct(id, data, categoryName) {
  if (!data) return null;
  return {
    id,
    name: data.name || "",
    description: data.description || "",
    salePrice: Number(data.salePrice) || 0,
    originalPrice: data.originalPrice != null ? Number(data.originalPrice) : null,
    images: Array.isArray(data.images) ? data.images : [],
    categoryId: data.categoryId || "",
    categoryName: categoryName || "Sin categoría",
    sku: data.sku || "",
    stock: Number(data.stock) || 0,
    brand: data.brand || "",
    status: data.status || "active",
    specifications: Array.isArray(data.specifications) ? data.specifications : [],
    attributes: Array.isArray(data.attributes) ? data.attributes : [],
    createdAt: data.createdAt || null,
  };
}

export async function getActiveProducts() {
  const q = query(
    collection(db, PRODUCTS_COLLECTION),
    orderBy("name", "asc")
  );
  const snapshot = await getDocs(q);

  const catSnap = await getDocs(collection(db, CATEGORIES_COLLECTION));
  const catMap = Object.fromEntries(
    catSnap.docs.map((d) => [d.id, d.data().name])
  );

  return snapshot.docs
    .map((docSnap) => {
      const data = docSnap.data();
      const categoryName = catMap[data.categoryId] || "Sin categoría";
      return toPublicProduct(docSnap.id, data, categoryName);
    })
    .filter((p) => p && p.status === "active");
}

export function subscribeToActiveProducts(onData, onError) {
  const q = query(
    collection(db, PRODUCTS_COLLECTION),
    orderBy("name", "asc")
  );

  return onSnapshot(
    q,
    async (snapshot) => {
      try {
        const catSnap = await getDocs(collection(db, CATEGORIES_COLLECTION));
        const catMap = Object.fromEntries(
          catSnap.docs.map((d) => [d.id, d.data().name])
        );

        const products = snapshot.docs
          .map((docSnap) => {
            const data = docSnap.data();
            const categoryName = catMap[data.categoryId] || "Sin categoría";
            return toPublicProduct(docSnap.id, data, categoryName);
          })
          .filter((p) => p && p.status === "active");

        onData(products);
      } catch (err) {
        if (onError) onError(err);
      }
    },
    (err) => {
      if (onError) onError(err);
    }
  );
}

export async function getActiveProductById(id) {
  const snap = await getDoc(doc(db, PRODUCTS_COLLECTION, id));
  if (!snap.exists()) return null;
  const rawData = snap.data();
  if (rawData.status !== "active") return null;

  let categoryName = "Sin categoría";
  if (rawData.categoryId) {
    const catSnap = await getDoc(doc(db, CATEGORIES_COLLECTION, rawData.categoryId));
    if (catSnap.exists()) categoryName = catSnap.data().name;
  }

  return toPublicProduct(snap.id, rawData, categoryName);
}

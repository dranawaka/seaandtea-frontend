// Single source of truth for shop products. Uses backend API when available; falls back to localStorage.

import { getProductsApi, getProductByIdApi, listProductsApi } from '../config/api';

const STORAGE_KEY = 'seaandtea_shop_products';

/** Map backend product DTO to frontend shape. Supports list (imageUrls) and detail (images) response. */
export function mapProductFromApi(apiProduct) {
  if (!apiProduct) return null;
  const id = apiProduct.id != null ? Number(apiProduct.id) : null;
  const title = apiProduct.title || apiProduct.name || '';
  const imageUrls = apiProduct.imageUrls || (apiProduct.images && apiProduct.images.length
    ? apiProduct.images.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)).map(img => img.imageUrl)
    : []);
  const image = apiProduct.image || apiProduct.imageUrl || (imageUrls[0]) || apiProduct.primaryImageUrl || '';
  const currentPrice = Number(apiProduct.currentPrice) ?? Number(apiProduct.price) ?? 0;
  const originalPrice = apiProduct.originalPrice != null ? Number(apiProduct.originalPrice) : null;
  const reviewCount = apiProduct.reviewCount != null ? Number(apiProduct.reviewCount) : (apiProduct.reviews != null ? Number(apiProduct.reviews) : 0);
  const isBestSeller = apiProduct.isBestSeller === true;
  return {
    id,
    title,
    category: apiProduct.category || 'tea',
    price: currentPrice,
    originalPrice,
    discountPercentage: apiProduct.discountPercentage != null ? Number(apiProduct.discountPercentage) : null,
    rating: apiProduct.rating != null ? Number(apiProduct.rating) : 0,
    reviews: reviewCount,
    image,
    imageUrls: imageUrls.length ? imageUrls : (image ? [image] : []),
    description: apiProduct.description || '',
    inStock: apiProduct.isActive !== false && apiProduct.inStock !== false,
    badge: apiProduct.badge || (isBestSeller ? 'Best Seller' : null),
    isBestSeller,
    productType: apiProduct.productType || null
  };
}

/** Map frontend product to backend create/update payload (API: name, currentPrice, imageUrls, primaryImageIndex, etc.) */
export function mapProductToApi(product) {
  const imageUrls = product.imageUrls || (product.image ? [product.image] : []);
  return {
    name: (product.title || product.name || '').trim(),
    description: product.description != null ? String(product.description).slice(0, 2000) : '',
    imageUrls: imageUrls.filter(u => (u || '').trim().length > 0).slice(0, 10),
    primaryImageIndex: 0,
    currentPrice: Number(product.currentPrice ?? product.price) || 0,
    originalPrice: product.originalPrice != null ? Number(product.originalPrice) : null,
    category: (product.category || 'tea').toLowerCase(),
    rating: product.rating != null ? Number(product.rating) : 0,
    reviewCount: product.reviewCount != null ? Number(product.reviewCount) : (product.reviews != null ? Number(product.reviews) : 0),
    isBestSeller: product.isBestSeller === true || (product.badge || '').toLowerCase().includes('best seller'),
    isActive: product.isActive !== false
  };
}

export function getProducts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('shopProducts: failed to read localStorage', e);
  }
  return [];
}

export function saveProducts(products) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (e) {
    console.warn('shopProducts: failed to write localStorage', e);
  }
}

export function getProductById(id) {
  const idNum = typeof id === 'string' ? parseInt(id, 10) : id;
  return getProducts().find(p => p.id === idNum);
}

/** Fetch all products from backend API (first page, up to 100); returns mapped array. Throws on failure. */
export async function fetchProductsFromApi() {
  const raw = await getProductsApi();
  const list = Array.isArray(raw) ? raw : (raw?.content ?? raw?.items ?? []);
  return list.map(mapProductFromApi).filter(Boolean);
}

/** Fetch products with filters and pagination; returns { content, totalPages, totalElements, ... } with content mapped. */
export async function fetchProductsPaginatedFromApi(params = {}) {
  const apiParams = { ...params };
  if (apiParams.sort == null && (apiParams.sortBy != null || apiParams.sortDirection != null)) {
    apiParams.sort = `${apiParams.sortBy ?? 'createdAt'},${apiParams.sortDirection ?? 'desc'}`;
  }
  const data = await listProductsApi(apiParams);
  const content = Array.isArray(data.content) ? data.content : [];
  return {
    ...data,
    content: content.map(mapProductFromApi).filter(Boolean)
  };
}

/** Fetch single product from backend by id; returns mapped product or null. */
export async function fetchProductByIdFromApi(id) {
  const idNum = typeof id === 'string' ? parseInt(id, 10) : id;
  const raw = await getProductByIdApi(idNum);
  return raw ? mapProductFromApi(raw) : null;
}

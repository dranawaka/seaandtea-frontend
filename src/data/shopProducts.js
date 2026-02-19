// Single source of truth for shop products. Admin edits persist in localStorage.

const STORAGE_KEY = 'seaandtea_shop_products';

export const INITIAL_PRODUCTS = [
  { id: 1, title: 'Ella High Grown Ceylon Tea', category: 'tea', price: 18, originalPrice: 25, rating: 4.9, reviews: 234, image: 'https://images.unsplash.com/photo-1597318985999-dd64bcc84baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', description: 'Premium high-grown Ceylon tea from the misty hills of Ella (100g)', inStock: true, badge: 'Best Seller', productType: 'Tea Packet' },
  { id: 2, title: 'Nuwara Eliya Orange Pekoe', category: 'tea', price: 22, originalPrice: 30, rating: 4.8, reviews: 189, image: 'https://images.unsplash.com/photo-1594736797933-d0401ba890fe?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', description: "Exquisite Orange Pekoe from Little England's finest estates (100g)", inStock: true, badge: 'Premium', productType: 'Tea Packet' },
  { id: 3, title: 'Dimbula Black Tea Collection', category: 'tea', price: 28, originalPrice: 35, rating: 4.9, reviews: 156, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', description: 'Rich black tea blend from Dimbula region, perfect for morning brew (150g)', inStock: true, badge: 'Limited Edition', productType: 'Tea Packet' },
  { id: 4, title: 'Ceylon Green Tea Organic', category: 'tea', price: 20, originalPrice: 28, rating: 4.7, reviews: 98, image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', description: 'Organic green tea from Sri Lankan highlands, antioxidant rich (100g)', inStock: true, badge: 'Organic', productType: 'Tea Packet' },
  { id: 5, title: 'Handwoven Sea Grass Beach Bag', category: 'sea', price: 35, originalPrice: 45, rating: 4.8, reviews: 142, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', description: 'Eco-friendly beach bag made from natural sea grass by local artisans', inStock: true, badge: 'Eco-Friendly', productType: 'Beach Ware' },
  { id: 6, title: 'Coral Reef Ceramic Bowl Set', category: 'sea', price: 65, originalPrice: 85, rating: 4.9, reviews: 89, image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', description: 'Hand-painted ceramic bowls featuring Sri Lankan coral reef patterns', inStock: true, badge: 'Handmade', productType: 'Sea Craft' },
  { id: 7, title: 'Sea Shell Wind Chime', category: 'sea', price: 28, originalPrice: 35, rating: 4.7, reviews: 156, image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', description: 'Beautiful wind chime made from authentic Sri Lankan sea shells', inStock: true, badge: 'Natural', productType: 'Sea Craft' },
  { id: 8, title: 'Beach Sarong Collection', category: 'sea', price: 22, originalPrice: 30, rating: 4.6, reviews: 203, image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', description: 'Lightweight sarongs perfect for beach days, handwoven with ocean motifs', inStock: true, badge: 'Best Seller', productType: 'Beach Ware' },
  { id: 9, title: 'Sri Lankan Spice Kit', category: 'spices', price: 35, originalPrice: 45, rating: 4.8, reviews: 189, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', description: 'Authentic spice collection for authentic Sri Lankan cooking', inStock: true, badge: 'New' },
  { id: 10, title: 'Handwoven Sarong Set', category: 'clothing', price: 25, originalPrice: 35, rating: 4.7, reviews: 156, image: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', description: 'Traditional handwoven sarongs in vibrant colors', inStock: true, badge: null },
  { id: 11, title: 'Wooden Elephant Carving', category: 'souvenirs', price: 85, originalPrice: 120, rating: 4.9, reviews: 98, image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', description: 'Hand-carved wooden elephant from local artisans', inStock: false, badge: 'Limited' },
  { id: 12, title: 'Coconut Oil Beauty Set', category: 'beauty', price: 28, originalPrice: 40, rating: 4.6, reviews: 143, image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', description: 'Pure coconut oil products for hair and skin care', inStock: true, badge: 'Eco-Friendly' },
  { id: 13, title: 'Sri Lankan Coffee Beans', category: 'beverages', price: 22, originalPrice: 30, rating: 4.5, reviews: 267, image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', description: 'Premium coffee beans from the hill country', inStock: true, badge: null }
];

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
  return [...INITIAL_PRODUCTS];
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

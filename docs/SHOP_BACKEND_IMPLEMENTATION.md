# Shop Feature Backend Implementation Guide

## Overview
This document outlines the backend implementation requirements for the Sea & Tea Tours shop feature. The shop allows users to browse, search, and purchase authentic Sri Lankan products including premium tea, sea crafts, and local souvenirs.

## Database Schema

### 1. Products Table
```sql
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category ENUM('tea', 'sea', 'spices', 'clothing', 'souvenirs', 'beauty', 'beverages') NOT NULL,
    product_type VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    stock_quantity INT DEFAULT 0,
    in_stock BOOLEAN DEFAULT TRUE,
    badge VARCHAR(50),
    rating DECIMAL(3,2) DEFAULT 0.00,
    review_count INT DEFAULT 0,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);
```

### 2. Product Categories Table
```sql
CREATE TABLE product_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    image_url VARCHAR(500),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Shopping Cart Table
```sql
CREATE TABLE shopping_carts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    session_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 4. Cart Items Table
```sql
CREATE TABLE cart_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cart_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price_at_time DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES shopping_carts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_cart_product (cart_id, product_id)
);
```

### 5. Orders Table
```sql
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INT,
    guest_email VARCHAR(255),
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    subtotal DECIMAL(10,2) NOT NULL,
    shipping_cost DECIMAL(10,2) DEFAULT 0.00,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_address JSON,
    billing_address JSON,
    payment_method VARCHAR(50),
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

### 6. Order Items Table
```sql
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price_at_time DECIMAL(10,2) NOT NULL,
    product_title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

### 7. Product Reviews Table
```sql
CREATE TABLE product_reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    user_id INT,
    guest_name VARCHAR(100),
    guest_email VARCHAR(255),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    review_text TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

### 8. Wishlist Table
```sql
CREATE TABLE wishlists (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product (user_id, product_id)
);
```

## API Endpoints

### Product Management

#### 1. Get All Products
```
GET /api/products
Query Parameters:
- page (optional): Page number for pagination
- limit (optional): Items per page (default: 12)
- category (optional): Filter by category
- search (optional): Search term
- sort (optional): Sort by price, rating, date (asc/desc)
- min_price (optional): Minimum price filter
- max_price (optional): Maximum price filter
- in_stock (optional): Filter by stock availability

Response:
{
  "success": true,
  "data": {
    "products": [...],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 50,
      "items_per_page": 12
    },
    "filters": {
      "categories": [...],
      "price_range": {"min": 10, "max": 100}
    }
  }
}
```

#### 2. Get Single Product
```
GET /api/products/:id

Response:
{
  "success": true,
  "data": {
    "product": {
      "id": 1,
      "title": "Ella High Grown Ceylon Tea",
      "description": "...",
      "category": "tea",
      "price": 18.00,
      "original_price": 25.00,
      "stock_quantity": 50,
      "in_stock": true,
      "rating": 4.9,
      "review_count": 234,
      "image_url": "...",
      "reviews": [...],
      "related_products": [...]
    }
  }
}
```

#### 3. Get Product Categories
```
GET /api/products/categories

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Premium Tea",
      "slug": "tea",
      "is_featured": true,
      "product_count": 4
    }
  ]
}
```

### Shopping Cart Management

#### 4. Get User Cart
```
GET /api/cart
Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "cart_id": 1,
    "items": [
      {
        "id": 1,
        "product": {...},
        "quantity": 2,
        "price_at_time": 18.00
      }
    ],
    "subtotal": 36.00,
    "item_count": 2
  }
}
```

#### 5. Add Item to Cart
```
POST /api/cart/items
Headers: Authorization: Bearer <token>
Body:
{
  "product_id": 1,
  "quantity": 1
}

Response:
{
  "success": true,
  "message": "Item added to cart",
  "data": {
    "cart_item": {...},
    "cart_summary": {...}
  }
}
```

#### 6. Update Cart Item Quantity
```
PUT /api/cart/items/:item_id
Headers: Authorization: Bearer <token>
Body:
{
  "quantity": 3
}

Response:
{
  "success": true,
  "message": "Cart item updated",
  "data": {...}
}
```

#### 7. Remove Item from Cart
```
DELETE /api/cart/items/:item_id
Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Item removed from cart"
}
```

#### 8. Clear Cart
```
DELETE /api/cart
Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Cart cleared"
}
```

### Order Management

#### 9. Create Order
```
POST /api/orders
Headers: Authorization: Bearer <token>
Body:
{
  "shipping_address": {
    "first_name": "John",
    "last_name": "Doe",
    "address_line_1": "123 Main St",
    "city": "Colombo",
    "postal_code": "00100",
    "country": "Sri Lanka"
  },
  "billing_address": {...},
  "payment_method": "credit_card",
  "notes": "Please handle with care"
}

Response:
{
  "success": true,
  "data": {
    "order": {
      "id": 1,
      "order_number": "ORD-2024-001",
      "status": "pending",
      "total_amount": 85.50,
      "items": [...]
    },
    "payment_url": "https://payment-gateway.com/..."
  }
}
```

#### 10. Get User Orders
```
GET /api/orders
Headers: Authorization: Bearer <token>
Query Parameters:
- page, limit, status (optional)

Response:
{
  "success": true,
  "data": {
    "orders": [...],
    "pagination": {...}
  }
}
```

#### 11. Get Single Order
```
GET /api/orders/:id
Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "order": {...}
  }
}
```

### Reviews and Wishlist

#### 12. Add Product Review
```
POST /api/products/:id/reviews
Headers: Authorization: Bearer <token>
Body:
{
  "rating": 5,
  "title": "Excellent tea!",
  "review_text": "Amazing quality and taste..."
}

Response:
{
  "success": true,
  "message": "Review submitted for approval",
  "data": {...}
}
```

#### 13. Get Product Reviews
```
GET /api/products/:id/reviews
Query Parameters:
- page, limit, rating (optional)

Response:
{
  "success": true,
  "data": {
    "reviews": [...],
    "average_rating": 4.8,
    "total_reviews": 234
  }
}
```

#### 14. Add to Wishlist
```
POST /api/wishlist
Headers: Authorization: Bearer <token>
Body:
{
  "product_id": 1
}

Response:
{
  "success": true,
  "message": "Added to wishlist"
}
```

#### 15. Get User Wishlist
```
GET /api/wishlist
Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "wishlist_items": [...]
  }
}
```

## Business Logic Implementation

### 1. Product Search and Filtering
```javascript
// Example implementation for product search
const searchProducts = async (filters) => {
  const {
    search,
    category,
    min_price,
    max_price,
    sort = 'created_at',
    order = 'desc',
    page = 1,
    limit = 12
  } = filters;

  let query = Product.find({ is_active: true });

  // Search in title and description
  if (search) {
    query = query.or([
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ]);
  }

  // Filter by category
  if (category && category !== 'all') {
    query = query.where('category', category);
  }

  // Price range filter
  if (min_price || max_price) {
    query = query.where('price');
    if (min_price) query = query.gte(min_price);
    if (max_price) query = query.lte(max_price);
  }

  // Sorting
  query = query.sort({ [sort]: order });

  // Pagination
  const skip = (page - 1) * limit;
  query = query.skip(skip).limit(limit);

  const products = await query.exec();
  const total = await Product.countDocuments(query.getQuery());

  return {
    products,
    pagination: {
      current_page: page,
      total_pages: Math.ceil(total / limit),
      total_items: total,
      items_per_page: limit
    }
  };
};
```

### 2. Shopping Cart Logic
```javascript
// Get or create user cart
const getOrCreateCart = async (userId) => {
  let cart = await ShoppingCart.findOne({ user_id: userId });
  
  if (!cart) {
    cart = new ShoppingCart({ user_id: userId });
    await cart.save();
  }
  
  return cart;
};

// Add item to cart with validation
const addToCart = async (userId, productId, quantity = 1) => {
  const product = await Product.findById(productId);
  if (!product || !product.in_stock) {
    throw new Error('Product not available');
  }

  if (product.stock_quantity < quantity) {
    throw new Error('Insufficient stock');
  }

  const cart = await getOrCreateCart(userId);
  
  const existingItem = await CartItem.findOne({
    cart_id: cart.id,
    product_id: productId
  });

  if (existingItem) {
    existingItem.quantity += quantity;
    await existingItem.save();
  } else {
    const cartItem = new CartItem({
      cart_id: cart.id,
      product_id: productId,
      quantity,
      price_at_time: product.price
    });
    await cartItem.save();
  }

  return await getCartWithItems(userId);
};
```

### 3. Order Processing
```javascript
// Create order from cart
const createOrder = async (userId, orderData) => {
  const cart = await getCartWithItems(userId);
  
  if (cart.items.length === 0) {
    throw new Error('Cart is empty');
  }

  // Validate stock availability
  for (const item of cart.items) {
    const product = await Product.findById(item.product_id);
    if (product.stock_quantity < item.quantity) {
      throw new Error(`Insufficient stock for ${product.title}`);
    }
  }

  // Calculate totals
  const subtotal = cart.items.reduce((sum, item) => 
    sum + (item.price_at_time * item.quantity), 0
  );
  
  const shippingCost = subtotal >= 50 ? 0 : 10; // Free shipping over $50
  const taxAmount = subtotal * 0.08; // 8% tax
  const totalAmount = subtotal + shippingCost + taxAmount;

  // Generate order number
  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

  // Create order
  const order = new Order({
    order_number: orderNumber,
    user_id: userId,
    status: 'pending',
    subtotal,
    shipping_cost: shippingCost,
    tax_amount: taxAmount,
    total_amount: totalAmount,
    shipping_address: orderData.shipping_address,
    billing_address: orderData.billing_address,
    payment_method: orderData.payment_method,
    notes: orderData.notes
  });

  await order.save();

  // Create order items and update stock
  for (const item of cart.items) {
    await OrderItem.create({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_time: item.price_at_time,
      product_title: item.product.title
    });

    // Update product stock
    await Product.findByIdAndUpdate(item.product_id, {
      $inc: { stock_quantity: -item.quantity }
    });
  }

  // Clear cart
  await CartItem.deleteMany({ cart_id: cart.id });

  return order;
};
```

### 4. Inventory Management
```javascript
// Update product stock
const updateStock = async (productId, quantityChange, operation = 'subtract') => {
  const product = await Product.findById(productId);
  
  if (!product) {
    throw new Error('Product not found');
  }

  const newStock = operation === 'subtract' 
    ? product.stock_quantity - quantityChange
    : product.stock_quantity + quantityChange;

  if (newStock < 0) {
    throw new Error('Insufficient stock');
  }

  product.stock_quantity = newStock;
  product.in_stock = newStock > 0;
  
  await product.save();
  
  return product;
};

// Low stock alert
const checkLowStock = async () => {
  const lowStockProducts = await Product.find({
    stock_quantity: { $lte: 10 },
    in_stock: true
  });

  if (lowStockProducts.length > 0) {
    // Send notification to admin
    await sendLowStockAlert(lowStockProducts);
  }
};
```

## Security Considerations

### 1. Input Validation
- Validate all product data (price, stock, etc.)
- Sanitize search queries to prevent injection attacks
- Validate file uploads for product images
- Rate limiting on search and cart operations

### 2. Authentication & Authorization
- JWT tokens for user authentication
- Role-based access control (admin, user, guest)
- Guest checkout support with session management
- API key validation for admin operations

### 3. Payment Security
- PCI DSS compliance for payment processing
- Secure payment gateway integration
- Encrypt sensitive customer data
- Implement fraud detection

### 4. Data Protection
- Encrypt personally identifiable information
- GDPR compliance for EU customers
- Secure session management
- Regular security audits

## Performance Optimization

### 1. Database Optimization
- Index frequently queried fields (category, price, rating)
- Use database connection pooling
- Implement query result caching
- Database query optimization

### 2. API Performance
- Implement Redis caching for product listings
- Pagination for large datasets
- Lazy loading for product images
- CDN for static assets

### 3. Search Optimization
- Full-text search implementation (Elasticsearch)
- Search result caching
- Autocomplete functionality
- Search analytics

## Integration Requirements

### 1. Payment Gateway
- Stripe/PayPal integration
- Multiple payment methods support
- Webhook handling for payment status
- Refund processing

### 2. Shipping Integration
- Shipping rate calculation
- Tracking number generation
- Delivery status updates
- International shipping support

### 3. Email Notifications
- Order confirmation emails
- Shipping notifications
- Inventory alerts
- Marketing campaigns

### 4. Analytics Integration
- Google Analytics for e-commerce tracking
- Sales reporting dashboard
- Customer behavior analytics
- Inventory turnover reports

## Testing Requirements

### 1. Unit Tests
- Product CRUD operations
- Cart management functions
- Order processing logic
- Payment validation

### 2. Integration Tests
- API endpoint testing
- Database operations
- Payment gateway integration
- Email notification system

### 3. Load Testing
- High concurrent user scenarios
- Database performance under load
- API response times
- Cart operation performance

## Deployment Considerations

### 1. Environment Setup
- Development, staging, and production environments
- Environment-specific configuration
- Database migrations
- SSL certificate setup

### 2. Monitoring
- Application performance monitoring
- Database performance tracking
- Error logging and alerting
- Uptime monitoring

### 3. Backup Strategy
- Regular database backups
- Product image backups
- Configuration backups
- Disaster recovery plan

## Sample Data Seeding

```javascript
// Seed initial product categories
const seedCategories = async () => {
  const categories = [
    { name: 'Premium Tea', slug: 'tea', is_featured: true },
    { name: 'Sea & Beach Wears and Handy Crafts', slug: 'sea', is_featured: true },
    { name: 'Spices & Food', slug: 'spices', is_featured: false },
    { name: 'Clothing & Textiles', slug: 'clothing', is_featured: false },
    { name: 'Souvenirs & Crafts', slug: 'souvenirs', is_featured: false },
    { name: 'Beauty & Wellness', slug: 'beauty', is_featured: false }
  ];

  await ProductCategory.insertMany(categories);
};

// Seed sample products
const seedProducts = async () => {
  const products = [
    {
      title: 'Ella High Grown Ceylon Tea',
      category: 'tea',
      product_type: 'Tea Packet',
      price: 18.00,
      original_price: 25.00,
      stock_quantity: 50,
      rating: 4.9,
      review_count: 234,
      badge: 'Best Seller',
      description: 'Premium high-grown Ceylon tea from the misty hills of Ella (100g)',
      image_url: 'https://images.unsplash.com/photo-1597318985999-dd64bcc84baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    }
    // ... more products
  ];

  await Product.insertMany(products);
};
```

This comprehensive backend implementation provides a solid foundation for the shop feature, ensuring scalability, security, and maintainability while supporting all the functionality demonstrated in the frontend implementation.




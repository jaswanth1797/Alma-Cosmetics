# Database Setup for Alma Cosmetics

## Recommended Database Options

### 1. **Firebase Firestore (Easiest)**
```javascript
// Example Firebase setup
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "alma-cosmetics.firebaseapp.com",
  projectId: "alma-cosmetics",
  storageBucket: "alma-cosmetics.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
```

**Pros:**
- No server setup required
- Real-time updates
- Built-in authentication
- Free tier available
- Easy integration

**Cost:** Free tier (1GB storage, 50K reads/day)

### 2. **MongoDB Atlas (Scalable)**
```javascript
// MongoDB connection
const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://username:password@cluster.mongodb.net/alma-cosmetics";
const client = new MongoClient(uri);
```

**Pros:**
- Highly scalable
- Flexible schema
- Good for complex queries
- Professional solution

**Cost:** Free tier (512MB storage)

### 3. **Supabase (PostgreSQL)**
```javascript
// Supabase setup
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://your-project.supabase.co', 'your-anon-key')
```

**Pros:**
- PostgreSQL database
- Built-in authentication
- Real-time subscriptions
- REST API auto-generated

**Cost:** Free tier (500MB storage)

## Database Schema Design

### Products Table
```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100),
  type VARCHAR(100),
  image_url VARCHAR(500),
  stock_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Orders Table
```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  shipping_address TEXT,
  payment_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Order Items Table
```sql
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL
);
```

## Implementation Steps

### 1. Choose Database Provider
- **Firebase**: Best for quick setup
- **MongoDB Atlas**: Best for scalability
- **Supabase**: Best for PostgreSQL features

### 2. Set Up Backend API
```javascript
// Example Express.js API
const express = require('express');
const app = express();

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await db.collection('products').find({}).toArray();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create order
app.post('/api/orders', async (req, res) => {
  try {
    const order = await db.collection('orders').insertOne(req.body);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 3. Update Frontend
```javascript
// Fetch products from database
async function loadProducts() {
  try {
    const response = await fetch('/api/products');
    const products = await response.json();
    displayProducts(products);
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

// Save order to database
async function saveOrder(orderData) {
  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error saving order:', error);
  }
}
```

## Cost Comparison

| Provider | Free Tier | Paid Plans | Best For |
|----------|-----------|------------|----------|
| Firebase | 1GB storage, 50K reads/day | $25/month | Small-medium business |
| MongoDB Atlas | 512MB storage | $9/month | Growing business |
| Supabase | 500MB storage | $25/month | Professional setup |

## Recommendation

**For Alma Cosmetics, I recommend starting with Firebase Firestore** because:

1. **Easy Setup**: No server configuration needed
2. **Real-time Updates**: Perfect for inventory management
3. **Built-in Auth**: User login/registration ready
4. **Cost Effective**: Free tier covers most needs
5. **Scalable**: Can grow with your business

## Migration Strategy

1. **Phase 1**: Set up Firebase, migrate product data
2. **Phase 2**: Add user authentication
3. **Phase 3**: Implement order management
4. **Phase 4**: Add inventory tracking
5. **Phase 5**: Analytics and reporting

This approach allows you to start simple and scale as your business grows! 
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const products = [
  {
    name: 'Midnight Rose',
    brand: 'Floral',
    description: 'A mysterious blend of dark roses and vanilla',
    price: 7499,
    stock: 50,
    image: '/alma2/images/image1.jpg'
  },
  {
    name: 'Ocean Breeze',
    brand: 'Fresh',
    description: 'Fresh ocean waves with citrus undertones',
    price: 6299,
    stock: 50,
    image: '/alma2/images/image2.jpg'
  },
  {
    name: 'Amber Nights',
    brand: 'Woody',
    description: 'Warm amber with spicy cinnamon notes',
    price: 7999,
    stock: 50,
    image: '/alma2/images/image3.jpg'
  },
  {
    name: 'Luxury Lipstick',
    brand: 'Cosmetic',
    description: 'Long-lasting color with moisturizing formula',
    price: 2099,
    stock: 100,
    image: '/alma2/images/lipstick.jpg'
  },
  {
    name: 'Mascara Pro',
    brand: 'Cosmetic',
    description: 'Volumizing mascara for dramatic lashes',
    price: 2699,
    stock: 100,
    image: '/alma2/images/mascara.jpg'
  },
  {
    name: 'Foundation Cream',
    brand: 'Cosmetic',
    description: 'Flawless coverage with natural finish',
    price: 3799,
    stock: 100,
    image: '/alma2/images/foundation.jpg'
  }
];

async function seed() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI not set');
    process.exit(1);
  }
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  try {
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log(`Inserted ${products.length} products.`);

    // Seed admin user if not exists
    const adminEmail = 'admin@alma.com';
    const existing = await User.findOne({ email: adminEmail });
    if (!existing) {
      const hashed = await bcrypt.hash('admin123', 10);
      await User.create({ name: 'Alma Admin', email: adminEmail, password: hashed, role: 'admin' });
      console.log('Admin user created: admin@alma.com / admin123');
    } else {
      console.log('Admin user already exists');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

seed();



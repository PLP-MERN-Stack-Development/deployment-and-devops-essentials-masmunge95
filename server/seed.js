// server/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');      // adjust paths to your models
const Post = require('./models/Post');
const Category = require('./models/Category');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mern-blog';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB for seeding');

    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    await Category.deleteMany({});

    console.log('Cleared existing data');

    // Seed users
    const editor = await User.create({
      name: 'Editor User',
      email: 'editor@example.com',
      role: 'editor',
      password: 'password123', // or hashed if your app requires
    });

    const viewer = await User.create({
      name: 'Viewer User',
      email: 'viewer@example.com',
      role: 'viewer',
      password: 'password123',
    });

    console.log('Seeded users');

    // Seed categories
    const category1 = await Category.create({ name: 'Tech' });
    const category2 = await Category.create({ name: 'Lifestyle' });

    console.log('Seeded categories');

    // Seed posts
    await Post.create([
      {
        title: 'First Post',
        content: 'Hello world!',
        author: editor._id,
        category: category1._id,
        published: true,
      },
      {
        title: 'Second Post',
        content: 'Another post',
        author: editor._id,
        category: category2._id,
        published: true,
      },
    ]);

    console.log('Seeded posts');

    console.log('Database seeding completed!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
}

seed();

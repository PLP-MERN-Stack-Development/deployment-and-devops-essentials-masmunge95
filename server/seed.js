// server/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const Post = require('./src/models/Post');
const Category = require('./src/models/Category');

// Since Clerk handles users, we'll use placeholder IDs for seeding purposes.
const EDITOR_ID = 'user_placeholder_editor_12345';
const EDITOR_NAME = 'Seeded Editor';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mern-blog';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB for seeding');

    // Clear existing data
    await Post.deleteMany({});
    await Category.deleteMany({});

    console.log('Cleared existing data');

    // Seed categories
    const category1 = await Category.create({ name: 'Tech', authorId: EDITOR_ID });
    const category2 = await Category.create({ name: 'Lifestyle', authorId: EDITOR_ID });

    console.log('Seeded categories');

    // Seed posts
    await Post.create([
      {
        title: 'First Seeded Post',
        content: 'This is the content of the first post seeded into the database.',
        author: EDITOR_NAME,
        authorId: EDITOR_ID,
        category: category1._id,
        status: 'published',
        tags: ['tech', 'getting-started'],
      },
      {
        title: 'Second Seeded Post',
        content: 'This is another post, this time about lifestyle.',
        author: EDITOR_NAME,
        authorId: EDITOR_ID,
        category: category2._id,
        status: 'published',
        tags: ['lifestyle', 'thoughts'],
      },
    ]);

    console.log('Seeded posts');

    console.log('Database seeding completed!');
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

seed();

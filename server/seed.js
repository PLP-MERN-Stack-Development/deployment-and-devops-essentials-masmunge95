// server/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const Post = require('./src/models/Post');
const Category = require('./src/models/Category');

// Since Clerk handles users, we'll use placeholder IDs for seeding purposes.
const EDITOR_ID = 'system-template'; // Standardize on 'system-template' for all seed data
const EDITOR_NAME = 'Seeded Editor';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mern-blog';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding');

    // Non-destructively seed categories if they don't exist
    const techCategory = await Category.findOneAndUpdate(
      { name: 'Tech', authorId: EDITOR_ID },
      { $setOnInsert: { name: 'Tech', authorId: EDITOR_ID } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const lifestyleCategory = await Category.findOneAndUpdate(
      { name: 'Lifestyle', authorId: EDITOR_ID },
      { $setOnInsert: { name: 'Lifestyle', authorId: EDITOR_ID } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log('Categories seeded or already exist.');

    // Non-destructively seed posts if they don't exist
    const seedPosts = [
      {
        title: 'First Seeded Post',
        content: 'This is the content of the first post seeded into the database.',
        author: EDITOR_NAME,
        authorId: EDITOR_ID,
        category: techCategory._id,
        status: 'published',
        tags: ['tech', 'getting-started'],
      },
      {
        title: 'Second Seeded Post',
        content: 'This is another post, this time about lifestyle.',
        author: EDITOR_NAME,
        authorId: EDITOR_ID,
        category: lifestyleCategory._id,
        status: 'published',
        tags: ['lifestyle', 'thoughts'],
      },
    ];

    console.log('Recreating seed posts to ensure data integrity and trigger hooks...');

    for (const postData of seedPosts) {
      // Delete any existing post with the same title to ensure a clean slate
      await Post.deleteOne({ title: postData.title, authorId: EDITOR_ID });
      // Create the post, which allows Mongoose pre-save hooks (like slug generation) to run
      await Post.create(postData);
    }

    console.log('Seed posts have been recreated successfully.');

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

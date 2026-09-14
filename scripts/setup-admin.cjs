const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function main() {
  const env = dotenv.parse(fs.readFileSync(path.resolve('.env.local')));
  const email = (env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = env.ADMIN_PASSWORD || '';
  if (!env.MONGODB_URI || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Set MONGODB_URI and a valid ADMIN_EMAIL in .env.local.');
  }
  if (password.length < 12 || password.length > 72 || /choose|replace|your_password/i.test(password)) {
    throw new Error('Set ADMIN_PASSWORD to a unique password of 12–72 characters.');
  }
  await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
  const users = mongoose.connection.db.collection('users');
  if (await users.findOne({ role: 'admin' })) {
    throw new Error('An admin already exists. No account was changed.');
  }
  if (await users.findOne({ email })) {
    throw new Error('That email already belongs to an account. No account was changed.');
  }
  await users.insertOne({ name: 'Amaze Admin', email, password: await bcrypt.hash(password, 12),
    role: 'admin', provider: 'credentials', isVerified: true, addresses: [], wishlist: [],
    createdAt: new Date(), updatedAt: new Date() });
  console.log('Admin created. Sign in at /login, then open /admin.');
}
main().catch(error => {
  const safe = ['Set ', 'An admin already', 'That email already'];
  console.error(safe.some(p => error.message.startsWith(p)) ? error.message : 'Admin setup failed. Check database connectivity and permissions.');
  process.exitCode = 1;
}).finally(() => mongoose.disconnect());

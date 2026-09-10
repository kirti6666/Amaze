const { MongoMemoryReplSet } = require('mongodb-memory-server');
const fs = require('node:fs');
const path = require('node:path');

async function main() {
  const dbPath = path.resolve('.preview-data');
  fs.mkdirSync(dbPath, { recursive: true });
  const server = await MongoMemoryReplSet.create({
    instanceOpts: [{ port: 27018, dbPath }],
    replSet: { count: 1, ip: '127.0.0.1', storageEngine: 'wiredTiger' },
  });
  console.log('Preview MongoDB ready: mongodb://127.0.0.1:27018/store_preview');
  console.log('Data is stored in .preview-data. Keep this terminal running.');
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, async () => { await server.stop(); process.exit(0); });
  }
}
main().catch((error) => { console.error(error); process.exit(1); });

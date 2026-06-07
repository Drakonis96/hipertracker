import './db/index.js'; // inicializa el esquema
import { createApp } from './app.js';
import { config } from './config.js';
import { getStores } from './lib/stores.js';

const app = createApp();

const storeCount = getStores().length;

app.listen(config.port, () => {
  console.log('');
  console.log('  🛒  HiperTracker v0.1.1');
  console.log(`  ▸ Entorno:   ${config.env}`);
  console.log(`  ▸ Servidor:  http://localhost:${config.port}`);
  console.log(`  ▸ API:       http://localhost:${config.port}/api/v1`);
  console.log(`  ▸ Docs:      http://localhost:${config.port}/api/docs`);
  console.log(`  ▸ Base de datos: ${config.dbPath}`);
  console.log(`  ▸ Tiendas cargadas: ${storeCount}`);
  console.log('');
});

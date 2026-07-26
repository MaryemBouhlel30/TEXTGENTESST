import { createApp } from './app';
import { initDb } from './db';

const PORT = process.env.PORT || 3000;

initDb();
const app = createApp();

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`textgen-hub démarré sur http://localhost:${PORT}`);
});

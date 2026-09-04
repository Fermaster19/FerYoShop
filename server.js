const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'prendas.json');

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.static(path.join(__dirname, 'public')));

function ensureDataFile() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]', 'utf8');
  }
}

function readItems() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const items = JSON.parse(raw);
    return Array.isArray(items) ? items : [];
  } catch (err) {
    console.error('Error leyendo prendas:', err);
    throw new Error('No se pudo leer el catálogo');
  }
}

function writeItems(items) {
  ensureDataFile();
  const tmp = DATA_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(items, null, 2), 'utf8');
  fs.renameSync(tmp, DATA_FILE);
}

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'reviste-api' });
});

app.get('/api/prendas', (req, res) => {
  try {
    const items = readItems().sort((a, b) => b.createdAt - a.createdAt);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/prendas/:id', (req, res) => {
  try {
    const item = readItems().find(i => i.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'Prenda no encontrada' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/prendas', (req, res) => {
  try {
    const { nombre, precio, categoria, talle, condicion, descripcion, imagen } = req.body || {};

    if (!nombre || precio === undefined || precio === '' || !categoria || !talle || !imagen) {
      return res.status(400).json({
        error: 'Faltan campos obligatorios: nombre, precio, categoria, talle e imagen.'
      });
    }

    const numericPrice = Number(precio);
    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      return res.status(400).json({ error: 'El precio no es válido.' });
    }

    if (typeof imagen !== 'string' || !imagen.startsWith('data:image/')) {
      return res.status(400).json({ error: 'La imagen no es válida.' });
    }

    const item = {
      id: makeId(),
      nombre: String(nombre).trim(),
      precio: numericPrice,
      categoria: String(categoria).trim(),
      talle: String(talle).trim(),
      condicion: condicion ? String(condicion).trim() : 'Nuevo',
      descripcion: descripcion ? String(descripcion).trim() : '',
      imagen,
      createdAt: Date.now()
    };

    const items = readItems();
    items.push(item);
    writeItems(items);

    res.status(201).json(item);
  } catch (err) {
    console.error('Error creando prenda:', err);
    res.status(500).json({ error: 'No se pudo guardar la publicación.' });
  }
});

app.delete('/api/prendas/:id', (req, res) => {
  try {
    const items = readItems();
    const index = items.findIndex(i => i.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Prenda no encontrada' });
    }

    const [deleted] = items.splice(index, 1);
    writeItems(items);
    res.json({ ok: true, deleted });
  } catch (err) {
    res.status(500).json({ error: 'No se pudo eliminar la prenda.' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'catalogo.html'));
});

ensureDataFile();
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Reviste API escuchando en el puerto ${PORT}`);
  console.log(`Archivo de datos: ${DATA_FILE}`);
});

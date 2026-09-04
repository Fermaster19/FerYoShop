const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 10000;
const ADMIN_USER = process.env.ADMIN_USER || '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;
const adminSessions = new Set();

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.static(path.join(__dirname, 'public')));

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function requireDatabase(res) {
  if (!supabase) {
    res.status(503).json({ error: 'La base de datos no está configurada.' });
    return false;
  }
  return true;
}

function normalizeItem(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    precio: Number(row.precio),
    categoria: row.categoria,
    talle: row.talle,
    condicion: row.condicion,
    descripcion: row.descripcion || '',
    imagen: row.imagen,
    estado: row.estado || 'Disponible',
    createdAt: Number(row.created_at)
  };
}

function requireAdmin(req, res, next) {
  const authorization = req.get('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token || !adminSessions.has(token)) {
    return res.status(401).json({ error: 'Sesión no válida o vencida.' });
  }
  next();
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'reviste-api', databaseConfigured: Boolean(supabase) });
});

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!ADMIN_USER || !ADMIN_PASSWORD) {
    return res.status(503).json({ error: 'El acceso administrador no está configurado.' });
  }
  if (username !== ADMIN_USER || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  adminSessions.add(token);
  res.json({ token });
});

app.get('/api/prendas', async (req, res) => {
  if (!requireDatabase(res)) return;
  try {
    const { data, error } = await supabase
      .from('prendas')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data.map(normalizeItem));
  } catch (err) {
    console.error('Error leyendo prendas:', err);
    res.status(500).json({ error: 'No se pudo leer el catálogo.' });
  }
});

app.get('/api/prendas/:id', async (req, res) => {
  if (!requireDatabase(res)) return;
  try {
    const { data, error } = await supabase
      .from('prendas')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Prenda no encontrada' });
    res.json(normalizeItem(data));
  } catch (err) {
    console.error('Error leyendo prenda:', err);
    res.status(500).json({ error: 'No se pudo leer la prenda.' });
  }
});

app.post('/api/prendas', requireAdmin, async (req, res) => {
  if (!requireDatabase(res)) return;
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
      estado: 'Disponible',
      created_at: Date.now()
    };

    const { data, error } = await supabase
      .from('prendas')
      .insert(item)
      .select()
      .single();
    if (error) throw error;

    res.status(201).json(normalizeItem(data));
  } catch (err) {
    console.error('Error creando prenda:', err);
    res.status(500).json({ error: 'No se pudo guardar la publicación.' });
  }
});

app.patch('/api/prendas/:id', requireAdmin, async (req, res) => {
  if (!requireDatabase(res)) return;
  try {
    const { nombre, precio, categoria, talle, condicion, descripcion, imagen, estado } = req.body || {};
    const allowedStates = ['Disponible', 'Reservada', 'Vendida', 'Oculta'];

    if (precio !== undefined && (!Number.isFinite(Number(precio)) || Number(precio) < 0)) {
      return res.status(400).json({ error: 'El precio no es válido.' });
    }
    if (imagen !== undefined && (typeof imagen !== 'string' || !imagen.startsWith('data:image/'))) {
      return res.status(400).json({ error: 'La imagen no es válida.' });
    }
    if (estado !== undefined && !allowedStates.includes(estado)) {
      return res.status(400).json({ error: 'El estado no es válido.' });
    }

    const updates = {
      ...(nombre !== undefined && { nombre: String(nombre).trim() }),
      ...(precio !== undefined && { precio: Number(precio) }),
      ...(categoria !== undefined && { categoria: String(categoria).trim() }),
      ...(talle !== undefined && { talle: String(talle).trim() }),
      ...(condicion !== undefined && { condicion: String(condicion).trim() }),
      ...(descripcion !== undefined && { descripcion: String(descripcion).trim() }),
      ...(imagen !== undefined && { imagen }),
      ...(estado !== undefined && { estado: String(estado) })
    };
    const { data, error } = await supabase
      .from('prendas')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Prenda no encontrada' });
    res.json(normalizeItem(data));
  } catch (err) {
    console.error('Error actualizando prenda:', err);
    res.status(500).json({ error: 'No se pudo actualizar la publicación.' });
  }
});

app.delete('/api/prendas/:id', requireAdmin, async (req, res) => {
  if (!requireDatabase(res)) return;
  try {
    const { data, error } = await supabase
      .from('prendas')
      .delete()
      .eq('id', req.params.id)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Prenda no encontrada' });
    res.json({ ok: true, deleted: normalizeItem(data) });
  } catch (err) {
    res.status(500).json({ error: 'No se pudo eliminar la prenda.' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'catalogo.html'));
});

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Reviste API escuchando en el puerto ${PORT}`);
    console.log(`Supabase configurado: ${Boolean(supabase)}`);
  });
}

module.exports = app;

# Reviste — API + catálogo

Proyecto listo para desplegar en Render con Supabase.

## Estructura

- `server.js` — API REST y servidor de los HTML.
- `public/catalogo.html` — catálogo.
- `public/subir.html` — panel para publicar prendas.
- `supabase/schema.sql` — esquema de la tabla de publicaciones.

## Ejecutar localmente

```bash
npm install
npm start
```

Abrir:

- http://localhost:10000/
- http://localhost:10000/subir.html

## API

- `GET /api/health`
- `GET /api/prendas`
- `GET /api/prendas/:id`
- `POST /api/admin/login`
- `POST /api/prendas`
- `PATCH /api/prendas/:id`
- `DELETE /api/prendas/:id`

Las operaciones de administración requieren iniciar sesión. En Render, crear estas
variables de entorno:

```text
ADMIN_USER=tu_usuario_admin
ADMIN_PASSWORD=tu_contraseña_admin
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

No incluir estas credenciales en el código frontend ni en el repositorio.

## Supabase

1. Crear un proyecto en Supabase.
2. Abrir **SQL Editor** y ejecutar `supabase/schema.sql`.
3. En **Settings > API**, copiar la URL del proyecto y la clave `service_role`.
4. Cargar esos valores como variables privadas en Render.

La clave `service_role` nunca debe ir en el frontend: la API la usa únicamente en el servidor.

## Render

Crear un Web Service conectado al repositorio.

Build Command:
```text
npm install
```

Start Command:
```text
npm start
```

## Importante

Las imágenes se guardan dentro de Supabase como Data URL. El formulario ya las reduce a un máximo de 900 px de ancho y JPEG calidad 0.82 antes de enviarlas.

Si el catálogo crece mucho, conviene pasar las imágenes a Supabase Storage o Cloudinary y guardar solo sus URLs.

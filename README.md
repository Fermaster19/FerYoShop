# Reviste — API + catálogo

Proyecto listo para desplegar en Vercel con Supabase.

## Estructura

- `server.js` — API REST y servidor local de los HTML.
- `api/index.js` — función serverless de Vercel.
- `public/catalogo.html` — catálogo.
- `public/subir.html` — panel para publicar prendas.
- `public/index.html` — entrada del sitio, redirige al catálogo.
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

Las operaciones de administración requieren iniciar sesión. En Vercel, crear estas
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
4. Cargar esos valores como variables privadas en Vercel.

La clave `service_role` nunca debe ir en el frontend: la API la usa únicamente en el servidor.

## Vercel

1. Importar el repositorio en Vercel.
2. Usar el preset **Other**.
3. Dejar el directorio raíz como `.`.
4. No definir un comando de build.
5. Agregar las cuatro variables de entorno indicadas arriba.
6. Hacer el deploy.

Vercel detectará `api/index.js` como función serverless y servirá la carpeta `public` como archivos estáticos.

## Importante

Las imágenes se guardan dentro de Supabase como Data URL. El formulario ya las reduce a un máximo de 900 px de ancho y JPEG calidad 0.82 antes de enviarlas.

Si el catálogo crece mucho, conviene pasar las imágenes a Supabase Storage o Cloudinary y guardar solo sus URLs.

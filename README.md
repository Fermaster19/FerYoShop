# FerYo — API + catálogo

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
copy .env.example .env
npm start
```

Completá los valores de `.env` con la URL y la clave `service_role` de Supabase.
Todas las publicaciones, modificaciones, estados y eliminaciones se guardan en
la tabla `public.prendas` de Supabase; no se usa `data/prendas.json`.

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

Las operaciones de administración requieren iniciar sesión. El usuario administrador
se guarda en `public.admin_users` de Supabase y la contraseña se almacena como hash.
Para crear el primer usuario, cargar temporalmente estas variables en Vercel:

```text
ADMIN_USER=tu_usuario_admin
ADMIN_PASSWORD=tu_contraseña_admin
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

Después del primer inicio de sesión correcto, podés eliminar `ADMIN_USER` y
`ADMIN_PASSWORD` de Vercel. El usuario seguirá guardado en Supabase.

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
5. Agregar `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`. Para crear el primer
	administrador, agregar también temporalmente `ADMIN_USER` y `ADMIN_PASSWORD`.
6. Hacer el deploy.

Vercel detectará `api/index.js` como función serverless y servirá la carpeta `public` como archivos estáticos.

## Importante

Las imágenes se guardan dentro de Supabase como Data URL. El formulario ya las reduce a un máximo de 900 px de ancho y JPEG calidad 0.82 antes de enviarlas.

Si el catálogo crece mucho, conviene pasar las imágenes a Supabase Storage o Cloudinary y guardar solo sus URLs.

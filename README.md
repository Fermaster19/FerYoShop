# FerYo — catálogo

Sitio estático para Vercel con Supabase directo desde el navegador.

## Estructura

- `public/catalogo.html` — catálogo.
- `public/subir.html` — panel para publicar prendas.
- `public/index.html` — entrada del sitio, redirige al catálogo.
- `public/supabase-client.js` — configuración pública de Supabase.
- `supabase/schema.sql` — tablas y políticas RLS.

No se utiliza servidor Node, API propia ni almacenamiento local. Todas las
publicaciones, modificaciones, estados y eliminaciones se guardan directamente
en Supabase.

El acceso usa Supabase Auth. En **Authentication > Users**, creá el usuario
`yoyo1001@feryo.local` con la contraseña elegida.

## Supabase

1. Crear un proyecto en Supabase.
2. Abrir **SQL Editor** y ejecutar `supabase/schema.sql`.
3. En **Settings > API**, copiar la URL del proyecto y la clave `anon` o `publishable`.
4. Pegarlas en `public/supabase-client.js`.

## Vercel

1. Importar el repositorio en Vercel.
2. Usar el preset **Other**.
3. Dejar el directorio raíz como `.`.
4. No definir un comando de build.
5. Hacer el deploy.

Vercel servirá la carpeta `public` como sitio estático. No hace falta Render ni una API propia.

## Importante

Las imágenes se guardan dentro de Supabase como Data URL. El formulario ya las reduce a un máximo de 900 px de ancho y JPEG calidad 0.82 antes de enviarlas.

Si el catálogo crece mucho, conviene pasar las imágenes a Supabase Storage o Cloudinary y guardar solo sus URLs.

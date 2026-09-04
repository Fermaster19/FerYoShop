# Reviste — API + catálogo

Proyecto listo para desplegar en Render sin base de datos.

## Estructura

- `server.js` — API REST y servidor de los HTML.
- `public/catalogo.html` — catálogo.
- `public/subir.html` — panel para publicar prendas.
- `data/prendas.json` — archivo donde se guardan las publicaciones.

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
- `POST /api/prendas`
- `DELETE /api/prendas/:id`

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

### Persistent Disk (recomendado)

Agregar un Persistent Disk al servicio:

- Mount Path: `/data`

El servidor usa automáticamente `/data` cuando ese directorio existe y guarda:
`/data/prendas.json`

También podés definir la variable de entorno `DATA_DIR` con valor `/data` en
Render. Esto es recomendable si querés dejar la ruta configurada explícitamente.

Esto permite no usar una base de datos, manteniendo el catálogo en un archivo.

## Importante

Las imágenes se guardan dentro del JSON como Data URL. El formulario ya las reduce a un máximo de 900 px de ancho y JPEG calidad 0.82 antes de enviarlas.

Si el catálogo crece mucho, conviene pasar las imágenes a almacenamiento de objetos (por ejemplo, Cloudinary/S3), pero para un catálogo pequeño esta implementación es sencilla.

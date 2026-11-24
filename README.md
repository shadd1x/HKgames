# Inventario de Juegos (PWA)

Aplicación web progresiva (PWA) para consultar el inventario de juegos de **PS5, PS4, Nintendo Switch / Switch 2, Xbox y Consolas**.

## Características

- ✅ Lista completa seccionada por plataforma (PS5, PS4, Switch 2, Switch, Xbox, Consolas)
- ✅ Cantidad, nombre del juego y precio unitario
- ✅ Búsqueda por nombre en tiempo real
- ✅ Conversión USD → Bolivianos (tasa configurable, se guarda en el dispositivo)
- ✅ Funciona offline (PWA)
- ✅ Instalable en el celular / escritorio
- ✅ Diseño oscuro y responsive

## Cómo usarlo

### Opción 1: GitHub Pages (recomendado)

1. Sube esta carpeta a un repositorio de GitHub.
2. Ve a **Settings → Pages**.
3. En "Source" elige la rama `main` (o `master`) y la carpeta `/ (root)`.
4. Guarda. En unos minutos tendrás una URL tipo:
   `https://tu-usuario.github.io/nombre-repo/`

Abre esa URL en el celular y pulsa **"Instalar"** o "Añadir a pantalla de inicio".

### Opción 2: Local

```bash
# Con Python
python -m http.server 8080

# O con Node
npx serve .
```

Luego abre `http://localhost:8080`.

## Actualizar el inventario

1. Edita `inventory.json` (o regenera desde el Excel).
2. Sube el cambio a GitHub.
3. Los dispositivos actualizarán el caché al abrir la app online.

## Estructura

```
inventario-pwa/
├── index.html
├── styles.css
├── app.js
├── inventory.json      ← datos del inventario
├── manifest.json
├── sw.js               ← service worker (offline)
├── icon-192.png
├── icon-512.png
└── README.md
```

## Tasa de cambio

Por defecto usa **1 USD = 6.96 BOB**. Puedes cambiarla en la barra superior; el valor se guarda automáticamente en el navegador.

---

Hecho para uso personal / negocio de videojuegos.

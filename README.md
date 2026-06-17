# TriviaArcade (Mundial 2026)

Proyecto hecho con Vite + React. Instrucciones para desplegar en Vercel.

Requisitos:
- Node 18+ (o versión compatible con dependencias)

Comandos útiles:
```bash
npm install
npm run dev     # desarrollo
npm run build   # genera carpeta dist
npm run preview # prueba build local
```

Deploy en Vercel (resumen):
1. Subir el repo a GitHub/GitLab/Bitbucket.
2. Conectar el repo en Vercel (Import Project).
3. Vercel detectará un sitio estático. Si no, configurar:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. (Opcional) Añadir `vercel.json` si querés forzar `dist` y fallback a `index.html`.

Archivos a revisar si el despliegue falla:
- `index.html` debe estar en la raíz del proyecto.
- `package.json` debe contener `build` script (ya está: `vite build`).
- `vite.config.js` con `base: './'` ayuda si vas a servir desde rutas relativas.

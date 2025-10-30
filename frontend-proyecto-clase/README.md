# Frontend Auth0 - UCO Challenge

Este proyecto es una SPA creada con React + Vite que usa Auth0 como proveedor de identidad. El objetivo es consumir el API Gateway protegido sin mantener formularios propios de usuario y contraseña.

## Configuración

Crea un archivo `.env` con los datos de tu tenant de Auth0:

```env
VITE_AUTH0_DOMAIN=dev-x2nlunlga02cbz17.us.auth0.com
VITE_AUTH0_CLIENT_ID=en1kMIo9YDqKfSPcEbOap6bOHnQkpk5u
VITE_AUTH0_REDIRECT_URI=http://localhost:5173/callback
VITE_AUTH0_AUDIENCE=https://spring-boot-auth0-integration
VITE_API_BASE_URL=http://localhost:8080
```

> `VITE_API_BASE_URL` es opcional. Si lo defines, el botón “Llamar al gateway” hará una petición a `${VITE_API_BASE_URL}/debug/whoami` usando el token emitido por Auth0.

Instala dependencias y levanta el entorno de desarrollo:

```bash
npm install
npm run dev
```

## Características principales

- Redirección al Universal Login de Auth0 (sin formularios personalizados).
- Sesión persistente mediante `cacheLocation="localstorage"` y refresh tokens rotativos.
- Página de perfil que muestra los claims del usuario conectado.
- Botón de prueba para invocar el gateway protegido con el access token vigente.

## Estructura

- `src/auth` → Inicialización del `Auth0Provider` con React Router.
- `src/components` → Layout, controles reutilizables y componentes de UI.
- `src/pages` → Vistas principales (home, callback, perfil).
- `src/styles` → Estilos globales (diseño original sin el formulario legacy).

## Linting

```bash
npm run lint
```

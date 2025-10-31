# Frontend Auth0 - UCO Challenge

Este proyecto es una SPA creada con React + Vite que usa Auth0 como proveedor de identidad. El objetivo es consumir el API Gateway protegido sin mantener formularios propios de usuario y contraseña y validar el rol `admin` emitido por Auth0.

## Configuración

Crea un archivo `.env` con los datos de tu tenant de Auth0:

```env
VITE_AUTH0_DOMAIN=dev-x2nlunlga02cbz17.us.auth0.com
VITE_AUTH0_CLIENT_ID=en1kMIo9YDqKfSPcEbOap6bOHnQkpk5u
VITE_AUTH0_REDIRECT_URI=http://localhost:5173/callback
VITE_AUTH0_AUDIENCE=https://spring-boot-auth0-integration
VITE_API_BASE_URL=http://localhost:8080
```

> `VITE_API_BASE_URL` es necesario para usar el dashboard administrativo. Se llama a `${VITE_API_BASE_URL}/api/admin/dashboard` con el token JWT obtenido desde Auth0 para que el gateway confirme el rol `admin`.

Instala dependencias y levanta el entorno de desarrollo:

```bash
npm install
npm run dev
```

## Características principales

- Redirección al Universal Login de Auth0 (sin formularios personalizados).
- Sesión persistente mediante `cacheLocation="localstorage"` y refresh tokens rotativos.
- Página de perfil que muestra los claims del usuario conectado.
- Validación automática del rol `admin`: sólo quienes lo tengan podrán entrar al dashboard.
- Redirección al inicio con el mensaje “No puedes continuar porque no tienes el rol adecuado” para usuarios autenticados sin el rol requerido.
- Botón de prueba para invocar el gateway protegido con el access token vigente.

## Flujo de autorización con el API Gateway

1. Inicia sesión mediante Auth0 (Universal Login).
2. Si tu usuario posee el rol `admin` en el claim personalizado `https://uco-challenge/roles`, verás el botón “Ir al dashboard”.
3. Al entrar a `/dashboard`, el frontend solicita un access token con `audience = VITE_AUTH0_AUDIENCE` y lo envía en la cabecera `Authorization` hacia `${VITE_API_BASE_URL}/api/admin/dashboard`.
4. El API Gateway valida el JWT, verifica el rol y devuelve la respuesta del dashboard. Si la verificación falla (403), el frontend vuelve al inicio y muestra el mensaje “No puedes continuar porque no tienes el rol adecuado”.

## Estructura

- `src/auth` → Inicialización del `Auth0Provider` con React Router.
- `src/components` → Layout, controles reutilizables y componentes de UI.
- `src/pages` → Vistas principales (home, callback, perfil).
- `src/styles` → Estilos globales (diseño original sin el formulario legacy).

## Linting

```bash
npm run lint
```

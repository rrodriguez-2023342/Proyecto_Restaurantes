# Proyecto Restaurantes

Este proyecto tiene 2 partes principales:

1. `AuthService`: aqui se maneja el inicio de sesion, registro de usuarios y roles.
2. `Restaurantes`: aqui se maneja todo lo del restaurante (mesas, menus, pedidos, facturas, etc.).

## Archivos importantes

- `AuthService/`
- `Restaurantes/`
- `Endpoints/ProyectoRestaurantes.postman_collection.json`
- `docs/AUTH_SERVICE.md`
- `docs/RESTAURANTES_SERVICE.md`
- `docs/PRUEBAS_Y_COLECCIONES.md`

## Documentacion

- [Servicio de Autenticacion](./docs/AUTH_SERVICE.md)
- [Servicio de Restaurantes](./docs/RESTAURANTES_SERVICE.md)
- [Pruebas y colecciones](./docs/PRUEBAS_Y_COLECCIONES.md)

## Como correr el proyecto rapido

1. Encender la base de datos de `AuthService`:

```bash
cd AuthService
docker compose up -d
```

2. Levantar `AuthService`:

```bash
cd AuthService
pnpm install
pnpm run dev
```

3. Levantar `Restaurantes`:

```bash
cd Restaurantes
pnpm install
pnpm run dev
```

4. Revisar si estan activos:

- AuthService: `http://localhost:3006/api/v1/health`
- Restaurantes: `http://localhost:3007/restaurantes/v1/Health`

## Nota

La coleccion de Postman para probar endpoints esta en:
`Endpoints/ProyectoRestaurantes.postman_collection.json`
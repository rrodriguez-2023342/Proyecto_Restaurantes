# Proyecto Restaurantes

Este proyecto ahora queda dividido en 4 servicios:

1. `AuthService`: autenticacion, usuarios y roles.
2. `RestaurantesService`: restaurantes, mesas, menus, platos, inventarios y resenas.
3. `PedidosReservacionesService`: pedidos, detalle de pedidos, reservaciones y facturas.
4. `EventosReportesService`: eventos y reportes.

## Archivos importantes

- `AuthService/`
- `RestaurantesService/`
- `PedidosReservacionesService/`
- `EventosReportesService/`
- `Restaurantes/` (monolito original, se conserva como referencia)
- `Endpoints/ProyectoRestaurantes.postman_collection.json`
- `docs/AUTH_SERVICE.md`
- `docs/RESTAURANTES_SERVICE.md`
- `docs/MICROSERVICIOS.md`

## Documentacion

- [Servicio de Autenticacion](./docs/AUTH_SERVICE.md)
- [Servicio de Restaurantes](./docs/RESTAURANTES_SERVICE.md)
- [Mapa de microservicios](./docs/MICROSERVICIOS.md)
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

3. Levantar `RestaurantesService`:

```bash
cd RestaurantesService
pnpm install
pnpm run dev
```

4. Levantar `PedidosReservacionesService`:

```bash
cd PedidosReservacionesService
pnpm install
pnpm run dev
```

5. Levantar `EventosReportesService`:

```bash
cd EventosReportesService
pnpm install
pnpm run dev
```

## Health checks

- AuthService: `http://localhost:3006/api/v1/health`
- RestaurantesService: `http://localhost:3007/restaurantes/v1/Health`
- PedidosReservacionesService: `http://localhost:3008/restaurantes/v1/Health`
- EventosReportesService: `http://localhost:3009/restaurantes/v1/Health`

## Nota

La coleccion de Postman para probar endpoints esta en:
`Endpoints/ProyectoRestaurantes.postman_collection.json`


## Swagger

- AuthService: http://localhost:3006/api/v1/docs`r
- RestaurantesService: http://localhost:3007/restaurantes/v1/docs`r
- PedidosReservacionesService: http://localhost:3008/restaurantes/v1/docs`r
- EventosReportesService: http://localhost:3009/restaurantes/v1/docs`r


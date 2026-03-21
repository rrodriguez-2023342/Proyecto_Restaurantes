# Mapa de microservicios

## Servicios

### AuthService
- Puerto: `3006`
- Base path: `/api/v1`
- Responsabilidad: autenticacion, usuarios y roles.

### RestaurantesService
- Puerto: `3007`
- Base path: `/restaurantes/v1`
- Responsabilidad: restaurantes, mesas, menus, platos, inventarios y resenas.
- Rutas activas:
  - `/restaurantes`
  - `/mesas`
  - `/menus`
  - `/platos`
  - `/inventarios`
  - `/resenas`

### PedidosReservacionesService
- Puerto: `3008`
- Base path: `/restaurantes/v1`
- Responsabilidad: pedidos, detalle de pedidos, reservaciones y facturas.
- Rutas activas:
  - `/pedidos`
  - `/detalle-pedidos`
  - `/reservaciones`
  - `/facturas`

### EventosReportesService
- Puerto: `3009`
- Base path: `/restaurantes/v1`
- Responsabilidad: eventos y reportes.
- Rutas activas:
  - `/eventos`
  - `/reportes`

## Decision tecnica

Para mantener el comportamiento actual sin reescribir toda la logica de negocio, los tres microservicios nuevos reutilizan la misma base tecnica del servicio original `Restaurantes` y comparten la misma base de datos MongoDB. Asi se conservan los modelos, validaciones, JWT y helpers ya existentes.

## Compatibilidad

- El servicio `Restaurantes/` original se conserva como referencia.
- Los endpoints mantienen la misma estructura de URL; lo que cambia es el puerto segun el dominio.
- `AuthService` sigue siendo el servicio emisor/validador de autenticacion.

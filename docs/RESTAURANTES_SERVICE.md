# Servicio de Restaurantes (`Restaurantes`)

## Que hace

Este servicio maneja casi todo lo del negocio del restaurante.

- Restaurantes
- Mesas
- Menus
- Platos
- Reservaciones
- Pedidos
- Detalle de pedidos
- Eventos
- Resenas
- Inventarios
- Facturas
- Reportes

URL base: `http://localhost:3007/restaurantes/v1`

## Como funciona (simple)

1. Primero inicias sesion en `AuthService`.
2. Te dan un token.
3. Con ese token ya puedes usar endpoints privados en este servicio.
4. Segun tu rol, puedes hacer mas o menos acciones.

## Endpoints principales

### Restaurantes

- `POST /restaurantes/create`
- `GET /restaurantes/`
- `GET /restaurantes/:id`
- `PUT /restaurantes/:id`
- `DELETE /restaurantes/:id`

### Mesas

- `POST /mesas/create`
- `GET /mesas/`
- `GET /mesas/:id`
- `PUT /mesas/:id`
- `DELETE /mesas/:id`

### Menus

- `POST /menus/create`
- `GET /menus/`
- `GET /menus/:id`
- `PUT /menus/:id`
- `DELETE /menus/:id`

### Platos

- `POST /platos/create`
- `GET /platos/`
- `GET /platos/:id`
- `PUT /platos/:id`
- `DELETE /platos/:id`

### Pedidos

- `POST /pedidos/create`
- `GET /pedidos/`
- `GET /pedidos/:id`
- `PUT /pedidos/:id`
- `DELETE /pedidos/:id`

### Detalle de pedidos

- `POST /detalle-pedidos/create`
- `GET /detalle-pedidos/`
- `PUT /detalle-pedidos/:id`
- `DELETE /detalle-pedidos/:id`

### Eventos

- `POST /eventos/create`
- `GET /eventos/`
- `PUT /eventos/:id`
- `DELETE /eventos/:id`

### Resenas

- `POST /resenas/create`
- `GET /resenas/`
- `PUT /resenas/:id`
- `DELETE /resenas/:id`

### Inventarios

- `POST /inventarios/create`
- `GET /inventarios/`
- `PUT /inventarios/:id`
- `DELETE /inventarios/:id`

### Facturas

- `POST /facturas/`
- `GET /facturas/`
- `GET /facturas/:id`
- `PUT /facturas/:id`
- `DELETE /facturas/:id`
- `GET /facturas/:id/pdf`

### Reportes

- `POST /reportes/create`
- `GET /reportes/`
- `GET /reportes/:id`
- `PUT /reportes/:id`
- `DELETE /reportes/:id`
- `GET /reportes/:id/pdf`

## Ejemplos

### Crear restaurante

```bash
curl -X POST http://localhost:3007/restaurantes/v1/restaurantes/create \
  -H "Authorization: Bearer TU_JWT_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre":"Bistro GT",
    "descripcion":"Comida fusion",
    "categoria":"Fusion",
    "telefono":"55551234",
    "direccion":{
      "calle":"Zona 10",
      "ciudad":"Guatemala"
    },
    "dueno":"usr_XXXXXXXXXXXX"
  }'
```

### Ver restaurantes

```bash
curl -X GET http://localhost:3007/restaurantes/v1/restaurantes/ \
  -H "Authorization: Bearer TU_JWT"
```

### Descargar factura en PDF

```bash
curl -X GET http://localhost:3007/restaurantes/v1/facturas/65f1b5f3d7b9c4e19f8a1234/pdf \
  -H "Authorization: Bearer TU_JWT" \
  --output factura.pdf
```

## Health check

```bash
curl http://localhost:3007/restaurantes/v1/Health
```

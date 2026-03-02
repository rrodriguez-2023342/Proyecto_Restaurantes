# Pruebas y Colecciones

## Coleccion de Postman

La coleccion ya viene en este archivo:

- `Endpoints/ProyectoRestaurantes.postman_collection.json`

## Como usarla facil

1. Abrir Postman.
2. Importar esa coleccion.
3. Probar primero login.
4. Copiar el token.
5. Pegar ese token en los endpoints privados.
6. Verificar que las URLs esten bien (algunas requests quedaron con `3006` y deben ser `3007` para RestauranteService).

## Orden recomendado para probar

1. Probar health de ambos servicios.
2. Hacer registro.
3. Hacer login.
4. Probar CRUD de restaurantes.
5. Probar CRUD de menus y platos.
6. Probar mesas, reservaciones y eventos.
7. Probar pedidos y detalle de pedidos.
8. Probar inventarios y resenas.
9. Probar facturas.
10. Probar reportes.

## Pruebas rapidas con cURL

### Health AuthService

```bash
curl http://localhost:3006/api/v1/health
```

### Health Restaurantes

```bash
curl http://localhost:3007/restaurantes/v1/Health
```

### Login

```bash
curl -X POST http://localhost:3006/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"admin","password":"TuPassword"}'
```

### Ver restaurantes

```bash
curl -X GET http://localhost:3007/restaurantes/v1/restaurantes/ \
  -H "Authorization: Bearer TU_JWT"
```

## Nota

La coleccion actual no trae pruebas automaticas en la pestana `Tests`, entonces la revision es manual por ahora.

Tambien revisa estas rutas porque en la coleccion pueden venir mezcladas:

- Los endpoints de `AuthService` usan `http://localhost:3006`.
- Los endpoints de `RestauranteService` deben usar `http://localhost:3007`.

# Servicio de Autenticacion (`AuthService`)

## Que hace

Este servicio se encarga de los usuarios.

- Registrar usuarios nuevos.
- Iniciar sesion.
- Verificar correo.
- Recuperar y cambiar contrasena.
- Ver y editar perfil.
- Manejar roles y usuarios (parte de admin).

URL base: `http://localhost:3006/api/v1`

## Como funciona (explicado simple)

1. Te registras con `register`.
2. Verificas tu correo.
3. Inicias sesion con `login`.
4. El sistema te da un token (JWT).
5. Ese token se usa para entrar a endpoints privados.

## Endpoints mas usados

### Auth (`/auth`)

- `POST /register`
- `POST /login`
- `POST /verify-email`
- `POST /resend-verification`
- `POST /forgot-password`
- `POST /reset-password`
- `GET /profile`
- `PUT /profile`
- `PUT /profile/image`
- `PUT /change-password`
- `PUT /profile/username`
- `POST /profile/username/confirm`
- `PUT /profile/phone`
- `POST /profile/phone/confirm`
- `POST /deactivate`
- `POST /deactivate/confirm`
- `POST /activate`
- `POST /activate/confirm`
- `POST /logout`

### Users (`/users`)

- `GET /`
- `POST /`
- `GET /:userId`
- `PUT /:userId`
- `DELETE /:userId`
- `PUT /:userId/role`
- `GET /:userId/roles`
- `GET /by-role/:roleName`
- `PATCH /deactivate/:userId`

## Ejemplos

### Registro

```bash
curl -X POST http://localhost:3006/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Roberto",
    "surname":"Perez",
    "username":"robertop",
    "email":"roberto@example.com",
    "password":"Pass1234!",
    "phone":"12345678"
  }'
```

### Login

```bash
curl -X POST http://localhost:3006/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername":"roberto@example.com",
    "password":"Pass1234!"
  }'
```

### Ver perfil con token

```bash
curl -X GET http://localhost:3006/api/v1/auth/profile \
  -H "Authorization: Bearer TU_JWT"
```

## Health check

```bash
curl http://localhost:3006/api/v1/health
```

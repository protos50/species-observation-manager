# Documentación de Seguridad

## Índice

Esta carpeta contiene la documentación completa sobre la implementación de seguridad en el sistema backend (NestJS) y frontend (Next.js).

---

## Documentos Disponibles

### 1. [authentication.md](./authentication.md)
**Autenticación y Autorización de Endpoints**

- JWT (JSON Web Tokens)
- Guards y protección de rutas
- Estrategias de Passport
- Roles y permisos
- Refresh tokens
- Manejo de errores 401/403

### 2. [password_hashing.md](./password_hashing.md)
**Hasheo Seguro de Contraseñas**

- Bcrypt y salt automático
- Salt rounds (complejidad)
- Validación de contraseñas
- Reset de contraseña por email
- Migraciones de passwords
- Buenas prácticas

### 3. [frontend_integration.md](./frontend_integration.md)
**Integración con Next.js**

- Almacenamiento de tokens (localStorage/cookies)
- Axios interceptors
- Contexto de autenticación
- Protección de páginas
- Refresh automático de tokens
- Flujo completo de autenticación

---

## Resumen Ejecutivo

### Arquitectura de Seguridad

```
┌─────────────────┐
│   Next.js       │ ← Usuario ingresa credenciales
│   (Frontend)    │
└────────┬────────┘
         │ POST /auth/login { email, password }
         ▼
┌─────────────────┐
│   NestJS        │ ← Valida credenciales
│   (Backend)     │ ← Hash password con bcrypt
└────────┬────────┘
         │ Devuelve { access_token, refresh_token, user }
         ▼
┌─────────────────┐
│  localStorage   │ ← Guarda tokens
│  /cookies       │
└────────┬────────┘
         │
         │ Requests a endpoints protegidos
         ▼
┌─────────────────┐
│   Authorization │ ← Header: Bearer <JWT>
│   Header        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   JwtAuthGuard  │ ← Valida token
│   (Backend)     │ ← Extrae user de payload
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Controller    │ ← Acceso permitido
│   @UseGuards    │
└─────────────────┘
```

### Tecnologías Utilizadas

- **Backend (NestJS):**
  - `@nestjs/jwt` - Generación y validación de tokens
  - `@nestjs/passport` - Estrategias de autenticación
  - `passport-jwt` - Estrategia JWT
  - `bcrypt` - Hasheo de contraseñas

- **Frontend (Next.js):**
  - `axios` - HTTP client con interceptors
  - `cookie` - Manejo de cookies httpOnly
  - React Context - Estado global de autenticación

---

## Guía Rápida

### Para Desarrolladores Backend

1. **Proteger un endpoint:**
   ```typescript
   @UseGuards(JwtAuthGuard)
   @Get('profile')
   getProfile(@CurrentUser() user: User) { }
   ```

2. **Proteger por roles:**
   ```typescript
   @UseGuards(JwtAuthGuard, RolesGuard)
   @Roles('admin')
   @Get('users')
   getAllUsers() { }
   ```

3. **Hashear contraseña:**
   ```typescript
   const hashed = await bcrypt.hash(password, 10);
   ```

### Para Desarrolladores Frontend

1. **Login:**
   ```typescript
   const { login } = useAuth();
   await login(email, password);
   ```

2. **Request protegido:**
   ```typescript
   import api from '@/lib/api/axios';
   const { data } = await api.get('/users/profile');
   ```

3. **Proteger página:**
   ```typescript
   export default withAuth(DashboardPage);
   ```

---

## Checklist de Seguridad

### Backend

- [x] JWT implementado con secret seguro (32+ chars)
- [x] Access token expira en 15min
- [x] Refresh token expira en 7 días
- [x] Passwords hasheados con bcrypt (10 rounds)
- [x] Guards aplicados a endpoints sensibles
- [x] Validación de roles implementada
- [x] Manejo de errores 401/403
- [ ] Rate limiting en /auth/login
- [ ] CORS configurado correctamente
- [ ] Helmet.js para headers seguros

### Frontend

- [x] Tokens almacenados de forma segura
- [x] Axios interceptor agrega token automáticamente
- [x] Refresh automático de tokens
- [x] Páginas protegidas con middleware/HOC
- [x] Logout limpia tokens
- [ ] Cookies httpOnly en producción
- [ ] HTTPS en producción
- [ ] XSS prevention (sanitización inputs)

---

## Variables de Entorno Requeridas

### Backend (.env)

```env
# JWT
JWT_SECRET=your_secret_key_minimum_32_characters
JWT_REFRESH_SECRET=your_refresh_secret_key_different

# Bcrypt
BCRYPT_ROUNDS=10

# Base de datos
DATABASE_URL=postgresql://user:pass@localhost:5432/db
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## Endpoints de Autenticación

| Método | Ruta | Descripción | Requiere Auth |
|--------|------|-------------|---------------|
| POST | `/auth/register` | Crear cuenta | No |
| POST | `/auth/login` | Iniciar sesión | No |
| POST | `/auth/refresh` | Renovar tokens | No (requiere refresh_token) |
| POST | `/auth/logout` | Cerrar sesión | Sí |
| GET | `/users/profile` | Obtener perfil | Sí |
| PATCH | `/users/profile` | Actualizar perfil | Sí |
| POST | `/users/change-password` | Cambiar contraseña | Sí |
| POST | `/auth/reset-password` | Solicitar reset | No |
| POST | `/auth/reset-password/confirm` | Confirmar reset | No |

---

## Testing

### Test de Autenticación

```bash
# Backend
npm run test src/auth/auth.service.spec.ts

# Frontend
npm run test src/__tests__/auth.test.tsx
```

### Probar Endpoints Manualmente

```bash
# Login
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"Password123!"}'

# Usar token
curl http://localhost:4000/users/profile \
  -H "Authorization: Bearer <TOKEN>"
```

---

## Troubleshooting

### Error 401 Unauthorized

**Causa:** Token inválido, expirado o no enviado  
**Solución:** Verificar que el header `Authorization: Bearer <token>` esté presente y el token sea válido

### Error 403 Forbidden

**Causa:** Token válido pero sin permisos (roles)  
**Solución:** Verificar que el usuario tenga el rol requerido

### CSRF token mismatch (frontend)

**Causa:** Token CSRF no coincide entre frontend y backend  
**Solución:** Asegurar que las cookies se envíen con cada request (credentials: 'include')

### Password no se hashea

**Causa:** Middleware o hook no se ejecuta  
**Solución:** Verificar que el hook `@BeforeInsert()` o middleware de Prisma esté registrado

---

## Próximas Mejoras

- [ ] Implementar 2FA (autenticación de dos factores)
- [ ] OAuth2 (Google, GitHub)
- [ ] Rate limiting avanzado
- [ ] Audit logs de sesiones
- [ ] IP whitelisting para endpoints admin
- [ ] Detección de dispositivos sospechosos

---

## Referencias

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [JWT.io](https://jwt.io/)
- [NestJS Security](https://docs.nestjs.com/security/authentication)
- [Next.js Authentication](https://nextjs.org/docs/authentication)

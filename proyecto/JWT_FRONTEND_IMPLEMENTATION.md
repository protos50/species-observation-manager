# JWT Authentication - Frontend Implementation

## ✅ Cambios Implementados

### 1. **config.ts - Soporte JWT Automático**
- ✅ `createHeaders()` ahora incluye automáticamente el token JWT
- ✅ El token se obtiene de la sesión de NextAuth
- ✅ Funciona tanto en server-side como client-side
- ✅ Redirección automática a login en caso de 401

### 2. **observations.ts - Completamente Actualizado**
- ✅ Todas las llamadas fetch() incluyen JWT token
- ✅ Usa `headers: await createHeaders()`
- ✅ GET, POST, PATCH, DELETE protegidos

### 3. **Otros Archivos API - Imports Agregados**
Los siguientes archivos ya tienen el import necesario:
- ✅ collection.ts
- ✅ contact.ts
- ✅ dashboard.api.ts
- ✅ geolocation.ts
- ✅ location.ts
- ✅ preservation.ts
- ✅ roles.ts
- ✅ service.ts
- ✅ taxonomy.ts
- ✅ traps.ts
- ✅ users.ts

## ⚠️ Acción Requerida

Cada archivo API necesita actualizar sus llamadas `fetch()` para incluir headers:

**Antes:**
```typescript
const response = await fetch(`${API_BASE_URL}/taxon`, {
  cache: "no-store"
});
```

**Después:**
```typescript
const response = await fetch(`${API_BASE_URL}/taxon`, {
  cache: "no-store",
  headers: await createHeaders()
});
```

## 🔧 Cómo Funciona

### Server-Side (SSR/SSG):
```typescript
// config.ts usa auth() de NextAuth
const session = await auth();
if (session?.user?.accessToken) {
  headers["Authorization"] = `Bearer ${session.user.accessToken}`;
}
```

### Client-Side:
```typescript
// config.ts consulta /api/auth/session
const response = await fetch("/api/auth/session");
const session = await response.json();
return session?.user?.accessToken || null;
```

## 🧪 Testing

### 1. Login funciona:
```bash
# El login debe devolver tokens
curl -X POST http://localhost:3000/api/auth/callback/credentials \
  -d 'email=user@example.com&password=password'
```

### 2. Dashboard carga datos:
- Ve a http://localhost:3000/dashboard
- Abre DevTools → Network
- Verifica que requests tengan header `Authorization: Bearer ...`

### 3. Manejo de 401:
- Si el token expira o es inválido
- Debe redirigir automáticamente a `/` (login)

## 📋 Checklist de Integración

- [x] config.ts actualizado con JWT
- [x] observations.ts actualizado completamente
- [ ] Actualizar resto de archivos API con headers
- [ ] Probar login → dashboard flow
- [ ] Verificar headers en Network tab
- [ ] Test 401 redirect
- [ ] Deploy a producción

## 🚀 Próximos Pasos

1. **Probar localmente:**
   ```bash
   npm run dev
   # Iniciar sesión
   # Navegar a dashboard/observaciones
   # Verificar que carga datos
   ```

2. **Verificar Network Tab:**
   - Todos los requests deben tener `Authorization` header
   - Token debe comenzar con `eyJ...`

3. **Actualizar archivos API restantes** (si es necesario):
   - Agregar `headers: await createHeaders()` en cada fetch

4. **Deploy:**
   ```bash
   bash deploy_front.sh
   ```

## 🔒 Seguridad

- ✅ Token JWT en Authorization header
- ✅ NextAuth maneja refresh de sesión
- ✅ Redirect automático en 401
- ✅ No se exponen tokens en URLs
- ✅ HTTPS en producción

## ⚠️ Notas Importantes

1. **Backend debe estar corriendo** con JWT guards activos
2. **Tokens expiran** - NextAuth maneja el refresh
3. **Rol "admin" temporal** - todos los usuarios tienen acceso por ahora
4. **CORS configurado** para localhost:3000 y producción

## 📞 Troubleshooting

### Error: "No token provided"
- Verifica que estás logueado
- Revisa que NextAuth esté retornando accessToken
- Check console para errores de sesión

### Error: "Invalid or expired token"
- El token del backend expiró (20s en dev)
- Cierra sesión y vuelve a iniciar
- Considera aumentar expiración en producción

### Headers no se envían
- Verifica que usas `await createHeaders()`
- Check que el import esté correcto
- Revisa Network tab para confirmar

# Autenticación y Autorización de Endpoints

## Introducción

El backend utiliza **JWT (JSON Web Tokens)** para autenticación stateless. Todos los endpoints sensibles están protegidos mediante **Guards** de NestJS.

**Estado anterior:** Endpoints públicos sin autenticación  
**Estado actual:** Sistema JWT completo con guards y validación de roles

---

## Arquitectura JWT

### Flujo de Autenticación

```
1. Login → Backend valida credenciales → Genera JWT
2. Cliente guarda JWT (localStorage/cookie)
3. Request a endpoint protegido → Header: Authorization: Bearer <JWT>
4. Backend valida JWT → Permite/Rechaza acceso
```

### Configuración

**Archivo:** `src/auth/auth.module.ts`

```typescript
JwtModule.register({
  secret: process.env.JWT_SECRET,
  signOptions: { expiresIn: '15m' }
})
```

**Variables de entorno:**
```env
JWT_SECRET=your_secret_key_minimum_32_characters
JWT_REFRESH_SECRET=refresh_secret_key
```

---

## Guards (Protección de Rutas)

### JwtAuthGuard

**Archivo:** `src/auth/guards/jwt-auth.guard.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

### Uso en Controladores

**Proteger controlador completo:**
```typescript
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  // Todos los métodos requieren JWT
}
```

**Proteger endpoints específicos:**
```typescript
@Controller('posts')
export class PostsController {
  
  @Get()
  findAll() { } // Público
  
  @Post()
  @UseGuards(JwtAuthGuard)
  create() { } // Protegido
}
```

---

## JWT Strategy

**Archivo:** `src/auth/strategies/jwt.strategy.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    return { 
      id: payload.sub, 
      email: payload.email,
      roles: payload.roles 
    };
  }
}
```

---

## Endpoints de Autenticación

### Login

**Request:**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Refresh Token

**Request:**
```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:**
```json
{
  "access_token": "nuevo_token...",
  "refresh_token": "nuevo_refresh..."
}
```

---

## Roles y Permisos

### RolesGuard

**Archivo:** `src/auth/guards/roles.guard.ts`

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles', 
      context.getHandler()
    );
    
    if (!requiredRoles) return true;
    
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some(role => user.roles?.includes(role));
  }
}
```

### Decorador de Roles

**Archivo:** `src/auth/decorators/roles.decorator.ts`

```typescript
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
```

### Uso

```typescript
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  
  @Get('users')
  @Roles('admin')
  getAllUsers() {
    // Solo usuarios con rol 'admin'
  }
  
  @Get('stats')
  @Roles('admin', 'moderator')
  getStats() {
    // Admin o moderator
  }
}
```

---

## Obtener Usuario Autenticado

### Decorador CurrentUser

**Archivo:** `src/auth/decorators/current-user.decorator.ts`

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

### Ejemplo de Uso

```typescript
@Get('profile')
@UseGuards(JwtAuthGuard)
getProfile(@CurrentUser() user: User) {
  return {
    id: user.id,
    email: user.email
  };
}
```

---

## Buenas Prácticas

### 1. Tiempos de Expiración

```typescript
// Access token: corto (15min)
access_token: { expiresIn: '15m' }

// Refresh token: largo (7 días)
refresh_token: { expiresIn: '7d' }
```

### 2. Secrets Seguros

- Mínimo 32 caracteres
- Generados aleatoriamente
- Nunca commitear en Git
- Usar variables de entorno

```bash
# Generar secret seguro
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Validaciones

```typescript
// Validar siempre en Guards
if (!user || !user.roles) {
  throw new UnauthorizedException();
}

// Verificar expiración
if (payload.exp < Date.now() / 1000) {
  throw new UnauthorizedException('Token expired');
}
```

### 4. Rate Limiting

```typescript
// Instalar: npm install @nestjs/throttler
@UseGuards(ThrottlerGuard)
@Post('login')
login() { }
```

---

## Manejo de Errores

### Códigos HTTP

- **401 Unauthorized**: Token inválido/expirado
- **403 Forbidden**: Token válido pero sin permisos
- **400 Bad Request**: Credenciales incorrectas

### Excepciones

```typescript
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';

// Token inválido
throw new UnauthorizedException('Invalid token');

// Sin permisos
throw new ForbiddenException('Insufficient permissions');
```

---

## Testing

### Ejemplo de Test con JWT

```typescript
describe('Protected Endpoint', () => {
  it('should return 401 without token', async () => {
    const response = await request(app.getHttpServer())
      .get('/users/profile')
      .expect(401);
  });
  
  it('should return user data with valid token', async () => {
    const token = generateTestToken();
    
    const response = await request(app.getHttpServer())
      .get('/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
      
    expect(response.body).toHaveProperty('email');
  });
});
```

---

## Referencias

- [NestJS Authentication](https://docs.nestjs.com/security/authentication)
- [Passport JWT](http://www.passportjs.org/packages/passport-jwt/)
- [JWT.io](https://jwt.io/)

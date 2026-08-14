# Hasheo de Contraseñas

## Introducción

**Nunca almacenar contraseñas en texto plano.** El backend utiliza **bcrypt** para hashear contraseñas con salt automático, garantizando que incluso contraseñas idénticas generen hashes diferentes.

---

## Bcrypt

### ¿Por qué bcrypt?

- **Salt automático**: Genera salt único por contraseña
- **Slow by design**: Resistente a ataques de fuerza bruta
- **Configurable**: Ajustar complejidad (rounds)
- **Estándar de industria**: Ampliamente probado

### Instalación

```bash
npm install bcrypt
npm install --save-dev @types/bcrypt
```

---

## Implementación

### Hashear Contraseña al Crear Usuario

**Archivo:** `src/users/users.service.ts`

```typescript
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  
  async create(createUserDto: CreateUserDto) {
    const saltRounds = 10; // Recomendado: 10-12
    
    const hashedPassword = await bcrypt.hash(
      createUserDto.password, 
      saltRounds
    );
    
    const user = await this.userRepository.save({
      ...createUserDto,
      password: hashedPassword // Guardar hash, no texto plano
    });
    
    // Nunca devolver el hash al cliente
    delete user.password;
    return user;
  }
}
```

### Validar Contraseña en Login

**Archivo:** `src/auth/auth.service.ts`

```typescript
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  
  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    // Comparar password con hash
    const isPasswordValid = await bcrypt.compare(
      password, 
      user.password
    );
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    // No devolver password
    const { password: _, ...result } = user;
    return result;
  }
}
```

---

## Salt Rounds (Complejidad)

### ¿Qué es saltRounds?

Número de iteraciones del algoritmo. A mayor rounds → más seguro pero más lento.

### Recomendaciones

```typescript
// Desarrollo/Testing
const saltRounds = 8; // Más rápido

// Producción
const saltRounds = 10; // Balance seguridad/performance

// Alta seguridad
const saltRounds = 12; // Más lento pero más seguro
```

### Benchmark

```
Rounds | Time (approx)
-------|---------------
  8    | ~40 ms
 10    | ~150 ms
 12    | ~600 ms
 14    | ~2.5 s
```

**Objetivo**: Que cada hash tome ~100-300ms.

---

## Hooks de Prisma (Opcional)

Si usás Prisma, podés automatizar el hasheo con middleware:

**Archivo:** `prisma/middleware/hash-password.middleware.ts`

```typescript
import * as bcrypt from 'bcrypt';

export const hashPasswordMiddleware = async (params: any, next: any) => {
  if (params.model === 'User') {
    if (params.action === 'create' || params.action === 'update') {
      const user = params.args.data;
      
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
  
  return next(params);
};
```

**Registrar middleware:**

```typescript
// main.ts o app.module.ts
prisma.$use(hashPasswordMiddleware);
```

---

## Cambio de Contraseña

**Archivo:** `src/users/users.service.ts`

```typescript
async changePassword(userId: number, oldPassword: string, newPassword: string) {
  const user = await this.findOne(userId);
  
  // Validar contraseña actual
  const isValid = await bcrypt.compare(oldPassword, user.password);
  
  if (!isValid) {
    throw new BadRequestException('Current password is incorrect');
  }
  
  // Hash de nueva contraseña
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  // Actualizar
  await this.userRepository.update(userId, {
    password: hashedPassword
  });
  
  return { message: 'Password updated successfully' };
}
```

---

## Reset de Contraseña (Email)

### Flujo

```
1. Usuario solicita reset → Backend genera token temporal
2. Backend envía email con link: /reset-password?token=xxx
3. Usuario ingresa nueva contraseña
4. Backend valida token y actualiza contraseña
```

### Implementación

**Generar token temporal:**

```typescript
async requestPasswordReset(email: string) {
  const user = await this.usersService.findByEmail(email);
  
  if (!user) {
    // No revelar si el email existe
    return { message: 'If email exists, reset link sent' };
  }
  
  // Token temporal (expira en 1 hora)
  const resetToken = this.jwtService.sign(
    { sub: user.id, type: 'password-reset' },
    { expiresIn: '1h' }
  );
  
  // Guardar token hasheado en DB
  await this.usersService.saveResetToken(user.id, resetToken);
  
  // Enviar email
  await this.emailService.sendPasswordResetEmail(user.email, resetToken);
  
  return { message: 'Password reset email sent' };
}
```

**Validar y cambiar contraseña:**

```typescript
async resetPassword(token: string, newPassword: string) {
  // Validar token JWT
  let payload;
  try {
    payload = this.jwtService.verify(token);
  } catch {
    throw new BadRequestException('Invalid or expired token');
  }
  
  if (payload.type !== 'password-reset') {
    throw new BadRequestException('Invalid token type');
  }
  
  // Verificar que el token coincida con el guardado
  const user = await this.usersService.findOne(payload.sub);
  const tokenMatches = await this.usersService.verifyResetToken(
    user.id, 
    token
  );
  
  if (!tokenMatches) {
    throw new BadRequestException('Token already used or invalid');
  }
  
  // Hash nueva contraseña
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  // Actualizar y invalidar token
  await this.usersService.update(user.id, { password: hashedPassword });
  await this.usersService.invalidateResetToken(user.id);
  
  return { message: 'Password reset successfully' };
}
```

---

## Validación de Contraseñas

### Reglas Recomendadas

- Mínimo 8 caracteres
- Al menos 1 mayúscula
- Al menos 1 minúscula
- Al menos 1 número
- Al menos 1 carácter especial

### class-validator

```bash
npm install class-validator
```

**DTO:**

```typescript
import { IsString, MinLength, Matches } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    { message: 'Password too weak' }
  )
  password: string;
}
```

---

## Buenas Prácticas

### ❌ NO Hacer

```typescript
// ❌ Texto plano
user.password = 'password123';

// ❌ Encodear (NO es hashear)
user.password = Buffer.from('password123').toString('base64');

// ❌ MD5/SHA1 sin salt
user.password = crypto.createHash('md5').update('password123').digest('hex');

// ❌ Salt fijo
const salt = 'mi-salt-secreto';
user.password = bcrypt.hashSync('password123', salt);

// ❌ Devolver hash al cliente
return { user: { id: 1, email: '...', password: '$2b$10$...' } };
```

### ✅ Hacer

```typescript
// ✅ bcrypt con salt automático
const hashedPassword = await bcrypt.hash(password, 10);

// ✅ Eliminar password de respuestas
delete user.password;
// o usar select en Prisma:
prisma.user.findMany({ select: { id: true, email: true } });

// ✅ Variables de entorno para salt rounds
const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;

// ✅ Rate limiting en login
@UseGuards(ThrottlerGuard)
@Post('login')

// ✅ Nunca loguear passwords
// ❌ logger.log(`User password: ${password}`);
// ✅ logger.log(`Login attempt for: ${email}`);
```

---

## Migraciones (Si ya tenés usuarios)

Si tenés usuarios con passwords en texto plano, debés migrarlos:

```typescript
async migratePasswordsToHash() {
  const users = await this.userRepository.find();
  
  for (const user of users) {
    // Detectar si ya está hasheado (bcrypt empieza con $2b$)
    if (!user.password.startsWith('$2b$')) {
      const hashed = await bcrypt.hash(user.password, 10);
      await this.userRepository.update(user.id, { password: hashed });
    }
  }
  
  console.log(`Migrated ${users.length} passwords`);
}
```

**IMPORTANTE:** Ejecutar esto UNA SOLA VEZ, luego borrar o comentar el código.

---

## Testing

```typescript
describe('Password Hashing', () => {
  it('should hash password on user creation', async () => {
    const dto = { email: 'test@test.com', password: 'Password123!' };
    const user = await service.create(dto);
    
    // Password debe estar hasheado
    expect(user.password).not.toBe(dto.password);
    expect(user.password).toMatch(/^\$2b\$/);
  });
  
  it('should validate correct password', async () => {
    const password = 'Password123!';
    const user = await service.create({ email: 'test@test.com', password });
    
    const isValid = await bcrypt.compare(password, user.password);
    expect(isValid).toBe(true);
  });
  
  it('should reject incorrect password', async () => {
    const user = await service.create({ 
      email: 'test@test.com', 
      password: 'Password123!' 
    });
    
    const isValid = await bcrypt.compare('WrongPassword', user.password);
    expect(isValid).toBe(false);
  });
});
```

---

## Referencias

- [bcrypt npm](https://www.npmjs.com/package/bcrypt)
- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [NestJS Security Best Practices](https://docs.nestjs.com/security/encryption-and-hashing)

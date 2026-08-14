# Integración Frontend (Next.js) - Manejo de Tokens JWT

## Introducción

Modificaciones realizadas en Next.js para manejar **tokens JWT** que devuelve el backend.

**Antes:** Sin autenticación  
**Ahora:** Sistema completo con JWT, refresh tokens y manejo de sesiones

---

## 1. Almacenamiento de Tokens

### localStorage (desarrollo)

```typescript
// Guardar
localStorage.setItem('access_token', token);
localStorage.setItem('refresh_token', refreshToken);

// Leer
const token = localStorage.getItem('access_token');

// Eliminar (logout)
localStorage.removeItem('access_token');
localStorage.removeItem('refresh_token');
```

### Cookies httpOnly (producción)

```typescript
// pages/api/auth/login.ts
import { serialize } from 'cookie';

res.setHeader('Set-Cookie', [
  serialize('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 900, // 15 min
    path: '/',
  })
]);
```

---

## 2. Axios Interceptor (Agregar Token Automáticamente)

**Archivo:** `lib/api/axios.ts`

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
});

// Request interceptor: agregar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: manejar 401 (token expirado)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Si es 401 y no hemos reintentado
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Intentar refresh token
        const refreshToken = localStorage.getItem('refresh_token');
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          { refresh_token: refreshToken }
        );
        
        // Guardar nuevos tokens
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        
        // Reintentar request original
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh falló, redirigir a login
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

---

## 3. Contexto de Autenticación

**Archivo:** `contexts/AuthContext.tsx`

```typescript
import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api/axios';

interface User {
  id: number;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Verificar si hay token al cargar
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchUser();
    }
  }, []);

  async function fetchUser() {
    try {
      const { data } = await api.get('/users/profile');
      setUser(data);
    } catch {
      localStorage.clear();
    }
  }

  async function login(email: string, password: string) {
    const { data } = await api.post('/auth/login', { email, password });
    
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    setUser(data.user);
  }

  function logout() {
    localStorage.clear();
    setUser(null);
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        logout, 
        isAuthenticated: !!user 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

**Uso en `_app.tsx`:**

```typescript
import { AuthProvider } from '@/contexts/AuthContext';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
```

---

## 4. Proteger Páginas

### Middleware de Next.js

**Archivo:** `middleware.ts`

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith('/login');
  const isProtectedPage = request.nextUrl.pathname.startsWith('/dashboard');

  if (!token && isProtectedPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
```

### Higher-Order Component (HOC)

**Archivo:** `components/withAuth.tsx`

```typescript
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

export function withAuth(Component: any) {
  return function ProtectedRoute(props: any) {
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isAuthenticated) {
        router.push('/login');
      }
    }, [isAuthenticated, router]);

    return isAuthenticated ? <Component {...props} /> : null;
  };
}
```

**Uso:**

```typescript
// pages/dashboard.tsx
import { withAuth } from '@/components/withAuth';

function Dashboard() {
  return <div>Protected Dashboard</div>;
}

export default withAuth(Dashboard);
```

---

## 5. Componente de Login

**Archivo:** `pages/login.tsx`

```typescript
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit">Login</button>
    </form>
  );
}
```

---

## 6. Ejemplo de Request Protegido

### Antes (sin autenticación)

```typescript
const response = await fetch('http://localhost:4000/users/profile');
const data = await response.json();
```

### Ahora (con JWT)

```typescript
import api from '@/lib/api/axios';

// El interceptor agrega automáticamente el header Authorization
const { data } = await api.get('/users/profile');
console.log(data);
```

---

## 7. Logout

```typescript
import { useAuth } from '@/contexts/AuthContext';

function LogoutButton() {
  const { logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push('/login');
  }

  return <button onClick={handleLogout}>Logout</button>;
}
```

---

## 8. Variables de Entorno

**Archivo:** `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## Resumen de Cambios

### Archivos Creados/Modificados

```
proyecto/
├── lib/
│   └── api/
│       └── axios.ts              (NUEVO: interceptor)
├── contexts/
│   └── AuthContext.tsx           (NUEVO: contexto auth)
├── components/
│   └── withAuth.tsx              (NUEVO: HOC protección)
├── pages/
│   ├── _app.tsx                  (MODIFICADO: AuthProvider)
│   ├── login.tsx                 (NUEVO: página login)
│   └── dashboard.tsx             (MODIFICADO: protegido)
├── middleware.ts                 (NUEVO: protección rutas)
└── .env.local                    (NUEVO: variables)
```

### Flujo Completo

```
1. Usuario entra a /login
2. Ingresa credenciales
3. Next.js → POST /auth/login → Backend
4. Backend valida y devuelve { access_token, refresh_token, user }
5. Next.js guarda tokens en localStorage
6. Usuario navega a /dashboard (protegido)
7. Next.js (axios interceptor) agrega: Authorization: Bearer <token>
8. Backend valida JWT → permite acceso
9. Si token expira (401) → interceptor usa refresh_token
10. Si refresh falla → redirect a /login
```

---

## Referencias

- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Axios Interceptors](https://axios-http.com/docs/interceptors)
- [JWT Best Practices](https://hasura.io/blog/best-practices-of-using-jwt-with-graphql/)

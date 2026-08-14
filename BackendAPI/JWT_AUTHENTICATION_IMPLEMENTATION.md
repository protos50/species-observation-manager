# JWT Authentication Implementation

## 🔐 Security Enhancement

Implemented JWT authentication guards to protect all API endpoints from unauthorized access.

## ✅ Implementation Overview

### 1. **Global JWT Authentication Guard**
- Applied globally to ALL endpoints by default
- Validates JWT tokens in Authorization header
- Format: `Authorization: Bearer <token>`
- Automatically rejects requests without valid tokens

### 2. **Public Decorator**
- Marks specific endpoints as publicly accessible
- Only applied to login and register endpoints
- All other endpoints require authentication

### 3. **Role-Based Access Control (RBAC)**
- Admin-only endpoints protected with `@Roles('admin')`
- User management restricted to admin users
- Extensible for future role requirements

## 📁 Files Created/Modified

### New Files:
1. **`src/auth/guards/jwt-auth.guard.ts`**
   - Main authentication guard
   - Validates JWT tokens
   - Extracts user info from token

2. **`src/auth/decorators/public.decorator.ts`**
   - Marks endpoints as public
   - Bypasses authentication

3. **`src/auth/decorators/roles.decorator.ts`**
   - Specifies required roles

4. **`src/auth/guards/roles.guard.ts`**
   - Validates user roles
   - Works with JWT guard

### Modified Files:
1. **`src/main.ts`**
   - Applied global JWT guard
   - Guards ALL endpoints by default

2. **`src/auth/auth.controller.ts`**
   - Added `@Public()` to login/register
   - These remain accessible without token

3. **`src/users/users.controller.ts`**
   - Added `@Roles('admin')` protection
   - Only admins can manage users

## 🛡️ Security Architecture

```
Request → JWT Guard → Role Guard → Controller → Service
           ↓              ↓
        No token?     Wrong role?
           ↓              ↓
         401            403
```

## 📋 Protected Endpoints

### Public Endpoints (No Auth Required):
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Protected Endpoints (Auth Required):
All other endpoints including:
- `GET /api/observation` ✅
- `GET /api/taxon` ✅
- `GET /api/locality` ✅
- `GET /api/collection` ✅
- `GET /api/geolocation` ✅
- etc.

### Admin-Only Endpoints:
- `GET /api/users` - List all users
- `POST /api/users` - Create user
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/deleted` - View deleted users
- `PATCH /api/users/:id/restore` - Restore user

## 🔧 How It Works

### Authentication Flow:
1. User logs in via `POST /api/auth/login`
2. Receives JWT token in response
3. Includes token in all subsequent requests
4. Guard validates token on each request
5. Request proceeds if valid, rejected if not

### Token Format:
```javascript
// Request header
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Token Payload:
```javascript
{
  "username": "user@example.com",
  "sub": {
    "name": "John Doe",
    "role": "admin"  // or "user"
  },
  "iat": 1728525741,
  "exp": 1728529341
}
```

## 🧪 Testing the Implementation

### 1. Test Unprotected Access (Should Fail):
```bash
# This should now return 401 Unauthorized
curl http://localhost:4000/api/users
```

Response:
```json
{
  "statusCode": 401,
  "message": "No token provided",
  "error": "Unauthorized"
}
```

### 2. Login to Get Token:
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

Response:
```json
{
  "user": { ... },
  "backendTokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 1728529341000
  }
}
```

### 3. Access Protected Endpoint with Token:
```bash
curl http://localhost:4000/api/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

Now returns user data! ✅

## 🚀 Frontend Integration

Update your frontend API calls to include the token:

```typescript
// Example: Frontend API service
const apiCall = async (endpoint: string, options = {}) => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers,
    },
  });
  
  if (response.status === 401) {
    // Token expired or invalid
    // Redirect to login
    window.location.href = '/login';
  }
  
  return response;
};
```

## 📊 Security Benefits

1. **No More Public Data Exposure** ✅
   - All sensitive data protected
   - User list no longer publicly accessible
   - Observations require authentication

2. **Role-Based Access** ✅
   - Admin functions restricted
   - Scalable for future roles
   - Clear permission boundaries

3. **Token Expiration** ✅
   - Tokens expire after set time
   - Reduces risk of token theft
   - Forces re-authentication

4. **Stateless Authentication** ✅
   - No server-side sessions
   - Scalable architecture
   - Works across multiple servers

## ⚠️ Important Notes

### Token Expiration:
- Current setting: 20 seconds (development)
- Production recommendation: 1-24 hours
- Refresh token: 7 days

### CORS Configuration:
Already configured for:
- `http://localhost:3000` (development)
- `https://192-99-145-175.sslip.io` (production)

### Environment Variables:
Ensure these are set:
```env
jwtSecretKey=your-secret-key-here
jwtRefreshToken=your-refresh-secret-here
```

## 🔄 Next Steps

1. **Update Frontend:**
   - Store tokens securely
   - Add token to all API calls
   - Handle 401 responses

2. **Test All Endpoints:**
   - Verify protection works
   - Test role restrictions
   - Confirm public endpoints

3. **Deploy to Production:**
   - Update production environment
   - Test with production frontend
   - Monitor for issues

## 📝 Quick Reference

| Endpoint | Auth Required | Role Required | Notes |
|----------|--------------|---------------|-------|
| POST /api/auth/login | ❌ | - | Public |
| POST /api/auth/register | ❌ | - | Public |
| GET /api/users | ✅ | admin | Protected |
| GET /api/observation | ✅ | - | Auth only |
| POST /api/observation | ✅ | - | Auth only |
| All other endpoints | ✅ | - | Auth required |

## 🎯 Summary

The API is now fully protected with JWT authentication:
- ✅ All endpoints protected by default
- ✅ Only login/register are public
- ✅ Admin endpoints restricted by role
- ✅ No more public data exposure
- ✅ Ready for production deployment

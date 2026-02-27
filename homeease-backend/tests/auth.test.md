# HomEase Authentication API Testing

## Base URL
```
http://localhost:5000/api/auth
```

---

## 1. User Registration (Customer)

**Endpoint:** `POST /api/auth/register/user`

**Request Body:**
```json
{
  "name": "Test User",
  "email": "testuser@example.com",
  "password": "Test123456",
  "phone": "+92-300-1234567",
  "address": "Test Address",
  "city": "Karachi"
}
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "Test User",
      "email": "testuser@example.com",
      "role": "CUSTOMER"
    },
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

---

## 2. Provider Registration

**Endpoint:** `POST /api/auth/register/provider`

**Request Body:**
```json
{
  "name": "Test Provider",
  "email": "testprovider@example.com",
  "password": "Test123456",
  "phone": "+92-311-1111111",
  "bio": "Professional service provider",
  "experience": 5,
  "address": "Provider Address",
  "city": "Lahore",
  "location": "DHA",
  "services": ["service-uuid-1", "service-uuid-2"]
}
```

---

## 3. Login (Any Role)

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "umar.farooq@example.com",
  "password": "demo123"
}
```

**With Role Specified:**
```json
{
  "email": "ahmed.khan@example.com",
  "password": "demo123",
  "role": "PROVIDER"
}
```

---

## 4. Get Profile (Protected)

**Endpoint:** `GET /api/auth/profile`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## 5. Refresh Token

**Endpoint:** `POST /api/auth/refresh-token`

**Request Body:**
```json
{
  "refreshToken": "your-refresh-token"
}
```

---

## 6. Logout

**Endpoint:** `POST /api/auth/logout`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## Demo Accounts (Already Seeded)

### Customers:
- **Email:** umar.farooq@example.com | **Password:** demo123
- **Email:** fahad.noor@example.com | **Password:** demo123

### Providers:
- **Email:** ahmed.khan@example.com | **Password:** demo123
- **Email:** muhammad.ali@example.com | **Password:** demo123
- **Email:** hassan.raza@example.com | **Password:** demo123

### Admin:
- **Email:** admin@homeease.com | **Password:** admin123

---

## Testing with cURL

### Login Test:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"umar.farooq@example.com\",\"password\":\"demo123\"}"
```

### Get Profile Test:
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

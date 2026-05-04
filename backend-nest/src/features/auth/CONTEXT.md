# Auth Feature

## Owns
- `roles` table
- `users` table
- `refresh_tokens` table

## Responsibilities
- User registration & login
- JWT access token + refresh token flow
- Role-based access control (customer / admin)
- Password hashing with bcrypt
- Multi-device session management via refresh_tokens

## Key Rules
- Never store plain passwords — always bcrypt hash
- Refresh token stored as hash in DB (never plain)
- Access token: 15m | Refresh token: 7d (httpOnly cookie)

## Error Codes
- AUTH_001: Invalid credentials
- AUTH_002: Token expired
- AUTH_003: Token invalid
- AUTH_004: Insufficient permissions
- AUTH_005: Email already exists

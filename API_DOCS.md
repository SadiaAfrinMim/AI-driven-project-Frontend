# API Endpoints Documentation

## Base URL: `http://localhost:5000/api/v1`

## Authentication
All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_access_token>
```

---

## 1. Health & Info

### GET `/health`
- **Public**: No authentication required
- **Description**: Check API health status

### GET `/version`
- **Public**: No authentication required
- **Description**: Get API version information

---

## 2. Authentication Routes (`/auth`)

### POST `/auth/register`
- **Public**: No authentication required
- **Body**:
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "bio": "string (optional)",
  "profileImage": "string (optional)"
}
```

### POST `/auth/login`
- **Public**: No authentication required
- **Body**:
```json
{
  "email": "string",
  "password": "string"
}
```

### POST `/auth/refresh-token`
- **Requires**: Refresh token in cookies
- **Description**: Refresh access token

### POST `/auth/logout`
- **Requires**: Authentication
- **Description**: Logout user and clear tokens

---

## 3. User Routes (`/users`)

### GET `/users/profile`
- **Requires**: USER, MANAGER, ADMIN
- **Description**: Get current user profile

### PATCH `/users/profile`
- **Requires**: USER, MANAGER, ADMIN
- **Body**:
```json
{
  "name": "string (optional)",
  "bio": "string (optional)",
  "profileImage": "string (optional)"
}
```

### GET `/users/stats`
- **Requires**: USER, MANAGER, ADMIN
- **Description**: Get user statistics

### DELETE `/users/account`
- **Requires**: USER, MANAGER, ADMIN
- **Description**: Delete user account

### GET `/users/all-users`
- **Requires**: ADMIN only
- **Description**: Get all users (admin only)

### PATCH `/users/update-role`
- **Requires**: ADMIN only
- **Body**:
```json
{
  "userId": "string",
  "role": "USER|MANAGER|ADMIN"
}
```

---

## 4. Items Routes (`/items`)

### GET `/items`
- **Public**: No authentication required
- **Query Parameters**:
  - `search`: string
  - `category`: string
  - `minPrice`: number
  - `maxPrice`: number
  - `location`: string
  - `isAIContent`: boolean
  - `tags`: string (comma-separated)
  - `page`: number
  - `limit`: number
  - `sortBy`: string
  - `sortOrder`: 'asc'|'desc'

### GET `/items/:id`
- **Public**: No authentication required
- **Description**: Get item by ID

### POST `/items`
- **Requires**: MANAGER, ADMIN
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `data`: JSON string with item data
  - `images`: Image files (multiple allowed)
```json
{
  "title": "string",
  "description": "string",
  "price": "number",
  "location": "string",
  "category": "string",
  "tags": "array (optional)",
  "isAIContent": "boolean (optional)"
}
```

### GET `/items/my-items`
- **Requires**: USER, MANAGER, ADMIN
- **Description**: Get current user's items

### PATCH `/items/:id`
- **Requires**: MANAGER, ADMIN
- **Description**: Update item (owner only)

### DELETE `/items/:id`
- **Requires**: ADMIN only
- **Description**: Delete item

---

## 5. Reviews Routes (`/reviews`)

### GET `/reviews`
- **Public**: No authentication required
- **Query Parameters**:
  - `itemId`: string
  - `userId`: string
  - `rating`: number
  - `minRating`: number
  - `maxRating`: number

### GET `/reviews/:id`
- **Public**: No authentication required
- **Description**: Get review by ID

### GET `/reviews/item/:itemId`
- **Public**: No authentication required
- **Description**: Get reviews for specific item

### GET `/reviews/stats/overview`
- **Public**: No authentication required
- **Description**: Get review statistics

### POST `/reviews`
- **Requires**: USER, MANAGER, ADMIN
- **Body**:
```json
{
  "comment": "string",
  "rating": "number (1-5)",
  "itemId": "string"
}
```

### GET `/reviews/user/my-reviews`
- **Requires**: USER, MANAGER, ADMIN
- **Description**: Get current user's reviews

### PATCH `/reviews/:id`
- **Requires**: USER, MANAGER, ADMIN
- **Description**: Update review (owner only)

### DELETE `/reviews/:id`
- **Requires**: MANAGER, ADMIN
- **Description**: Delete review

---

## 6. AI Routes (`/ai`)

### POST `/ai/generate-content`
- **Requires**: USER, MANAGER, ADMIN
- **Body**:
```json
{
  "type": "string",
  "prompt": "string",
  "length": "number (optional)"
}
```

### GET `/ai/recommendations`
- **Requires**: Authentication
- **Query Parameters**:
  - `userId`: string
  - `category`: string
  - `limit`: number

### POST `/ai/chat`
- **Requires**: Authentication
- **Body**:
```json
{
  "message": "string",
  "context": "object (optional)"
}
```

### GET `/ai/analytics`
- **Requires**: ADMIN only
- **Description**: Get AI usage analytics

### POST `/ai/generate-blog`
- **Requires**: Authentication
- **Body**:
```json
{
  "topic": "string",
  "keywords": "array",
  "length": "number"
}
```

### GET `/ai/chat-history`
- **Requires**: Authentication
- **Description**: Get user's chat history

### GET `/ai/insights`
- **Requires**: MANAGER, ADMIN
- **Description**: Get AI insights and analytics

---

## Response Format

All API responses follow this format:

**Success Response:**
```json
{
  "success": true,
  "message": "string",
  "data": "object/array",
  "meta": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "totalPages": "number"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "string",
  "errorDetails": "string or array (optional)"
}
```

---

## Authentication Tokens

- **Access Token**: Valid for 1 day, sent in Authorization header
- **Refresh Token**: Valid for 30 days, stored in httpOnly cookie
- Tokens are automatically refreshed when needed

---

## File Upload

For endpoints that accept file uploads:
- Use `multipart/form-data` content type
- Maximum file size: 10MB per file
- Maximum files: 10 files
- Supported formats: Images only (JPEG, PNG, WebP, etc.)

---

## Pagination

For endpoints that return lists:
- Default page: 1
- Default limit: 10
- Use `page` and `limit` query parameters
- Response includes `meta` object with pagination info
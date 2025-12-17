# Avatar Upload Endpoint Specification

## Endpoint

**POST** `/user/upload-avatar`

## Authentication

Requires JWT authentication token in Authorization header:

```
Authorization: Bearer <accessToken>
```

## Request

### Content-Type

`multipart/form-data`

### Body

- **file** (required): Image file
  - Type: File upload (multipart/form-data)
  - Accepted formats: image/\* (jpg, png, gif, webp, etc.)
  - Maximum file size: 5MB (recommended, but can be adjusted)

### Example Request

```javascript
const formData = new FormData();
formData.append('file', imageFile);

fetch('/user/upload-avatar', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer <token>',
  },
  body: formData,
});
```

## Response

### Success Response (200 OK)

```json
{
  "avatarUrl": "https://example.com/uploads/avatars/user-123-avatar.jpg"
}
```

### Error Responses

#### 400 Bad Request

```json
{
  "message": "Invalid file type. Only image files are allowed."
}
```

or

```json
{
  "message": "File size exceeds maximum allowed size (5MB)."
}
```

#### 401 Unauthorized

```json
{
  "message": "Unauthorized"
}
```

#### 500 Internal Server Error

```json
{
  "message": "Failed to upload avatar"
}
```

## Implementation Notes

1. The endpoint should:

   - Validate that the uploaded file is an image
   - Validate file size (recommend 5MB max)
   - Store the file in a secure location (S3, local storage, etc.)
   - Update the user's `avatarUrl` field in the database
   - Return the new avatar URL

2. File storage recommendations:

   - Use a unique filename (e.g., `user-{userId}-{timestamp}.{ext}`)
   - Store in a dedicated avatars directory
   - Consider using cloud storage (AWS S3, Google Cloud Storage) for production

3. Security considerations:

   - Validate file type (not just extension, check MIME type and file signature)
   - Limit file size to prevent DoS attacks
   - Sanitize filename
   - Consider virus scanning for uploaded files
   - Generate unique filenames to prevent overwriting

4. After successful upload, the user's `avatarUrl` field should be updated in the database to point to the new file location.

## Frontend Implementation

The frontend is already implemented and expects:

- Endpoint: `/user/upload-avatar`
- Method: POST
- Body: FormData with `file` field
- Response: `{ avatarUrl: string }`

The frontend will automatically refresh the user data after successful upload.

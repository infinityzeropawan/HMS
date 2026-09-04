# SKILL: REST API Conventions & OpenAPI Standards

<!-- Source: Extracted REST API Conventions and Header Rules -->

## 1. REST Endpoint Conventions
- All API routes MUST be prefixed with `/api/v1/`.
- Use lowercase plural nouns for resource paths: `/api/v1/patients`, `/api/v1/encounters`.
- OpenAPI 3.0 specification file MUST be updated in `docs/api-spec.md` whenever an endpoint signature is changed or created.

## 2. Pagination Format
All list endpoints MUST support query params `page` (default 1) and `limit` (default 20, max 100) and return a `pagination` metadata object:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

## 3. Standard Error Envelope Format
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Validation failed for registration payload",
    "details": [{ "field": "mobile", "issue": "Invalid Indian mobile number format" }]
  }
}
```

## 4. Rate-Limit Header Conventions
All API responses MUST return rate-limiting headers:
- `X-RateLimit-Limit`: Maximum allowed requests per window (e.g. 100).
- `X-RateLimit-Remaining`: Remaining request quota.
- `X-RateLimit-Reset`: Unix timestamp when quota resets.

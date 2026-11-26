# Guide Profile Creation - Sequence Diagram (With Backend Details)

## Overview
This document provides a detailed sequence diagram for the guide profile creation process in the Sea & Tea Tours backend application, including actual implementation details, code snippets, configuration specifics, and complete API endpoint documentation.

## 🚀 **Backend API Endpoints - Complete Reference**

### **Base URL Configuration**
```yaml
# application.yml
server:
  servlet:
    context-path: /api/v1

# Full API Base URLs:
# Local Development: http://localhost:8080/api/v1
# Railway Production: https://your-domain.railway.app/api/v1
```

### **1. Authentication Endpoints**

#### **POST /api/v1/auth/register**
- **Description:** User registration
- **Authentication:** None (public endpoint)
- **Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "phone": "+1234567890",
  "dateOfBirth": "1990-01-01",
  "nationality": "Sri Lankan"
}
```
- **Response (201 Created):**
```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "role": "USER",
  "isVerified": false,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

#### **POST /api/v1/auth/login**
- **Description:** User authentication
- **Authentication:** None (public endpoint)
- **Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```
- **Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 86400000,
  "user": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "role": "USER"
  }
}
```

#### **POST /api/v1/auth/refresh**
- **Description:** Refresh access token
- **Authentication:** None (public endpoint)
- **Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```
- **Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 86400000
}
```

### **2. User Management Endpoints**

#### **GET /api/v1/users/profile**
- **Description:** Get current user profile
- **Authentication:** Required (Bearer token)
- **Authorization:** Any authenticated user
- **Response (200 OK):**
```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "dateOfBirth": "1990-01-01",
  "nationality": "Sri Lankan",
  "role": "USER",
  "isVerified": false,
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

#### **PUT /api/v1/users/profile**
- **Description:** Update current user profile
- **Authentication:** Required (Bearer token)
- **Authorization:** Any authenticated user
- **Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890",
  "dateOfBirth": "1990-01-01",
  "nationality": "Sri Lankan"
}
```
- **Response (200 OK):** Updated user profile

#### **PUT /api/v1/users/role**
- **Description:** Update user role (Admin only)
- **Authentication:** Required (Bearer token)
- **Authorization:** ADMIN role only
- **Request Body:**
```json
{
  "role": "GUIDE"
}
```
- **Response (200 OK):**
```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "role": "GUIDE",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### **3. Guide Profile Endpoints**

#### **POST /api/v1/guides**
- **Description:** Create guide profile
- **Authentication:** Required (Bearer token)
- **Authorization:** USER or ADMIN role
- **Request Body:**
```json
{
  "bio": "Experienced tour guide with 5+ years of experience leading cultural tours in Sri Lanka. Specialized in historical sites, tea plantations, and wildlife safaris. Fluent in English, Sinhala, and Tamil.",
  "hourlyRate": 25.00,
  "dailyRate": 200.00,
  "responseTimeHours": 24,
  "isAvailable": true,
  "specialties": [
    {
      "specialty": "Cultural Tours",
      "yearsExperience": 5,
      "certificationUrl": "https://example.com/cert1.pdf"
    },
    {
      "specialty": "Tea Plantation Tours",
      "yearsExperience": 3,
      "certificationUrl": null
    },
    {
      "specialty": "Wildlife Safaris",
      "yearsExperience": 4,
      "certificationUrl": "https://example.com/cert2.pdf"
    }
  ],
  "languages": [
    {
      "language": "English",
      "proficiencyLevel": "NATIVE"
    },
    {
      "language": "Sinhala",
      "proficiencyLevel": "FLUENT"
    },
    {
      "language": "Tamil",
      "proficiencyLevel": "INTERMEDIATE"
    }
  ]
}
```
- **Response (201 Created):**
```json
{
  "id": 1,
  "userId": 1,
  "userFirstName": "John",
  "userLastName": "Doe",
  "userEmail": "john.doe@example.com",
  "bio": "Experienced tour guide with 5+ years of experience...",
  "hourlyRate": 25.00,
  "dailyRate": 200.00,
  "responseTimeHours": 24,
  "isAvailable": true,
  "totalTours": 0,
  "averageRating": 0.00,
  "totalReviews": 0,
  "verificationStatus": "PENDING",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "specialties": [
    {
      "id": 1,
      "specialty": "Cultural Tours",
      "yearsExperience": 5,
      "certificationUrl": "https://example.com/cert1.pdf",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "languages": [
    {
      "id": 1,
      "language": "English",
      "proficiencyLevel": "NATIVE",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### **GET /api/v1/guides/{guideId}**
- **Description:** Get guide profile by ID
- **Authentication:** Required (Bearer token)
- **Authorization:** Any authenticated user
- **Path Parameters:**
  - `guideId` (Long): Guide profile ID
- **Response (200 OK):** Guide profile details

#### **GET /api/v1/guides/my-profile**
- **Description:** Get current user's guide profile
- **Authentication:** Required (Bearer token)
- **Authorization:** GUIDE role only
- **Response (200 OK):** Current user's guide profile

#### **PUT /api/v1/guides/my-profile**
- **Description:** Update current user's guide profile
- **Authentication:** Required (Bearer token)
- **Authorization:** GUIDE role only
- **Request Body:** Same as POST /api/v1/guides
- **Response (200 OK):** Updated guide profile

#### **PUT /api/v1/guides/{guideId}**
- **Description:** Update guide profile by ID (Admin only)
- **Authentication:** Required (Bearer token)
- **Authorization:** ADMIN role only
- **Path Parameters:**
  - `guideId` (Long): Guide profile ID
- **Request Body:** Same as POST /api/v1/guides
- **Response (200 OK):** Updated guide profile

#### **DELETE /api/v1/guides/my-profile**
- **Description:** Delete current user's guide profile
- **Authentication:** Required (Bearer token)
- **Authorization:** GUIDE role only
- **Response (204 No Content)**

#### **DELETE /api/v1/guides/{guideId}**
- **Description:** Delete guide profile by ID (Admin only)
- **Authentication:** Required (Bearer token)
- **Authorization:** ADMIN role only
- **Path Parameters:**
  - `guideId` (Long): Guide profile ID
- **Response (204 No Content)**

#### **GET /api/v1/guides/my-profile/exists**
- **Description:** Check if current user has a guide profile
- **Authentication:** Required (Bearer token)
- **Authorization:** Any authenticated user
- **Response (200 OK):**
```json
{
  "exists": true,
  "guideId": 1
}
```

#### **GET /api/v1/guides**
- **Description:** Get all guide profiles with pagination
- **Authentication:** Required (Bearer token)
- **Authorization:** Any authenticated user
- **Query Parameters:**
  - `page` (int, default: 0): Page number (0-based)
  - `size` (int, default: 10): Page size
  - `sort` (string): Sort field (e.g., "createdAt,desc")
- **Response (200 OK):**
```json
{
  "content": [
    {
      "id": 1,
      "userId": 1,
      "userFirstName": "John",
      "userLastName": "Doe",
      "bio": "Experienced tour guide...",
      "hourlyRate": 25.00,
      "verificationStatus": "VERIFIED",
      "isAvailable": true
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10,
    "sort": {
      "sorted": true,
      "unsorted": false
    }
  },
  "totalElements": 1,
  "totalPages": 1,
  "last": true,
  "first": true,
  "numberOfElements": 1
}
```

#### **GET /api/v1/guides/search**
- **Description:** Search guides by criteria
- **Authentication:** Required (Bearer token)
- **Authorization:** Any authenticated user
- **Query Parameters:**
  - `specialty` (string, optional): Guide specialty
  - `language` (string, optional): Required language
  - `minPrice` (decimal, optional): Minimum hourly rate
  - `maxPrice` (decimal, optional): Maximum hourly rate
  - `available` (boolean, optional): Availability status
  - `verified` (boolean, optional): Verification status
- **Response (200 OK):** Paginated search results

### **4. Health & Monitoring Endpoints**

#### **GET /api/v1/actuator/health**
- **Description:** Application health check
- **Authentication:** None (public endpoint)
- **Response (200 OK):**
```json
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP",
      "details": {
        "database": "PostgreSQL",
        "validationQuery": "isValid()"
      }
    },
    "diskSpace": {
      "status": "UP",
      "details": {
        "total": 107374182400,
        "free": 21474836480,
        "threshold": 10485760
      }
    }
  }
}
```

#### **GET /api/v1/actuator/info**
- **Description:** Application information
- **Authentication:** None (public endpoint)
- **Response (200 OK):**
```json
{
  "app": {
    "name": "Sea & Tea Tours Backend",
    "version": "1.0.0",
    "description": "Tour guide management system"
  },
  "build": {
    "artifact": "seaandtea-backend",
    "version": "1.0.0",
    "time": "2024-01-15T10:30:00Z"
  }
}
```

#### **GET /api/v1/actuator/metrics**
- **Description:** Application metrics
- **Authentication:** Required (Bearer token)
- **Authorization:** ADMIN role only
- **Response (200 OK):** Various application metrics

### **5. Swagger Documentation Endpoints**

#### **GET /api/v1/swagger-ui/index.html**
- **Description:** Swagger UI interface
- **Authentication:** None (public endpoint)
- **Response:** HTML page with interactive API documentation

#### **GET /api/v1/v3/api-docs**
- **Description:** OpenAPI specification
- **Authentication:** None (public endpoint)
- **Response:** JSON OpenAPI specification

#### **GET /api/v1/v3/api-docs.yaml**
- **Description:** OpenAPI specification (YAML format)
- **Authentication:** None (public endpoint)
- **Response:** YAML OpenAPI specification

## 🔐 **Authentication & Authorization Details**

### **JWT Token Format**
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "john.doe@example.com",
    "iat": 1705312200,
    "exp": 1705398600,
    "role": "USER",
    "userId": 1
  },
  "signature": "HMACSHA256(base64UrlEncode(header) + '.' + base64UrlEncode(payload), secret)"
}
```

### **Authorization Header Format**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsImlhdCI6MTcwNTMxMjIwMCwiZXhwIjoxNzA1Mzk4NjAwLCJyb2xlIjoiVVNFUiIsInVzZXJJZCI6MX0.signature
```

### **Role-Based Access Control**
```java
// Available roles
public enum UserRole {
    USER,      // Basic user, can create guide profile
    GUIDE,     // Tour guide, can manage own profile
    ADMIN      // Administrator, can manage all profiles
}

// Authorization annotations
@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")    // USER or ADMIN
@PreAuthorize("hasRole('GUIDE')")                       // GUIDE only
@PreAuthorize("hasRole('ADMIN')")                       // ADMIN only
@PreAuthorize("isAuthenticated()")                      // Any authenticated user
```

## 📊 **HTTP Status Codes & Error Responses**

### **Success Status Codes**
- **200 OK:** Request successful
- **201 Created:** Resource created successfully
- **204 No Content:** Request successful, no content to return

### **Client Error Status Codes**
- **400 Bad Request:** Invalid request data or business logic violation
- **401 Unauthorized:** Missing or invalid authentication
- **403 Forbidden:** Insufficient permissions
- **404 Not Found:** Resource not found
- **409 Conflict:** Resource already exists

### **Server Error Status Codes**
- **500 Internal Server Error:** Unexpected server error
- **503 Service Unavailable:** Service temporarily unavailable

### **Error Response Format**
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "User already has a guide profile",
  "path": "/api/v1/guides",
  "details": [
    "Bio must be at least 50 characters long",
    "Hourly rate must be greater than 0"
  ]
}
```

## 🧪 **API Testing Examples**

### **1. Create Guide Profile (cURL)**
```bash
curl -X POST "http://localhost:8080/api/v1/guides" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "bio": "Experienced tour guide with 5+ years of experience...",
    "hourlyRate": 25.00,
    "dailyRate": 200.00,
    "responseTimeHours": 24,
    "isAvailable": true,
    "specialties": [
      {
        "specialty": "Cultural Tours",
        "yearsExperience": 5
      }
    ],
    "languages": [
      {
        "language": "English",
        "proficiencyLevel": "NATIVE"
      }
    ]
  }'
```

### **2. Get Guide Profile (cURL)**
```bash
curl -X GET "http://localhost:8080/api/v1/guides/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **3. Update Guide Profile (cURL)**
```bash
curl -X PUT "http://localhost:8080/api/v1/guides/my-profile" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "bio": "Updated bio with more experience...",
    "hourlyRate": 30.00,
    "dailyRate": 250.00
  }'
```

### **4. Search Guides (cURL)**
```bash
curl -X GET "http://localhost:8080/api/v1/guides/search?specialty=Cultural%20Tours&minPrice=20&maxPrice=50&verified=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📱 **Postman Collection Integration**

### **Environment Variables**
```json
{
  "base_url": "http://localhost:8080/api/v1",
  "auth_token": "YOUR_JWT_TOKEN",
  "user_id": "1",
  "guide_id": "1"
}
```

### **Pre-request Scripts**
```javascript
// Set Authorization header
pm.request.headers.add({
    key: 'Authorization',
    value: 'Bearer ' + pm.environment.get('auth_token')
});
```

### **Test Scripts**
```javascript
// Verify successful response
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

// Verify response structure
pm.test("Response has required fields", function () {
    const response = pm.response.json();
    pm.expect(response).to.have.property('id');
    pm.expect(response).to.have.property('userId');
    pm.expect(response).to.have.property('bio');
});
```

## 🔍 **API Monitoring & Analytics**

### **Request/Response Logging**
```yaml
logging:
  level:
    org.springframework.web: DEBUG
    org.springframework.web.servlet: DEBUG
    com.seaandtea.controller: DEBUG
    com.seaandtea.service: DEBUG
```

### **Performance Metrics**
- **Response Time:** Track API response times
- **Throughput:** Requests per second
- **Error Rate:** Percentage of failed requests
- **Availability:** Uptime percentage

### **Business Metrics**
- **Guide Profile Creation Rate:** Daily/weekly creation counts
- **Role Elevation Rate:** USER to GUIDE conversion rate
- **API Usage Patterns:** Most used endpoints
- **User Engagement:** Active users and session duration

## 🚀 **Deployment & Environment Configuration**

### **Local Development**
```yaml
# application-dev.yml
spring:
  profiles:
    active: dev
  datasource:
    url: jdbc:postgresql://localhost:5432/seaandtea_dev
    username: postgres
    password: password

logging:
  level:
    com.seaandtea: DEBUG
    org.springframework.web: DEBUG
```

### **Railway Production**
```yaml
# application-railway.yml
spring:
  profiles:
    active: railway
  datasource:
    url: ${DATABASE_URL}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}

logging:
  level:
    com.seaandtea: INFO
    org.springframework.web: INFO
```

### **Environment Variables**
```bash
# Database
DATABASE_URL=jdbc:postgresql://host:port/database
DB_USERNAME=postgres
DB_PASSWORD=secure_password

# JWT
JWT_SECRET=your-secure-jwt-secret-key
JWT_EXPIRATION=86400000

# Application
SPRING_PROFILES_ACTIVE=railway
SERVER_PORT=8080
```

This comprehensive API documentation provides everything needed to understand, test, and integrate with the guide profile management system! 🎯

## Backend Architecture Overview

### **Technology Stack:**
- **Framework:** Spring Boot 3.2+
- **Database:** PostgreSQL with JPA/Hibernate
- **Security:** Spring Security + JWT
- **Build Tool:** Maven
- **Java Version:** 17
- **Deployment:** Railway (Cloud Platform)

### **Project Structure:**
```
src/main/java/com/seaandtea/
├── SeaAndTeaApplication.java          # Main Spring Boot application
├── controller/
│   └── GuideController.java          # REST API endpoints
├── service/
│   ├── GuideService.java             # Business logic
│   └── UserService.java              # User management
├── repository/
│   ├── GuideRepository.java          # Data access
│   └── UserRepository.java           # User data access
├── entity/
│   ├── Guide.java                    # Guide entity
│   ├── GuideSpecialty.java           # Guide specialties
│   ├── GuideLanguage.java            # Guide languages
│   └── User.java                     # User entity
├── dto/
│   ├── GuideProfileRequest.java      # Request DTO
│   └── GuideProfileResponse.java     # Response DTO
└── security/
    ├── JwtService.java               # JWT management
    ├── JwtAuthenticationFilter.java  # JWT filter
    └── SecurityConfig.java           # Security configuration
```

## Database Schema

### **Users Table:**
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    nationality VARCHAR(100),
    profile_picture_url VARCHAR(500),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    role VARCHAR(20) DEFAULT 'USER', -- USER, GUIDE, ADMIN
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Guides Table:**
```sql
CREATE TABLE guides (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) NOT NULL,
    bio TEXT,
    hourly_rate DECIMAL(10,2),
    daily_rate DECIMAL(10,2),
    response_time_hours INTEGER DEFAULT 24,
    is_available BOOLEAN DEFAULT TRUE,
    total_tours INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    verification_status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, VERIFIED, REJECTED
    verification_documents JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Guide Specialties Table:**
```sql
CREATE TABLE guide_specialties (
    id BIGSERIAL PRIMARY KEY,
    guide_id BIGINT REFERENCES guides(id) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    years_experience INTEGER,
    certification_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Guide Languages Table:**
```sql
CREATE TABLE guide_languages (
    id BIGSERIAL PRIMARY KEY,
    guide_id BIGINT REFERENCES guides(id) NOT NULL,
    language VARCHAR(100) NOT NULL,
    proficiency_level VARCHAR(20) NOT NULL, -- BASIC, INTERMEDIATE, FLUENT, NATIVE
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Sequence Diagram with Implementation Details

```mermaid
sequenceDiagram
    participant Client as Client/Browser
    participant Security as Spring Security
    participant Filter as JwtAuthenticationFilter
    participant Controller as GuideController
    participant Service as GuideService
    participant UserService as UserService
    participant Repository as GuideRepository
    participant UserRepo as UserRepository
    participant Database as PostgreSQL

    Note over Client,Database: 1. Authentication & Authorization
    Client->>Security: POST /api/v1/guides (with JWT token)
    Note right of Client: Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
    
    Security->>Filter: Process JWT token
    Filter->>Filter: Extract user email from JWT
    Note right of Filter: String userEmail = jwtService.extractUsername(jwt);
    
    Filter->>UserRepo: loadUserByUsername(email)
    Note right of Filter: UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);
    
    UserRepo->>Database: SELECT * FROM users WHERE email = ?
    Database-->>UserRepo: User details
    UserRepo-->>Filter: UserDetails object (User entity)
    
    Filter->>Filter: Validate JWT token
    Note right of Filter: if (jwtService.isTokenValid(jwt, userDetails))
    
    Filter->>Security: Set Authentication in SecurityContext
    Note right of Filter: SecurityContextHolder.getContext().setAuthentication(authToken);
    
    Security->>Security: Check @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    Note right of Security: User.UserRole.USER or User.UserRole.ADMIN
    
    Security->>Controller: Route request to createGuideProfile()

    Note over Client,Database: 2. Controller Processing
    Controller->>Controller: Log request details
    Note right of Controller: log.info("=== GUIDE CONTROLLER: Creating guide profile ===");
    
    Controller->>Controller: Extract user ID from SecurityContext
    Note right of Controller: Long userId = getCurrentUserId();
    
    Controller->>Service: createGuideProfile(userId, request)
    Note right of Controller: GuideProfileResponse response = guideService.createGuideProfile(userId, request);

    Note over Client,Database: 3. Business Logic Validation
    Service->>UserRepo: findById(userId)
    Note right of Service: User user = userRepository.findById(userId).orElseThrow(...);
    
    UserRepo->>Database: SELECT * FROM users WHERE id = ?
    Database-->>UserRepo: User entity
    UserRepo-->>Service: User object
    
    Service->>Repository: findByUserId(userId)
    Note right of Service: if (guideRepository.findByUserId(userId).isPresent())
    
    Repository->>Database: SELECT * FROM guides WHERE user_id = ?
    Database-->>Repository: No existing guide (empty result)
    Repository-->>Service: Optional.empty()

    Note over Client,Database: 4. User Role Update
    Service->>UserService: updateUserRole(userId, "GUIDE")
    Note right of Service: userService.updateUserRole(userId, UserRoleUpdateRequest.builder().role("GUIDE").build());
    
    UserService->>UserRepo: findById(userId)
    UserRepo->>Database: SELECT * FROM users WHERE id = ?
    Database-->>UserRepo: User entity
    UserRepo-->>UserService: User object
    
    UserService->>UserService: Set role = UserRole.GUIDE
    Note right of UserService: user.setRole(User.UserRole.GUIDE);
    
    UserService->>UserRepo: save(user)
    UserRepo->>Database: UPDATE users SET role = 'GUIDE' WHERE id = ?
    Database-->>UserRepo: Updated user
    UserRepo-->>UserService: Updated User
    UserService-->>Service: UserDto

    Note over Client,Database: 5. Guide Profile Creation
    Service->>Service: Create Guide entity
    Note right of Service: Guide guide = Guide.builder().user(user).bio(request.getBio())...
    
    Service->>Repository: save(guide)
    Repository->>Database: INSERT INTO guides (user_id, bio, hourly_rate, daily_rate, response_time_hours, is_available, verification_status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    Database-->>Repository: Generated guide ID
    Repository-->>Service: Saved Guide entity

    Note over Client,Database: 6. Guide Specialties Creation
    Service->>Service: Create GuideSpecialty entities
    loop For each specialty in request
        Service->>Service: Build GuideSpecialty with guide reference
        Note right of Service: GuideSpecialty.builder().guide(savedGuide).specialty(specialtyRequest.getSpecialty())...
    end
    
    Service->>Repository: save(guide) [with specialties]
    Repository->>Database: INSERT INTO guide_specialties (guide_id, specialty, years_experience, certification_url, created_at) VALUES (?, ?, ?, ?, ?)
    Database-->>Repository: Specialty IDs
    Repository-->>Service: Updated Guide with specialties

    Note over Client,Database: 7. Guide Languages Creation
    Service->>Service: Create GuideLanguage entities
    loop For each language in request
        Service->>Service: Build GuideLanguage with guide reference
        Note right of Service: GuideLanguage.builder().guide(guide).language(languageRequest.getLanguage())...
    end
    
    Service->>Repository: save(guide) [with languages]
    Repository->>Database: INSERT INTO guide_languages (guide_id, language, proficiency_level, created_at) VALUES (?, ?, ?, ?)
    Database-->>Repository: Language IDs
    Repository-->>Service: Final Guide with all relationships

    Note over Client,Database: 8. Response Mapping & Return
    Service->>Service: mapToResponse(guide)
    Note right of Service: return GuideProfileResponse.builder().id(guide.getId())...
    
    Service-->>Controller: GuideProfileResponse
    Controller->>Controller: Log success
    Note right of Controller: log.info("Successfully created guide profile with ID: {}", response.getId());
    
    Controller-->>Security: ResponseEntity<GuideProfileResponse> (HTTP 201)
    Security-->>Client: HTTP 201 Created + Guide Profile Data

    Note over Client,Database: 9. Database Transaction Commit
    Database->>Database: COMMIT transaction
```

## Implementation Code Details

### **1. GuideController.java - Main Endpoint**

```java
@RestController
@RequestMapping("/guides")
@Slf4j
public class GuideController {
    
    private final GuideService guideService;
    
    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<GuideProfileResponse> createGuideProfile(
            @Valid @RequestBody GuideProfileRequest request) {
        
        log.info("=== GUIDE CONTROLLER: Creating guide profile ===");
        
        // Extract user ID from security context
        Long userId = getCurrentUserId();
        log.info("Extracted user ID: {}", userId);
        
        GuideProfileResponse response = guideService.createGuideProfile(userId, request);
        log.info("Successfully created guide profile with ID: {}", response.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new IllegalStateException("Authentication context is null");
        }
        
        if (authentication.getPrincipal() instanceof User) {
            User user = (User) authentication.getPrincipal();
            return user.getId();
        } else {
            throw new IllegalStateException("Authentication principal is not a User entity");
        }
    }
}
```

### **2. GuideService.java - Business Logic**

```java
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class GuideService {
    
    private final GuideRepository guideRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    
    public GuideProfileResponse createGuideProfile(Long userId, GuideProfileRequest request) {
        log.info("Creating guide profile for user ID: {}", userId);
        
        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with ID: " + userId));
        
        // Check if user already has a guide profile
        if (guideRepository.findByUserId(userId).isPresent()) {
            throw new IllegalStateException("User already has a guide profile");
        }
        
        // Update user role to GUIDE
        userService.updateUserRole(userId, UserRoleUpdateRequest.builder()
                .role("GUIDE")
                .build());
        
        // Create guide entity
        Guide guide = Guide.builder()
                .user(user)
                .bio(request.getBio())
                .hourlyRate(request.getHourlyRate())
                .dailyRate(request.getDailyRate())
                .responseTimeHours(request.getResponseTimeHours())
                .isAvailable(request.getIsAvailable())
                .verificationStatus(Guide.VerificationStatus.PENDING)
                .build();
        
        // Save guide first to get the ID
        Guide savedGuide = guideRepository.save(guide);
        
        // Create and save specialties
        List<GuideSpecialty> specialties = request.getSpecialties().stream()
                .map(specialtyRequest -> GuideSpecialty.builder()
                        .guide(savedGuide)
                        .specialty(specialtyRequest.getSpecialty())
                        .yearsExperience(specialtyRequest.getYearsExperience())
                        .certificationUrl(specialtyRequest.getCertificationUrl())
                        .build())
                .collect(Collectors.toList());
        
        savedGuide.setSpecialties(specialties);
        
        // Create and save languages
        List<GuideLanguage> languages = request.getLanguages().stream()
                .map(languageRequest -> GuideLanguage.builder()
                        .guide(guide)
                        .language(languageRequest.getLanguage())
                        .proficiencyLevel(GuideLanguage.ProficiencyLevel.valueOf(
                                languageRequest.getProficiencyLevel().toUpperCase()))
                        .build())
                .collect(Collectors.toList());
        
        savedGuide.setLanguages(languages);
        
        // Save the complete guide with relationships
        final Guide finalGuide = guideRepository.save(savedGuide);
        
        log.info("Successfully created guide profile with ID: {}", finalGuide.getId());
        return mapToResponse(finalGuide);
    }
}
```

### **3. JwtAuthenticationFilter.java - Authentication**

```java
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    
    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        jwt = authHeader.substring(7);
        userEmail = jwtService.extractUsername(jwt);
        
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
            
            if (jwtService.isTokenValid(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );
                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        filterChain.doFilter(request, response);
    }
}
```

### **4. SecurityConfig.java - Security Configuration**

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    
    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/public/**").permitAll()
                .requestMatchers("/actuator/**").permitAll()
                .requestMatchers("/health/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .requestMatchers("/error").permitAll()
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
```

### **5. GuideProfileRequest.java - Request DTO**

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuideProfileRequest {
    
    @NotBlank(message = "Bio is required")
    @Size(min = 50, message = "Bio must be at least 50 characters long")
    private String bio;
    
    @NotNull(message = "Hourly rate is required")
    @DecimalMin(value = "0.01", message = "Hourly rate must be greater than 0")
    @Digits(integer = 5, fraction = 2, message = "Hourly rate must have up to 5 digits and 2 decimal places")
    private BigDecimal hourlyRate;
    
    @NotNull(message = "Daily rate is required")
    @DecimalMin(value = "0.01", message = "Daily rate must be greater than 0")
    @Digits(integer = 5, fraction = 2, message = "Daily rate must have up to 5 digits and 2 decimal places")
    private BigDecimal dailyRate;
    
    @NotNull(message = "Response time is required")
    @Min(value = 1, message = "Response time must be at least 1 hour")
    @Max(value = 168, message = "Response time cannot exceed 168 hours (1 week)")
    private Integer responseTimeHours;
    
    @NotNull(message = "Availability status is required")
    private Boolean isAvailable;
    
    @NotEmpty(message = "At least one specialty is required")
    @Size(max = 10, message = "Maximum 10 specialties allowed")
    private List<GuideSpecialtyRequest> specialties;
    
    @NotEmpty(message = "At least one language is required")
    @Size(max = 5, message = "Maximum 5 languages allowed")
    private List<GuideLanguageRequest> languages;
}
```

### **6. GuideRepository.java - Data Access**

```java
@Repository
public interface GuideRepository extends JpaRepository<Guide, Long> {
    
    @Query("SELECT g FROM Guide g WHERE g.user.id = :userId")
    Optional<Guide> findByUserId(Long userId);
    
    @Query("SELECT g FROM Guide g WHERE g.verificationStatus = 'VERIFIED' AND g.isAvailable = true")
    Page<Guide> findAvailableVerifiedGuides(Pageable pageable);
    
    @Query("SELECT g FROM Guide g WHERE g.verificationStatus = 'VERIFIED' AND g.isAvailable = true " +
           "AND (:specialty IS NULL OR EXISTS (SELECT s FROM GuideSpecialty s WHERE s.guide = g AND s.specialty = :specialty)) " +
           "AND (:language IS NULL OR EXISTS (SELECT l FROM GuideLanguage l WHERE l.guide = g AND l.language = :language)) " +
           "AND (:minPrice IS NULL OR g.hourlyRate >= :minPrice) " +
           "AND (:maxPrice IS NULL OR g.hourlyRate <= :maxPrice)")
    Page<Guide> searchGuides(@Param("specialty") String specialty,
                             @Param("language") String language,
                             @Param("minPrice") BigDecimal minPrice,
                             @Param("maxPrice") BigDecimal maxPrice,
                             Pageable pageable);
}
```

## Configuration Files

### **1. application.yml - Main Configuration**

```yaml
spring:
  application:
    name: seaandtea-backend
  
  profiles:
    active: dev
  
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 10MB

server:
  servlet:
    context-path: /api/v1

jwt:
  expiration: 86400000 # 24 hours

management:
  endpoints:
    web:
      exposure:
        include: health,info
  endpoint:
    health:
      show-details: always
      show-components: always
  health:
    redis:
      enabled: false
    mail:
      enabled: false

logging:
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n"
  level:
    root: INFO
    org.springframework.web: INFO
    org.springframework.web.servlet: INFO
```

### **2. application-dev.yml - Development Profile**

```yaml
spring:
  datasource:
    url: ${DATABASE_URL:jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:seaandtea_dev}}
    username: ${DB_USERNAME:postgres}
    password: ${DB_PASSWORD:password}
    driver-class-name: org.postgresql.Driver
  
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
  
  flyway:
    enabled: true
    baseline-on-migrate: true
    locations: classpath:db/migration

logging:
  level:
    com.seaandtea: DEBUG
    org.springframework.security: DEBUG
    org.hibernate.SQL: DEBUG
    org.hibernate.type.descriptor.sql.BasicBinder: TRACE
    org.springframework.web: DEBUG
    org.springframework.web.servlet: DEBUG
```

### **3. pom.xml - Dependencies**

```xml
<dependencies>
    <!-- Spring Boot Starters -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>
    
    <!-- Database -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
    </dependency>
    
    <!-- JWT -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.11.5</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>0.11.5</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-jackson</artifactId>
        <version>0.11.5</version>
    </dependency>
    
    <!-- Lombok -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
</dependencies>
```

## Database Indexes for Performance

```sql
-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Guides table indexes
CREATE INDEX idx_guides_user_id ON guides(user_id);
CREATE INDEX idx_guides_verification_status ON guides(verification_status);
CREATE INDEX idx_guides_is_available ON guides(is_available);
CREATE INDEX idx_guides_hourly_rate ON guides(hourly_rate);
CREATE INDEX idx_guides_created_at ON guides(created_at);

-- Guide specialties indexes
CREATE INDEX idx_guide_specialties_guide_id ON guide_specialties(guide_id);
CREATE INDEX idx_guide_specialties_specialty ON guide_specialties(specialty);

-- Guide languages indexes
CREATE INDEX idx_guide_languages_guide_id ON guide_languages(guide_id);
CREATE INDEX idx_guide_languages_language ON guide_languages(language);
```

## Error Handling Implementation

### **1. Global Exception Handler**

```java
@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    
    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUsernameNotFound(UsernameNotFoundException ex) {
        log.error("User not found: {}", ex.getMessage());
        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(404)
                .error("Not Found")
                .message(ex.getMessage())
                .path("/api/v1/guides")
                .build();
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
    
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleIllegalState(IllegalStateException ex) {
        log.error("Illegal state: {}", ex.getMessage());
        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(400)
                .error("Bad Request")
                .message(ex.getMessage())
                .path("/api/v1/guides")
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(MethodArgumentNotValidException ex) {
        List<String> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.toList());
        
        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(400)
                .error("Validation Error")
                .message("Invalid request data")
                .details(errors)
                .path("/api/v1/guides")
                .build();
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
}
```

### **2. Error Response DTO**

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    private LocalDateTime timestamp;
    private int status;
    private String error;
    private String message;
    private String path;
    private List<String> details;
}
```

## Monitoring & Logging Configuration

### **1. Logback Configuration**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>logs/application.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>logs/application.%d{yyyy-MM-dd}.log</fileNamePattern>
            <maxHistory>30</maxHistory>
        </rollingPolicy>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    
    <root level="INFO">
        <appender-ref ref="CONSOLE" />
        <appender-ref ref="FILE" />
    </root>
    
    <logger name="com.seaandtea" level="DEBUG" />
    <logger name="org.springframework.security" level="DEBUG" />
    <logger name="org.springframework.web" level="DEBUG" />
    <logger name="org.hibernate.SQL" level="DEBUG" />
    
</configuration>
```

### **2. Actuator Endpoints**

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: always
      show-components: always
  metrics:
    export:
      prometheus:
        enabled: true
```

## Performance Optimization

### **1. Connection Pool Configuration**

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
      leak-detection-threshold: 60000
```

### **2. JPA Configuration**

```yaml
spring:
  jpa:
    properties:
      hibernate:
        jdbc:
          batch_size: 20
        order_inserts: true
        order_updates: true
        batch_versioned_data: true
        connection:
          provider_disables_autocommit: true
```

### **3. Caching Configuration**

```java
@Configuration
@EnableCaching
public class CacheConfig {
    
    @Bean
    public CacheManager cacheManager() {
        SimpleCacheManager cacheManager = new SimpleCacheManager();
        cacheManager.setCaches(Arrays.asList(
            new ConcurrentMapCache("users"),
            new ConcurrentMapCache("guides"),
            new ConcurrentMapCache("userRoles")
        ));
        return cacheManager;
    }
}
```

## Testing Implementation

### **1. Unit Test Example**

```java
@ExtendWith(MockitoExtension.class)
class GuideServiceTest {
    
    @Mock
    private GuideRepository guideRepository;
    
    @Mock
    private UserRepository userRepository;
    
    @Mock
    private UserService userService;
    
    @InjectMocks
    private GuideService guideService;
    
    @Test
    void createGuideProfile_Success() {
        // Given
        Long userId = 1L;
        User user = User.builder().id(userId).role(User.UserRole.USER).build();
        GuideProfileRequest request = createValidRequest();
        
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(guideRepository.findByUserId(userId)).thenReturn(Optional.empty());
        when(userService.updateUserRole(userId, any())).thenReturn(new UserDto());
        when(guideRepository.save(any())).thenReturn(createMockGuide());
        
        // When
        GuideProfileResponse response = guideService.createGuideProfile(userId, request);
        
        // Then
        assertNotNull(response);
        verify(userService).updateUserRole(userId, any());
        verify(guideRepository, times(2)).save(any());
    }
    
    @Test
    void createGuideProfile_UserAlreadyHasProfile_ThrowsException() {
        // Given
        Long userId = 1L;
        User user = User.builder().id(userId).build();
        Guide existingGuide = Guide.builder().id(1L).build();
        
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(guideRepository.findByUserId(userId)).thenReturn(Optional.of(existingGuide));
        
        // When & Then
        assertThrows(IllegalStateException.class, () -> 
            guideService.createGuideProfile(userId, createValidRequest()));
    }
}
```

### **2. Integration Test Example**

```java
@SpringBootTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@TestPropertySource(locations = "classpath:application-test.yml")
@Transactional
class GuideControllerIntegrationTest {
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Autowired
    private UserRepository userRepository;
    
    @Test
    void createGuideProfile_ValidRequest_Success() {
        // Given
        User user = createTestUser();
        userRepository.save(user);
        
        String jwtToken = generateJwtToken(user);
        
        GuideProfileRequest request = createValidRequest();
        
        // When
        ResponseEntity<GuideProfileResponse> response = restTemplate
            .withBasicAuth(jwtToken, "")
            .postForEntity("/api/v1/guides", request, GuideProfileResponse.class);
        
        // Then
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(user.getId(), response.getBody().getUserId());
    }
}
```

## Deployment Configuration

### **1. Railway Configuration (railway.json)**

```json
{
  "build": {
    "builder": "nixpacks"
  },
  "deploy": {
    "startCommand": "java -jar target/seaandtea-backend-1.0.0.jar",
    "healthcheckPath": "/api/v1/actuator/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

### **2. Docker Configuration (Dockerfile)**

```dockerfile
FROM openjdk:17-jdk-slim

WORKDIR /app

COPY target/seaandtea-backend-1.0.0.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

### **3. Environment Variables**

```bash
# Database Configuration
DATABASE_URL=jdbc:postgresql://host:port/database
DB_USERNAME=postgres
DB_PASSWORD=secure_password

# JWT Configuration
JWT_SECRET=your-secure-jwt-secret-key
JWT_EXPIRATION=86400000

# Application Configuration
SPRING_PROFILES_ACTIVE=railway
SERVER_PORT=8080

# Logging Configuration
LOGGING_LEVEL_COM_SEAANDTEA=INFO
LOGGING_LEVEL_ORG_SPRINGFRAMEWORK_SECURITY=INFO
```

This comprehensive documentation provides all the backend implementation details, including actual code snippets, configuration files, database schemas, and deployment specifics for the guide profile creation process.

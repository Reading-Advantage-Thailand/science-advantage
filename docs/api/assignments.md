# Assignment API Documentation

## Overview

The Assignment API allows teachers to create, manage, and schedule assignments for their classes. Teachers can assign lessons or quizzes to classes with due dates and publish them when ready.

## Endpoints

### 1. Create Assignment

**POST** `/api/assignments`

Creates a new assignment for a class.

#### Authorization

- **Required**: Yes
- **Roles**: TEACHER, ADMIN

#### Request Body

```json
{
  "title": "Complete Earth's Systems Overview",
  "description": "Read Lesson 1 and complete the quiz",
  "classId": "clxxxxx",
  "lessonId": "clxxxxx",
  "contentType": "LESSON",
  "dueDate": "2024-12-31T23:59:59Z",
  "timezone": "America/New_York",
  "status": "DRAFT"
}
```

#### Request Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| title | string | Yes | - | Assignment title (max 200 chars) |
| description | string | No | null | Assignment description (max 1000 chars) |
| classId | string | Yes | - | ID of the class to assign to |
| lessonId | string | Yes | - | ID of the lesson content |
| contentType | enum | No | "LESSON" | Type of content: LESSON, QUIZ, or EXPERIMENT |
| dueDate | ISO datetime | Yes | - | When the assignment is due |
| timezone | string | No | "UTC" | Timezone for the due date (max 50 chars) |
| status | enum | No | "DRAFT" | Assignment status: DRAFT, PUBLISHED, or CANCELLED |

#### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "clxxxxx",
    "title": "Complete Earth's Systems Overview",
    "description": "Read Lesson 1 and complete the quiz",
    "contentType": "LESSON",
    "status": "DRAFT",
    "dueDate": "2024-12-31T23:59:59.000Z",
    "timezone": "America/New_York",
    "publishedAt": null,
    "cancelledAt": null,
    "className": "NGSS Grade 6 - Unit 1",
    "lessonTitle": "Lesson 1: Earth's Systems Overview",
    "lessonType": "LESSON",
    "teacherName": "Taylor Morgan",
    "teacherEmail": "teacher.ngss@example.com",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

#### Business Rules

- Only teachers can create assignments for their own classes
- Lesson must exist and be published if assignment status is PUBLISHED
- Due date must be in the future
- Only one active assignment allowed per class-lesson combination (unless cancelled)
- Cannot publish assignment for unpublished lesson

#### Error Responses

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Cannot publish assignment for unpublished lesson"
  }
}
```

**401 Unauthorized** - Not authenticated
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

**403 Forbidden** - Not authorized (wrong role or not class owner)
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You can only create assignments for your own classes"
  }
}
```

---

### 2. List Assignments

**GET** `/api/assignments`

Retrieves a paginated list of assignments for the authenticated teacher.

#### Authorization

- **Required**: Yes
- **Roles**: TEACHER, ADMIN

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| classId | string | No | - | Filter by class ID |
| teacherId | string | No | current user | Filter by teacher ID (admins only) |
| status | enum | No | - | Filter by status: DRAFT, PUBLISHED, CANCELLED |
| contentType | enum | No | - | Filter by type: LESSON, QUIZ, EXPERIMENT |
| page | number | No | 1 | Page number (min: 1) |
| limit | number | No | 20 | Items per page (min: 1, max: 100) |
| sortBy | enum | No | "createdAt" | Sort field: createdAt, dueDate, title |
| sortOrder | enum | No | "desc" | Sort order: asc, desc |

#### Example Request

```
GET /api/assignments?classId=clxxxxx&status=PUBLISHED&page=1&limit=10&sortBy=dueDate&sortOrder=asc
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "assignments": [
      {
        "id": "clxxxxx",
        "title": "Complete Earth's Systems Overview",
        "description": "Read Lesson 1 and complete the quiz",
        "contentType": "LESSON",
        "status": "PUBLISHED",
        "dueDate": "2024-12-31T23:59:59.000Z",
        "timezone": "America/New_York",
        "publishedAt": "2024-01-15T10:00:00.000Z",
        "cancelledAt": null,
        "className": "NGSS Grade 6 - Unit 1",
        "lessonTitle": "Lesson 1: Earth's Systems Overview",
        "lessonType": "LESSON",
        "lessonPublished": true,
        "teacherName": "Taylor Morgan",
        "teacherEmail": "teacher.ngss@example.com",
        "createdAt": "2024-01-15T10:00:00.000Z",
        "updatedAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

---

### 3. Get Assignment

**GET** `/api/assignments/:id`

Retrieves a specific assignment by ID.

#### Authorization

- **Required**: Yes
- **Roles**: TEACHER (own assignments only), ADMIN (all assignments)

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Assignment ID |

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "clxxxxx",
    "title": "Complete Earth's Systems Overview",
    "description": "Read Lesson 1 and complete the quiz",
    "contentType": "LESSON",
    "status": "PUBLISHED",
    "dueDate": "2024-12-31T23:59:59.000Z",
    "timezone": "America/New_York",
    "publishedAt": "2024-01-15T10:00:00.000Z",
    "cancelledAt": null,
    "class": {
      "id": "clxxxxx",
      "name": "NGSS Grade 6 - Unit 1"
    },
    "lesson": {
      "id": "clxxxxx",
      "title": "Lesson 1: Earth's Systems Overview",
      "type": "LESSON",
      "isPublished": true
    },
    "teacher": {
      "id": "clxxxxx",
      "name": "Taylor Morgan",
      "email": "teacher.ngss@example.com"
    },
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

#### Error Responses

**404 Not Found** - Assignment not found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Assignment not found"
  }
}
```

---

### 4. Update Assignment

**PUT** `/api/assignments/:id`

Updates an existing assignment.

#### Authorization

- **Required**: Yes
- **Roles**: TEACHER (own assignments only), ADMIN (all assignments)

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Assignment ID |

#### Request Body

All fields are optional. Only include fields you want to update.

```json
{
  "title": "Updated Assignment Title",
  "description": "Updated description",
  "dueDate": "2024-12-31T23:59:59Z",
  "timezone": "America/Los_Angeles",
  "status": "PUBLISHED"
}
```

#### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | No | Assignment title (min 1, max 200 chars) |
| description | string | No | Assignment description (max 1000 chars) |
| dueDate | ISO datetime | No | When the assignment is due |
| timezone | string | No | Timezone for the due date (max 50 chars) |
| status | enum | No | Assignment status: DRAFT, PUBLISHED, CANCELLED |

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "clxxxxx",
    "title": "Updated Assignment Title",
    "description": "Updated description",
    "contentType": "LESSON",
    "status": "PUBLISHED",
    "dueDate": "2024-12-31T23:59:59.000Z",
    "timezone": "America/Los_Angeles",
    "publishedAt": "2024-01-15T12:00:00.000Z",
    "cancelledAt": null,
    "class": {
      "id": "clxxxxx",
      "name": "NGSS Grade 6 - Unit 1"
    },
    "lesson": {
      "id": "clxxxxx",
      "title": "Lesson 1: Earth's Systems Overview",
      "type": "LESSON",
      "isPublished": true
    },
    "teacher": {
      "id": "clxxxxx",
      "name": "Taylor Morgan",
      "email": "teacher.ngss@example.com"
    },
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

#### Business Rules

- Cannot update cancelled assignments
- Cannot change status from PUBLISHED back to DRAFT
- Cannot publish assignment for unpublished lesson
- Due date must be in the future if updated
- publishedAt timestamp is set when status changes to PUBLISHED
- cancelledAt timestamp is set when status changes to CANCELLED

#### Status Transition Rules

| From | To | Allowed |
|------|-----|---------|
| DRAFT | DRAFT | ✅ |
| DRAFT | PUBLISHED | ✅ (if lesson is published) |
| DRAFT | CANCELLED | ✅ |
| PUBLISHED | DRAFT | ❌ |
| PUBLISHED | PUBLISHED | ✅ |
| PUBLISHED | CANCELLED | ✅ |
| CANCELLED | * | ❌ (cannot update) |

---

### 5. Delete Assignment

**DELETE** `/api/assignments/:id`

Deletes an assignment. Only DRAFT assignments can be deleted. PUBLISHED assignments should be cancelled instead.

#### Authorization

- **Required**: Yes
- **Roles**: TEACHER (own assignments only), ADMIN (all assignments)

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Assignment ID |

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Assignment deleted successfully"
}
```

#### Business Rules

- Only DRAFT assignments can be deleted
- PUBLISHED assignments must be cancelled instead (use PUT to change status to CANCELLED)
- Teachers can only delete their own assignments
- Admins can delete any assignment

#### Error Responses

**400 Bad Request** - Cannot delete published assignment
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Cannot delete published assignments. Cancel them instead."
  }
}
```

---

## Data Models

### Assignment Status

- **DRAFT**: Assignment is being prepared and not visible to students
- **PUBLISHED**: Assignment is active and visible to students
- **CANCELLED**: Assignment has been cancelled and is no longer active

### Content Type

- **LESSON**: Regular lesson content
- **QUIZ**: Quiz or assessment
- **EXPERIMENT**: Lab or experiment activity

### Timestamps

- **createdAt**: When the assignment was created
- **updatedAt**: When the assignment was last modified
- **publishedAt**: When the assignment was published (null if not published)
- **cancelledAt**: When the assignment was cancelled (null if not cancelled)

---

## Examples

### Create a Draft Assignment

```bash
curl -X POST https://api.example.com/api/assignments \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "title": "Week 1 Assignment",
    "description": "Complete Lesson 1 and take the quiz",
    "classId": "clxxxxx",
    "lessonId": "clxxxxx",
    "dueDate": "2024-12-31T23:59:59Z",
    "status": "DRAFT"
  }'
```

### Publish a Draft Assignment

```bash
curl -X PUT https://api.example.com/api/assignments/clxxxxx \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "status": "PUBLISHED"
  }'
```

### List Published Assignments Due Soon

```bash
curl "https://api.example.com/api/assignments?status=PUBLISHED&sortBy=dueDate&sortOrder=asc&limit=5" \
  -H "Cookie: next-auth.session-token=..."
```

### Cancel an Assignment

```bash
curl -X PUT https://api.example.com/api/assignments/clxxxxx \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "status": "CANCELLED"
  }'
```

---

## Notes

- All dates are stored and returned in ISO 8601 format
- Timezone is stored separately to preserve the original intention
- Teachers can only manage assignments for their own classes
- Admins have full access to all assignments
- Assignment-lesson combinations must be unique per class (unless cancelled)
- Audit logs are emitted for create, update, and delete operations

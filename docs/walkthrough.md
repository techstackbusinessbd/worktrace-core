# Walkthrough: Laravel Tracker API

We have successfully implemented the **Tracker Telemetry API** in Laravel to securely receive activity data and screenshots from the C# Desktop Agent.

## Storage Configuration (MinIO S3)
- Configured Laravel's `.env` to use the `s3` disk driver pointing to our local MinIO container (`http://minio:9000`).
- Installed `league/flysystem-aws-s3-v3` to handle S3 uploads natively.
- Set `AWS_USE_PATH_STYLE_ENDPOINT=true` which is required for MinIO compatibility.

## Database Architecture
Created two new tables using UUIDs and Foreign Keys linked to `tenants` and `users`:

### 1. `activities` table
Stores telemetry data about what the user is doing on their computer.
- Tracks `start_time`, `end_time`
- Tracks the `application_name` (e.g., "VS Code") and `window_title`
- Stores productivity metrics: `keyboard_strokes`, `mouse_clicks`
- Indicates if the user was away (`is_idle`)

### 2. `screenshots` table
Stores the reference to the image uploaded to MinIO.
- Links to the `activity_id` (so we know what they were doing when the screenshot was taken).
- Stores the `s3_path` (e.g., `screenshots/{tenant_id}/{user_id}/2026-06-14/image.jpg`).

## API Endpoints
Created `TrackerController` with two secure endpoints protected by Sanctum and Tenancy middleware:

- **`POST /api/v1/tracker/activity`**
  - Accepts an array of activities for bulk uploading. This allows the desktop agent to cache data locally and send it every 5-10 minutes, saving bandwidth and server load.
  
- **`POST /api/v1/tracker/screenshot`**
  - Accepts a multipart form data file (`image`).
  - Automatically uploads the file to MinIO S3 in an organized folder structure.
  - Saves the record in the database.

> [!TIP]
> **Next Step:** We are now completely ready to start building the **C# .NET 8 Desktop Agent (Tracker)**! It will authenticate via `/api/v1/login`, store the token, and use these new endpoints to push data.

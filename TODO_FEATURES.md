# 📌 GlobeTrotter — Remaining Features & P1 Backlog

This document outlines all **P1 high-priority differentiator features**, **missing usability enhancements**, and **P2 optional admin features** for GlobeTrotter, along with team member task assignments.

---

## 🎯 Section 1: P1 Differentiator Features (High Priority)

### 1. Interactive Mapbox Route & Markers Visualization
* **Owner**: Farhan (Travel Experience Lead)
* **Goal**: Transform static location badges into an interactive Mapbox canvas showing trip stops and route polylines.
* **Tasks**:
  - Install `mapbox-gl` / `react-map-gl` in `frontend/package.json`.
  - Add interactive map component to `TripDetails.tsx` and `Dashboard.tsx`.
  - Plot markers for all stops and activities using their `latitude` and `longitude`.
  - Fetch route polylines from backend Mapbox service (`backend/app/services/mapbox.py` -> `get_directions`) and render connecting path.

### 2. Drag-and-Drop Itinerary Reordering
* **Owner**: Farhan & Kavya
* **Goal**: Allow users to reorder activity cards across days via drag-and-drop.
* **Tasks**:
  - Install `@dnd-kit/core`, `@dnd-kit/sortable`, and `@dnd-kit/utilities` in `frontend/package.json`.
  - Add drag handles to activity cards inside `TripDetails.tsx`.
  - Trigger `POST /api/itinerary/reorder` on drop to persist new `order_index` and `day_number` values in PostgreSQL.

### 3. Custom Image Upload via Cloudinary
* **Owner**: Kavya (Frontend UI Lead)
* **Goal**: Enable custom cover photo uploads for trips and activities.
* **Tasks**:
  - Integrate Cloudinary upload widget or direct API upload component in `CreateTrip.tsx`.
  - Store returned Cloudinary image URLs in `cover_photo_url` / `cover_image_url` fields.

### 4. Live Google Places Search Proxy Integration
* **Owner**: Krishna (Backend Lead) & Farhan
* **Goal**: Search real-world tourist places, restaurants, and sights using Google Places API.
* **Tasks**:
  - Add `GOOGLE_PLACES_API_KEY` to environment configuration.
  - Wire `backend/app/services/places.py` to call Google Places Text Search and Details APIs when key is active.
  - Connect `Discover.tsx` search bar to query places live via backend.

---

## 🔗 Section 2: Usability & Workflow Enhancements

### 1. "Copy Shared Trip" UI Button
* **Owner**: Kavya & Farhan
* **Goal**: Allow users viewing a public share link (`/share/:slug`) to clone the itinerary into their own account.
* **Tasks**:
  - Add a "Copy Trip to My Account" button on `PublicTrip.tsx`.
  - Wire button to call backend `POST /api/sharing/{slug}/copy`.
  - Redirect user to `/trip/{new_id}` upon successful copy.

### 2. User Saved Favorite Destinations UI
* **Owner**: Kavya
* **Goal**: Allow users to bookmark favorite cities and view them on the Dashboard.
* **Tasks**:
  - Wire heart icon on city cards (`Discover.tsx`) to `POST /api/cities/{id}/save` and `DELETE /api/cities/{id}/save`.
  - Add a "Saved Destinations" tab on `Dashboard.tsx` calling `GET /api/cities/saved/me`.

### 3. Calendar / Timeline View Toggle
* **Owner**: Farhan
* **Goal**: Provide a calendar-style timeline view of itineraries alongside the standard day-list layout.
* **Tasks**:
  - Add a "List View / Calendar View" toggle button in `TripDetails.tsx`.
  - Render day blocks and activity time slots in grid timeline layout.

---

## 📊 Section 3: P2 Optional Features (Admin & Analytics)

### 1. Platform Admin & Engagement Analytics (`/api/admin/stats`)
* **Owner**: Krishna (Backend) & Kavya (Frontend)
* **Goal**: High-level admin dashboard for platform metrics.
* **Tasks**:
  - Create `POST /api/admin/stats` endpoint returning total trips count, active users, top popular cities, top activity categories, and total planned budget.
  - Build simple Admin route `/admin` with metric summary cards and charts.

---

## 📋 Section 4: Team Task Checklist

### 🎨 Kavya (Frontend UI)
- [ ] Add Cloudinary image uploader in `CreateTrip.tsx`.
- [ ] Add "Copy Trip" button on `PublicTrip.tsx` connected to `POST /api/sharing/{slug}/copy`.
- [ ] Add heart icon toggle on city cards and display saved cities using `GET /api/cities/saved/me`.

### 🗺️ Farhan (Travel Experience & Maps)
- [ ] Integrate Mapbox GL interactive map on `TripDetails.tsx`.
- [ ] Install `@dnd-kit` and implement drag-and-drop reordering for itinerary activities.
- [ ] Add Calendar / List view toggle in `TripDetails.tsx`.

### ⚡ Krishna (Backend & Database)
- [ ] Connect `GOOGLE_PLACES_API_KEY` to live Google Places Text Search in `backend/app/services/places.py`.
- [ ] (Optional P2) Add `GET /api/admin/stats` router in `backend/app/api/admin.py`.

### 🛠️ Tech Lead / Integration
- [ ] Maintain deployment pipelines on Vercel (Frontend) and Render/Railway (Backend).
- [ ] Verify CORS, environment variables, and PostgreSQL/Neon migration status (`alembic upgrade head`).

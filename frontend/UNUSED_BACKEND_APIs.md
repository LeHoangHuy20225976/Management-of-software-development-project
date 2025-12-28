# Unused Backend APIs - Implementation Guide

**Date:** 2025-12-27
**Total Unused APIs:** 20

This document lists all backend APIs that exist but are NOT yet used by the frontend, along with implementation guidelines.

---

## 📋 CATEGORIES

### 🏨 Hotel Profile (5 APIs)
### 👤 User Profile (3 APIs)
### 🏞️ Destinations (5 APIs)
### 🛏️ Room Inventory (3 APIs)
### 💳 Payment (1 API)
### ⭐ Reviews (3 APIs)

---

## 🏨 HOTEL PROFILE - Unused APIs (5)

### 1. POST /hotel-profile/add-hotel
**Purpose:** Create a new hotel
**Authentication:** Required
**Permission:** hotel_manager role
**Content-Type:** multipart/form-data
**Fields:**
- `thumbnail`: image file
- `hotelData`: JSON string with hotel information

**Request Format:**
```typescript
{
  name: string,
  address: string,
  description: text,
  contact_phone: string,
  longitude: number,
  latitude: number
}
```

**Where to implement:**
- Create `/hotel-manager/onboarding` page for new hotel managers
- Or add "Create New Hotel" button in hotel manager dashboard

**API Service:**
```typescript
// Add to services.ts
async createHotel(hotelData: {
  name: string;
  address: string;
  description: string;
  contact_phone: string;
  longitude: number;
  latitude: number;
  thumbnail?: File;
}): Promise<Hotel> {
  const formData = new FormData();
  if (hotelData.thumbnail) {
    formData.append('thumbnail', hotelData.thumbnail);
  }
  const { thumbnail, ...data } = hotelData;
  formData.append('hotelData', JSON.stringify(data));

  return apiClient.post<Hotel>(
    API_CONFIG.ENDPOINTS.ADD_HOTEL,
    formData,
    { 'Content-Type': 'multipart/form-data' }
  );
}
```

---

### 2. DELETE /hotel-profile/delete-hotel/:hotel_id
**Purpose:** Disable/soft delete hotel
**Authentication:** Required
**Permission:** hotel:update

**Where to implement:**
- Add "Delete Hotel" button in hotel manager profile settings
- Show confirmation modal before deletion

**API Service:**
```typescript
async deleteHotel(hotelId: string): Promise<void> {
  return apiClient.delete(
    API_CONFIG.ENDPOINTS.DELETE_HOTEL,
    { hotel_id: hotelId }
  );
}
```

---

### 3. POST /hotel-profile/add-facility/:hotel_id
**Purpose:** Add facilities/amenities to hotel
**Authentication:** Required
**Permission:** hotel:update

**Where to implement:**
- Already have `/hotel-manager/facilities` page (currently mock)
- Update to use real API

**API Service:**
```typescript
async addFacilities(hotelId: string, facilities: string[]): Promise<void> {
  return apiClient.post(
    API_CONFIG.ENDPOINTS.ADD_FACILITY,
    { hotel_id: hotelId, facilities },
    { hotel_id: hotelId }
  );
}
```

---

### 4. POST /hotel-profile/upload-images-for-hotel/:hotel_id
**Purpose:** Upload multiple images for hotel
**Authentication:** Required
**Permission:** hotel:update
**Content-Type:** multipart/form-data
**Field:** `images` (max 10 files)

**Where to implement:**
- Already have `/hotel-manager/images` page (currently uses localStorage)
- Update `handleUpload()` function to call real API

**API Service:**
```typescript
async uploadHotelImages(hotelId: string, images: File[]): Promise<Image[]> {
  const formData = new FormData();
  images.forEach(image => {
    formData.append('images', image);
  });

  return apiClient.post<Image[]>(
    API_CONFIG.ENDPOINTS.UPLOAD_HOTEL_IMAGES,
    formData,
    { hotel_id: hotelId },
    { 'Content-Type': 'multipart/form-data' }
  );
}
```

---

### 5. POST /hotel-profile/upload-images-for-room/:room_id
**Purpose:** Upload multiple images for specific room
**Authentication:** Required
**Permission:** room:update
**Content-Type:** multipart/form-data
**Field:** `images` (max 10 files)

**Where to implement:**
- Add to room edit page or images page
- Allow filtering by room and uploading room-specific images

**API Service:**
```typescript
async uploadRoomImages(roomId: string, images: File[]): Promise<Image[]> {
  const formData = new FormData();
  images.forEach(image => {
    formData.append('images', image);
  });

  return apiClient.post<Image[]>(
    API_CONFIG.ENDPOINTS.UPLOAD_ROOM_IMAGES,
    formData,
    { room_id: roomId },
    { 'Content-Type': 'multipart/form-data' }
  );
}
```

---

## 👤 USER PROFILE - Unused APIs (3)

### 6. POST /users
**Purpose:** Create new user (admin only)
**Authentication:** Required (admin)
**Permission:** admin role

**Where to implement:**
- Admin users page - add "Create User" button
- Create modal with user creation form

**API Service:**
```typescript
async createUser(userData: {
  name: string;
  email: string;
  phone_number: string;
  gender: string;
  date_of_birth: string;
  role: 'customer' | 'hotel_manager' | 'admin';
  password: string;
}): Promise<User> {
  return apiClient.post<User>(
    API_CONFIG.ENDPOINTS.CREATE_USER,
    userData
  );
}
```

---

### 7. GET /users/bookings
**Purpose:** Get current user's bookings
**Authentication:** Required

**Where to implement:**
- User dashboard bookings page (currently uses localStorage)
- Update to fetch from real API

**API Service:**
```typescript
async getUserBookings(): Promise<Booking[]> {
  return apiClient.get<Booking[]>(
    API_CONFIG.ENDPOINTS.USER_BOOKINGS
  );
}
```

**Page to update:** `app/user/dashboard/bookings/page.tsx`

---

### 8. GET /users/profile/image
**Purpose:** Get profile image URL
**Authentication:** Required

**Where to implement:**
- User profile page - display profile image
- Currently profile image might be in user object, but this endpoint gets the URL separately

**API Service:**
```typescript
async getProfileImageUrl(): Promise<{ url: string }> {
  return apiClient.get<{ url: string }>(
    API_CONFIG.ENDPOINTS.GET_PROFILE_IMAGE
  );
}
```

---

## 🏞️ DESTINATIONS - Unused APIs (5)

### 9. POST /destinations/:id/thumbnail
**Purpose:** Upload thumbnail for destination
**Authentication:** Required (admin)
**Content-Type:** multipart/form-data
**Field:** `thumbnail` (max 10MB)

**Where to implement:**
- Admin destinations page
- Add thumbnail upload in create/edit destination modal

**API Service:**
```typescript
async uploadDestinationThumbnail(destinationId: string, thumbnail: File): Promise<void> {
  const formData = new FormData();
  formData.append('thumbnail', thumbnail);

  return apiClient.post(
    API_CONFIG.ENDPOINTS.DESTINATION_THUMBNAIL,
    formData,
    { id: destinationId },
    { 'Content-Type': 'multipart/form-data' }
  );
}
```

---

### 10. DELETE /destinations/:id/thumbnail
**Purpose:** Delete destination thumbnail
**Authentication:** Required (admin)

**API Service:**
```typescript
async deleteDestinationThumbnail(destinationId: string): Promise<void> {
  return apiClient.delete(
    API_CONFIG.ENDPOINTS.DESTINATION_THUMBNAIL,
    { id: destinationId }
  );
}
```

---

### 11. GET /destinations/:id/images
**Purpose:** Get all images for destination
**Authentication:** None (public)

**Where to implement:**
- Destination detail page
- Display image gallery

**API Service:**
```typescript
async getDestinationImages(destinationId: string): Promise<Image[]> {
  return apiClient.get<Image[]>(
    API_CONFIG.ENDPOINTS.DESTINATION_IMAGES,
    { id: destinationId }
  );
}
```

---

### 12. POST /destinations/:id/images
**Purpose:** Upload image for destination
**Authentication:** Required (admin)
**Content-Type:** multipart/form-data
**Field:** `image`

**API Service:**
```typescript
async uploadDestinationImage(destinationId: string, image: File): Promise<Image> {
  const formData = new FormData();
  formData.append('image', image);

  return apiClient.post<Image>(
    API_CONFIG.ENDPOINTS.DESTINATION_IMAGES,
    formData,
    { id: destinationId },
    { 'Content-Type': 'multipart/form-data' }
  );
}
```

---

### 13. DELETE /destinations/:id/images/:imageId
**Purpose:** Delete destination image
**Authentication:** Required (admin)

**API Service:**
```typescript
async deleteDestinationImage(destinationId: string, imageId: string): Promise<void> {
  return apiClient.delete(
    API_CONFIG.ENDPOINTS.DELETE_DESTINATION_IMAGE,
    { id: destinationId, imageId }
  );
}
```

---

## 🛏️ ROOM INVENTORY - Unused APIs (3)

### 14. GET /rooms/types/:id
**Purpose:** Get room type by ID
**Authentication:** None (public)

**Where to implement:**
- Room type detail pages
- Booking flow to show room type details

**API Service:**
```typescript
async getRoomTypeById(typeId: string): Promise<RoomType> {
  return apiClient.get<RoomType>(
    API_CONFIG.ENDPOINTS.ROOM_TYPE_BY_ID,
    { id: typeId }
  );
}
```

---

### 15. GET /rooms/:id
**Purpose:** Get room by ID
**Authentication:** None (public)

**Where to implement:**
- Room detail pages
- Display specific room information

**API Service:**
```typescript
async getRoomById(roomId: string): Promise<Room> {
  return apiClient.get<Room>(
    API_CONFIG.ENDPOINTS.ROOM_BY_ID,
    { id: roomId }
  );
}
```

---

### 16. GET /rooms/type/:typeId
**Purpose:** Get all rooms of a specific room type
**Authentication:** None (public)

**Where to implement:**
- Room type detail pages
- Show available rooms for booking

**API Service:**
```typescript
async getRoomsByType(typeId: string): Promise<Room[]> {
  return apiClient.get<Room[]>(
    API_CONFIG.ENDPOINTS.ROOMS_BY_TYPE,
    { typeId }
  );
}
```

---

## 💳 PAYMENT - Unused APIs (1)

### 17. POST /payments/:id/cancel
**Purpose:** Cancel pending payment
**Authentication:** Required
**Permission:** booking:cancel_own or payment:manage

**Where to implement:**
- User bookings page
- Add "Cancel Payment" button for pending payments

**API Service:**
```typescript
async cancelPayment(paymentId: string): Promise<void> {
  return apiClient.post(
    API_CONFIG.ENDPOINTS.PAYMENT_CANCEL,
    {},
    { id: paymentId }
  );
}
```

**Note:** PAYMENT_CANCEL endpoint needs to be added to config.ts:
```typescript
PAYMENT_CANCEL: '/payments/:id/cancel',
```

---

## ⭐ REVIEWS - Unused APIs (3)

### 18. POST /hotel-profile/add-review
**Purpose:** Add review for hotel
**Authentication:** Required

**Where to implement:**
- Hotel detail page
- User dashboard (my reviews)

**API Service:**
```typescript
async addHotelReview(reviewData: {
  hotel_id: string;
  rating: number;
  comment: string;
  title?: string;
}): Promise<Review> {
  return apiClient.post<Review>(
    API_CONFIG.ENDPOINTS.ADD_REVIEW,
    reviewData
  );
}
```

**Note:** Currently `reviewsApi.create()` exists but might not be used in UI

---

### 19. PUT /hotel-profile/update-review/:review_id
**Purpose:** Update review
**Authentication:** Required
**Permission:** Must be review owner

**Where to implement:**
- User reviews page
- Hotel detail page (if user owns the review)

**API Service:**
```typescript
async updateHotelReview(reviewId: string, reviewData: {
  rating?: number;
  comment?: string;
  title?: string;
}): Promise<Review> {
  return apiClient.put<Review>(
    API_CONFIG.ENDPOINTS.UPDATE_REVIEW,
    reviewData,
    { review_id: reviewId }
  );
}
```

---

### 20. DELETE /hotel-profile/delete-review/:review_id
**Purpose:** Delete review
**Authentication:** Required
**Permission:** Must be review owner

**Where to implement:**
- User reviews page
- Hotel detail page (if user owns the review)

**API Service:**
```typescript
async deleteHotelReview(reviewId: string): Promise<void> {
  return apiClient.delete(
    API_CONFIG.ENDPOINTS.DELETE_REVIEW,
    { review_id: reviewId }
  );
}
```

---

## 🎯 IMPLEMENTATION PRIORITY

### 🔴 High Priority (User-Facing Features)
1. **Upload Hotel Images** (API #4) - Hotel managers need this
2. **Add/Edit/Delete Reviews** (APIs #18-20) - Users need to review hotels
3. **Get User Bookings** (API #7) - User dashboard needs real data
4. **Cancel Payment** (API #17) - Important for payment flow
5. **Upload Room Images** (API #5) - Hotel managers need this

### 🟡 Medium Priority (Admin Features)
6. **Create Hotel** (API #1) - Onboarding new hotels
7. **Delete Hotel** (API #2) - Hotel management
8. **Add Facilities** (API #3) - Hotel amenities
9. **Destination Images** (APIs #9-13) - Content management
10. **Create User** (API #6) - Admin user management

### 🟢 Low Priority (Nice to Have)
11. **Get Room/Type Details** (APIs #14-16) - Optimization/detail pages
12. **Get Profile Image URL** (API #8) - Minor feature

---

## 📝 IMPLEMENTATION STEPS

For each unused API, follow these steps:

### Step 1: Add API Endpoint to Config (if missing)
```typescript
// frontend/lib/api/config.ts
ENDPOINTS: {
  // ... existing endpoints
  NEW_ENDPOINT: '/path/to/endpoint/:param',
}
```

### Step 2: Add API Service Function
```typescript
// frontend/lib/api/services.ts
async newFunction(params): Promise<ReturnType> {
  return apiClient.method<ReturnType>(
    API_CONFIG.ENDPOINTS.NEW_ENDPOINT,
    data,
    { param: value }
  );
}
```

### Step 3: Update UI Component
- Import API function
- Replace mock/localStorage with API call
- Handle loading/error states
- Update on success

### Step 4: Test
- Test with real backend
- Check error handling
- Verify data flow

---

## 🚀 QUICK WIN: Upload Hotel Images Example

Here's a complete example of implementing hotel image upload:

### 1. Add to services.ts:
```typescript
async uploadHotelImages(hotelId: string, images: File[]): Promise<Image[]> {
  const formData = new FormData();
  images.forEach(image => formData.append('images', image));

  return apiClient.post<Image[]>(
    API_CONFIG.ENDPOINTS.UPLOAD_HOTEL_IMAGES,
    formData,
    { hotel_id: hotelId },
    { 'Content-Type': 'multipart/form-data' }
  );
}
```

### 2. Update app/hotel-manager/images/page.tsx:

Replace `handleUpload()` function (lines 90-111):
```typescript
const handleUpload = async () => {
  if (uploadForm.files.length === 0) return;

  setUploading(true);

  try {
    const hotelId = 'h1'; // TODO: Get from auth context
    const uploadedImages = await hotelManagerApi.uploadHotelImages(
      hotelId,
      uploadForm.files
    );

    // Add to local state
    saveImages([...images, ...uploadedImages]);
    setUploadForm({ type: 'hotel', caption: '', files: [] });
    setShowUploadModal(false);
    alert('✅ Upload thành công!');
  } catch (error) {
    console.error('Error uploading images:', error);
    alert('❌ Lỗi khi upload ảnh!');
  } finally {
    setUploading(false);
  }
};
```

---

## 📊 COVERAGE SUMMARY

- **Total Backend APIs:** 104
- **Already Used:** 84 (81%)
- **Unused:** 20 (19%)

**By Category:**
- Hotel Profile: 11/16 used (69%)
- User Profile: 6/9 used (67%)
- Destinations: 8/13 used (62%)
- Room Inventory: 6/9 used (67%)
- Payments: 9/10 used (90%)
- Reviews: 0/3 used (0%) ⚠️

**Priority Focus:** Implement Reviews APIs and Image Upload APIs first.

---

**Next Steps:** Pick 1-2 high priority APIs and implement them using the examples above. Once comfortable with the pattern, implement the rest gradually.

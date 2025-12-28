# API Request/Response Formats (required vs optional fields)

Successful responses use HTTP 200 with `{ success: true, data, status: 200, message: "ok" }` unless noted. Fields marked REQUIRED must be non-empty based on controller/service usage; others are optional.

## Auth (/auth)
- `POST /auth/login`
  - possible_request_format:
    + REQUIRED `{ "userData": { "email": string, "password": string, "role": string } }`
  - possible_response_format:
    + sets httpOnly cookies `accessToken`, `refreshToken`
    + `{ "success": true, "data": { "user_id": number, "name": string, "gender": string, "role": string, "profile_image": string|null }, "status": 200, "message": "ok" }`
- `POST /auth/register`
  - possible_request_format:
    + REQUIRED `{ "userData": { "name": string, "email": string, "phone_number": string, "gender": string, "date_of_birth": string, "role": string, "password": string, "profile_image": string|null } }`
    + note: `profile_image` can be null; others should be provided to avoid DB issues.
  - possible_response_format:
    + `{ "success": true, "data": { "email": string }, "status": 200, "message": "ok" }` (401 if email exists)
- `POST /auth/refresh-tokens`
  - possible_request_format:
    + REQUIRED `refreshToken` cookie; no body
  - possible_response_format:
    + sets new token cookies; `{ "success": true, "data": { "message": "Tokens refreshed successfully" }, "status": 200, "message": "ok" }`
- `POST /auth/logout`
  - possible_request_format:
    + requires auth middleware; no body
  - possible_response_format:
    + clears token cookies; `{ "success": true, "data": { "message": "Logged out successfully" }, "status": 200, "message": "ok" }`
- `POST /auth/verify-forget-password`
  - possible_request_format:
    + REQUIRED `{ "email": string }`
  - possible_response_format:
    + `{ "success": true, "data": { "message": "Password reset link sent to email, please use this link to access the reset page." }, "status": 200, "message": "ok" }`
- `POST /auth/reset-password`
  - possible_request_format:
    + requires auth middleware
    + REQUIRED `{ "currentPassword": string, "newPassword": string, "confirmNewPassword": string }`
  - possible_response_format:
    + `{ "success": true, "data": { "message": "Password reset successfully" }, "status": 200, "message": "ok" }`
- `POST /auth/reset-forget-password`
  - possible_request_format:
    + REQUIRED `{ "email": string, "newPassword": string, "newPasswordConfirm": string, "token": string }`
  - possible_response_format:
    + `{ "success": true, "data": { "message": "Password reset successfully" }, "status": 200, "message": "ok" }`

## Hotel Profile (/hotel-profile)
- `POST /hotel-profile/add-hotel`
  - possible_request_format:
    + requires auth middleware
    + `multipart/form-data`
      - REQUIRED field `hotelData` (JSON string): `{ "hotelName": string, "address": string, "contact_phone": string, "longitude": number|null, "latitute": number|null, "description": string }`
      - optional file field `thumbnail` (image/*, max 5MB)
    + `hotelName`, `address`, `contact_phone` must be present (name/address are lowercased in service); others optional.
  - possible_response_format:
    + `{ "success": true, "data": { "message": "Add hotel <hotelName> successfully " }, "status": 200, "message": "ok" }`
- `POST /hotel-profile/add-room-type`
  - possible_request_format:
    + requires auth + rbac `room:create`
    + REQUIRED `{ "typeData": { "hotel_id": number, "type": string, "priceData": { "basic_price": number, "special_price": number|null, "event": string, "discount": number } , "availability": boolean?, "max_guests": number?, "description": string? } }`
    + `hotel_id`, `type`, and `priceData.basic_price` must be present; other fields optional.
  - possible_response_format:
    + `{ "success": true, "data": { "message": "Add room type successfully" }, "status": 200, "message": "ok" }`
- `POST /hotel-profile/add-room`
  - possible_request_format:
    + requires auth + rbac `room:create`
    + `multipart/form-data`
      - REQUIRED field `roomData` (JSON string): `{ "type_id": number, "name": string, "location": string, "number_of_single_beds": number?, "number_of_double_beds": number?, "room_view": string?, "room_size": number?, "notes": string? }`
      - optional file field `images` (image/* array, up to 10 files, max 5MB each)
    + `type_id`, `name`, and `location` must be present; others optional.
  - possible_response_format:
    + `{ "success": true, "data": { "message": "Add room successfully" }, "status": 200, "message": "ok" }`
- `GET /hotel-profile/view-hotel/:hotel_id`
  - possible_request_format:
    + REQUIRED path param `hotel_id`
  - possible_response_format:
    + `{ "success": true, "data": HotelObject, "status": 200, "message": "ok" }`
- `PUT /hotel-profile/update-hotel/:hotel_id`
  - possible_request_format:
    + requires auth + rbac `hotel:update`
    + path param `hotel_id`
    + `multipart/form-data`
      - optional field `hotelData` (JSON string): `{ "hotelName": string?, "address": string?, "status": number?, "longitude": number?, "latitute": number?, "description": string?, "contact_phone": string? }`
      - optional file field `thumbnail` (image/*, max 5MB)
  - possible_response_format:
    + `{ "success": true, "data": { "message": "Update hotel profile successfully" }, "status": 200, "message": "ok" }`
- `DELETE /hotel-profile/delete-hotel/:hotel_id`
  - possible_request_format:
    + requires auth + rbac `hotel:update`
    + REQUIRED path param `hotel_id`
  - possible_response_format:
    + `{ "success": true, "data": { "message": "Disable hotel successfully" }, "status": 200, "message": "ok" }`
- `POST /hotel-profile/add-facility/:hotel_id`
  - possible_request_format:
    + requires auth + rbac `hotel:update`
    + REQUIRED `{ "facilityData": { "hotel_id": number, "facilities": [ { "facility_id": number, "description": string? } ] } }` and path param `hotel_id`
    + `facility_id` required per item; `description` optional.
  - possible_response_format:
    + `{ "success": true, "data": { "message": "Add facility successfully" }, "status": 200, "message": "ok" }`
- `PUT /hotel-profile/update-price`
  - possible_request_format:
    + requires auth + rbac `room:update`
    + REQUIRED `{ "priceData": { "type_id": number, "basic_price": number?, "special_price": number|null, "event": string?, "discount": number?, "start_date": string?, "end_date": string? } }`
    + `type_id` must be present; `basic_price` should be provided when updating price; others optional.
  - possible_response_format:
    + `{ "success": true, "data": { "message": "Update price successfully" }, "status": 200, "message": "ok" }`
- `GET /hotel-profile/view-room-types/:hotel_id`
  - possible_request_format:
    + REQUIRED path param `hotel_id`
  - possible_response_format:
    + `{ "success": true, "data": [RoomTypeObject], "status": 200, "message": "ok" }`
- `GET /hotel-profile/view-all-rooms/:hotel_id`
  - possible_request_format:
    + REQUIRED path param `hotel_id`
  - possible_response_format:
    + `{ "success": true, "data": [ { "roomData": RoomObjectWithIsAvailable, "roomTypeData": RoomTypeObject, "priceData": { "price": number, "discount": number, "start_date": string, "end_date": string }|null } ], "status": 200, "message": "ok" }`
- `GET /hotel-profile/all-rooms`
  - possible_request_format:
    + no params
  - possible_response_format:
    + `{ "success": true, "data": [ { "roomData": RoomObjectWithIsAvailable, "roomTypeData": RoomTypeObject, "priceData": { "price": number, "discount": number, "start_date": string, "end_date": string }|null } ], "status": 200, "message": "ok" }`
- `GET /hotel-profile/all-hotels`
  - possible_request_format:
    + no params
  - possible_response_format:
    + `{ "success": true, "data": [HotelObject], "status": 200, "message": "ok" }`
- `POST /hotel-profile/upload-images-for-hotel/:hotel_id`
  - possible_request_format:
    + requires auth + rbac `hotel:update`
    + REQUIRED path param `hotel_id`
    + `multipart/form-data`
      - REQUIRED file field `images` (image/* array, up to 10 files, max 5MB each)
  - possible_response_format:
    + `{ "success": true, "data": { "message": string }, "status": 200, "message": "ok" }`
- `POST /hotel-profile/upload-images-for-room/:room_id`
  - possible_request_format:
    + requires auth + rbac `room:update`
    + REQUIRED path param `room_id`
    + `multipart/form-data`
      - REQUIRED file field `images` (image/* array, up to 10 files, max 5MB each)
  - possible_response_format:
    + `{ "success": true, "data": { "message": string }, "status": 200, "message": "ok" }`

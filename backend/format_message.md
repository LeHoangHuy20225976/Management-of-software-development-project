# API Request/Response Formats

For each route, include the request shape and the URL to call from client. Successful responses use HTTP 200 with `{ success: true, data, status: 200, message: "ok" }` unless noted.

## Auth (/auth)
- `POST /auth/login`
  - possible_request_format:
    + `{ "userData": { "email": string, "password": string, "role": string } }`
  - possible_response_format:
    + sets httpOnly cookies `accessToken`, `refreshToken`
    + `{ "success": true, "data": { "user_id": number, "name": string, "gender": string, "role": string, "profile_image": string|null }, "status": 200, "message": "ok" }`
- `POST /auth/register`
  - possible_request_format:
    + `{ "userData": { "name": string, "email": string, "phone_number": string, "gender": string, "date_of_birth": string, "role": string, "password": string, "profile_image": string|null } }`
  - possible_response_format:
    + `{ "success": true, "data": { "email": string }, "status": 200, "message": "ok" }` (401 if email exists)
- `POST /auth/refresh-tokens`
  - possible_request_format:
    + requires `refreshToken` cookie; no body
  - possible_response_format:
    + sets new token cookies; `{ "success": true, "data": { "message": "Tokens refreshed successfully" }, "status": 200, "message": "ok" }`
- `POST /auth/logout`
  - possible_request_format:
    + requires auth middleware; no body
  - possible_response_format:
    + clears token cookies; `{ "success": true, "data": { "message": "Logged out successfully" }, "status": 200, "message": "ok" }`
- `POST /auth/verify-forget-password`
  - possible_request_format:
    + `{ "email": string }`
  - possible_response_format:
    + `{ "success": true, "data": { "message": "Password reset link sent to email, please use this link to access the reset page." }, "status": 200, "message": "ok" }`
- `POST /auth/reset-password`
  - possible_request_format:
    + requires auth middleware
    + `{ "currentPassword": string, "newPassword": string, "confirmNewPassword": string }`
  - possible_response_format:
    + `{ "success": true, "data": { "message": "Password reset successfully" }, "status": 200, "message": "ok" }`
- `POST /auth/reset-forget-password`
  - possible_request_format:
    + `{ "email": string, "newPassword": string, "newPasswordConfirm": string, "token": string }`
  - possible_response_format:
    + `{ "success": true, "data": { "message": "Password reset successfully" }, "status": 200, "message": "ok" }`

## Hotel Profile (/hotel-profile)
- `POST /hotel-profile/add-hotel`
  - possible_request_format:
    + requires auth middleware
    + `{ "hotelData": { "hotelName": string, "address": string, "longitude": number|null, "latitute": number|null, "description": string, "contact_phone": string, "thumbnail": string|null } }`
  - possible_response_format:
    + `{ "success": true, "data": { "message": "Add hotel <hotelName> successfully " }, "status": 200, "message": "ok" }`
- `POST /hotel-profile/add-room-type`
  - possible_request_format:
    + requires auth + rbac `room:create`
    + `{ "typeData": { "hotel_id": number, "type": string, "availability": boolean?, "max_guests": number?, "description": string?, "priceData": { "special_price": number|null, "event": string, "basic_price": number, "discount": number } } }`
  - possible_response_format:
    + `{ "success": true, "data": { "message": "Add room type successfully" }, "status": 200, "message": "ok" }`
- `POST /hotel-profile/add-room`
  - possible_request_format:
    + requires auth + rbac `room:create`
    + `{ "roomData": { "type_id": number, "name": string, "location": string, "number_of_single_beds": number?, "number_of_double_beds": number?, "room_view": string?, "room_size": number?, "notes": string? } }`
  - possible_response_format:
    + `{ "success": true, "data": { "message": "Add room successfully" }, "status": 200, "message": "ok" }`
- `GET /hotel-profile/view-hotel/:hotel_id`
  - possible_request_format:
    + path param `hotel_id`
  - possible_response_format:
    + `{ "success": true, "data": HotelObject, "status": 200, "message": "ok" }`
- `PUT /hotel-profile/update-hotel/:hotel_id`
  - possible_request_format:
    + requires auth + rbac `hotel:update`
    + `{ "hotelData": { "hotelName": string?, "address": string?, "status": number?, "longitude": number?, "latitute": number?, "description": string?, "contact_phone": string?, "thumbnail": string? } }`
  - possible_response_format:
    + `{ "success": true, "data": { "message": "Update hotel profile successfully" }, "status": 200, "message": "ok" }`
- `DELETE /hotel-profile/delete-hotel/:hotel_id`
  - possible_request_format:
    + requires auth + rbac `hotel:update`
    + path param `hotel_id`
  - possible_response_format:
    + `{ "success": true, "data": { "message": "Disable hotel successfully" }, "status": 200, "message": "ok" }`
- `POST /hotel-profile/add-facility/:hotel_id`
  - possible_request_format:
    + requires auth + rbac `hotel:update`
    + `{ "facilityData": { "hotel_id": number, "facilities": [ { "facility_id": number, "description": string? } ] } }`
  - possible_response_format:
    + `{ "success": true, "data": { "message": "Add facility successfully" }, "status": 200, "message": "ok" }`
- `PUT /hotel-profile/update-price`
  - possible_request_format:
    + requires auth + rbac `room:update`
    + `{ "priceData": { "type_id": number, "start_date": string?, "end_date": string?, "special_price": number|null, "event": string?, "basic_price": number?, "discount": number? } }`
  - possible_response_format:
    + `{ "success": true, "data": { "message": "Update price successfully" }, "status": 200, "message": "ok" }`
- `GET /hotel-profile/view-room-types/:hotel_id`
  - possible_request_format:
    + path param `hotel_id`
  - possible_response_format:
    + `{ "success": true, "data": [RoomTypeObject], "status": 200, "message": "ok" }`
- `GET /hotel-profile/view-all-rooms/:hotel_id`
  - possible_request_format:
    + path param `hotel_id`
  - possible_response_format:
    + `{ "success": true, "data": [ { "roomData": RoomObjectWithIsAvailable, "roomTypeData": RoomTypeObject, "priceData": { "price": number, "discount": number, "start_date": string, "end_date": string }|null } ], "status": 200, "message": "ok" }`
- `GET /hotel-profile/all-rooms`
  - possible_request_format:
    + no params
  - possible_response_format:
    + `{ "success": true, "data": [ { "roomData": RoomObjectWithIsAvailable, "roomTypeData": RoomTypeObject, "priceData": { "price": number, "discount": number, "start_date": string, "end_date": string }|null } ], "status": 200, "message": "ok" }`

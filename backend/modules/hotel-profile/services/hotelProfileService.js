const db = require("../../../models/index");
const { Op, fn, col, where } = require('sequelize');
const minioUtils = require("../../../utils/minioUtils");
const { up } = require("../../../migrations/20251215110000-change-media-url-columns-to-text");

const toPublicObjectUrl = (presignedUrl) => {
    if (!presignedUrl) return null;

    try {
        const url = new URL(presignedUrl);

        // Remove signature/query params to make it a plain object URL.
        url.search = "";

        // If you want a specific external host/port, set these env vars.
        // Example (host machine): MINIO_PUBLIC_ENDPOINT=localhost, MINIO_PUBLIC_PORT=9002
        const publicEndpoint = process.env.MINIO_PUBLIC_ENDPOINT;
        const publicPort = process.env.MINIO_PUBLIC_PORT;

        if (publicEndpoint) url.hostname = publicEndpoint;
        if (publicPort) url.port = String(publicPort);

        // Dev convenience: when running in Docker Compose, presigned URLs often use `minio:9000`
        // which isn't reachable from the host browser. Map it to `localhost:9002` by default.
        if (!publicEndpoint && !publicPort && url.hostname === "minio" && url.port === "9000") {
            url.hostname = "localhost";
            url.port = "9002";
        }

        return url.toString();
    } catch {
        return presignedUrl.split("?")[0];
    }
};

const normalizeObjectName = (value) => {
    if (value === null || value === undefined) return value;
    if (typeof value !== "string") return value;

    const trimmed = value.trim();
    if (trimmed === "") return "";

    const withoutQuery = trimmed.split("?")[0].split("#")[0];

    try {
        const url = new URL(withoutQuery);
        const segments = url.pathname.split("/").filter(Boolean);
        return segments.length ? segments[segments.length - 1] : trimmed;
    } catch {
        const segments = withoutQuery.split("/").filter(Boolean);
        return segments.length ? segments[segments.length - 1] : withoutQuery;
    }
};

const hotelProfileService = {
    async addNewHotel(hotelData, userid, thumbnailFile) {
        // check for existed hotel based on address and name
        console.log("Hotel data: ", hotelData);
        const existedHotel = await db.Hotel.findOne({
            where: {
                [Op.and]: [
                    where(fn('lower', col('name')), hotelData.hotelName.toLowerCase()),
                    where(fn('lower', col('address')), hotelData.address.toLowerCase()),
                ],
            },
        });
        if(existedHotel) {
            throw new Error("Hotel has been registered on our system");
        }
        let uploadedThumbnail = null;
        let thumbnailUrl = hotelData?.thumbnail ? hotelData.thumbnail : null;
        try {
            if (thumbnailFile?.buffer) {
                if (!thumbnailFile.mimetype?.startsWith("image/")) {
                    throw new Error("Only image files are allowed");
                }
                console.log("Uploading thumbnail to MinIO...", minioUtils.buckets.HOTEL_IMAGES);
	                uploadedThumbnail = await minioUtils.uploadFile(
	                    minioUtils.buckets.HOTEL_IMAGES,
	                    thumbnailFile.buffer,
	                    thumbnailFile.originalname,
	                    { "Content-Type": thumbnailFile.mimetype }
	                );
	
	                thumbnailUrl = uploadedThumbnail.fileName;
	                console.log("Thumbnail uploaded:", thumbnailUrl);
	            }

            const newHotel = await db.Hotel.create({
                name: hotelData.hotelName,
                hotel_owner: userid,
                address: hotelData.address,
                status: 1,
                rating: hotelData.rating ?? hotelData.rating ?? 3.0,
                longitude: hotelData.longitude ? hotelData.longitude : null,
                latitude: hotelData.latitude ?? hotelData.latitute ?? null,
                description: hotelData.description ? hotelData.description : 'No description provided',
                contact_phone: hotelData.contact_phone,
                thumbnail: thumbnailUrl
            });
            const user = await db.User.findByPk(userid);
            user.role = 'hotel_manager';
            await user.save();
            return {
                hotelName: newHotel.name
            };
        } catch (error) {
            if (uploadedThumbnail?.fileName) {
                try {
                    await minioUtils.deleteFile(
                        minioUtils.buckets.HOTEL_IMAGES,
                        uploadedThumbnail.fileName
                    );
                } catch (cleanupError) {
                    console.error("Failed to cleanup uploaded thumbnail:", cleanupError);
                }
            }
            throw error;
        }
    },
    async addTypeForHotel(typeData, userid) {
        const hotel = await db.Hotel.findByPk(typeData.hotel_id);
        if(!hotel) {
            throw new Error("Hotel not found");
        }
        // check for user who update room is the owner of hotel or not
        const ownerid = hotel.hotel_owner;
        if(userid !== ownerid) {
            throw new Error("You are not the owner of this hotel");
        }
        const newRoomType = await db.RoomType.create({
            hotel_id: typeData.hotel_id,
            type: typeData.type,
            availability: typeData.availability ? typeData.availability : true,
            max_guests: typeData.max_guests ? typeData.max_guests: 2,
            description: typeData.description ? typeData.description : 'No description provided',
            quantity: 0
        });
        // get type_id from the roomtype be created to add price
        const NOW = new Date();
        const priceData = typeData.priceData;
        console.log("Price data: ", priceData);
        await db.RoomPrice.create({
            type_id: newRoomType.type_id,
            start_date: NOW,
            end_date: null,
            special_price: priceData.special_price ? priceData.special_price : null,
            event: priceData.event ? priceData.event : 'No event',
            basic_price: priceData.basic_price,
            discount: priceData.discount ? priceData.discount : 0.0
        });
    },
    async addRoom(roomData, userid, imageFiles) {
        const typeId = roomData.type_id;
        // check for type
        const roomType = await db.RoomType.findByPk(typeId);
        if(!roomType) {
            throw new Error("Room type not found");
        }
        const hotel = await db.Hotel.findByPk(roomType.hotel_id);
        if(!hotel) {
            throw new Error("Hotel not found");
        }
        const ownerid = hotel.hotel_owner;
        if(ownerid !== userid) {
            throw new Error("You are not the owner of this hotel");
        }
        const newRoom = await db.Room.create({
            type_id: roomType.type_id,
            name: roomData.name, 
            location: roomData.location,
            status: 1,
            estimated_available_time: null,
            number_of_single_beds: roomData.number_of_single_beds ? roomData.number_of_single_beds : 0,
            number_of_double_beds: roomData.number_of_double_beds ? roomData.number_of_double_beds: 0,
            room_view: roomData.room_view ? roomData.room_view: 'No view',
            room_size: roomData.room_size ? roomData.room_size: 0.0,
            notes: roomData.notes ? roomData.notes: 'No notes'
        });

        // update quantity of room type
        roomType.quantity += 1;
        await roomType.save();

        // Handle image files for the room
        if (imageFiles && imageFiles.length > 0) {
            for (const file of imageFiles) {
                if (!file.mimetype?.startsWith("image/")) {
                    throw new Error("Only image files are allowed");
                }

                const uploadedImage = await minioUtils.uploadFile(
                    minioUtils.buckets.ROOM_IMAGES,
                    file.buffer,
                    file.originalname,
                    { "Content-Type": file.mimetype }
                );

                await db.Image.create({
                    room_id: newRoom.room_id,
                    image_url: uploadedImage.fileName
                });
            }
        }
    },
    async viewHotelProfile(hotelid) {
        const hotel = await db.Hotel.findByPk(hotelid);
        if(!hotel) {
            throw new Error("Hotel not found");
        }
        // get images for hotel
        const imageUrl = hotel?.thumbnail ? hotel.thumbnail : null;
        if(imageUrl) {
            // Check if it's already a full URL (from external sources like Unsplash)
            if(imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
                hotel.thumbnail = imageUrl; // Keep the external URL as-is
            } else {
                // It's a MinIO object key, get presigned URL
                const presignedUrl = await minioUtils.getFileUrl(
                    minioUtils.buckets.HOTEL_IMAGES,
                    imageUrl
                );
                let publicUrl = toPublicObjectUrl(presignedUrl);
                hotel.thumbnail = publicUrl; // just replace with presigned URL to return for client
            }
        }
        const imageList = await db.Image.findAll({
            where: { hotel_id: hotel.hotel_id }
        });
        const publicImageUrls = [];
        for(const image of imageList) {
            // Check if it's already a full URL
            if(image.image_url.startsWith('http://') || image.image_url.startsWith('https://')) {
                publicImageUrls.push(image.image_url); // Keep the external URL as-is
            } else {
                // It's a MinIO object key, get presigned URL
                const presignedUrl = await minioUtils.getFileUrl(
                    minioUtils.buckets.HOTEL_IMAGES,
                    image.image_url
                );
                let publicUrl = toPublicObjectUrl(presignedUrl);
                publicImageUrls.push(publicUrl);
            }
        }
        hotel.setDataValue('imageUrls', publicImageUrls); // make it JSON-visible

        // Get facilities for hotel
        const facilitiesPossessing = await db.FacilitiesPossessing.findAll({
            where: { hotel_id: hotel.hotel_id },
            include: [{
                model: db.HotelFacilities,
                as: 'HotelFacility',
                attributes: ['facility_id', 'name']
            }]
        });
        const facilities = facilitiesPossessing.map(fp => ({
            facility_id: fp.HotelFacility.facility_id,
            name: fp.HotelFacility.name
        }));
        hotel.setDataValue('facilities', facilities); // make it JSON-visible

        console.log("Hotel profile data: ", hotel);
        return {
            hotelData: hotel
        }
    },
    async updateHotelProfile(hotelid, userid, hotelData = {}, thumbnailFile) {
        const hotel = await db.Hotel.findByPk(hotelid);
        if(!hotel) {
            throw new Error("Hotel not found");
        }
        const ownerid = hotel.hotel_owner;
        if(ownerid !== userid) {
            throw new Error("You are not the owner of this hotel");
        }

        const hasThumbnailField = Object.prototype.hasOwnProperty.call(hotelData, "thumbnail");
        const previousThumbnail = hotel.thumbnail;
        console.log("Previous thumbnail:", previousThumbnail);
        let uploadedThumbnail = null;

        try {
            let nextThumbnail = previousThumbnail;

            if (thumbnailFile?.buffer) {
                console.log("Uploading new thumbnail to MinIO...", minioUtils.buckets.HOTEL_IMAGES);
                if (!thumbnailFile.mimetype?.startsWith("image/")) {
                    throw new Error("Only image files are allowed");
                }

                uploadedThumbnail = await minioUtils.uploadFile(
                    minioUtils.buckets.HOTEL_IMAGES,
                    thumbnailFile.buffer,
                    thumbnailFile.originalname,
                    { "Content-Type": thumbnailFile.mimetype }
                );

                nextThumbnail = uploadedThumbnail.fileName;
                console.log("Uploaded new thumbnail:", nextThumbnail);
            } else if (hasThumbnailField) {
                nextThumbnail = normalizeObjectName(hotelData.thumbnail);
            }

            // Use nullish coalescing to allow falsy values like 0 or empty strings to be saved intentionally
            hotel.name = hotelData.hotelName ?? hotel.name;
            hotel.address = hotelData.address ?? hotel.address;
            hotel.status = hotelData.status ?? hotel.status;
            hotel.longitude = hotelData.longitude ?? hotel.longitude;
            hotel.latitude = (hotelData.latitude ?? hotelData.latitute) ?? hotel.latitude;
            hotel.description = hotelData.description ?? hotel.description;
            hotel.contact_phone = hotelData.contact_phone ?? hotel.contact_phone;

            if (nextThumbnail !== previousThumbnail) {
                hotel.thumbnail = nextThumbnail;
            }

            await hotel.save();
        } catch (error) {
            if (uploadedThumbnail?.fileName) {
                try {
                    await minioUtils.deleteFile(
                        minioUtils.buckets.HOTEL_IMAGES,
                        uploadedThumbnail.fileName
                    );
                } catch (cleanupError) {
                    console.error("Failed to cleanup uploaded thumbnail:", cleanupError);
                }
            }
            throw error;
        }

        if (previousThumbnail && previousThumbnail !== hotel.thumbnail) {
            try {
                await minioUtils.deleteFile(minioUtils.buckets.HOTEL_IMAGES, previousThumbnail);
            } catch (cleanupError) {
                console.error("Failed to cleanup previous thumbnail:", cleanupError);
            }
        }
    },
    async disableHotel(hotelid, userid) {
        const hotel = await db.Hotel.findByPk(hotelid);
        if(!hotel) {
            throw new Error("Hotel not found");
        }
        if(hotel.hotel_owner !== userid) {
            throw new Error("You are not the owner of this hotel");
        }
        const transaction = await db.sequelize.transaction();
        try {
            hotel.status = 0;
            await hotel.save({ transaction });
            const roomTypes = await db.RoomType.findAll({
                where: { hotel_id: hotelid },
                attributes: ['type_id'],
                transaction
            });
            const typeIds = roomTypes.map((roomType) => roomType.type_id);
            if(typeIds.length > 0) {
                await db.RoomType.update(
                    { availability: false },
                    {
                        where: { type_id: typeIds },
                        transaction
                    }
                );
                await db.Room.update( 
                    {status: 0}, 
                    {
                        where: {type_id: typeIds},
                        transaction
                    }
                )
            }
            await transaction.commit();
        } catch (error) {
            await transaction.rollback(); 
            throw error;
        }
    },
    updateFacilityForHotel: async(facilityData, userid, hotelid) => {
        const hotel = await db.Hotel.findByPk(hotelid);
        if(!hotel) {
            throw new Error("Hotel not found");
        }
        // check for the verification of update 
        const ownerid = hotel.hotel_owner;
        if(ownerid !== userid) {
            throw new Error("You are not the owner of hotel");
        }
        // add facility for hotel (must be initialized first)
        const listFacilities = facilityData.facilities; // list of facilities and descriptions
        await db.FacilitiesPossessing.destroy({
            where: {
                hotel_id: facilityData.hotel_id
            }
        });
        for(const facility of listFacilities) {   
            await db.FacilitiesPossessing.create({
                facility_id: facility.facility_id,
                hotel_id: facilityData.hotel_id,
                description: facility.description ? facility.description : 'No description provided'
            });
        }
    },
    updatePriceForRoomType: async(priceData, userid) => {
        const roomType = await db.RoomType.findByPk(priceData.type_id);
        if(!roomType) {
            throw new Error("Room type not found");
        }
        // update room price
        const hotel = await db.Hotel.findByPk(roomType.hotel_id);
        if(!hotel) {
            throw new Error("Hotel not found");
        }
        const ownerid = hotel.hotel_owner;
        if(ownerid !== userid) {
            throw new Error("You are not the owner of this hotel");
        }
        const roomPrice = await db.RoomPrice.findOne({
            where: {
                type_id: priceData.type_id}
        });   
        await db.RoomPrice.update({
            start_date: priceData.start_date  ?? roomPrice.start_date,
            end_date: priceData.end_date ?? roomPrice.end_date,
            special_price: priceData.special_price ?? roomPrice.special_price,
            event: priceData.event ?? roomPrice.event,
            basic_price: priceData.basic_price ?? roomPrice.basic_price,
            discount: priceData.discount ?? roomPrice.discount
        }, {
            where: {
                type_id: priceData.type_id
            }
        });
    },
    getAllTypeForHotel: async(hotelid) => {
        const hotel = await db.Hotel.findByPk(hotelid);
        if(!hotel) {
            throw new Error("Hotel not found");
        }
        // get all room types join with room prices for hotel
        const roomTypes = await db.RoomType.findAll({
            where: {hotel_id: hotelid},
            include: [{
                model: db.RoomPrice
            }]
        });
        console.log("Room types with prices: ", roomTypes.RoomPrice);
        return roomTypes;
    },
    getFacilitiesForHotel: async(hotelid, userid) => {
        const hotel = await db.Hotel.findByPk(hotelid);
        if(!hotel) {
            throw new Error("Hotel not found");
        }
        if(hotel.hotel_owner !== userid) {
            throw new Error("You are not the owner of this hotel");
        }

        const facilities = await db.HotelFacilities.findAll({
            attributes: ['facility_id', 'name']
        });

        const facilitiesPossessing = await db.FacilitiesPossessing.findAll({
            where: { hotel_id: hotel.hotel_id },
            include: [{
                model: db.HotelFacilities,
                as: 'HotelFacility',
                attributes: ['facility_id', 'name']
            }]
        });

        const hotelFacilities = facilitiesPossessing.map(fp => ({
            facility_id: fp.HotelFacility.facility_id,
            name: fp.HotelFacility.name,
            description: fp.description ?? null,
        }));

        return {
            hotel_id: Number(hotelid),
            facilities,
            hotel_facilities: hotelFacilities,
        };
    },
    getAllRoomsForHotel: async(hotelid) => {
        const hotel = await db.Hotel.findByPk(hotelid);
        if(!hotel) {
            throw new Error("Hotel not found");
        }
        // get all room types of hotel first
        const roomTypes = await db.RoomType.findAll({
            where: {hotel_id: hotelid}
        });
        const typeIds = roomTypes.map((roomType) => roomType.type_id);
        const rooms = await db.Room.findAll({
            where: {type_id: typeIds}
        });
        // check from bookings for each room to check availablity
        // get bookings for rooms
        const bookings = await db.Booking.findAll({
            where: {
                room_id: rooms.map((room) => room.room_id),
                status: { [Op.ne]: 'cancelled' } // exclude cancelled bookings
            }
        });
        // check for each room in current Date is between check-in and check-out date of booking
        const currentDate = new Date();
        for(const room of rooms) {
            const roomBookings = bookings.filter((booking) => booking.room_id === room.room_id);
            const isAvailable = !roomBookings.some(
                b => currentDate >= b.check_in_date && currentDate <= b.check_out_date
            );
            room.setDataValue('isAvailable', isAvailable); // make it JSON-visible
        }
        // get price for each room based on type_id
        const roomsWithPrices = [];
        for(const room of rooms) {
            const roomType = roomTypes.find((type) => type.type_id === room.type_id);
            const roomPrice = await db.RoomPrice.findOne({
                where: { type_id: room.type_id }
            });
            if(!roomPrice) {
                roomsWithPrices.push({
                    roomData: room,
                    roomTypeData: roomType,
                    priceData: null, // or set defaults
                });
                continue;
            }
            // get images
            const listImages = await db.Image.findAll({
                where: { room_id: room.room_id }
            });
            const publicImageUrls = [];
            for(const image of listImages) {
                const presignedUrl = await minioUtils.getFileUrl(
                    minioUtils.buckets.HOTEL_IMAGES,
                    image.image_url
                );
                let publicUrl = toPublicObjectUrl(presignedUrl);
                publicImageUrls.push(publicUrl);
            }
            room.setDataValue('imageUrls', publicImageUrls); // make it JSON-visible
            // check for special price and price, if existed special price, use it, else use basic price
            const price = roomPrice?.special_price ?? roomPrice?.basic_price;
            roomsWithPrices.push({
                roomData: room.get({ plain: true }), // includes isAvailable
                roomTypeData: roomType,
                priceData: {
                    price: price,
                    discount: roomPrice.discount,
                    start_date: roomPrice.start_date,
                    end_date: roomPrice.end_date,
                }
            });
        }
        return roomsWithPrices;
    },
    viewRoom: async(roomid, userid) => {
        const room = await db.Room.findByPk(roomid);
        if(!room) {
            throw new Error("Room not found");
        }

        const roomType = await db.RoomType.findByPk(room.type_id);
        if(!roomType) {
            throw new Error("Room type not found");
        }

        const hotel = await db.Hotel.findByPk(roomType.hotel_id);
        if(!hotel) {
            throw new Error("Hotel not found");
        }

        const ownerid = hotel.hotel_owner;
        if(ownerid !== userid) {
            throw new Error("You are not the owner of this hotel");
        }

        const bookings = await db.Booking.findAll({
            where: {
                room_id: room.room_id,
                status: { [Op.ne]: 'cancelled' } // exclude cancelled bookings
            }
        });
        const currentDate = new Date();
        const isAvailable = !bookings.some(
            b => currentDate >= b.check_in_date && currentDate <= b.check_out_date
        );
        room.setDataValue('isAvailable', isAvailable); // make it JSON-visible

        const listImages = await db.Image.findAll({
            where: { room_id: room.room_id }
        });
        const publicImageUrls = [];
        for(const image of listImages) {
            const presignedUrl = await minioUtils.getFileUrl(
                minioUtils.buckets.HOTEL_IMAGES,
                image.image_url
            );
            let publicUrl = toPublicObjectUrl(presignedUrl);
            publicImageUrls.push(publicUrl);
        }
        room.setDataValue('imageUrls', publicImageUrls); // make it JSON-visible

        const roomPrice = await db.RoomPrice.findOne({
            where: { type_id: room.type_id }
        });

        if(!roomPrice) {
            return {
                roomData: room.get({ plain: true }),
                roomTypeData: roomType,
                priceData: null,
            };
        }

        const price = roomPrice?.special_price ?? roomPrice?.basic_price;
        return {
            roomData: room.get({ plain: true }),
            roomTypeData: roomType,
            priceData: {
                price: price,
                discount: roomPrice.discount,
                start_date: roomPrice.start_date,
                end_date: roomPrice.end_date,
            }
        };
    },
    updateRoom: async(roomid, userid, roomData = {}) => {
        const room = await db.Room.findByPk(roomid);
        if(!room) {
            throw new Error("Room not found");
        }

        const roomType = await db.RoomType.findByPk(room.type_id);
        if(!roomType) {
            throw new Error("Room type not found");
        }

        const hotel = await db.Hotel.findByPk(roomType.hotel_id);
        if(!hotel) {
            throw new Error("Hotel not found");
        }

        const ownerid = hotel.hotel_owner;
        if(ownerid !== userid) {
            throw new Error("You are not the owner of this hotel");
        }

        const allowedUpdates = {};
        if(Object.prototype.hasOwnProperty.call(roomData, 'name')) allowedUpdates.name = roomData.name;
        if(Object.prototype.hasOwnProperty.call(roomData, 'location')) allowedUpdates.location = roomData.location;
        if(Object.prototype.hasOwnProperty.call(roomData, 'status')) allowedUpdates.status = roomData.status;
        if(Object.prototype.hasOwnProperty.call(roomData, 'estimated_available_time')) {
            allowedUpdates.estimated_available_time = roomData.estimated_available_time;
        }
        if(Object.prototype.hasOwnProperty.call(roomData, 'number_of_single_beds')) {
            allowedUpdates.number_of_single_beds = roomData.number_of_single_beds;
        }
        if(Object.prototype.hasOwnProperty.call(roomData, 'number_of_double_beds')) {
            allowedUpdates.number_of_double_beds = roomData.number_of_double_beds;
        }
        if(Object.prototype.hasOwnProperty.call(roomData, 'room_view')) allowedUpdates.room_view = roomData.room_view;
        if(Object.prototype.hasOwnProperty.call(roomData, 'room_size')) allowedUpdates.room_size = roomData.room_size;
        if(Object.prototype.hasOwnProperty.call(roomData, 'notes')) allowedUpdates.notes = roomData.notes;

        await db.Room.update(allowedUpdates, { where: { room_id: room.room_id } });
    },
    viewRoomType: async(typeid, userid) => {
        const roomType = await db.RoomType.findByPk(typeid);
        if(!roomType) {
            throw new Error("Room type not found");
        }
        const hotel = await db.Hotel.findByPk(roomType.hotel_id);
        if(!hotel) {
            throw new Error("Hotel not found");
        }
        if(hotel.hotel_owner !== userid) {
            throw new Error("You are not the owner of this hotel");
        }

        const roomPrice = await db.RoomPrice.findOne({
            where: { type_id: roomType.type_id }
        });

        if(!roomPrice) {
            return {
                typeData: roomType,
                priceData: null,
            };
        }

        return {
            typeData: roomType,
            priceData: {
                basic_price: roomPrice.basic_price,
                special_price: roomPrice.special_price,
                discount: roomPrice.discount,
                event: roomPrice.event,
                start_date: roomPrice.start_date,
                end_date: roomPrice.end_date,
            }
        };
    },
    updateRoomType: async(typeid, userid, typeData = {}) => {
        const roomType = await db.RoomType.findByPk(typeid);
        if(!roomType) {
            throw new Error("Room type not found");
        }
        const hotel = await db.Hotel.findByPk(roomType.hotel_id);
        if(!hotel) {
            throw new Error("Hotel not found");
        }
        if(hotel.hotel_owner !== userid) {
            throw new Error("You are not the owner of this hotel");
        }

        if(Object.prototype.hasOwnProperty.call(typeData, 'type')) {
            roomType.type = typeData.type;
        }
        if(Object.prototype.hasOwnProperty.call(typeData, 'availability')) {
            roomType.availability = typeData.availability;
        }
        if(Object.prototype.hasOwnProperty.call(typeData, 'max_guests')) {
            roomType.max_guests = typeData.max_guests;
        }
        if(Object.prototype.hasOwnProperty.call(typeData, 'description')) {
            roomType.description = typeData.description;
        }

        await roomType.save();
    },
    getAllRooms: async() => {
        const rooms = await db.Room.findAll();
        // get all room types based on rooms
        const typeIds = rooms.map((room) => room.type_id);
        const roomTypes = await db.RoomType.findAll({
            where: {type_id: typeIds}
        });
        // get bookings for rooms
        const bookings = await db.Booking.findAll({
            where: {
                room_id: rooms.map((room) => room.room_id),
                status: { [Op.ne]: 'cancelled' } // exclude cancelled bookings
            }
        });
        // check for each room in current Date is between check-in and check-out date of booking
        const currentDate = new Date();
        for(const room of rooms) {
            const roomBookings = bookings.filter((booking) => booking.room_id === room.room_id);
            const isAvailable = !roomBookings.some(
                b => currentDate >= b.check_in_date && currentDate <= b.check_out_date
            );
            room.setDataValue('isAvailable', isAvailable); // make it JSON-visible
            const listImages = await db.Image.findAll({
                where: { room_id: room.room_id }
            })
            const publicImageUrls = [];
            for(const image of listImages) {
                const presignedUrl = await minioUtils.getFileUrl(
                    minioUtils.buckets.HOTEL_IMAGES,
                    image.image_url
                );
                let publicUrl = toPublicObjectUrl(presignedUrl);
                publicImageUrls.push(publicUrl);
            }
            room.setDataValue('imageUrls', publicImageUrls); // make it JSON-visible
        }
        // get price for each room based on type_id
        const roomsWithPrices = [];
        for(const room of rooms) {
            const roomType = roomTypes.find((type) => type.type_id === room.type_id);
            const roomPrice = await db.RoomPrice.findOne({
                where: { type_id: room.type_id }
            });
            if(!roomPrice) {
                roomsWithPrices.push({
                    roomData: room,
                    roomTypeData: roomType,
                    priceData: null, // or set defaults
                });
                continue;
            }
            // check for special price and price, if existed special price, use it, else use basic price
            const price = roomPrice?.special_price ?? roomPrice?.basic_price;

            roomsWithPrices.push({
                roomData: room.get({ plain: true }), // includes isAvailable
                roomTypeData: roomType,
                priceData: {
                    price: price,
                    discount: roomPrice.discount,
                    start_date: roomPrice.start_date,
                    end_date: roomPrice.end_date,
                }
            });
        }
        return roomsWithPrices;
    },
    getAllHotel: async() => {
        const hotels = await db.Hotel.findAll();
        // for each hotel, get presigned url for thumbnail
        for(const hotel of hotels) {
            const imageUrl = hotel?.thumbnail ? hotel.thumbnail : null;
            if(imageUrl) {
                // Check if it's already a full URL (from external sources like Unsplash)
                if(imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
                    hotel.thumbnail = imageUrl; // Keep the external URL as-is
                } else {
                    // It's a MinIO object key, get presigned URL
                    const presignedUrl = await minioUtils.getFileUrl(
                        minioUtils.buckets.HOTEL_IMAGES,
                        imageUrl
                    );
                    let publicUrl = toPublicObjectUrl(presignedUrl);
                    hotel.thumbnail = publicUrl; // just replace with presigned URL to return for client
                }
            }
            const imageList = await db.Image.findAll({
                where: { hotel_id: hotel.hotel_id }
            });
            const publicImageUrls = [];
            for(const image of imageList) {
                // Check if it's already a full URL
                if(image.image_url.startsWith('http://') || image.image_url.startsWith('https://')) {
                    publicImageUrls.push(image.image_url); // Keep the external URL as-is
                } else {
                    // It's a MinIO object key, get presigned URL
                    const presignedUrl = await minioUtils.getFileUrl(
                        minioUtils.buckets.HOTEL_IMAGES,
                        image.image_url
                    );
                    let publicUrl = toPublicObjectUrl(presignedUrl);
                    publicImageUrls.push(publicUrl);
                }
            }
            hotel.setDataValue('imageUrls', publicImageUrls); // make it JSON-visible

            // Get facilities for hotel
            const facilitiesPossessing = await db.FacilitiesPossessing.findAll({
                where: { hotel_id: hotel.hotel_id },
                include: [{
                    model: db.HotelFacilities,
                    as: 'HotelFacility',
                    attributes: ['facility_id', 'name']
                }]
            });
            const facilities = facilitiesPossessing.map(fp => ({
                facility_id: fp.HotelFacility.facility_id,
                name: fp.HotelFacility.name
            }));
            hotel.setDataValue('facilities', facilities); // make it JSON-visible

            // Calculate lowest room price
            const roomTypes = await db.RoomType.findAll({
                where: { hotel_id: hotel.hotel_id },
                include: [{
                    model: db.RoomPrice,
                    required: false
                }]
            });

            let lowestPrice = null;
            let maxDiscount = 0;

            for (const roomType of roomTypes) {
                if (roomType.RoomPrice) {
                    const price = roomType.RoomPrice.special_price
                        ? parseInt(roomType.RoomPrice.special_price)
                        : parseInt(roomType.RoomPrice.basic_price);

                    if (lowestPrice === null || price < lowestPrice) {
                        lowestPrice = price;
                    }

                    if (roomType.RoomPrice.discount > maxDiscount) {
                        maxDiscount = roomType.RoomPrice.discount;
                    }
                }
            }

            hotel.setDataValue('basePrice', lowestPrice);
            hotel.setDataValue('discount', maxDiscount);
        }
        return hotels;
    },
    uploadImagesForHotel: async(hotelid, userid, imageFiles) => {
        const hotel = await db.Hotel.findByPk(hotelid);
        if(!hotel) {
            throw new Error("Hotel not found");
        }
        const ownerid = hotel.hotel_owner;
        if(ownerid !== userid) {
            throw new Error("You are not the owner of this hotel");
        }
        for(const imageFile of imageFiles) {
            if (!imageFile.mimetype?.startsWith("image/")) {
                throw new Error("Only image files are allowed");
            }
            uploadedThumbnail = await minioUtils.uploadFile(
                minioUtils.buckets.HOTEL_IMAGES,
                imageFile.buffer,
                imageFile.originalname,
                { "Content-Type": imageFile.mimetype }
            );
            const imageUrl = uploadedThumbnail.fileName;
            await db.Image.create({
                hotel_id: hotelid,
                image_url: imageUrl
            });
        }
    },
    uploadImagesForRoom: async (roomid, userid, imageFiles) => {
        const room = await db.Room.findByPk(roomid);
        if(!room) {
            throw new Error("Room not found");
        }
        const roomType = await db.RoomType.findByPk(room.type_id);
        if(!roomType) {
            throw new Error("Room type not found");
        }
        const hotel = await db.Hotel.findByPk(roomType.hotel_id);
        if(!hotel) {
            throw new Error("Hotel not found");
        }
        const ownerid = hotel.hotel_owner;
        if(ownerid !== userid) {
            throw new Error("You are not the owner of this hotel");
        }
        for(const imageFile of imageFiles) {
            if (!imageFile.mimetype?.startsWith("image/")) {
                throw new Error("Only image files are allowed");
            }
            uploadedThumbnail = await minioUtils.uploadFile(
                minioUtils.buckets.HOTEL_IMAGES,
                imageFile.buffer,
                imageFile.originalname,
                { "Content-Type": imageFile.mimetype }
            );
            const imageUrl = uploadedThumbnail.fileName;
            await db.Image.create({
                room_id: roomid,
                image_url: imageUrl
            });
        }
    },
    async getHotelForHotelOwner(userid) {
        const hotels =  await db.Hotel.findAll({
            where: { hotel_owner: userid }
        });
        return hotels;
    },
    async getAllReviewsForHotel(hotelId) {
        const reviews = await db.Review.findAll({
            where: { hotel_id: hotelId },
            include: [{
                model: db.User,
                attributes: ['user_id', 'name', 'email']
            }],
            order: [['date_created', 'DESC']]
        });

        // Format the reviews data
        const formattedReviews = reviews.map(review => ({
            review_id: review.review_id,
            rating: review.rating,
            comment: review.comment,
            date_created: review.date_created,
            user: {
                user_id: review.User.user_id,
                name: review.User.name,
                email: review.User.email
            }
        }));

        return formattedReviews;
    }
};
module.exports = hotelProfileService;

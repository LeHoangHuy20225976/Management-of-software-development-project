const responseUtils = require("../../../utils/responseUtils");
const hotelProfileService = require("../services/hotelProfileService");

const hotelProfileController = {
    addNewHotel: async(req, res) => {
        try{    
            const userid = req.user.user_id;
            const { hotelData } = req.body;
            const hotelName = await hotelProfileService.addNewHotel(hotelData, userid, req.file);
            return responseUtils.ok(res, {message: `Add hotel ${hotelName.hotelName} successfully `});
        } catch(error) {
            return responseUtils.error(res, error.message);
        }
    },
    addTypeForHotel: async(req, res) => {
        try {
            console.log("addTypeForHotel is called");
            const userid = req.user.user_id;
            const { typeData } = req.body;
            console.log("Type data in controller:", typeData);
            await hotelProfileService.addTypeForHotel(typeData, userid);
            return responseUtils.ok(res, {message: `Add room type successfully`});
        } catch (error) {
            return responseUtils.error(res, error.message);
        }
    },
    addRoom: async(req, res) => {
        try {
            const userid = req.user.user_id;
            const { roomData } = req.body;
            await hotelProfileService.addRoom(roomData, userid, req.files);
            return responseUtils.ok(res, {message: "Add room successfully"});        
        } catch (error) {
            return responseUtils.error(res, error.message);
        }
    },
    viewHotelProfile: async(req, res) => {
        try {
            const hotelid = req.params.hotel_id;
            const hotelProfile = await hotelProfileService.viewHotelProfile(hotelid);
            return responseUtils.ok(res, hotelProfile.hotelData);
        } catch(error) {
            return responseUtils.error(res, error.message);
        }

    },
    updateHotelProfile: async(req, res) => {
        try {
            const hotelid = req.params.hotel_id;
            const userid = req.user.user_id;
            const { hotelData} = req.body;
            console.log(Object.keys(req.body), req.body.thumbnail);
            console.log("content-type:", req.headers["content-type"]);
            console.log("file:", !!req.file, req.file?.mimetype, req.file?.size);
            await hotelProfileService.updateHotelProfile(hotelid, userid, hotelData, req.file);
            return responseUtils.ok(res, {message: "Update hotel profile successfully"});
        } catch(error) {
            return responseUtils.error(res, error.message);
        }

    },
    disableHotel: async(req, res) => {
        try {
            const hotelid = req.params.hotel_id;
            const userid = req.user.user_id;
            await hotelProfileService.disableHotel(hotelid, userid);
            return responseUtils.ok(res, {message: "Disable hotel successfully"});
        } catch(error) {
            return responseUtils.error(res, error.message);
        }

    },
    addFacilityForHotel: async(req, res) => {
        try {
            const userid = req.user.user_id;
            const { facilityData} = req.body;
            const hotelid = req.params.hotel_id;
            await hotelProfileService.updateFacilityForHotel(facilityData, userid, hotelid); 
            return responseUtils.ok(res, {message: "Add facility successfully"});
        } catch (error) {
            return responseUtils.error(res, error.message);
        }
    },
    updatePriceForRoomType: async(req, res) => {
        try {
            console.log("updatePriceForRoomType is called");
            const userid = req.user.user_id;
            const { priceData} = req.body;
            console.log("Price data in controller:", priceData);
            await hotelProfileService.updatePriceForRoomType(priceData, userid);
            return responseUtils.ok(res, {message: "Update price successfully"});
        } catch (error) {
            return responseUtils.error(res, error.message);
        }
    },
    getAllTypeForHotel: async(req, res) => {
        try {
            const hotelid = req.params.hotel_id;
            const roomTypes = await hotelProfileService.getAllTypeForHotel(hotelid);
            return responseUtils.ok(res, roomTypes);
        } catch(error) {
            return responseUtils.error(res, error.message);
        }
    },
    getAllRoomsForHotel: async(req, res) => {
        try {
            const hotelid = req.params.hotel_id;
            const rooms = await hotelProfileService.getAllRoomsForHotel(hotelid);
            return responseUtils.ok(res, rooms);
        } catch(error) {
            return responseUtils.error(res, error.message);
        }
    },
    viewRoom: async(req, res) => {
        try {
            const userid = req.user.user_id;
            const roomid = req.params.room_id;
            const room = await hotelProfileService.viewRoom(roomid, userid);
            return responseUtils.ok(res, room);
        } catch(error) {
            return responseUtils.error(res, error.message);
        }
    },
    updateRoom: async(req, res) => {
        try {
            const userid = req.user.user_id;
            const roomid = req.params.room_id;
            const { roomData } = req.body;
            await hotelProfileService.updateRoom(roomid, userid, roomData ?? {});
            return responseUtils.ok(res, {message: "Update room successfully"});
        } catch(error) {
            return responseUtils.error(res, error.message);
        }
    },
    getAllRooms: async(req, res) => {
        try {
            const rooms = await hotelProfileService.getAllRooms();
            return responseUtils.ok(res, rooms);
        } catch(error) {
            return responseUtils.error(res, error.message);
        }
    },
    getAllHotels: async(req, res) => {
        try {
            const hotels = await hotelProfileService.getAllHotel();
            return responseUtils.ok(res, hotels);
        } catch(error) {
            return responseUtils.error(res, error.message);
        }
    },
    uploadImagesForHotel: async(req, res) => {
        try {
            const hotelid = req.params.hotel_id;
            const userid = req.user.user_id;
            await hotelProfileService.uploadImagesForHotel(hotelid, userid, req.files);
            return responseUtils.ok(res, {message: "Upload images successfully"});
        } catch(error) {
            return responseUtils.error(res, error.message);
        }
    },
    uploadImagesForRoom: async(req, res) => {
        try {
            const roomid = req.params.room_id;
            const userid = req.user.user_id;
            await hotelProfileService.uploadImagesForRoom(roomid, userid, req.files);
            return responseUtils.ok(res, {message: "Upload images successfully"});
        } catch(error) {
            return responseUtils.error(res, error.message);
        }
    },
    getHotelForHotelOwner: async(req, res) => {
        try {
            console.log("getHotelForHotelOwner is called");
            const userid = req.user.user_id;
            const hotels =  await hotelProfileService.getHotelForHotelOwner(userid);
            return responseUtils.ok(res, hotels);
        } catch(error) {
            return responseUtils.error(res, error.message);
        }
    },
    getAllReviewsForHotel: async(req, res) => {
        try {
            const hotelId = req.params.hotel_id;
            const reviews = await hotelProfileService.getAllReviewsForHotel(hotelId);
            return responseUtils.ok(res, reviews);
        } catch(error) {
            return responseUtils.error(res, error.message);
        }
    }
};
module.exports = hotelProfileController;

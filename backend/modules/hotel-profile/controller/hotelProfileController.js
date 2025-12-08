const responseUtils = require("../../../utils/responseUtils");
const hotelProfileService = require("../services/hotelProfileService");

const hotelProfileController = {
    addNewHotel: async(req, res) => {
        try{    
            const userid = req.user.user_id;
            const { hotelData } = req.body;
            const hotelName = await hotelProfileService.addNewHotel(hotelData, userid);
            return responseUtils.ok(res, {message: `Add hotel ${hotelName.hotelName} successfully `});
        } catch(error) {
            return responseUtils.error(res, error.message);
        }
    },
    addTypeForHotel: async(req, res) => {
        try {
            const userid = req.user.user_id;
            const { typeData } = req.body;
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
            await hotelProfileService.addRoom(roomData, userid);
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
            await hotelProfileService.updateHotelProfile(hotelid, userid, hotelData);
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

    }
};
module.exports = hotelProfileController;

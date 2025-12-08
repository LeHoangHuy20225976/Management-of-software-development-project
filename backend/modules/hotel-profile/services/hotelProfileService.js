const express = require("express");
const db = require("../../../models/index");
const { Op, fn, col, where } = require('sequelize');

const hotelProfileService = {
    async addNewHotel(hotelData, userid) {
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
        const newHotel = await db.Hotel.create({
            name: hotelData.hotelName,
            hotel_owner: userid,
            address: hotelData.address,
            status: 1,
            rating: 5.0,
            longitude: hotelData.longitude ? hotelData.longitude : null,
            latitute: hotelData.latitute ? hotelData.latitute : null,
            description: hotelData.description ? hotelData.description : 'No description provided',
            contact_phone: hotelData.contact_phone,
            thumbnail: hotelData.thumbnail ? hotelData.thumbnail : null
        });
        const user = await db.User.findByPk(userid);
        user.role = 'hotel_manager';
        await user.save();
        return {
            hotelName: newHotel.name
        };
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
        await db.RoomType.create({
            hotel_id: typeData.hotel_id,
            type: typeData.type,
            availability: typeData.availability ? typeData.availability : true,
            max_guests: typeData.max_guests ? typeData.max_guests: 2,
            description: typeData.description ? typeData.description : 'No description provided',
            quantity: 0
        });
    },
    async addRoom(roomData, userid) {
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
        await db.Room.create({
            type_id: roomData.type_id,
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
    },
    async viewHotelProfile(hotelid) {
        const hotel = await db.Hotel.findByPk(hotelid);
        if(!hotel) {
            throw new Error("Hotel not found");
        }
        return {
            hotelData: hotel
        }
    },
    async updateHotelProfile(hotelid, userid, hotelData) {
        const hotel = await db.Hotel.findByPk(hotelid);
        if(!hotel) {
            throw new Error("Hotel not found");
        }
        const ownerid = hotel.hotel_owner;
        if(ownerid !== userid) {
            throw new Error("You are not the owner of this hotel");
        }
        // Use nullish coalescing to allow falsy values like 0 or empty strings to be saved intentionally
        hotel.name = hotelData.hotelName ?? hotel.name;
        hotel.address = hotelData.address ?? hotel.address;
        hotel.status = hotelData.status ?? hotel.status;
        hotel.longitude = hotelData.longitude ?? hotel.longitude;
        hotel.latitute = hotelData.latitute ?? hotel.latitute;
        hotel.description = hotelData.description ?? hotel.description;
        hotel.contact_phone = hotelData.contact_phone ?? hotel.contact_phone;
        hotel.thumbnail = hotelData.thumbnail ?? hotel.thumbnail;
        await hotel.save();
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
    }
};
module.exports = hotelProfileService;

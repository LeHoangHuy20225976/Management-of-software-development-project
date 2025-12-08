const hotelProfileService = require('../hotelProfileService');

jest.mock('models/index', () => ({
  Hotel: {
    findOne: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn()
  },
  User: {
    findByPk: jest.fn()
  },
  RoomType: {
    create: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn()
  },
  Room: {
    create: jest.fn(),
    update: jest.fn()
  },
  sequelize: {
    transaction: jest.fn()
  }
}));

jest.mock('sequelize', () => ({
  Op: {
    and: 'and'
  },
  fn: jest.fn((funcName, column) => ({ funcName, column })),
  col: jest.fn((column) => column),
  where: jest.fn((lhs, rhs) => ({ lhs, rhs }))
}));

const db = require('models/index');
const { Op } = require('sequelize');

describe('hotelProfileService - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addNewHotel', () => {
    const hotelData = {
      hotelName: 'Test Hotel',
      address: '123 Street',
      longitude: 10.5,
      contact_phone: '123456789'
    };

    it('creates a new hotel and updates user role when no duplicate exists', async () => {
      db.Hotel.findOne.mockResolvedValue(null);
      const mockUser = { role: 'customer', save: jest.fn().mockResolvedValue() };
      db.User.findByPk.mockResolvedValue(mockUser);
      db.Hotel.create.mockResolvedValue({ name: hotelData.hotelName });

      const result = await hotelProfileService.addNewHotel(hotelData, 1);

      expect(db.Hotel.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            [Op.and]: expect.any(Array)
          })
        })
      );
      expect(db.Hotel.create).toHaveBeenCalledWith({
        name: hotelData.hotelName,
        hotel_owner: 1,
        address: hotelData.address,
        status: 1,
        rating: 5.0,
        longitude: hotelData.longitude,
        latitute: null,
        description: 'No description provided',
        contact_phone: hotelData.contact_phone,
        thumbnail: null
      });
      expect(mockUser.role).toBe('hotel_manager');
      expect(mockUser.save).toHaveBeenCalled();
      expect(result).toEqual({ hotelName: hotelData.hotelName });
    });

    it('throws an error when the hotel already exists', async () => {
      db.Hotel.findOne.mockResolvedValue({ hotel_id: 99 });

      await expect(hotelProfileService.addNewHotel(hotelData, 1))
        .rejects
        .toThrow('Hotel has been registered on our system');
    });
  });

  describe('addTypeForHotel', () => {
    const typeData = {
      hotel_id: 1,
      type: 'Suite',
      max_guests: 3
    };

    it('throws when hotel does not exist', async () => {
      db.Hotel.findByPk.mockResolvedValue(null);

      await expect(hotelProfileService.addTypeForHotel(typeData, 1))
        .rejects
        .toThrow('Hotel not found');
    });

    it('throws when user is not the hotel owner', async () => {
      db.Hotel.findByPk.mockResolvedValue({ hotel_owner: 2 });

      await expect(hotelProfileService.addTypeForHotel(typeData, 1))
        .rejects
        .toThrow('You are not the owner of this hotel');
    });

    it('creates a room type with defaults when data is valid', async () => {
      db.Hotel.findByPk.mockResolvedValue({ hotel_owner: 1 });
      db.RoomType.create.mockResolvedValue({});

      await hotelProfileService.addTypeForHotel(typeData, 1);

      expect(db.RoomType.create).toHaveBeenCalledWith({
        hotel_id: typeData.hotel_id,
        type: typeData.type,
        availability: true,
        max_guests: typeData.max_guests,
        description: 'No description provided',
        quantity: 0
      });
    });
  });

  describe('addRoom', () => {
    it('throws when room type is missing', async () => {
      db.RoomType.findByPk.mockResolvedValue(null);

      await expect(hotelProfileService.addRoom({ type_id: 1 }, 1))
        .rejects
        .toThrow('Room type not found');
    });

    it('throws when hotel for the type cannot be found', async () => {
      db.RoomType.findByPk.mockResolvedValue({ hotel_id: 1 });
      db.Hotel.findByPk.mockResolvedValue(null);

      await expect(hotelProfileService.addRoom({ type_id: 1 }, 1))
        .rejects
        .toThrow('Hotel not found');
    });

    it('throws when user is not the hotel owner', async () => {
      db.RoomType.findByPk.mockResolvedValue({ hotel_id: 1 });
      db.Hotel.findByPk.mockResolvedValue({ hotel_owner: 2 });

      await expect(hotelProfileService.addRoom({ type_id: 1 }, 1))
        .rejects
        .toThrow('You are not the owner of this hotel');
    });

    it('creates room and increments quantity for valid data', async () => {
      const roomType = { hotel_id: 1, quantity: 0, save: jest.fn().mockResolvedValue() };
      db.RoomType.findByPk.mockResolvedValue(roomType);
      db.Hotel.findByPk.mockResolvedValue({ hotel_owner: 1 });
      db.Room.create.mockResolvedValue({});

      const roomData = {
        type_id: 1,
        name: '101',
        location: 'Floor 1',
        number_of_single_beds: 1
      };

      await hotelProfileService.addRoom(roomData, 1);

      expect(db.Room.create).toHaveBeenCalledWith({
        type_id: roomData.type_id,
        name: roomData.name,
        location: roomData.location,
        status: 1,
        estimated_available_time: null,
        number_of_single_beds: roomData.number_of_single_beds,
        number_of_double_beds: 0,
        room_view: 'No view',
        room_size: 0.0,
        notes: 'No notes'
      });
      expect(roomType.quantity).toBe(1);
      expect(roomType.save).toHaveBeenCalled();
    });
  });

  describe('viewHotelProfile', () => {
    it('returns hotel data when found', async () => {
      const hotel = { hotel_id: 1, name: 'Hotel' };
      db.Hotel.findByPk.mockResolvedValue(hotel);

      const result = await hotelProfileService.viewHotelProfile(1);

      expect(result).toEqual({ hotelData: hotel });
    });

    it('throws when hotel is not found', async () => {
      db.Hotel.findByPk.mockResolvedValue(null);

      await expect(hotelProfileService.viewHotelProfile(1))
        .rejects
        .toThrow('Hotel not found');
    });
  });

  describe('updateHotelProfile', () => {
    const baseHotel = {
      hotel_owner: 1,
      name: 'Old Name',
      address: 'Old Address',
      status: 1,
      longitude: 1,
      latitute: 2,
      description: 'Old',
      contact_phone: '000',
      thumbnail: 'old.png',
      save: jest.fn().mockResolvedValue()
    };

    it('throws when hotel is not found', async () => {
      db.Hotel.findByPk.mockResolvedValue(null);

      await expect(hotelProfileService.updateHotelProfile(1, 1, {}))
        .rejects
        .toThrow('Hotel not found');
    });

    it('throws when user is not the owner', async () => {
      db.Hotel.findByPk.mockResolvedValue({ hotel_owner: 2 });

      await expect(hotelProfileService.updateHotelProfile(1, 1, {}))
        .rejects
        .toThrow('You are not the owner of this hotel');
    });

    it('updates provided fields and keeps existing values otherwise', async () => {
      const hotel = { ...baseHotel };
      db.Hotel.findByPk.mockResolvedValue(hotel);

      const updateData = {
        hotelName: 'New Name',
        description: 'New Description',
        status: 0
      };

      await hotelProfileService.updateHotelProfile(1, 1, updateData);

      expect(hotel.name).toBe(updateData.hotelName);
      expect(hotel.description).toBe(updateData.description);
      expect(hotel.status).toBe(updateData.status);
      expect(hotel.address).toBe(baseHotel.address);
      expect(hotel.contact_phone).toBe(baseHotel.contact_phone);
      expect(hotel.save).toHaveBeenCalled();
    });
  });

  describe('disableHotel', () => {
    it('throws when hotel does not exist', async () => {
      db.Hotel.findByPk.mockResolvedValue(null);

      await expect(hotelProfileService.disableHotel(1, 1))
        .rejects
        .toThrow('Hotel not found');
    });

    it('throws when user is not the owner', async () => {
      db.Hotel.findByPk.mockResolvedValue({ hotel_owner: 2 });

      await expect(hotelProfileService.disableHotel(1, 1))
        .rejects
        .toThrow('You are not the owner of this hotel');
    });

    it('disables hotel and related entities within a transaction', async () => {
      const transaction = { commit: jest.fn(), rollback: jest.fn() };
      db.sequelize.transaction.mockResolvedValue(transaction);
      const hotel = { hotel_owner: 1, status: 1, save: jest.fn().mockResolvedValue() };
      db.Hotel.findByPk.mockResolvedValue(hotel);
      db.RoomType.findAll.mockResolvedValue([{ type_id: 10 }, { type_id: 11 }]);
      db.RoomType.update.mockResolvedValue();
      db.Room.update.mockResolvedValue();

      await hotelProfileService.disableHotel(5, 1);

      expect(hotel.status).toBe(0);
      expect(hotel.save).toHaveBeenCalledWith({ transaction });
      expect(db.RoomType.update).toHaveBeenCalledWith(
        { availability: false },
        { where: { type_id: [10, 11] }, transaction }
      );
      expect(db.Room.update).toHaveBeenCalledWith(
        { status: 0 },
        { where: { type_id: [10, 11] }, transaction }
      );
      expect(transaction.commit).toHaveBeenCalled();
      expect(transaction.rollback).not.toHaveBeenCalled();
    });

    it('rolls back transaction when an error occurs', async () => {
      const transaction = { commit: jest.fn(), rollback: jest.fn() };
      db.sequelize.transaction.mockResolvedValue(transaction);
      const hotel = { hotel_owner: 1, status: 1, save: jest.fn().mockResolvedValue() };
      db.Hotel.findByPk.mockResolvedValue(hotel);
      db.RoomType.findAll.mockResolvedValue([{ type_id: 10 }]);
      db.RoomType.update.mockRejectedValue(new Error('update failed'));

      await expect(hotelProfileService.disableHotel(5, 1))
        .rejects
        .toThrow('update failed');
      expect(transaction.rollback).toHaveBeenCalled();
      expect(transaction.commit).not.toHaveBeenCalled();
    });
  });
});

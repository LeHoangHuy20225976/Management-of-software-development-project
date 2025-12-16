const hotelProfileService = require('../hotelProfileService');

jest.mock('models/index', () => ({
  Hotel: {
    findOne: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn()
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
    update: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn()
  },
  RoomPrice: {
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn()
  },
  Image: {
    findAll: jest.fn(),
    create: jest.fn()
  },
  FacilitiesPossessing: {
    destroy: jest.fn(),
    create: jest.fn()
  },
  Booking: {
    findAll: jest.fn()
  },
  sequelize: {
    transaction: jest.fn()
  }
}));

jest.mock('sequelize', () => ({
  Op: {
    and: 'and',
    ne: 'ne'
  },
  fn: jest.fn((funcName, column) => ({ funcName, column })),
  col: jest.fn((column) => column),
  where: jest.fn((lhs, rhs) => ({ lhs, rhs }))
}));

jest.mock('../../../../utils/minioUtils', () => ({
  buckets: {
    HOTEL_IMAGES: 'hotel-images',
    ROOM_IMAGES: 'room-images'
  },
  uploadFile: jest.fn(),
  deleteFile: jest.fn(),
  getFileUrl: jest.fn()
}));

const db = require('models/index');
const { Op } = require('sequelize');
const minioUtils = require('../../../../utils/minioUtils');

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
        latitude: null,
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

    it('uploads thumbnail and stores returned object key when file is provided', async () => {
      db.Hotel.findOne.mockResolvedValue(null);
      const mockUser = { role: 'customer', save: jest.fn().mockResolvedValue() };
      db.User.findByPk.mockResolvedValue(mockUser);

      minioUtils.uploadFile.mockResolvedValue({
        success: true,
        fileName: 'thumb-123.png',
        url: 'http://minio.local/hotel-images/thumb-123.png',
        bucketName: 'hotel-images'
      });

      db.Hotel.create.mockResolvedValue({ name: hotelData.hotelName });

      const thumbnailFile = {
        buffer: Buffer.from('fake'),
        originalname: 'thumb.png',
        mimetype: 'image/png'
      };

      await hotelProfileService.addNewHotel(hotelData, 1, thumbnailFile);

      expect(minioUtils.uploadFile).toHaveBeenCalledWith(
        minioUtils.buckets.HOTEL_IMAGES,
        thumbnailFile.buffer,
        thumbnailFile.originalname,
        { 'Content-Type': thumbnailFile.mimetype }
      );
      expect(db.Hotel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          thumbnail: 'thumb-123.png'
        })
      );
    });
  });

  describe('addTypeForHotel', () => {
    const typeData = {
      hotel_id: 1,
      type: 'Suite',
      max_guests: 3,
      priceData: { basic_price: 100, special_price: null, discount: 0, event: 'No event' }
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
      db.RoomType.create.mockResolvedValue({ type_id: 77 });
      db.RoomPrice.create.mockResolvedValue({});

      await hotelProfileService.addTypeForHotel(typeData, 1);

      expect(db.RoomType.create).toHaveBeenCalledWith({
        hotel_id: typeData.hotel_id,
        type: typeData.type,
        availability: true,
        max_guests: typeData.max_guests,
        description: 'No description provided',
        quantity: 0
      });
      expect(db.RoomPrice.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type_id: 77,
          basic_price: typeData.priceData.basic_price,
          special_price: null,
          event: 'No event',
          discount: 0.0
        })
      );
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
      const roomType = { type_id: 1, hotel_id: 1, quantity: 0, save: jest.fn().mockResolvedValue() };
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

    it('uploads images and creates Image records when image files are provided', async () => {
      const roomType = { type_id: 1, hotel_id: 1, quantity: 0, save: jest.fn().mockResolvedValue() };
      db.RoomType.findByPk.mockResolvedValue(roomType);
      db.Hotel.findByPk.mockResolvedValue({ hotel_owner: 1 });

      db.Room.create.mockResolvedValue({ room_id: 55 });
      minioUtils.uploadFile
        .mockResolvedValueOnce({ fileName: 'room-1.png' })
        .mockResolvedValueOnce({ fileName: 'room-2.png' });
      db.Image.create.mockResolvedValue({});

      const roomData = { type_id: 1, name: '101', location: 'Floor 1' };
      const imageFiles = [
        { buffer: Buffer.from('a'), originalname: 'a.png', mimetype: 'image/png' },
        { buffer: Buffer.from('b'), originalname: 'b.jpg', mimetype: 'image/jpeg' }
      ];

      await hotelProfileService.addRoom(roomData, 1, imageFiles);

      expect(minioUtils.uploadFile).toHaveBeenNthCalledWith(
        1,
        minioUtils.buckets.ROOM_IMAGES,
        imageFiles[0].buffer,
        imageFiles[0].originalname,
        { 'Content-Type': imageFiles[0].mimetype }
      );
      expect(minioUtils.uploadFile).toHaveBeenNthCalledWith(
        2,
        minioUtils.buckets.ROOM_IMAGES,
        imageFiles[1].buffer,
        imageFiles[1].originalname,
        { 'Content-Type': imageFiles[1].mimetype }
      );
      expect(db.Image.create).toHaveBeenCalledWith({ room_id: 55, image_url: 'room-1.png' });
      expect(db.Image.create).toHaveBeenCalledWith({ room_id: 55, image_url: 'room-2.png' });
    });
  });

  describe('viewHotelProfile', () => {
    it('returns hotel data when found', async () => {
      const hotel = { hotel_id: 1, name: 'Hotel', thumbnail: null, setDataValue: jest.fn() };
      db.Hotel.findByPk.mockResolvedValue(hotel);
      db.Image.findAll.mockResolvedValue([]);

      const result = await hotelProfileService.viewHotelProfile(1);

      expect(result).toEqual({ hotelData: hotel });
      expect(hotel.setDataValue).toHaveBeenCalledWith('imageUrls', []);
    });

    it('throws when hotel is not found', async () => {
      db.Hotel.findByPk.mockResolvedValue(null);

      await expect(hotelProfileService.viewHotelProfile(1))
        .rejects
        .toThrow('Hotel not found');
    });

    it('converts presigned URLs to public object URLs', async () => {
      const hotel = { hotel_id: 1, thumbnail: 'thumb.png', setDataValue: jest.fn() };
      db.Hotel.findByPk.mockResolvedValue(hotel);
      db.Image.findAll.mockResolvedValue([{ image_url: 'h-1.png' }]);

      minioUtils.getFileUrl.mockImplementation(async (_bucket, objectName) => {
        return `http://minio:9000/hotel-images/${objectName}?X-Amz-Signature=abc`;
      });

      const result = await hotelProfileService.viewHotelProfile(1);

      expect(result.hotelData.thumbnail).toBe('http://localhost:9002/hotel-images/thumb.png');
      expect(hotel.setDataValue).toHaveBeenCalledWith('imageUrls', ['http://localhost:9002/hotel-images/h-1.png']);
    });
  });

  describe('updateHotelProfile', () => {
	    const baseHotel = {
	      hotel_owner: 1,
	      name: 'Old Name',
	      address: 'Old Address',
	      status: 1,
	      longitude: 1,
	      latitude: 2,
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

    it('uploads and updates thumbnail when a new file is provided', async () => {
      const hotel = { ...baseHotel };
      db.Hotel.findByPk.mockResolvedValue(hotel);

      minioUtils.uploadFile.mockResolvedValue({ fileName: 'new-thumb.png' });
      minioUtils.deleteFile.mockResolvedValue(true);

      const thumbnailFile = {
        buffer: Buffer.from('fake-image-bytes'),
        originalname: 'thumb.png',
        mimetype: 'image/png'
      };

      await hotelProfileService.updateHotelProfile(1, 1, {}, thumbnailFile);

      expect(minioUtils.uploadFile).toHaveBeenCalledWith(
        minioUtils.buckets.HOTEL_IMAGES,
        thumbnailFile.buffer,
        thumbnailFile.originalname,
        { 'Content-Type': thumbnailFile.mimetype }
      );
      expect(hotel.thumbnail).toBe('new-thumb.png');
      expect(minioUtils.deleteFile).toHaveBeenCalledWith(minioUtils.buckets.HOTEL_IMAGES, 'old.png');
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

  describe('updateFacilityForHotel', () => {
    it('throws when hotel not found', async () => {
      db.Hotel.findByPk.mockResolvedValue(null);
      await expect(hotelProfileService.updateFacilityForHotel({ facilities: [] }, 1, 1))
        .rejects.toThrow('Hotel not found');
    });

    it('throws when user is not owner', async () => {
      db.Hotel.findByPk.mockResolvedValue({ hotel_owner: 2 });
      await expect(hotelProfileService.updateFacilityForHotel({ facilities: [] }, 1, 1))
        .rejects.toThrow('You are not the owner of hotel');
    });

    it('replaces facilities when data valid', async () => {
      db.Hotel.findByPk.mockResolvedValue({ hotel_owner: 1 });
      const facilityData = {
        hotel_id: 1,
        facilities: [
          { facility_id: 10, description: 'Pool' },
          { facility_id: 11, description: 'Gym' }
        ]
      };
      db.FacilitiesPossessing.destroy.mockResolvedValue();
      db.FacilitiesPossessing.create.mockResolvedValue();

      await hotelProfileService.updateFacilityForHotel(facilityData, 1, 1);

      expect(db.FacilitiesPossessing.destroy).toHaveBeenCalledWith({ where: { hotel_id: facilityData.hotel_id } });
      expect(db.FacilitiesPossessing.create).toHaveBeenCalledWith({
        facility_id: 10,
        hotel_id: 1,
        description: 'Pool'
      });
      expect(db.FacilitiesPossessing.create).toHaveBeenCalledWith({
        facility_id: 11,
        hotel_id: 1,
        description: 'Gym'
      });
    });
  });

  describe('updatePriceForRoomType', () => {
    it('throws when room type missing', async () => {
      db.RoomType.findByPk.mockResolvedValue(null);
      await expect(hotelProfileService.updatePriceForRoomType({ type_id: 1 }, 1))
        .rejects.toThrow('Room type not found');
    });

    it('throws when user is not owner', async () => {
      db.RoomType.findByPk.mockResolvedValue({ hotel_id: 2 });
      db.Hotel.findByPk.mockResolvedValue({ hotel_owner: 3 });
      await expect(hotelProfileService.updatePriceForRoomType({ type_id: 1 }, 1))
        .rejects.toThrow('You are not the owner of this hotel');
    });

    it('updates price when valid', async () => {
      db.RoomType.findByPk.mockResolvedValue({ type_id: 1, hotel_id: 1 });
      db.Hotel.findByPk.mockResolvedValue({ hotel_owner: 5 });
      db.RoomPrice.findOne.mockResolvedValue({
        start_date: null, end_date: null, special_price: null, event: 'No event', basic_price: 100, discount: 0
      });
      db.RoomPrice.update = jest.fn().mockResolvedValue();

      await hotelProfileService.updatePriceForRoomType({ type_id: 1, basic_price: 150 }, 5);

      expect(db.RoomPrice.update).toHaveBeenCalledWith(
        expect.objectContaining({ basic_price: 150 }),
        { where: { type_id: 1 } }
      );
    });
  });

  describe('getAllTypeForHotel', () => {
    it('throws when hotel missing', async () => {
      db.Hotel.findByPk.mockResolvedValue(null);
      await expect(hotelProfileService.getAllTypeForHotel(1)).rejects.toThrow('Hotel not found');
    });

    it('returns types when hotel found', async () => {
      const types = [{ type_id: 1 }];
      db.Hotel.findByPk.mockResolvedValue({ hotel_id: 1 });
      db.RoomType.findAll.mockResolvedValue(types);
      const result = await hotelProfileService.getAllTypeForHotel(1);
      expect(result).toBe(types);
    });
  });

  describe('getAllRoomsForHotel', () => {
    it('throws when hotel missing', async () => {
      db.Hotel.findByPk.mockResolvedValue(null);
      await expect(hotelProfileService.getAllRoomsForHotel(1)).rejects.toThrow('Hotel not found');
    });

    it('returns rooms with availability and price', async () => {
      db.Hotel.findByPk.mockResolvedValue({ hotel_id: 1 });
      const roomTypes = [{ type_id: 1 }];
      const rooms = [{
        room_id: 1,
        type_id: 1,
        get: jest.fn(() => ({ room_id: 1, type_id: 1, isAvailable: true })),
        setDataValue: jest.fn()
      }];
      db.RoomType.findAll.mockResolvedValue(roomTypes);
      db.Room.findAll.mockResolvedValue(rooms);
      db.Booking.findAll.mockResolvedValue([]);
      db.RoomPrice.findOne.mockResolvedValue({ special_price: null, basic_price: 200, discount: 0, start_date: null, end_date: null });
      db.Image.findAll.mockResolvedValue([]);

      const result = await hotelProfileService.getAllRoomsForHotel(1);

      expect(result[0].priceData.price).toBe(200);
      expect(rooms[0].setDataValue).toHaveBeenCalledWith('isAvailable', true);
      expect(rooms[0].setDataValue).toHaveBeenCalledWith('imageUrls', []);
    });
  });

  describe('getAllRooms', () => {
    it('returns all rooms with availability and price', async () => {
      const rooms = [{
        room_id: 1,
        type_id: 1,
        get: jest.fn(() => ({ room_id: 1, type_id: 1, isAvailable: true })),
        setDataValue: jest.fn()
      }];
      const roomTypes = [{ type_id: 1 }];
      db.Room.findAll.mockResolvedValue(rooms);
      db.RoomType.findAll.mockResolvedValue(roomTypes);
      db.Booking.findAll.mockResolvedValue([]);
      db.RoomPrice.findOne.mockResolvedValue({ special_price: 120, basic_price: 150, discount: 0.1, start_date: null, end_date: null });
      db.Image.findAll.mockResolvedValue([]);

      const result = await hotelProfileService.getAllRooms();

      expect(result[0].priceData.price).toBe(120);
      expect(result[0].roomTypeData).toEqual(roomTypes[0]);
      expect(rooms[0].setDataValue).toHaveBeenCalledWith('isAvailable', true);
      expect(rooms[0].setDataValue).toHaveBeenCalledWith('imageUrls', []);
    });
  });
});

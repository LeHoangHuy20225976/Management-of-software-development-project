jest.mock('models/index', () => {
  const hotels = [];
  const roomTypes = [];
  const rooms = [];
  const roomPrices = [];
  const facilities = [];
  const bookings = [];
  const users = [];
  const images = [];
  let lastTransaction = null;

  const sequelize = {
    transaction: jest.fn(async () => {
      lastTransaction = {
        committed: false,
        rolledBack: false,
        commit: jest.fn(async function () {
          this.committed = true;
        }),
        rollback: jest.fn(async function () {
          this.rolledBack = true;
        })
      };
      return lastTransaction;
    })
  };

  const Hotel = {
    findOne: jest.fn(async ({ where }) => {
      const andClauses = (where && (where.and || where['and'])) || [];
      const nameValue = andClauses.find((c) => c.lhs?.col === 'name')?.rhs;
      const addressValue = andClauses.find((c) => c.lhs?.col === 'address')?.rhs;
      return hotels.find(
        (h) =>
          h.name.toLowerCase() === nameValue &&
          h.address.toLowerCase() === addressValue
      ) || null;
    }),
    create: jest.fn(async (data) => {
      const record = {
        ...data,
        hotel_id: hotels.length + 1,
        save: jest.fn(async function () { return this; })
      };
      hotels.push(record);
      return record;
    }),
    findByPk: jest.fn(async (id) => hotels.find((h) => h.hotel_id === id) || null)
  };

  const RoomType = {
    create: jest.fn(async (data) => {
      const record = {
        ...data,
        type_id: roomTypes.length + 1,
        quantity: data.quantity ?? 0,
        save: jest.fn(async function () { return this; })
      };
      roomTypes.push(record);
      return record;
    }),
    findByPk: jest.fn(async (id) => roomTypes.find((rt) => rt.type_id === id) || null),
    findAll: jest.fn(async ({ where }) => {
      if (where?.hotel_id !== undefined) {
        return roomTypes.filter((rt) => rt.hotel_id === where.hotel_id);
      }
      return [...roomTypes];
    }),
    update: jest.fn(async (values, { where }) => {
      const ids = Array.isArray(where.type_id) ? where.type_id : [where.type_id];
      roomTypes.forEach((rt) => {
        if (ids.includes(rt.type_id)) {
          Object.assign(rt, values);
        }
      });
    })
  };

  const Room = {
    create: jest.fn(async (data) => {
      const record = {
        ...data,
        room_id: rooms.length + 1,
        setDataValue(key, value) {
          this[key] = value;
        },
        get() {
          return { ...this };
        }
      };
      rooms.push(record);
      return record;
    }),
    update: jest.fn(async (values, { where }) => {
      const ids = Array.isArray(where.type_id) ? where.type_id : [where.type_id];
      rooms.forEach((room) => {
        if (ids.includes(room.type_id)) {
          Object.assign(room, values);
        }
      });
    }),
    findAll: jest.fn(async ({ where } = {}) => {
      if (!where) return [...rooms];
      if (where.type_id) {
        const ids = Array.isArray(where.type_id) ? where.type_id : [where.type_id];
        return rooms.filter((r) => ids.includes(r.type_id));
      }
      if (where.room_id) {
        const ids = Array.isArray(where.room_id) ? where.room_id : [where.room_id];
        return rooms.filter((r) => ids.includes(r.room_id));
      }
      return [...rooms];
    })
  };

  const User = {
    findByPk: jest.fn(async (id) => users.find((u) => u.user_id === id) || null)
  };

  const RoomPrice = {
    findOne: jest.fn(async ({ where }) => roomPrices.find((rp) => rp.type_id === where.type_id) || null),
    update: jest.fn(async (values, { where }) => {
      roomPrices.forEach((rp) => {
        if (rp.type_id === where.type_id) Object.assign(rp, values);
      });
    }),
    create: jest.fn(async (data) => {
      roomPrices.push({ ...data });
      return data;
    })
  };

  const FacilitiesPossessing = {
    destroy: jest.fn(async ({ where }) => {
      const remaining = facilities.filter((f) => f.hotel_id !== where.hotel_id);
      facilities.length = 0;
      facilities.push(...remaining);
    }),
    create: jest.fn(async (data) => {
      facilities.push({ ...data });
      return data;
    })
  };

  const Booking = {
    findAll: jest.fn(async ({ where }) => {
      const ids = Array.isArray(where.room_id) ? where.room_id : [where.room_id];
      return bookings.filter((b) => ids.includes(b.room_id) && b.status !== 'cancelled');
    })
  };

  const Image = {
    findAll: jest.fn(async ({ where } = {}) => {
      if (!where) return [...images];
      if (where.hotel_id !== undefined) return images.filter((i) => i.hotel_id === where.hotel_id);
      if (where.room_id !== undefined) return images.filter((i) => i.room_id === where.room_id);
      return [...images];
    }),
    create: jest.fn(async (data) => {
      const record = { ...data, image_id: images.length + 1 };
      images.push(record);
      return record;
    })
  };

  return {
    Hotel,
    RoomType,
    Room,
    User,
    RoomPrice,
    Image,
    FacilitiesPossessing,
    Booking,
    sequelize,
    __data: { hotels, roomTypes, rooms, users, roomPrices, facilities, bookings, images },
    __reset: () => {
      hotels.length = 0;
      roomTypes.length = 0;
      rooms.length = 0;
      users.length = 0;
      roomPrices.length = 0;
      facilities.length = 0;
      bookings.length = 0;
      images.length = 0;
      lastTransaction = null;
      sequelize.transaction.mockClear();
      Hotel.findOne.mockClear();
      Hotel.create.mockClear();
      Hotel.findByPk.mockClear();
      RoomType.create.mockClear();
      RoomType.findByPk.mockClear();
      RoomType.findAll.mockClear();
      RoomType.update.mockClear();
      Room.create.mockClear();
      Room.update.mockClear();
      Room.findAll.mockClear();
      User.findByPk.mockClear();
      RoomPrice.findOne.mockClear();
      RoomPrice.update.mockClear();
      RoomPrice.create.mockClear();
      Image.findAll.mockClear();
      Image.create.mockClear();
      FacilitiesPossessing.destroy.mockClear();
      FacilitiesPossessing.create.mockClear();
      Booking.findAll.mockClear();
    },
    getLastTransaction: () => lastTransaction
  };
});

jest.mock('sequelize', () => ({
  Op: {
    and: 'and',
    ne: 'ne'
  },
  fn: (funcName, column) => ({ funcName, col: column }),
  col: (column) => column,
  where: (lhs, rhs) => ({ lhs, rhs })
}));

jest.mock('../../../../utils/minioUtils', () => ({
  buckets: {
    HOTEL_IMAGES: 'hotel-images',
    ROOM_IMAGES: 'room-images'
  },
  uploadFile: jest.fn(async (_bucket, _buffer, originalname) => ({ fileName: `uploaded-${originalname}` })),
  deleteFile: jest.fn(async () => {}),
  getFileUrl: jest.fn(async (bucket, objectName) => {
    return `http://minio:9000/${bucket}/${objectName}?X-Amz-Signature=abc`;
  })
}));

const hotelProfileService = require('../hotelProfileService');
const db = require('models/index');
const minioUtils = require('../../../../utils/minioUtils');

describe('hotelProfileService - Integration Tests', () => {
  beforeEach(() => {
    db.__reset();
    jest.clearAllMocks();
  });

  it('creates hotel, room type, and room end-to-end', async () => {
    const userId = 1;
    db.__data.users.push({
      user_id: userId,
      role: 'customer',
      save: jest.fn(async function () { return this; })
    });

	    const hotelPayload = {
	      hotelName: 'Sunrise',
	      address: '123 Beach Road',
	      longitude: 10.1,
	      latitute: 20.2,
	      contact_phone: '555-0000'
	    };

    const createdHotel = await hotelProfileService.addNewHotel(hotelPayload, userId);
    expect(createdHotel).toEqual({ hotelName: hotelPayload.hotelName });

    const hotel = db.__data.hotels[0];
	    expect(hotel).toMatchObject({
	      name: hotelPayload.hotelName,
	      address: hotelPayload.address,
	      status: 1,
	      rating: 5.0,
	      longitude: hotelPayload.longitude,
	      latitude: hotelPayload.latitute,
	      description: 'No description provided',
	      contact_phone: hotelPayload.contact_phone,
	      thumbnail: null
	    });
    expect(db.__data.users[0].role).toBe('hotel_manager');

    const typePayload = {
      hotel_id: hotel.hotel_id,
      type: 'Deluxe',
      priceData: { basic_price: 120, special_price: null, discount: 0, event: 'No event' }
    };
    await hotelProfileService.addTypeForHotel(typePayload, userId);

    const roomType = db.__data.roomTypes[0];
    expect(roomType).toMatchObject({
      hotel_id: hotel.hotel_id,
      type: 'Deluxe',
      availability: true,
      max_guests: 2,
      description: 'No description provided',
      quantity: 0
    });

    const roomPayload = {
      type_id: roomType.type_id,
      name: 'Room 101',
      location: '1F',
      number_of_double_beds: 1
    };
    await hotelProfileService.addRoom(roomPayload, userId);

    const room = db.__data.rooms[0];
    expect(room).toMatchObject({
      type_id: roomType.type_id,
      name: roomPayload.name,
      location: roomPayload.location,
      status: 1,
      estimated_available_time: null,
      number_of_single_beds: 0,
      number_of_double_beds: roomPayload.number_of_double_beds,
      room_view: 'No view',
      room_size: 0.0,
      notes: 'No notes'
    });
    expect(roomType.quantity).toBe(1);
  });

  it('updates hotel thumbnail end-to-end when a new file is provided', async () => {
    const ownerId = 21;
    db.__data.users.push({
      user_id: ownerId,
      role: 'hotel_manager',
      save: jest.fn(async function () { return this; })
    });

    const hotel = {
      hotel_id: 70,
      hotel_owner: ownerId,
      name: 'Hotel',
      address: 'Addr',
      status: 1,
      longitude: 1,
      latitude: 2,
      description: 'Desc',
      contact_phone: '000',
      thumbnail: 'old.png',
      save: jest.fn(async function () { return this; })
    };
    db.__data.hotels.push(hotel);

    const thumbnailFile = {
      buffer: Buffer.from('fake-image'),
      originalname: 'thumb.png',
      mimetype: 'image/png'
    };

    await hotelProfileService.updateHotelProfile(hotel.hotel_id, ownerId, {}, thumbnailFile);

    expect(minioUtils.uploadFile).toHaveBeenCalledWith(
      minioUtils.buckets.HOTEL_IMAGES,
      thumbnailFile.buffer,
      thumbnailFile.originalname,
      { 'Content-Type': thumbnailFile.mimetype }
    );
    expect(hotel.thumbnail).toBe('uploaded-thumb.png');
    expect(minioUtils.deleteFile).toHaveBeenCalledWith(minioUtils.buckets.HOTEL_IMAGES, 'old.png');
    expect(hotel.save).toHaveBeenCalled();
  });

  it('disables hotel and cascades availability/status updates', async () => {
    const ownerId = 5;
    db.__data.users.push({
      user_id: ownerId,
      role: 'hotel_manager',
      save: jest.fn(async function () { return this; })
    });

    const hotel = {
      hotel_id: 10,
      hotel_owner: ownerId,
      status: 1,
      save: jest.fn(async function () { return this; })
    };
    db.__data.hotels.push(hotel);

    db.__data.roomTypes.push(
      { type_id: 1, hotel_id: hotel.hotel_id, availability: true, quantity: 2 },
      { type_id: 2, hotel_id: hotel.hotel_id, availability: true, quantity: 1 }
    );
    db.__data.rooms.push(
      { room_id: 1, type_id: 1, status: 1 },
      { room_id: 2, type_id: 2, status: 1 }
    );

    await hotelProfileService.disableHotel(hotel.hotel_id, ownerId);

    expect(hotel.status).toBe(0);
    expect(db.__data.roomTypes.every((rt) => rt.availability === false)).toBe(true);
    expect(db.__data.rooms.every((room) => room.status === 0)).toBe(true);

    const transaction = db.getLastTransaction();
    expect(transaction).not.toBeNull();
    expect(transaction.commit).toHaveBeenCalled();
    expect(transaction.rolledBack).toBe(false);
  });

  it('rolls back transaction when cascading updates fail', async () => {
    const ownerId = 7;
    db.__data.users.push({
      user_id: ownerId,
      role: 'hotel_manager',
      save: jest.fn(async function () { return this; })
    });

    const hotel = {
      hotel_id: 20,
      hotel_owner: ownerId,
      status: 1,
      save: jest.fn(async function () { return this; })
    };
    db.__data.hotels.push(hotel);
    db.__data.roomTypes.push({ type_id: 3, hotel_id: hotel.hotel_id, availability: true });

    db.RoomType.update.mockImplementationOnce(async () => {
      throw new Error('failed cascade');
    });

    await expect(hotelProfileService.disableHotel(hotel.hotel_id, ownerId))
      .rejects
      .toThrow('failed cascade');

    const transaction = db.getLastTransaction();
    expect(transaction.rollback).toHaveBeenCalled();
    expect(transaction.commit).not.toHaveBeenCalled();
  });

  it('updates facility list end-to-end', async () => {
    const ownerId = 9;
    db.__data.users.push({ user_id: ownerId, role: 'hotel_manager', save: jest.fn() });
    db.__data.hotels.push({ hotel_id: 30, hotel_owner: ownerId });
    db.__data.facilities.push({ hotel_id: 30, facility_id: 1, description: 'Old' });

    const payload = {
      hotel_id: 30,
      facilities: [
        { facility_id: 2, description: 'Pool' },
        { facility_id: 3, description: 'Gym' }
      ]
    };

    await hotelProfileService.updateFacilityForHotel(payload, ownerId, 30);

    expect(db.__data.facilities).toHaveLength(2);
    expect(db.__data.facilities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ facility_id: 2, hotel_id: 30, description: 'Pool' }),
        expect.objectContaining({ facility_id: 3, hotel_id: 30, description: 'Gym' })
      ])
    );
  });

  it('updates price for room type end-to-end', async () => {
    const ownerId = 11;
    db.__data.users.push({ user_id: ownerId, role: 'hotel_manager', save: jest.fn() });
    db.__data.hotels.push({ hotel_id: 40, hotel_owner: ownerId });
    db.__data.roomTypes.push({ type_id: 4, hotel_id: 40 });
    db.__data.roomPrices.push({
      type_id: 4,
      basic_price: 100,
      special_price: null,
      discount: 0,
      start_date: null,
      end_date: null,
      event: 'No event'
    });

    await hotelProfileService.updatePriceForRoomType(
      { type_id: 4, basic_price: 150, discount: 0.15 },
      ownerId
    );

    expect(db.__data.roomPrices[0]).toMatchObject({
      basic_price: 150,
      discount: 0.15
    });
  });

  it('gets all room types for a hotel', async () => {
    db.__data.hotels.push({ hotel_id: 50, hotel_owner: 1 });
    db.__data.roomTypes.push(
      { type_id: 10, hotel_id: 50 },
      { type_id: 11, hotel_id: 50 }
    );

    const result = await hotelProfileService.getAllTypeForHotel(50);
    expect(result).toHaveLength(2);
  });

  it('returns rooms for a hotel with availability and price', async () => {
    const ownerId = 12;
    db.__data.hotels.push({ hotel_id: 60, hotel_owner: ownerId });
    db.__data.roomTypes.push({ type_id: 20, hotel_id: 60 });
    const now = new Date();
    db.__data.rooms.push({
      room_id: 100,
      type_id: 20,
      status: 1,
      setDataValue(key, value) { this[key] = value; },
      get() { return { ...this }; }
    });
    db.__data.roomPrices.push({
      type_id: 20,
      basic_price: 220,
      special_price: 180,
      discount: 0.1,
      start_date: null,
      end_date: null
    });
    db.__data.bookings.push({
      room_id: 100,
      status: 'booked',
      check_in_date: new Date(now.getTime() - 3600000),
      check_out_date: new Date(now.getTime() + 3600000)
    });

    const result = await hotelProfileService.getAllRoomsForHotel(60);

    expect(result[0].priceData.price).toBe(180);
    expect(result[0].roomData.isAvailable).toBe(false);
  });

  it('returns all rooms across hotels with availability and price fallback', async () => {
    db.__data.rooms.push({
      room_id: 200,
      type_id: 30,
      status: 1,
      setDataValue(key, value) { this[key] = value; },
      get() { return { ...this }; }
    });
    db.__data.roomTypes.push({ type_id: 30, hotel_id: 70 });
    db.__data.roomPrices.push({
      type_id: 30,
      basic_price: 90,
      special_price: null,
      discount: 0,
      start_date: null,
      end_date: null
    });
    db.__data.bookings.push({
      room_id: 200,
      status: 'cancelled',
      check_in_date: new Date(),
      check_out_date: new Date()
    });

    const result = await hotelProfileService.getAllRooms();

    expect(result[0].priceData.price).toBe(90);
    expect(result[0].roomData.isAvailable).toBe(true);
  });

  it('converts hotel thumbnail/images to public object URLs when viewing hotel profile', async () => {
    const hotelId = 99;
    db.__data.hotels.push({
      hotel_id: hotelId,
      hotel_owner: 1,
      thumbnail: 'thumb.png',
      setDataValue(key, value) { this[key] = value; },
      save: jest.fn(async function () { return this; })
    });
    db.__data.images.push({ hotel_id: hotelId, image_url: 'gallery-1.png' });

    const result = await hotelProfileService.viewHotelProfile(hotelId);

    expect(minioUtils.getFileUrl).toHaveBeenCalledWith(minioUtils.buckets.HOTEL_IMAGES, 'thumb.png');
    expect(result.hotelData.thumbnail).toBe('http://localhost:9002/hotel-images/thumb.png');
    expect(result.hotelData.imageUrls).toEqual(['http://localhost:9002/hotel-images/gallery-1.png']);
  });
});

jest.mock('models/index', () => {
  const hotels = [];
  const roomTypes = [];
  const rooms = [];
  const users = [];
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
      const record = { ...data, room_id: rooms.length + 1 };
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
    })
  };

  const User = {
    findByPk: jest.fn(async (id) => users.find((u) => u.user_id === id) || null)
  };

  return {
    Hotel,
    RoomType,
    Room,
    User,
    sequelize,
    __data: { hotels, roomTypes, rooms, users },
    __reset: () => {
      hotels.length = 0;
      roomTypes.length = 0;
      rooms.length = 0;
      users.length = 0;
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
      User.findByPk.mockClear();
    },
    getLastTransaction: () => lastTransaction
  };
});

jest.mock('sequelize', () => ({
  Op: {
    and: 'and'
  },
  fn: (funcName, column) => ({ funcName, col: column }),
  col: (column) => column,
  where: (lhs, rhs) => ({ lhs, rhs })
}));

const hotelProfileService = require('../hotelProfileService');
const db = require('models/index');

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
      latitute: hotelPayload.latitute,
      description: 'No description provided',
      contact_phone: hotelPayload.contact_phone,
      thumbnail: null
    });
    expect(db.__data.users[0].role).toBe('hotel_manager');

    const typePayload = { hotel_id: hotel.hotel_id, type: 'Deluxe' };
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
});

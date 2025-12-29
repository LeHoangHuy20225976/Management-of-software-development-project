'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Add CASCADE constraints for existing foreign keys

        // User -> LovingList (user_id)
        await queryInterface.changeColumn('LovingList', 'user_id', {
            type: Sequelize.INTEGER,
            references: {
                model: 'User',
                key: 'user_id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        });

        // User -> Review (user_id)
        await queryInterface.changeColumn('Review', 'user_id', {
            type: Sequelize.INTEGER,
            references: {
                model: 'User',
                key: 'user_id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        });

        // User -> Booking (user_id)
        await queryInterface.changeColumn('Booking', 'user_id', {
            type: Sequelize.INTEGER,
            references: {
                model: 'User',
                key: 'user_id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        });

        // User -> Hotel (hotel_owner)
        await queryInterface.changeColumn('Hotel', 'hotel_owner', {
            type: Sequelize.INTEGER,
            references: {
                model: 'User',
                key: 'user_id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        });

        // Booking -> Payment (booking_id)
        await queryInterface.changeColumn('Payment', 'booking_id', {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'Booking',
                key: 'booking_id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        });

        // Hotel -> RoomType (hotel_id)
        await queryInterface.changeColumn('RoomType', 'hotel_id', {
            type: Sequelize.INTEGER,
            references: {
                model: 'Hotel',
                key: 'hotel_id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        });

        // Hotel -> Image (hotel_id)
        await queryInterface.changeColumn('Image', 'hotel_id', {
            type: Sequelize.INTEGER,
            references: {
                model: 'Hotel',
                key: 'hotel_id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        });

        // Hotel -> Review (hotel_id)
        await queryInterface.changeColumn('Review', 'hotel_id', {
            type: Sequelize.INTEGER,
            references: {
                model: 'Hotel',
                key: 'hotel_id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        });

        // Hotel -> LovingList (hotel_id)
        await queryInterface.changeColumn('LovingList', 'hotel_id', {
            type: Sequelize.INTEGER,
            references: {
                model: 'Hotel',
                key: 'hotel_id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        });

        // RoomType -> Room (type_id)
        await queryInterface.changeColumn('Room', 'type_id', {
            type: Sequelize.INTEGER,
            references: {
                model: 'RoomType',
                key: 'type_id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        });

        // Room -> Booking (room_id)
        await queryInterface.changeColumn('Booking', 'room_id', {
            type: Sequelize.INTEGER,
            references: {
                model: 'Room',
                key: 'room_id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        });

        // Room -> Image (room_id)
        await queryInterface.changeColumn('Image', 'room_id', {
            type: Sequelize.INTEGER,
            references: {
                model: 'Room',
                key: 'room_id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        });

        // Room -> Review (room_id)
        await queryInterface.changeColumn('Review', 'room_id', {
            type: Sequelize.INTEGER,
            references: {
                model: 'Room',
                key: 'room_id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        });

        // RoomType -> RoomPrice (type_id)
        await queryInterface.changeColumn('RoomPrice', 'type_id', {
            type: Sequelize.INTEGER,
            references: {
                model: 'RoomType',
                key: 'type_id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        });
    },

    async down(queryInterface, Sequelize) {
        // Remove CASCADE constraints (set back to RESTRICT)

        // User -> LovingList (user_id)
        await queryInterface.changeColumn('LovingList', 'user_id', {
            type: Sequelize.INTEGER,
            references: {
                model: 'User',
                key: 'user_id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
        });

        // User -> Review (user_id)
        await queryInterface.changeColumn('Review', 'user_id', {
            type: Sequelize.INTEGER,
            references: {
                model: 'User',
                key: 'user_id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
        });

        // User -> Booking (user_id)
        await queryInterface.changeColumn('Booking', 'user_id', {
            type: Sequelize.INTEGER,
            references: {
                model: 'User',
                key: 'user_id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
        });

        // User -> Hotel (hotel_owner)
        await queryInterface.changeColumn('Hotel', 'hotel_owner', {
            type: Sequelize.INTEGER,
            references: {
                model: 'User',
                key: 'user_id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        });

        // Booking -> Payment (booking_id)
        await queryInterface.changeColumn('Payment', 'booking_id', {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'Booking',
                key: 'booking_id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
        });

        // Hotel -> RoomType (hotel_id)
        await queryInterface.changeColumn('RoomType', 'hotel_id', {
            type: Sequelize.INTEGER,
            references: {
                model: 'Hotel',
                key: 'hotel_id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
        });

        // Hotel -> Image (hotel_id)
        await queryInterface.changeColumn('Image', 'hotel_id', {
            type: Sequelize.INTEGER,
            references: {
                model: 'Hotel',
                key: 'hotel_id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
        });

        // Hotel -> Review (hotel_id)
        await queryInterface.changeColumn('Review', 'hotel_id', {
            type: Sequelize.INTEGER,
            references: {
                model: 'Hotel',
                key: 'hotel_id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
        });

        // Hotel -> LovingList (hotel_id)
        await queryInterface.changeColumn('LovingList', 'hotel_id', {
            type: Sequelize.INTEGER,
            references: {
                model: 'Hotel',
                key: 'hotel_id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
        });

        // RoomType -> Room (type_id)
        await queryInterface.changeColumn('Room', 'type_id', {
            type: Sequelize.INTEGER,
            references: {
                model: 'RoomType',
                key: 'type_id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
        });

        // Room -> Booking (room_id)
        await queryInterface.changeColumn('Booking', 'room_id', {
            type: Sequelize.INTEGER,
            references: {
                model: 'Room',
                key: 'room_id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
        });

        // Room -> Image (room_id)
        await queryInterface.changeColumn('Image', 'room_id', {
            type: Sequelize.INTEGER,
            references: {
                model: 'Room',
                key: 'room_id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
        });

        // Room -> Review (room_id)
        await queryInterface.changeColumn('Review', 'room_id', {
            type: Sequelize.INTEGER,
            references: {
                model: 'Room',
                key: 'room_id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
        });

        // RoomType -> RoomPrice (type_id)
        await queryInterface.changeColumn('RoomPrice', 'type_id', {
            type: Sequelize.INTEGER,
            references: {
                model: 'RoomType',
                key: 'type_id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
        });
    }
};

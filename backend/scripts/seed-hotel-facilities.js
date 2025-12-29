/* eslint-disable no-console */
'use strict';

const db = require('../models');
const bcrypt = require('bcryptjs');

const FACILITIES = [
  { facility_id: 1, name: 'WiFi miễn phí' },
  { facility_id: 2, name: 'Lễ tân 24/7' },
  { facility_id: 3, name: 'Thang máy' },
  { facility_id: 4, name: 'Két an toàn' },
  { facility_id: 5, name: 'Dịch vụ giặt ủi' },
  { facility_id: 6, name: 'Dịch vụ phòng' },
  { facility_id: 7, name: 'Điều hòa' },
  { facility_id: 8, name: 'TV màn hình phẳng' },
  { facility_id: 9, name: 'Minibar' },
  { facility_id: 10, name: 'Máy sấy tóc' },
  { facility_id: 11, name: 'Bồn tắm' },
  { facility_id: 12, name: 'Ban công' },
  { facility_id: 13, name: 'Nhà hàng' },
  { facility_id: 14, name: 'Quầy bar' },
  { facility_id: 15, name: 'Bữa sáng buffet' },
  { facility_id: 16, name: 'Phục vụ phòng 24h' },
  { facility_id: 17, name: 'Hồ bơi' },
  { facility_id: 18, name: 'Phòng gym' },
  { facility_id: 19, name: 'Sân tennis' },
  { facility_id: 20, name: 'Khu vui chơi trẻ em' },
  { facility_id: 21, name: 'Phòng họp' },
  { facility_id: 22, name: 'Trung tâm hội nghị' },
  { facility_id: 23, name: 'Máy in/Fax' },
  { facility_id: 24, name: 'Spa' },
  { facility_id: 25, name: 'Phòng xông hơi' },
  { facility_id: 26, name: 'Massage' },
  { facility_id: 27, name: 'Bãi đậu xe miễn phí' },
  { facility_id: 28, name: 'Đưa đón sân bay' },
  { facility_id: 29, name: 'Thuê xe' },
  { facility_id: 30, name: 'Dịch vụ taxi' },
];

async function main() {
  console.log('Deprecated: use scripts/seed-additional-data.js instead.');
  console.log('Seeding HotelFacilities...');

  try {
    const qi = db.sequelize.getQueryInterface();
    const tables = await qi.showAllTables();
    const hasTable = (tables || []).some(
      (t) => String(t).toLowerCase() === 'hotelfacilities'
    );
    if (!hasTable) {
      console.log('HotelFacilities table does not exist yet. Skipping seed.');
      return;
    }

    const existingCount = await db.HotelFacilities.count();
    if (existingCount > 0) {
      console.log(`HotelFacilities already has ${existingCount} rows. Skipping seed.`);
      return;
    }

    const tx = await db.sequelize.transaction();
    try {
      for (const facility of FACILITIES) {
        await db.HotelFacilities.upsert(facility, { transaction: tx });
      }
      await tx.commit();
    } catch (e) {
      await tx.rollback();
      throw e;
    }

    const count = await db.HotelFacilities.count();
    console.log(`Done. HotelFacilities count: ${count}`);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  } finally {
    await db.sequelize.close();
  }
}

main();

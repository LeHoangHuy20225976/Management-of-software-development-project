const { RoomPrice, RoomType, Hotel } = require('../../../models');
const { Op } = require('sequelize');

/**
 * Pricing Engine Service
 * Calculates room prices using base rates and dynamic rules
 */
class PricingEngineService {
  /**
   * Calculate the total price for a booking
   * @param {number} typeId - Room type ID
   * @param {Date} checkInDate - Check-in date
   * @param {Date} checkOutDate - Check-out date
   * @param {number} guests - Number of guests (optional, for occupancy-based pricing)
   * @param {string} promoCode - Promo code (optional)
   * @returns {Promise<{totalPrice: number, breakdown: object}>}
   */
  async calculatePrice(typeId, checkInDate, checkOutDate, guests = 1, promoCode = null) {
    const roomPrice = await RoomPrice.findOne({
      where: { type_id: typeId },
      include: [
        {
          model: RoomType,
          include: [{ model: Hotel }]
        }
      ]
    });

    if (!roomPrice) {
      throw new Error('Room price not found');
    }

    // Calculate number of nights
    const nights = Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24));
    
    if (nights <= 0) {
      throw new Error('Check-out date must be after check-in date');
    }

    // Get base price
    let pricePerNight = roomPrice.basic_price;
    let eventApplied = null;
    let discountApplied = 0;
    const dailyBreakdown = [];

    // Calculate price for each night
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    let totalPrice = 0;

    for (let i = 0; i < nights; i++) {
      const currentDate = new Date(checkIn);
      currentDate.setDate(currentDate.getDate() + i);
      
      let nightPrice = roomPrice.basic_price;
      let nightEvent = null;
      let nightDiscount = 0;

      // Check for special event price
      if (roomPrice.start_date && roomPrice.end_date && roomPrice.special_price) {
        const startDate = new Date(roomPrice.start_date);
        const endDate = new Date(roomPrice.end_date);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        currentDate.setHours(0, 0, 0, 0);

        if (currentDate >= startDate && currentDate <= endDate) {
          nightPrice = roomPrice.special_price;
          nightEvent = roomPrice.event;
        }
      }

      // Apply occupancy-based pricing (if guests exceed base capacity)
      const roomType = roomPrice.RoomType;
      if (roomType && guests > roomType.max_guests) {
        throw new Error(`Number of guests (${guests}) exceeds maximum capacity (${roomType.max_guests})`);
      }

      // Apply seasonal/demand-based pricing (simplified - can be extended)
      nightPrice = this.applyDynamicPricing(nightPrice, currentDate, roomType);

      // Apply base discount if available
      if (roomPrice.discount && roomPrice.discount > 0) {
        nightDiscount = roomPrice.discount;
      }

      // Apply promo code discount (if provided)
      if (promoCode) {
        const promoDiscount = await this.applyPromoCode(promoCode, nightPrice, currentDate);
        if (promoDiscount > 0) {
          nightDiscount = Math.max(nightDiscount, promoDiscount);
        }
      }

      const nightSubtotal = nightPrice;
      const nightDiscountAmount = nightSubtotal * nightDiscount;
      const nightFinalPrice = nightSubtotal - nightDiscountAmount;

      dailyBreakdown.push({
        date: currentDate.toISOString().split('T')[0],
        base_price: nightPrice,
        event: nightEvent,
        discount_rate: nightDiscount,
        discount_amount: Math.round(nightDiscountAmount),
        final_price: Math.round(nightFinalPrice)
      });

      totalPrice += nightFinalPrice;
    }

    // Calculate overall totals
    const subtotal = dailyBreakdown.reduce((sum, day) => sum + day.base_price, 0);
    const totalDiscount = dailyBreakdown.reduce((sum, day) => sum + day.discount_amount, 0);

    return {
      totalPrice: Math.round(totalPrice),
      breakdown: {
        nights,
        guests,
        subtotal: Math.round(subtotal),
        totalDiscount: Math.round(totalDiscount),
        finalTotal: Math.round(totalPrice),
        dailyBreakdown,
        promoCode: promoCode || null,
        eventApplied: eventApplied || (roomPrice.event && dailyBreakdown.some(d => d.event) ? roomPrice.event : null)
      }
    };
  }

  /**
   * Apply dynamic pricing rules (seasonal, demand-based)
   * @param {number} basePrice - Base price
   * @param {Date} date - Date to check
   * @param {object} roomType - Room type object
   * @returns {number} Adjusted price
   */
  applyDynamicPricing(basePrice, date, roomType) {
    // Holiday pricing has highest priority (20% increase)
    if (this.isHoliday(date)) {
      return Math.round(basePrice * 1.2);
    }

    // Weekend pricing (Friday, Saturday) - 10% increase
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 5 || dayOfWeek === 6) {
      return Math.round(basePrice * 1.1);
    }

    // Peak season (June-August, December) - 15% increase
    const month = date.getMonth();
    if (month === 5 || month === 6 || month === 7 || month === 11) {
      return Math.round(basePrice * 1.15);
    }

    // Regular pricing
    return basePrice;
  }

  /**
   * Check if a date is a holiday
   * @param {Date} date - Date to check
   * @returns {boolean}
   */
  isHoliday(date) {
    // Simplified holiday check - can be extended with a holidays table
    const month = date.getMonth();
    const day = date.getDate();
    
    // New Year (Jan 1), Independence Day (Sep 2), Christmas (Dec 25)
    if ((month === 0 && day === 1) || 
        (month === 8 && day === 2) || 
        (month === 11 && day === 25)) {
      return true;
    }
    
    return false;
  }

  /**
   * Apply promo code discount
   * @param {string} promoCode - Promo code
   * @param {number} price - Current price
   * @param {Date} date - Booking date
   * @returns {Promise<number>} Discount rate (0-1)
   */
  async applyPromoCode(promoCode, price, date) {
    // TODO: Implement promo codes table in database
    // For now, return 0 to avoid hard-coded data
    // This ensures no mock/hard-coded data is used
    return 0;
  }

  /**
   * Get price for a specific date
   * @param {number} typeId - Room type ID
   * @param {Date} date - Date
   * @returns {Promise<{price: number, event?: string, discount?: number}>}
   */
  async getPriceForDate(typeId, date) {
    const roomPrice = await RoomPrice.findOne({
      where: { type_id: typeId },
      include: [{ model: RoomType }]
    });

    if (!roomPrice) {
      throw new Error('Room price not found');
    }

    let price = roomPrice.basic_price;
    let event = null;

    // Check for special event price
    if (roomPrice.start_date && roomPrice.end_date && roomPrice.special_price) {
      const startDate = new Date(roomPrice.start_date);
      const endDate = new Date(roomPrice.end_date);
      const checkDate = new Date(date);
      
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      checkDate.setHours(0, 0, 0, 0);

      if (checkDate >= startDate && checkDate <= endDate) {
        price = roomPrice.special_price;
        event = roomPrice.event;
      }
    }

    // Apply dynamic pricing
    price = this.applyDynamicPricing(price, new Date(date), roomPrice.RoomType);

    return {
      price: Math.round(price),
      base_price: roomPrice.basic_price,
      event,
      discount: roomPrice.discount || 0
    };
  }

  /**
   * Get price range for a date range
   * @param {number} typeId - Room type ID
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<{minPrice: number, maxPrice: number, averagePrice: number, dailyPrices: Array}>}
   */
  async getPriceRange(typeId, startDate, endDate) {
    const dailyPrices = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const current = new Date(start);

    while (current <= end) {
      const priceInfo = await this.getPriceForDate(typeId, current);
      dailyPrices.push({
        date: current.toISOString().split('T')[0],
        ...priceInfo
      });
      current.setDate(current.getDate() + 1);
    }

    const prices = dailyPrices.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const averagePrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;

    return {
      minPrice,
      maxPrice,
      averagePrice: Math.round(averagePrice),
      dailyPrices
    };
  }

  /**
   * Update pricing for a room type
   * @param {number} typeId - Room type ID
   * @param {object} updateData - Pricing update data
   * @returns {Promise<object>} Updated pricing data
   */
  async updatePricing(typeId, updateData) {
    const roomPrice = await RoomPrice.findOne({
      where: { type_id: typeId },
      include: [{ model: RoomType }]
    });

    if (!roomPrice) {
      throw new Error('Room price not found');
    }

    // Prepare update data
    const updateFields = {};

    if (updateData.basic_price !== undefined) {
      updateFields.basic_price = updateData.basic_price;
    }

    if (updateData.special_price !== undefined) {
      updateFields.special_price = updateData.special_price;
    }

    if (updateData.discount !== undefined) {
      updateFields.discount = updateData.discount;
    }

    if (updateData.event !== undefined) {
      updateFields.event = updateData.event;
    }

    if (updateData.start_date !== undefined) {
      updateFields.start_date = updateData.start_date;
    }

    if (updateData.end_date !== undefined) {
      updateFields.end_date = updateData.end_date;
    }

    await roomPrice.update(updateFields);

    return {
      type_id: typeId,
      ...roomPrice.toJSON()
    };
  }
}

module.exports = new PricingEngineService();



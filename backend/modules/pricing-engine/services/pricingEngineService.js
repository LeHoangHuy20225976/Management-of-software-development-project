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
    let adjustedPrice = basePrice;

    // Weekend pricing (Friday, Saturday)
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 5 || dayOfWeek === 6) {
      adjustedPrice = basePrice * 1.1; // 10% increase on weekends
    }

    // Holiday pricing (simplified - check for common holidays)
    if (this.isHoliday(date)) {
      adjustedPrice = basePrice * 1.2; // 20% increase on holidays
    }

    // Peak season (June-August, December)
    const month = date.getMonth();
    if (month === 5 || month === 6 || month === 7 || month === 11) {
      adjustedPrice = basePrice * 1.15; // 15% increase in peak season
    }

    return Math.round(adjustedPrice);
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
    // Simplified promo code logic - can be extended with a promo codes table
    const promoCodes = {
      'SUMMER10': { discount: 0.1, validUntil: new Date('2024-12-31') },
      'WINTER15': { discount: 0.15, validUntil: new Date('2024-12-31') },
      'EARLY20': { discount: 0.2, validUntil: new Date('2024-12-31') }
    };

    const promo = promoCodes[promoCode.toUpperCase()];
    
    if (!promo) {
      return 0; // Invalid promo code
    }

    if (date > promo.validUntil) {
      return 0; // Expired promo code
    }

    return promo.discount;
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
    price = this.applyDynamicPricing(price, date, roomPrice.RoomType);

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
}

module.exports = new PricingEngineService();



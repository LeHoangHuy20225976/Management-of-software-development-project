const db = require("../../../models/index");

const DestinationService = {
  /**
   * Get all destinations
   */
  async getAllDestinations() {
    const destinations = await db.Destination.findAll();
    console.log(destinations);
    return destinations;
  },
  /* 
  {
      include: [
        {
          model: db.Image,
          attributes: ["image_id", "image_url"],
        },
      ],
      order: [["destination_id", "ASC"]],
    }
  */

  /**
   * Get destination by ID
   */
  async getDestinationById(destinationId) {
    const destination = await db.Destination.findByPk(destinationId, {
      include: [
        {
          model: db.Image,
          attributes: ["image_id", "image_url"],
        },
        {
          model: db.Review,
          attributes: ["review_id", "rating", "content", "created_at"],
          include: [
            {
              model: db.User,
              attributes: ["user_id", "name", "profile_image"],
            },
          ],
        },
      ],
    });
    if (!destination) {
      throw new Error("Destination not found");
    }
    return destination;
  },

  /**
   * Create a new destination
   */
  async createDestination(destinationData) {
    const {
      name,
      rating,
      location,
      transportation,
      entry_fee,
      description,
      latitude,
      longitude,
      type,
      thumbnail,
    } = destinationData;

    const newDestination = await db.Destination.create({
      name,
      rating,
      location,
      transportation,
      entry_fee,
      description,
      latitude,
      longitude,
      type,
      thumbnail,
    });

    return newDestination;
  },

  /**
   * Update destination by ID
   */
  async updateDestination(destinationId, destinationData) {
    const destination = await db.Destination.findByPk(destinationId);
    if (!destination) {
      throw new Error("Destination not found");
    }

    const {
      name,
      rating,
      location,
      transportation,
      entry_fee,
      description,
      latitude,
      longitude,
      type,
      thumbnail,
    } = destinationData;

    // Prepare update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (rating !== undefined) updateData.rating = rating;
    if (location !== undefined) updateData.location = location;
    if (transportation !== undefined)
      updateData.transportation = transportation;
    if (entry_fee !== undefined) updateData.entry_fee = entry_fee;
    if (description !== undefined) updateData.description = description;
    if (latitude !== undefined) updateData.latitude = latitude;
    if (longitude !== undefined) updateData.longitude = longitude;
    if (type !== undefined) updateData.type = type;
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;

    await destination.update(updateData);

    return destination;
  },

  /**
   * Delete destination by ID
   */
  async deleteDestination(destinationId) {
    const destination = await db.Destination.findByPk(destinationId);
    if (!destination) {
      throw new Error("Destination not found");
    }

    await destination.destroy();
    return { message: "Destination deleted successfully" };
  },

  /**
   * Search destinations by name or location
   */
  async searchDestinations(query) {
    const { Op } = require("sequelize");
    const destinations = await db.Destination.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { location: { [Op.iLike]: `%${query}%` } },
        ],
      },
      include: [
        {
          model: db.Image,
          attributes: ["image_id", "image_url"],
        },
      ],
      order: [["rating", "DESC"]],
    });
    return destinations;
  },

  /**
   * Get destinations by type
   */
  async getDestinationsByType(type) {
    const destinations = await db.Destination.findAll({
      where: { type },
      include: [
        {
          model: db.Image,
          attributes: ["image_id", "image_url"],
        },
      ],
      order: [["rating", "DESC"]],
    });
    return destinations;
  },

  /**
   * Add multiple images to destination
   */
  async addDestinationImages(destinationId, imageUrls) {
    const images = await Promise.all(
      imageUrls.map((url) =>
        db.Image.create({
          destination_id: destinationId,
          image_url: url,
        })
      )
    );
    return images;
  },

  /**
   * Get all images for a destination
   */
  async getDestinationImages(destinationId) {
    const images = await db.Image.findAll({
      where: {
        destination_id: destinationId,
      },
      order: [["image_id", "ASC"]],
    });
    return images;
  },

  /**
   * Get destination image by ID
   */
  async getDestinationImage(destinationId, imageId) {
    const image = await db.Image.findOne({
      where: {
        image_id: imageId,
        destination_id: destinationId,
      },
    });
    if (!image) {
      throw new Error("Image not found");
    }
    return image;
  },

  /**
   * Delete destination image
   */
  async deleteDestinationImage(destinationId, imageId) {
    const image = await this.getDestinationImage(destinationId, imageId);
    await image.destroy();
    return { message: "Image deleted successfully" };
  },
};

module.exports = DestinationService;

const hotelUploadService = require('../services/hotelUploadService');
const responseUtils = require('../../../utils/responseUtils');

class HotelUploadController {
  /**
   * Upload hotel images
   * POST /api/v1/hotel/:hotel_id/images/upload
   */
  async uploadImages(req, res) {
    try {
      const { hotel_id } = req.params;
      const { image_types, descriptions } = req.body;
      const files = req.files;

      console.log('📸 Hotel Image Upload Request:', {
        hotel_id,
        files_count: files?.length || 0,
        image_types,
        user_id: req.user?.user_id
      });

      // Validation
      if (!files || files.length === 0) {
        return responseUtils.invalidated(res, [
          { msg: 'At least one image file is required', param: 'files' }
        ]);
      }

      if (!image_types) {
        return responseUtils.invalidated(res, [
          { msg: 'image_types is required (comma-separated)', param: 'image_types' }
        ]);
      }

      // Upload to AI service
      const result = await hotelUploadService.uploadHotelImages({
        hotel_id: parseInt(hotel_id),
        files,
        image_types,
        descriptions: descriptions || '',
        uploaded_by: req.user?.user_id || null
      });

      console.log('✅ Hotel Images Uploaded:', {
        hotel_id,
        total_uploaded: result.total_uploaded,
        total_failed: result.total_failed
      });

      return responseUtils.ok(res, {
        message: 'Hotel images uploaded successfully',
        data: result
      });

    } catch (error) {
      console.error('Hotel Image Upload Controller Error:', error);
      return responseUtils.error(res, error.message);
    }
  }

  /**
   * Upload hotel document
   * POST /api/v1/hotel/:hotel_id/documents/upload
   */
  async uploadDocument(req, res) {
    try {
      const { hotel_id } = req.params;
      const { document_type } = req.body;
      const file = req.file;

      console.log('📄 Hotel Document Upload Request:', {
        hotel_id,
        document_type,
        filename: file?.originalname,
        user_id: req.user?.user_id
      });

      // Validation
      if (!file) {
        return responseUtils.invalidated(res, [
          { msg: 'Document file is required', param: 'file' }
        ]);
      }

      if (!document_type) {
        return responseUtils.invalidated(res, [
          { msg: 'document_type is required', param: 'document_type' }
        ]);
      }

      const allowedTypes = ['brochure', 'policy', 'menu', 'guide', 'contract'];
      if (!allowedTypes.includes(document_type)) {
        return responseUtils.invalidated(res, [
          { msg: `document_type must be one of: ${allowedTypes.join(', ')}`, param: 'document_type' }
        ]);
      }

      // Upload to AI service
      const result = await hotelUploadService.uploadHotelDocument({
        hotel_id: parseInt(hotel_id),
        file,
        document_type,
        uploaded_by: req.user?.user_id || null
      });

      console.log('✅ Hotel Document Uploaded:', {
        hotel_id,
        document_id: result.document_id,
        rag_status: result.rag_status
      });

      return responseUtils.ok(res, {
        message: 'Hotel document uploaded successfully',
        data: result
      });

    } catch (error) {
      console.error('Hotel Document Upload Controller Error:', error);
      return responseUtils.error(res, error.message);
    }
  }

  /**
   * List hotel images
   * GET /api/v1/hotel/:hotel_id/images
   */
  async listImages(req, res) {
    try {
      const { hotel_id } = req.params;

      const result = await hotelUploadService.listHotelImages(
        parseInt(hotel_id)
      );

      return responseUtils.ok(res, {
        message: 'Hotel images retrieved successfully',
        data: result
      });

    } catch (error) {
      console.error('List Hotel Images Error:', error);
      return responseUtils.error(res, error.message);
    }
  }

  /**
   * List hotel documents
   * GET /api/v1/hotel/:hotel_id/documents
   */
  async listDocuments(req, res) {
    try {
      const { hotel_id } = req.params;

      const result = await hotelUploadService.listHotelDocuments(
        parseInt(hotel_id)
      );

      return responseUtils.ok(res, {
        message: 'Hotel documents retrieved successfully',
        data: result
      });

    } catch (error) {
      console.error('List Hotel Documents Error:', error);
      return responseUtils.error(res, error.message);
    }
  }

  /**
   * Delete hotel image
   * DELETE /api/v1/hotel/:hotel_id/images/:image_id
   */
  async deleteImage(req, res) {
    try {
      const { hotel_id, image_id } = req.params;

      const result = await hotelUploadService.deleteHotelImage(
        parseInt(hotel_id),
        parseInt(image_id)
      );

      return responseUtils.ok(res, {
        message: 'Hotel image deleted successfully',
        data: result
      });

    } catch (error) {
      console.error('Delete Hotel Image Error:', error);
      return responseUtils.error(res, error.message);
    }
  }

  /**
   * Delete hotel document
   * DELETE /api/v1/hotel/:hotel_id/documents/:document_id
   */
  async deleteDocument(req, res) {
    try {
      const { hotel_id, document_id } = req.params;

      const result = await hotelUploadService.deleteHotelDocument(
        parseInt(hotel_id),
        parseInt(document_id)
      );

      return responseUtils.ok(res, {
        message: 'Hotel document deleted successfully',
        data: result
      });

    } catch (error) {
      console.error('Delete Hotel Document Error:', error);
      return responseUtils.error(res, error.message);
    }
  }

  /**
   * Get hotel upload statistics
   * GET /api/v1/hotel/:hotel_id/upload-stats
   */
  async getUploadStats(req, res) {
    try {
      const { hotel_id } = req.params;

      const result = await hotelUploadService.getHotelUploadStats(
        parseInt(hotel_id)
      );

      return responseUtils.ok(res, {
        message: 'Hotel upload statistics retrieved successfully',
        data: result
      });

    } catch (error) {
      console.error('Get Upload Stats Error:', error);
      return responseUtils.error(res, error.message);
    }
  }
}

module.exports = new HotelUploadController();

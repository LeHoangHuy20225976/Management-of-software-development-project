const axios = require('axios');
const FormData = require('form-data');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8003';

class HotelUploadService {
  /**
   * Upload hotel images with CLIP embeddings
   * @param {number} hotel_id - Hotel ID
   * @param {Array} files - Array of image files
   * @param {string} image_types - Comma-separated image types
   * @param {string} descriptions - Comma-separated descriptions (optional)
   * @param {number} uploaded_by - User ID
   * @returns {Promise<Object>} Upload response
   */
  async uploadHotelImages({
    hotel_id,
    files,
    image_types,
    descriptions = '',
    uploaded_by = null
  }) {
    try {
      const formData = new FormData();

      // Append files
      files.forEach((file) => {
        formData.append('files', file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype
        });
      });

      // Append metadata
      formData.append('image_types', image_types);
      if (descriptions) {
        formData.append('descriptions', descriptions);
      }
      if (uploaded_by) {
        formData.append('uploaded_by', uploaded_by.toString());
      }

      const response = await axios.post(
        `${AI_SERVICE_URL}/api/hotel/${hotel_id}/images/upload`,
        formData,
        {
          headers: {
            ...formData.getHeaders()
          },
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
          timeout: 120000 // 2 minutes for image processing
        }
      );

      return response.data;
    } catch (error) {
      console.error('Hotel Image Upload Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw new Error(
        error.response?.data?.detail ||
        error.message ||
        'Failed to upload hotel images'
      );
    }
  }

  /**
   * Upload hotel document (PDF, DOCX)
   * @param {number} hotel_id - Hotel ID
   * @param {Object} file - Document file
   * @param {string} document_type - Document type (brochure, policy, menu, guide)
   * @param {number} uploaded_by - User ID
   * @returns {Promise<Object>} Upload response
   */
  async uploadHotelDocument({
    hotel_id,
    file,
    document_type,
    uploaded_by = null
  }) {
    try {
      const formData = new FormData();

      formData.append('file', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype
      });
      formData.append('document_type', document_type);
      if (uploaded_by) {
        formData.append('uploaded_by', uploaded_by.toString());
      }

      const response = await axios.post(
        `${AI_SERVICE_URL}/api/hotel/${hotel_id}/documents/upload`,
        formData,
        {
          headers: {
            ...formData.getHeaders()
          },
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
          timeout: 120000 // 2 minutes
        }
      );

      return response.data;
    } catch (error) {
      console.error('Hotel Document Upload Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw new Error(
        error.response?.data?.detail ||
        error.message ||
        'Failed to upload hotel document'
      );
    }
  }

  /**
   * List hotel images
   * @param {number} hotel_id - Hotel ID
   * @returns {Promise<Object>} Images list
   */
  async listHotelImages(hotel_id) {
    try {
      const response = await axios.get(
        `${AI_SERVICE_URL}/api/hotel/${hotel_id}/images`,
        { timeout: 30000 }
      );
      return response.data;
    } catch (error) {
      console.error('List Hotel Images Error:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.detail ||
        'Failed to list hotel images'
      );
    }
  }

  /**
   * List hotel documents
   * @param {number} hotel_id - Hotel ID
   * @returns {Promise<Object>} Documents list
   */
  async listHotelDocuments(hotel_id) {
    try {
      const response = await axios.get(
        `${AI_SERVICE_URL}/api/hotel/${hotel_id}/documents`,
        { timeout: 30000 }
      );
      return response.data;
    } catch (error) {
      console.error('List Hotel Documents Error:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.detail ||
        'Failed to list hotel documents'
      );
    }
  }

  /**
   * Delete hotel image
   * @param {number} hotel_id - Hotel ID
   * @param {number} image_id - Image ID
   * @returns {Promise<Object>} Delete response
   */
  async deleteHotelImage(hotel_id, image_id) {
    try {
      const response = await axios.delete(
        `${AI_SERVICE_URL}/api/hotel/${hotel_id}/images/${image_id}`,
        { timeout: 30000 }
      );
      return response.data;
    } catch (error) {
      console.error('Delete Hotel Image Error:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.detail ||
        'Failed to delete hotel image'
      );
    }
  }

  /**
   * Delete hotel document
   * @param {number} hotel_id - Hotel ID
   * @param {number} document_id - Document ID
   * @returns {Promise<Object>} Delete response
   */
  async deleteHotelDocument(hotel_id, document_id) {
    try {
      const response = await axios.delete(
        `${AI_SERVICE_URL}/api/hotel/${hotel_id}/documents/${document_id}`,
        { timeout: 30000 }
      );
      return response.data;
    } catch (error) {
      console.error('Delete Hotel Document Error:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.detail ||
        'Failed to delete hotel document'
      );
    }
  }

  /**
   * Get hotel upload statistics
   * @param {number} hotel_id - Hotel ID
   * @returns {Promise<Object>} Upload stats
   */
  async getHotelUploadStats(hotel_id) {
    try {
      const response = await axios.get(
        `${AI_SERVICE_URL}/api/hotel/${hotel_id}/upload-stats`,
        { timeout: 30000 }
      );
      return response.data;
    } catch (error) {
      console.error('Get Upload Stats Error:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.detail ||
        'Failed to get upload statistics'
      );
    }
  }
}

module.exports = new HotelUploadService();

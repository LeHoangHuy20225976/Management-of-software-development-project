const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8003';

class AIService {
  /**
   * Chat with AI and get related images
   * @param {Object} params - Chat parameters
   * @param {string} params.message - User message
   * @param {number} params.user_id - Optional user ID for personalized queries
   * @param {number} params.hotel_id - Optional hotel ID
   * @param {string} params.conversation_id - Optional conversation ID
   * @param {boolean} params.include_images - Whether to include images
   * @param {number} params.max_images - Max images to return
   * @param {number} params.image_similarity_threshold - Similarity threshold
   * @returns {Promise<Object>} AI response with images
   */
  async chatWithImages({
    message,
    user_id = null,
    hotel_id = null,
    conversation_id = null,
    include_images = true,
    max_images = 5,
    image_similarity_threshold = 0.3
  }) {
    try {
      const response = await axios.post(
        `${AI_SERVICE_URL}/api/llm/chat2testEimg`,
        {
          message,
          user_id,
          hotel_id,
          conversation_id,
          include_images,
          max_images,
          image_similarity_threshold
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 seconds timeout
        }
      );

      return response.data;
    } catch (error) {
      console.error('AI Service Error Details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        url: `${AI_SERVICE_URL}/api/llm/chat2testEimg`
      });
      throw new Error(
        error.response?.data?.detail ||
        error.message ||
        'Failed to communicate with AI service'
      );
    }
  }

  /**
   * Simple chat without images
   * @param {string} message - User message
   * @param {string} conversation_id - Optional conversation ID
   * @returns {Promise<Object>} AI response
   */
  async chat(message, conversation_id = null) {
    try {
      const response = await axios.post(
        `${AI_SERVICE_URL}/api/llm/chat`,
        {
          message,
          conversation_id
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      return response.data;
    } catch (error) {
      console.error('AI Chat Error:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.detail ||
        'Failed to chat with AI'
      );
    }
  }
}

module.exports = new AIService();

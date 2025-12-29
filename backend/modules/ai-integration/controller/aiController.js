const aiService = require('../services/aiService');
const responseUtils = require('../../../utils/responseUtils');

class AIController {
  /**
   * Chat with AI and get images
   * POST /api/v1/ai/chat
   */
  async chatWithAI(req, res) {
    try {
      const {
        message,
        user_id,
        hotel_id,
        conversation_id,
        include_images = true,
        max_images = 5,
        image_similarity_threshold = 0.3
      } = req.body;

      console.log('🤖 AI Chat Request:', {
        message: message?.substring(0, 100) + (message?.length > 100 ? '...' : ''),
        user_id,
        hotel_id,
        conversation_id,
        include_images,
        max_images
      });

      // Validate message
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return responseUtils.invalidated(res, [
          { msg: 'Message is required and must be a non-empty string', param: 'message' }
        ]);
      }

      // Call AI service
      const result = await aiService.chatWithImages({
        message,
        user_id,
        hotel_id,
        conversation_id,
        include_images,
        max_images,
        image_similarity_threshold
      });

      console.log('✅ AI Chat Response:', {
        conversation_id: result.conversation_id,
        response_length: result.response?.length || 0,
        images_count: result.images?.length || 0
      });

      return responseUtils.ok(res, {
        message: 'AI response generated successfully',
        data: result
      });

    } catch (error) {
      console.error('AI Controller Error:', error);
      return responseUtils.error(res, error.message);
    }
  }

  /**
   * Simple chat without images
   * POST /api/v1/ai/simple-chat
   */
  async simpleChat(req, res) {
    try {
      const { message, conversation_id } = req.body;

      console.log('💬 Simple Chat Request:', {
        message: message?.substring(0, 100) + (message?.length > 100 ? '...' : ''),
        conversation_id
      });

      // Validate message
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return responseUtils.invalidated(res, [
          { msg: 'Message is required and must be a non-empty string', param: 'message' }
        ]);
      }

      // Call AI service
      const result = await aiService.chat(message, conversation_id);

      console.log('✅ Simple Chat Response:', {
        conversation_id: result.conversation_id,
        response_length: result.response?.length || 0
      });

      return responseUtils.ok(res, {
        message: 'AI response generated successfully',
        data: result
      });

    } catch (error) {
      console.error('AI Simple Chat Error:', error);
      return responseUtils.error(res, error.message);
    }
  }
}

module.exports = new AIController();

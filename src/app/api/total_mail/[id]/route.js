import getRedisClient from '@/lib/redis';

export async function GET(req, context) {
  const { id } = await context.params;

  try {
    const redisClient = getRedisClient();
    
    // Ensure Redis client is connected before use
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    
    // Get the list of message IDs for this user
    const messageIds = await redisClient.lRange(`user:${id}:sent`, 0, -1);
    
    if (!messageIds || messageIds.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        messages: [],
        message: 'No messages found for this user'
      }), {
        status: 200,
      });
    }

    // Fetch all messages for the user using the stored message IDs
    const messages = [];
    for (const messageId of messageIds) {
      const messageData = await redisClient.get(`message:${messageId}`);
      if (messageData) {
        try {
          const parsedMessage = JSON.parse(messageData);
          messages.push(parsedMessage);
        } catch (parseError) {
          console.error('Error parsing message:', parseError);
        }
      }
    }

    // Sort messages by timestamp (newest first)
    messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return new Response(JSON.stringify({ 
      success: true, 
      messages: messages,
      count: messages.length
    }), { 
      status: 200 
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
    });
  }
}

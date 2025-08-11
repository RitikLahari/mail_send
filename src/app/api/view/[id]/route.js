import { NextResponse } from 'next/server';
import getRedisClient from '@/lib/redis';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    // Get Redis client and connect
    const redisClient = getRedisClient();
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }

    // Retrieve encrypted data from Redis
    const encryptedData = await redisClient.get(`message:${id}`);
    
    if (!encryptedData) {
      return NextResponse.json(
        { error: 'Message not found or expired' },
        { status: 404 }
      );
    }

    const messageData = JSON.parse(encryptedData);
    
    return NextResponse.json({
      success: true,
      data: messageData
    });

  } catch (error) {
    console.error('Error retrieving message:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve message' },
      { status: 500 }
    );
  }
} 
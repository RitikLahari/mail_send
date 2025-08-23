import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import getRedisClient from '@/lib/redis';
import { encryptText, encryptImage } from '@/lib/encryption';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from 'next-auth';

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const recipientEmail = formData.get('email');
    const message = formData.get('message');
    const imageFile = formData.get('image');

    if (!recipientEmail || !message) {
      return NextResponse.json(
        { error: 'Email and message are required' },
        { status: 400 }
      );
    }

    // Generate unique ID for the message
    const messageId = uuidv4();

    // Encrypt the message
    const encryptedText = await encryptText(message);

    let encryptedImage = null;
    if (imageFile && imageFile.size > 0) {
      const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
      encryptedImage = await encryptImage(imageBuffer);
    }

    // Store encrypted data in Redis with 24-hour expiry
    const messageData = {
      encryptedText,
      encryptedImage,
      sender: {
        email: session.user.email,
        name: session.user.name,
        picture: session.user.picture,
      },
      timestamp: new Date().toISOString(),
    };

    // Get Redis client and connect
    const redisClient = getRedisClient();
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }

    await redisClient.setEx(
      `message:${messageId}`,
      86400, // 24 hours in seconds
      JSON.stringify(messageData)
    );
    await redisClient.lPush(`user:${session.user.email}:sent`, messageId);

    // Send email to recipient
    const emailContent = `
      You have received a secure message from ${session.user.name} (${session.user.email}).
      
      Click the following link to view your encrypted message:
      ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/view/${messageId}
      
      This link will expire in 24 hours.
      
      Best regards,
      Secure Mail Website
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: recipientEmail,
      subject: `Secure message from ${session.user.name}`,
      text: emailContent,
    });

    return NextResponse.json({
      success: true,
      messageId,
      message: 'Message sent successfully'
    });

  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
} 
// src/app/api/send/route.js
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import getRedisClient from '@/lib/redis';
import { encryptText, encryptImage } from '@/lib/encryption';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from 'next-auth';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const formData = await request.formData();
    const recipientEmail = formData.get('email');
    const message = formData.get('message');
    const imageFile = formData.get('image');

    if (!recipientEmail || !message) {
      return NextResponse.json({ error: 'Email and message are required' }, { status: 400 });
    }

    const messageId = uuidv4();

    // Encrypt text
    let encryptedText;
    try {
      encryptedText = await encryptText(String(message));
    } catch (err) {
      console.error('Text encryption failed:', err);
      return NextResponse.json({ error: 'Encryption error (text)' }, { status: 500 });
    }

    // Encrypt image (if provided)
    let encryptedImagePackage = null;
    if (imageFile && imageFile.size && imageFile.size > 0) {
      try {
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        encryptedImagePackage = await encryptImage(buffer);
      } catch (err) {
        console.error('Image encryption failed:', err);
        return NextResponse.json({ error: 'Encryption error (image)' }, { status: 500 });
      }
    }

    const messageData = {
      encryptedText,
      encryptedImage: encryptedImagePackage, // base64 package or null
      sender: {
        email: session.user.email,
        name: session.user.name,
        picture: session.user.picture,
      },
      timestamp: new Date().toISOString(),
    };

    // store in redis
    const redisClient = getRedisClient();
    if (!redisClient.isOpen) await redisClient.connect();

    await redisClient.setEx(`message:${messageId}`, 86400, JSON.stringify(messageData));
    await redisClient.lPush(`user:${session.user.email}:sent`, messageId);

    // Notify recipient via email
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    const emailContent = `You have received a secure message from ${session.user.name} (${session.user.email}).
View it here: ${baseUrl}/view/${messageId}
This link expires in 24 hours.`;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: recipientEmail,
      subject: `Secure message from ${session.user.name}`,
      text: emailContent,
    });

    return NextResponse.json({ success: true, messageId, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

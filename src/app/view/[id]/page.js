'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import toast, { Toaster } from 'react-hot-toast';
import { decryptText, decryptImage } from '@/lib/encryption';
import { FiMail, FiClock, FiShield, FiArrowLeft } from 'react-icons/fi';

function SenderInfo({ sender, timestamp }) {
  return (
    <section className="flex items-center space-x-4 border-b border-gray-300 pb-6 mb-6">
      {sender?.picture ? (
        <Image
          src={sender.picture}
          alt={`${sender.name}'s avatar`}
          width={48}
          height={48}
          className="rounded-full object-cover"
          priority
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-lg font-semibold">
          {sender?.name?.[0] || '?'}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-gray-900 truncate">{sender?.name || 'Unknown Sender'}</h3>
        <p className="text-sm text-gray-600 truncate">{sender?.email || 'No Email Provided'}</p>
      </div>
      <time className="flex items-center space-x-1 text-sm text-gray-500 whitespace-nowrap" dateTime={timestamp}>
        <FiClock className="w-4 h-4" />
        <span>{new Date(timestamp).toLocaleString()}</span>
      </time>
    </section>
  );
}

function MessageBubble({ icon, title, children, className = '' }) {
  return (
    <article className={`bg-gray-50 rounded-xl p-5 shadow-sm ${className}`}>
      <header className="flex items-center space-x-2 mb-3">
        {icon}
        <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
      </header>
      <div className="text-gray-800 whitespace-pre-wrap break-words">{children}</div>
    </article>
  );
}

export default function ViewMessage() {
  const params = useParams();
  const [messageData, setMessageData] = useState(null);
  const [decryptedData, setDecryptedData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMessage() {
      try {
        const response = await fetch(`/api/view/${params.id}`);
        const data = await response.json();

        if (response.ok) {
          setMessageData(data.data);
          await decryptMessage(data.data);
        } else {
          setError(data.error || 'Failed to retrieve message');
          toast.error(data.error || 'Failed to retrieve message');
        }
      } catch {
        setError('An error occurred while retrieving the message');
      } finally {
        setIsLoading(false);
      }
    }

    if (params.id) fetchMessage();
  }, [params.id]);

  async function decryptMessage(encryptedData) {
    try {
      const decryptedText = await decryptText(encryptedData.encryptedText);
      let decryptedImage = null;
      if (encryptedData.encryptedImage) {
        decryptedImage = await decryptImage(encryptedData.encryptedImage);
      }
      setDecryptedData({
        text: decryptedText,
        image: decryptedImage,
        timestamp: encryptedData.timestamp,
      });
      toast.success('Message decrypted successfully! 🔓');
    } catch {
      setError('Failed to decrypt message');
      toast.error('Failed to decrypt message');
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Decrypting your message...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-blue-50 p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-lg p-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Message Not Found</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <Link
            href="/"
            className="inline-block bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!decryptedData) return null;

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: '#363636', color: '#fff' },
          success: {
            duration: 4000,
            iconTheme: { primary: '#10B981', secondary: '#fff' },
          },
          error: {
            duration: 4000,
            iconTheme: { primary: '#EF4444', secondary: '#fff' },
          },
        }}
      />

      <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-12 px-6 sm:px-12 lg:px-24">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-10">
          {/* Header */}
          <header className="mb-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 mb-4 font-medium transition-colors"
              aria-label="Back to home"
            >
              <FiArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Secure Message</h1>
            <p className="text-lg text-gray-700">
              Your encrypted message has been <span className="font-semibold text-indigo-600">successfully decrypted</span>.
            </p>
          </header>

          {/* Sender Info */}
          {messageData?.sender && (
            <SenderInfo sender={messageData.sender} timestamp={messageData.timestamp} />
          )}

          {/* Message Content */}
          <section className="space-y-8">
            <MessageBubble
              icon={<FiMail className="w-6 h-6 text-indigo-600" />}
              title="Message"
            >
              {decryptedData.text}
            </MessageBubble>

            {decryptedData.image && (
              <MessageBubble
                icon={
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                }
                title="Attached Image"
              >
                <Image
                  src={decryptedData.image}
                  alt="Decrypted message image"
                  width={600}
                  height={400}
                  className="rounded-xl object-contain shadow-md"
                  priority
                />
              </MessageBubble>
            )}

            {/* Security Notice */}
            <section className="mt-6 bg-indigo-50 border border-indigo-200 rounded-xl p-5 flex items-start space-x-4">
              <FiShield className="w-6 h-6 text-indigo-600 mt-1" aria-hidden="true" />
              <div>
                <h5 className="font-semibold text-indigo-900 mb-1">Security Information</h5>
                <p className="text-indigo-800 text-sm leading-relaxed">
                  This message was encrypted using military-grade encryption and has been automatically decrypted for your viewing. The original encrypted data has been securely stored and will automatically expire in 24 hours for your privacy.
                </p>
              </div>
            </section>
          </section>

          {/* Action Button */}
          <footer className="mt-10 text-center">
            <Link
              href="/"
              className="inline-flex items-center space-x-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-10 py-3 rounded-2xl font-semibold shadow-lg hover:from-indigo-700 hover:to-blue-700 transition transform hover:scale-105"
              aria-label="Send your own message"
            >
              <FiMail className="w-6 h-6" />
              <span>Send Your Own Message</span>
            </Link>
          </footer>
        </div>
      </main>
    </>
  );
}

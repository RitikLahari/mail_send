'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

export default function SentMessages() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMessages() {
      if (status === 'loading') return;
      
      if (!session?.user?.email) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/total_mail/${encodeURIComponent(session.user.email)}`);
        const data = await response.json();
        
        if (data.success) {
          setMessages(data.messages || []);
        } else {
          setError(data.error || 'Failed to fetch messages');
        }
      } catch (err) {
        setError('Failed to fetch messages');
      } finally {
        setLoading(false);
      }
    }
    fetchMessages();
  }, [session, status]);

  if (status === 'loading') return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-lg">Loading session...</div>
    </div>
  );

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-lg">Loading messages...</div>
    </div>
  );
  
  if (error) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-red-600 text-lg">Error: {error}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Sent Messages</h1>
        
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No messages found for this user</div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Message #{index + 1}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Sent at: {new Date(message.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    Sent
                  </span>
                </div>
                
                <div className="space-y-3">
                  {message.sender && (
                    <div>
                      <span className="font-medium text-gray-700">From: </span>
                      <span className="text-gray-600">
                        {message.sender.name} ({message.sender.email})
                      </span>
                    </div>
                  )}
                  
                  {message.recipient && (
                    <div>
                      <span className="font-medium text-gray-700">To: </span>
                      <span className="text-gray-600">
                        {message.recipient.name} ({message.recipient.email})
                      </span>
                    </div>
                  )}
                  
                  {message.subject && (
                    <div>
                      <span className="font-medium text-gray-700">Subject: </span>
                      <span className="text-gray-600">{message.subject}</span>
                    </div>
                  )}
                  
                  {message.encryptedText && (
                    <div>
                      <span className="font-medium text-gray-700">Message: </span>
                      <div className="mt-2 p-3 bg-gray-100 rounded-md">
                        <p className="text-gray-700 font-mono text-sm break-words">
                          {message.encryptedText}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {message.encryptedImage && (
                    <div className="mt-4">
                      <span className="font-medium text-gray-700">Attached Image:</span>
                      <div className="mt-2">
                        <img 
                          src={`data:image/png;base64,${message.encryptedImage}`} 
                          alt="Encrypted attachment" 
                          width={320}
                          height={240}
                          className="max-w-xs rounded-md border border-gray-300"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-8 text-center text-gray-600">
          Total messages: {messages.length}
        </div>
      </div>
    </div>
  );
}

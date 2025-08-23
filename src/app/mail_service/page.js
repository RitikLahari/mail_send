'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { FiMail, FiShield, FiLogOut, FiSend, FiFileText, FiSearch, FiPlus } from 'react-icons/fi';
import Image from 'next/image';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    message: '',
    image: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({
      ...prev,
      image: file,
    }));
  };

  const generateAISuggestions = async () => {
    if (!formData.message.trim()) {
      toast.error('Please enter a message first to get AI suggestions');
      return;
    }

    setIsGeneratingSuggestions(true);
    setAiSuggestions([]);

    try {
      const response = await fetch('/api/ai-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: formData.message,
          recipientEmail: formData.email,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAiSuggestions(data.suggestions || []);
        toast.success('AI suggestions generated! ✨');
      } else {
        toast.error(data.error || 'Failed to generate AI suggestions');
      }
    } catch (error) {
      toast.error('Failed to generate AI suggestions');
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const applySuggestion = (suggestion) => {
    setFormData(prev => ({
      ...prev,
      message: suggestion
    }));
    setAiSuggestions([]);
    toast.success('Suggestion applied! ✨');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('email', formData.email);
      formDataToSend.append('message', formData.message);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const response = await fetch('/api/send', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          type: 'success',
          message: `Message sent successfully! Message ID: ${data.messageId}`,
          messageId: data.messageId,
        });
        setFormData({ email: '', message: '', image: null });
        e.target.reset();
        toast.success('Message sent successfully! 🎉');
      } else {
        setResult({
          type: 'error',
          message: data.error || 'Failed to send message',
        });
        toast.error(data.error || 'Failed to send message');
      }
    } catch {
      setResult({
        type: 'error',
        message: 'An error occurred while sending the message',
      });
      toast.error('An error occurred while sending the message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <>
      <Toaster position="top-right" />

      <div className="flex min-h-screen bg-gray-100">
        {/* Sidebar */}
        <aside className="w-64 bg-neutral-900 text-white flex flex-col p-6">
          <div className="flex items-center mb-8 space-x-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600">
              <FiShield className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold">Secure Mail</h1>
          </div>

          <nav className="space-y-4">
            <Link href="/" className="flex items-center gap-3 hover:text-indigo-400">
              <FiMail /> Inbox
            </Link>
            <Link href="/Sent_page" className="flex items-center gap-3 hover:text-indigo-400">
              <FiSend /> Sent
            </Link>
            {/* <Link href="/drafts" className="flex items-center gap-3 hover:text-indigo-400">
              <FiFileText /> Drafts
            </Link> */}
            <Link href="/" className="flex items-center gap-3 hover:text-indigo-400">
              <FiShield /> Secure Messages
            </Link>
          </nav>

          <button
            onClick={handleSignOut}
            className="mt-auto flex items-center gap-2 px-4 py-3 bg-red-600 rounded-lg hover:bg-red-700"
          >
            <FiLogOut /> Sign Out
          </button>
        </aside>

        {/* Main Section */}
        <main className="flex-1 p-8">
          {/* Top Bar */}
          <div className="flex justify-between items-center mb-10">
           
            <div className="flex items-center gap-4">
              <div className="relative group">
                <img
                  src={session.user.picture || '/default-avatar.png'}
                  alt="User"
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover cursor-pointer"
                />
                {/* Hover tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  {session.user.email}
                  {/* Arrow pointing down */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Secure Message Form */}
          <div className="bg-white rounded-2xl shadow-md p-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">Send Secure Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Recipient */}
              <div>
                <label className="block mb-2 font-semibold">Recipient Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="recipient@example.com"
                  required
                  className="w-full border rounded-lg px-4 py-3"
                />
              </div>

              {/* Message */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="font-semibold">Secure Message</label>
                  <button
                    type="button"
                    onClick={generateAISuggestions}
                    disabled={isGeneratingSuggestions || !formData.message.trim()}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isGeneratingSuggestions ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        AI Suggestions
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Type your secure message..."
                  required
                  className="w-full border rounded-lg px-4 py-3 resize-none"
                />
                
                {/* AI Suggestions */}
                {aiSuggestions.length > 0 && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      AI Suggestions
                    </h4>
                    <div className="space-y-3">
                      {aiSuggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-purple-200 hover:border-purple-300 transition-colors">
                          <div className="flex-1">
                            <p className="text-gray-700 text-sm leading-relaxed">{suggestion}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => applySuggestion(suggestion)}
                            className="px-3 py-1.5 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Use
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Image Upload */}
              <div>
                <label className="block mb-2 font-semibold">Attach Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full border rounded-lg px-4 py-2 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Supported formats: JPG, PNG, GIF. Max size: 10MB
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4 text-white font-semibold shadow-lg hover:from-indigo-700 hover:to-blue-700"
              >
                {isLoading ? 'Encrypting & Sending...' : 'Encrypt & Send Message'}
              </button>
            </form>

            {/* Result */}
            {result && (
              <div
                className={`mt-6 p-4 rounded-lg ${
                  result.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {result.message}
              </div>
            )}
          </div>
        </main>

        {/* Floating Compose Button */}
        <button className="fixed bottom-6 right-6 bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-4 rounded-full shadow-lg hover:scale-105 transition">
          <FiPlus className="w-6 h-6" />
        </button>
      </div>
    </>
  );
}

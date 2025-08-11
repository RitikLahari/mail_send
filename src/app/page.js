'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { FiMail, FiShield, FiLogOut } from 'react-icons/fi';

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  if (!session) return null;

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

      {/* Header */}
      <header className=" bg-neutral-900 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 shadow-md">
                <FiShield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-extrabold text-white tracking-tight select-none">Secure Mail</h1>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                {session.user.picture ? (
                  <img
                    src={session.user.picture}
                    alt={session.user.name}
                    className="w-9 h-9 rounded-full object-cover shadow-sm"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full  flex items-center justify-center text-white font-semibold">
                    {session.user.name?.[0].toUpperCase() || '?'}
                  </div>
                )}
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-white truncate max-w-[150px]">{session.user.name}</p>
                  <p className="text-xs text-gray-500 truncate max-w-[150px]">{session.user.email}</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium text-white  hover:bg-gray-100 transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Sign Out"
              >
                <FiLogOut className="w-5 h-5" />
                <span className="hidden sm:inline select-none">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-14 px-6 sm:px-12 lg:px-24">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-10">
          {/* Welcome Section */}
          <section className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4 select-none">
              Welcome back, <span className="text-indigo-600">{session.user.name}</span>! 👋
            </h2>
            <p className="text-lg text-gray-700 max-w-xl mx-auto leading-relaxed">
              Send encrypted messages and images securely. Your data is protected with end-to-end encryption and automatically expires in 24 hours.
            </p>
          </section>

          {/* Send Form Card */}
          <section className="bg-white rounded-2xl shadow-md p-8 sm:p-10">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full shadow-lg mb-5">
                <FiMail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-1 select-none">
                Send Secure Message
              </h3>
              <p className="text-gray-600 select-none">
                Encrypt and send your message with military-grade security
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-7">
              {/* Recipient Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 mb-2 select-none"
                >
                  Recipient Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="recipient@example.com"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                  autoComplete="off"
                />
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-semibold text-gray-700 mb-2 select-none"
                >
                  Secure Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  placeholder="Type your secure message here..."
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 resize-none"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label
                  htmlFor="image"
                  className="block text-sm font-semibold text-gray-700 mb-2 select-none"
                >
                  Attach Image
                </label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                <p className="mt-2 text-xs text-gray-500 select-none">
                  Supported formats: JPG, PNG, GIF. Max size: 10MB
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4 text-white font-semibold shadow-lg hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:opacity-60 disabled:cursor-not-allowed transition transform hover:scale-[1.03]"
                aria-label="Encrypt and Send Message"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Encrypting & Sending...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-3">
                    <FiShield className="w-5 h-5" />
                    <span>Encrypt & Send Message</span>
                  </div>
                )}
              </button>
            </form>

            {/* Result Display */}
            {result && (
              <div
                className={`mt-8 rounded-xl p-5 ${
                  result.type === 'success'
                    ? 'bg-green-50 border border-green-300 text-green-800'
                    : 'bg-red-50 border border-red-300 text-red-800'
                } shadow-sm select-text`}
                role="alert"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-5 h-5 rounded-full ${
                      result.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                  <p className="font-medium text-sm">{result.message}</p>
                </div>
                {result.type === 'success' && result.messageId && (
                  <div className="mt-3 rounded-md bg-green-100 p-3 font-mono text-xs break-all text-green-700 select-all">
                    Message ID: {result.messageId}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Features Section */}
          <section className="mt-16 grid gap-8 md:grid-cols-3">
            <FeatureCard
              icon={<FiShield className="w-7 h-7 text-indigo-600" />}
              title="End-to-End Encryption"
              description="Your messages are encrypted before transmission and can only be decrypted by the intended recipient."
              bg="bg-indigo-50"
              border="border-indigo-200"
              text="text-indigo-900"
            />
            <FeatureCard
              icon={<FiMail className="w-7 h-7 text-green-600" />}
              title="Secure Delivery"
              description="Recipients receive a secure link to decrypt and view your message, ensuring privacy and security."
              bg="bg-green-50"
              border="border-green-200"
              text="text-green-900"
            />
            <FeatureCard
              icon={
                <svg
                  className="w-7 h-7 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
              title="Auto-Expiration"
              description="Messages automatically expire after 24 hours, ensuring sensitive information doesn't persist indefinitely."
              bg="bg-purple-50"
              border="border-purple-200"
              text="text-purple-900"
            />
          </section>
        </div>
      </main>
    </>
  );
}

function FeatureCard({ icon, title, description, bg, border, text }) {
  return (
    <article
      className={`${bg} ${border} border rounded-xl p-6 flex flex-col items-center text-center shadow-md`}
      tabIndex={0}
      role="region"
      aria-label={title}
    >
      <div className="mb-4 rounded-lg p-3 bg-white shadow-sm">{icon}</div>
      <h4 className={`text-lg font-semibold mb-2 select-none ${text}`}>{title}</h4>
      <p className={`text-sm ${text} max-w-xs`}>{description}</p>
    </article>
  );
}

'use client';

import { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FiMail, FiShield, FiLogOut } from 'react-icons/fi';
import '../app/globals.css';
import Link from 'next/link';
import Image from 'next/image';

export default function Landing() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-200 to-blue-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  if (!session) return null;

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-900 via-black to-blue-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 shadow-md">
                <FiShield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-extrabold tracking-tight select-none">Secure Mail</h1>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                {session.user.picture ? (
                  <img
                    src={session.user.picture}
                    alt={session.user.name}
                    width={36}
                    height={36}
                    className="w-9 h-9 rounded-full object-cover shadow-sm"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                    {session.user.name?.[0].toUpperCase() || '?'}
                  </div>
                )}
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold truncate max-w-[150px]">{session.user.name}</p>
                  <p className="text-xs text-gray-400 truncate max-w-[150px]">{session.user.email}</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <FiLogOut className="w-5 h-5" />
                <span className="hidden sm:inline select-none">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16">
       
         <div className="flex flex-col items-center mt-12">
      <div className="relative flex items-center mail-fly">
        {/* Motion Lines */}
        <div className="absolute -left-6 top-1/2 -translate-y-1/2 flex flex-col space-y-2">
          <div className="w-6 h-[2px] bg-white rounded-full opacity-80"></div>
          <div className="w-4 h-[2px] bg-white/70 rounded-full"></div>
          <div className="w-3 h-[2px] bg-white/50 rounded-full"></div>
        </div>

        {/* Envelope Icon */}
        <FiMail className="w-28 h-28 text-white stroke-[2.5]" />
      </div>

      {/* Text below */}
      <p className="mt-6 text-white text-lg font-semibold tracking-wide animate-bounce">
        SEND YOUR EMAIL!!
      </p>
    </div>


        <h2 className="mt-8 text-4xl font-extrabold tracking-tight">
          Fast, Secure, <span className="text-indigo-400">Mail_sender</span>
        </h2>
        <p className="mt-4 max-w-2xl text-gray-300">
          Send encrypted text & images.  
          Experience the future of secure communication.
        </p>

        <Link
          href="/mail_service"
          className="mt-8 inline-block px-8 py-3 text-lg font-semibold bg-blue-800 rounded-xl shadow-lg  hover:bg-blue-300  transform transition duration-300"
        >
          Get Started
        </Link>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-700 py-6 text-center text-sm text-gray-400">
        <p>
          © {new Date().getFullYear()} Secure Mail —  by Ritik
        </p>
        <div className="flex justify-center space-x-6 mt-3">
          <Link href="/privacy" className="hover:text-indigo-400">Privacy</Link>
          <Link href="/terms" className="hover:text-indigo-400">Terms</Link>
          <a href="https://github.com/RitikLahari/mail_send" target="_blank" className="hover:text-indigo-400">GitHub</a>
        </div>
      </footer>
    </div>
  );
}


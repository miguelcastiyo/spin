// Add a simple bounceIn animation to your global CSS (e.g., styles/globals.css):
// @keyframes bounceIn {
//   0% { transform: scale(0.7); opacity: 0; }
//   60% { transform: scale(1.1); opacity: 1; }
//   80% { transform: scale(0.95); }
//   100% { transform: scale(1); }
// }
// .animate-bounceIn { animation: bounceIn 0.7s cubic-bezier(.68,-0.55,.27,1.55) both; }

import React, { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';
import { HelpCircle, CheckCircle2 } from 'lucide-react';

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
const USER_ID = process.env.NEXT_PUBLIC_EMAILJS_USER_ID;

export default function FeedbackModal() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fadeOut, setFadeOut] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !message.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      await emailjs.send(
        SERVICE_ID!,
        TEMPLATE_ID!,
        { name: name.trim(), message: message.trim() },
        USER_ID
      );
      setSuccess(true);
      setName('');
      setMessage('');
      setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => {
          setOpen(false);
          setSuccess(false);
          setFadeOut(false);
          buttonRef.current?.focus();
        }, 600);
      }, 2000);
    } catch (err) {
      console.error('Email send error:', err);
      setError('Failed to send feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setOpen(false);
      setError('');
      setName('');
      setMessage('');
    }
  };

  return (
    <>
      {/* Floating Help Button */}
      <button
        ref={buttonRef}
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-full shadow-lg p-3 transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        aria-label="Get Help or Send Feedback"
        style={{ opacity: 0.9 }}
      >
        <HelpCircle className="w-6 h-6" />
      </button>

      {/* Modal Overlay */}
      {open && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/30 dark:bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
          onClick={handleClose}
        >
          <div 
            className={`bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-xs sm:max-w-sm min-h-[220px] sm:min-h-[260px] mx-4 relative flex flex-col justify-center transition-all duration-500 ${fadeOut ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header and Form - fade out together on success */}
            <div className={`transition-opacity duration-500 ${success ? 'opacity-0 pointer-events-none absolute w-full h-full' : 'opacity-100 relative'}`} style={{top:0,left:0}}>
              <button
                onClick={handleClose}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-full p-1"
                aria-label="Close"
                tabIndex={success ? -1 : 0}
                disabled={loading}
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Any Feedback?</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="feedback-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    id="feedback-name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 focus:border-blue-400 dark:focus:border-blue-600 transition"
                    required
                    maxLength={64}
                    autoComplete="name"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="feedback-message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Message
                  </label>
                  <textarea
                    id="feedback-message"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 focus:border-blue-400 dark:focus:border-blue-600 transition min-h-[90px] resize-vertical"
                    required
                    maxLength={1000}
                    disabled={loading}
                  />
                </div>
                {error && (
                  <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                    {error}
                  </div>
                )}
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-60"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-500 dark:bg-blue-600 text-white font-semibold hover:bg-blue-600 dark:hover:bg-blue-700 transition disabled:opacity-60"
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </form>
            </div>
            {/* Animated Success State */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ${success ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <CheckCircle2 className="w-16 h-16 text-green-500 mb-6 animate-bounce" />
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-3">Thank you!</div>
              <div className="text-base text-gray-700 dark:text-gray-300 text-center px-2">Your message was sent successfully.</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 
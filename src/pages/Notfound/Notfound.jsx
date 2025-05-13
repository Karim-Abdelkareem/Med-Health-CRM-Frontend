import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiHome } from 'react-icons/fi';

export default function Notfound() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);
  
  // Countdown effect for auto-redirect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      navigate('/');
    }
  }, [countdown, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <h1 className="text-9xl font-bold text-gray-200">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-bounce">
              <svg className="w-24 h-24 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
            </div>
          </div>
        </div>
        
        {/* Message */}
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
          You'll be redirected to the home page in <span className="font-semibold text-blue-600">{countdown}</span> seconds.
        </p>
        
        {/* Animated buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => navigate(-1)}
            className="group relative inline-flex items-center justify-center px-6 py-3 overflow-hidden font-medium text-blue-600 border-2 border-blue-600 rounded-md shadow-md transition-all duration-300 ease-in-out hover:bg-blue-600 hover:text-white"
          >
            <span className="absolute left-0 w-0 h-full bg-blue-600 -ml-2 transition-all duration-300 ease-in-out group-hover:w-full"></span>
            <span className="relative flex items-center gap-2">
              <FiArrowLeft className="transition-transform duration-300 group-hover:-translate-x-1" />
              Go Back
            </span>
          </button>
          
          <button 
            onClick={() => navigate('/')}
            className="group relative inline-flex items-center justify-center px-6 py-3 overflow-hidden font-medium text-indigo-600 border-2 border-indigo-600 rounded-md shadow-md transition-all duration-300 ease-in-out hover:bg-indigo-600 hover:text-white"
          >
            <span className="absolute right-0 w-0 h-full bg-indigo-600 -mr-2 transition-all duration-300 ease-in-out group-hover:w-full"></span>
            <span className="relative flex items-center gap-2">
              <FiHome className="transition-transform duration-300 group-hover:scale-110" />
              Home Page
            </span>
          </button>
        </div>
        
        {/* Animated dots */}
        <div className="flex justify-center mt-12 space-x-2">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className="w-3 h-3 rounded-full bg-blue-500"
              style={{
                animation: `bounce 1.4s infinite ease-in-out both`,
                animationDelay: `${i * 0.16}s`
              }}
            ></div>
          ))}
        </div>
        
        {/* CSS for the dots animation */}
        <style jsx>{`
          @keyframes bounce {
            0%, 80%, 100% { 
              transform: scale(0);
              opacity: 0.5;
            }
            40% { 
              transform: scale(1);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    </div>
  );
}

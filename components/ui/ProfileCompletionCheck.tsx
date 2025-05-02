"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ProfileCompletionCheckProps {
  onComplete: () => void;
  onCancel: () => void;
  children: React.ReactNode;
}

export default function ProfileCompletionCheck({ 
  onComplete, 
  onCancel,
  children 
}: ProfileCompletionCheckProps) {
  const router = useRouter();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const handleAction = async () => {
    setIsChecking(true);
    
    try {
        const res = await fetch('/api/auth/check-profile');
        const data = await res.json();
        
        if (!data.isAuthenticated) {
          setShowLoginModal(true);
        } else if (data.isAuthenticated && !data.isAuthorized) {
          setShowProfileModal(true);
        } else {
          onComplete();
        }
    } catch (error) {
      console.error("Error checking profile:", error);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <>
      {/* Wrap the add to cart button */}
      <div onClick={handleAction}>
        {children}
      </div>
      
      {/* Profile Completion Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Complete Your Profile First</h2>
            <p className="mb-6">
              Please complete your profile information before adding items to your cart. 
              This helps us with delivery and contact information.
            </p>
            <div className="flex gap-4 justify-end">
              <button 
                onClick={() => {
                  setShowProfileModal(false);
                  onCancel();
                }}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <Link
                href="/profile/edit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Complete Profile
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Login Required</h2>
            <p className="mb-6">
              Please login or register to add items to your cart and access all features.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  router.push('/login');
                }}
                className="w-full px-4 py-3 bg-[#3528AB] text-white rounded-lg hover:bg-[#2a2086]"
              >
                Login
              </button>
              <button 
                onClick={() => {
                  router.push('/register');
                }}
                className="w-full px-4 py-3 bg-white border border-[#3528AB] text-[#3528AB] rounded-lg hover:bg-gray-50"
              >
                Register
              </button>
              <button 
                onClick={() => {
                  setShowLoginModal(false);
                  onCancel();
                }}
                className="w-full px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 mt-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading overlay */}
      {isChecking && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-30">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      )}
    </>
  );
}
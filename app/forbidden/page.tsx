import React from 'react';
import Link from 'next/link';

export default function NotFound() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white shadow-lg rounded-lg max-w-md">
          <h1 className="text-6xl font-bold text-red-500">404</h1>
          <h2 className="text-2xl font-semibold mt-4">Page Not Found</h2>
          <p className="mt-2 text-gray-600">
            The page you are looking for doesn&apos;t exist or you don&apos;t have permission to access it.
          <Link 
            href="/"
            className="mt-6 inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Home
          </Link>
          </p>
        </div>
      </div>
    );
  }
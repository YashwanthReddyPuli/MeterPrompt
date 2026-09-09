import React from 'react';

export default function NotFound({ setCurrentRoute }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 px-6">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-6">
        This page doesn't exist — looks like you took a wrong turn.
      </p>
      <button
        onClick={() => setCurrentRoute('landing')}
        className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
      >
        Back to Home
      </button>
    </div>
  );
}
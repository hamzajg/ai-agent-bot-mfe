import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => (
  <div className='flex flex-col items-center justify-center h-screen text-center'>
    <h1 className='text-4xl font-bold mb-4'>AI Shopping Assistant Bot</h1>
    <p className='text-gray-600 mb-6 max-w-xl'>
      A micro-frontend React app integrating an AI-powered shopping assistant capable of searching for products,
      navigating to details, and creating orders across multiple APIs.
    </p>
    <Link to='/chat' className='bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition'>
      Open Chat Assistant
    </Link>
  </div>
);

export default HomePage;
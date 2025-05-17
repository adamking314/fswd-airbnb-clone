import React, { useEffect } from 'react';

const SuccessPage = () => {
  useEffect(() => {
    console.log('SuccessPage loaded'); // Check if it's rendering
  }, []);

  return (
    <div>
      <h1>Booking Success</h1>
      <p>Your booking was successful!</p>
    </div>
  );
};

export default SuccessPage;

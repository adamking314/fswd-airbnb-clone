// successPage.jsx
import React from 'react';
import { useParams } from 'react-router-dom';

const SuccessPage = () => {
  const { id } = useParams(); // Get the booking ID from the URL
  const [booking, setBooking] = React.useState(null);
  const [statusMessage, setStatusMessage] = React.useState('Processing...');
  
  React.useEffect(() => {
    // Fetch the booking details from the API
    fetch(`/booking/${id}/success`)
      .then(res => res.json())
      .then(data => {
        setBooking(data.booking);
        setStatusMessage(data.status_message);
      })
      .catch(err => {
        console.error('Error fetching booking details:', err);
      });
  }, [id]);

  if (!booking) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mt-5">
      <h2>Booking Confirmation</h2>
      <div>
        <h3>{booking.property.title}</h3>
        <p>Booked from {booking.start_date} to {booking.end_date}</p>
        <p>Total: ${booking.total_amount}</p>
        <p>{statusMessage}</p>
      </div>
    </div>
  );
};

export default SuccessPage;

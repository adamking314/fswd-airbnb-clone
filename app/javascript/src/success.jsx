import React from 'react';
import ReactDOM from 'react-dom';
import Layout from '@src/layout';

class SuccessPage extends React.Component {
  // no change here except use this.props.bookingId
  componentDidMount() {
    const bookingId = this.props.bookingId;
    fetch(`/api/bookings/${bookingId}`)
      .then(res => res.json())
      .then(data =>
        this.setState({ booking: data, loading: false })
      )
      .catch(() =>
        this.setState({ error: 'Failed to load booking data', loading: false })
      );
  }

  render() {
    const { booking, loading, error } = this.state;

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
      <Layout>
        <div className="container mt-4">
          <h2>Booking Successful!</h2>
          <p>Thank you for your booking!</p>
          
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Booking Details</h4>
              <p><strong>Property:</strong> {booking.property.title}</p>
              <p><strong>Location:</strong> {booking.property.address}</p>
              <p><strong>Dates:</strong> {booking.start_date} → {booking.end_date}</p>
              <p><strong>Status:</strong> {booking.paid ? 'Paid' : 'Not Paid'}</p>
              <p><strong>Total Price:</strong> ${booking.total_price}</p>
              <Link to={`/property/${booking.property.id}`} className="btn btn-outline-primary btn-sm">
                View Property Details
              </Link>
            </div>
          </div>

          <div className="mt-4">
            <Link to="/user_page" className="btn btn-primary">Go to My Profile</Link>
          </div>
        </div>
      </Layout>
    );
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('success-page-root');
  if (!root) return;

  const bookingId = root.getAttribute('data-booking-id');
  ReactDOM.render(
    <SuccessPage bookingId={bookingId} />,
    root
  );
});
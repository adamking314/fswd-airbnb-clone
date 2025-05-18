import React from 'react';
import ReactDOM from 'react-dom';
import Layout from '@src/layout';

class SuccessPage extends React.Component {
  state = { booking: null, loading: true, error: null };

  componentDidMount() {
    const bookingId = this.props.bookingId;
    fetch(`/api/bookings/${bookingId}`)
      .then(r => r.json())
      .then(data => this.setState({ booking: data, loading: false }))
      .catch(() => this.setState({ error: 'Failed to load', loading: false }));
  }

  render() {
    const { booking, loading, error } = this.state;

    if (loading)   return <p>Loading…</p>;
    if (error)     return <p>{error}</p>;
    if (!booking   || !booking.property)
                   return <p>No booking details available.</p>;

    // now we know booking.property exists
    const { property, start_date, end_date, paid, total_price } = booking;

    return (
      <Layout>
        <div className="container mt-4">
          <h2>Booking Successful!</h2>
          <div className="card">
            <div className="card-body">
              <h4>Booking Details</h4>
              <p><strong>Property:</strong> {property.title}</p>
              <p>
                <strong>Location:</strong> {property.city}, {property.country}
              </p>
              <p><strong>Dates:</strong> {start_date} → {end_date}</p>
              <p><strong>Status:</strong> {paid ? 'Paid' : 'Not Paid'}</p>
              <p><strong>Total Price:</strong> ${total_price}</p>
              <a
                href={`/property/${property.id}`}
                className="btn btn-outline-primary btn-sm"
              >
                View Property Details
              </a>
            </div>
          </div>
          <div className="mt-4">
            <a href="/user_page" className="btn btn-primary">
              Go to My Profile
            </a>
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
  ReactDOM.render(<SuccessPage bookingId={bookingId} />, root);
});

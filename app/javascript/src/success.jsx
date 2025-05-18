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
      .catch(() => this.setState({ error: 'Failed to load booking', loading: false }));
  }

  render() {
    const { booking, loading, error } = this.state;

    if (loading) return <p>Loading…</p>;
    if (error)   return <p>{error}</p>;
    if (!booking || !booking.property) 
      return <p>No booking details available.</p>;

    const { property, start_date, end_date, total_price } = booking;
    return (
      <Layout>
        <h2>Booking Successful!</h2>
        <p><strong>Property:</strong> {property.title}</p>
        <p><strong>Dates:</strong> {start_date} → {end_date}</p>
        <p><strong>Total:</strong> ${total_price}</p>
      </Layout>
    );
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('success-page-root');
  const bookingId = root.dataset.bookingId;
  ReactDOM.render(<SuccessPage bookingId={bookingId} />, root);
});

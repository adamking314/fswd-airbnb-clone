import React from 'react';


class HostBookings extends React.Component {
  state = {
    bookings: [],
    loading: true,
    error: null,
  }

  componentDidMount() {
        fetch('/api/bookings/host')
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then(data => {
            this.setState({ bookings: data.bookings, loading: false });
          })
          .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
            this.setState({ error: 'Could not load host bookings', loading: false });
          });
      }
      

  render() {
    const { bookings, loading, error } = this.state;

    if (loading) return <p>Loading host bookings...</p>;
    if (error) return <p>{error}</p>;

    if (bookings.length === 0) {
      return <p>No bookings on your properties yet.</p>;
    }

    return (
      <div>
        {bookings.map(booking => (
          <div key={booking.id} className="card mb-3">
            <div className="card-body">
              <h5>Booked Property: {booking.property_title}</h5>
              <p>Guest: {booking.guest_username}</p>
              <p>From: {booking.start_date}</p>
              <p>To: {booking.end_date}</p>
              <p>Status: {booking.status}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }
}

export default HostBookings;

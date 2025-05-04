import React from 'react';


class GuestBookings extends React.Component {
  state = {
    bookings: [],
    loading: true,
    error: null,
  }
  componentDidMount() {
    fetch('/api/authenticated')
      .then(res => res.json())
      .then(data => {
        if (data.username) {
          this.setState({ username: data.username }, this.fetchProperties);
        } else {
          this.setState({ error: 'Not logged in' });
        }
      });
  }
  fetchProperties = () => {
    const { username } = this.props;
    fetch(`/api/users/${username}/bookings`) 
      .then(res => res.json())
      .then(data => this.setState({ bookings: data, loading: false }))
      .catch(() => this.setState({ bookings: [], loading: false }));
  }
  
  
  render() {
    const { bookings, loading, error } = this.state;

    if (loading) return <p>Loading guest bookings...</p>;
    if (error) return <p>{error}</p>;

    if (bookings.length === 0) {
      return <p>You have no bookings yet.</p>;
    }
    const handlePayNow = async (bookingId) => {
        try {
          const response = await fetch(`/api/charges/new_checkout_session?booking_id=${bookingId}`);
          const data = await response.json();
          if (data.url) {
            window.location.href = data.url; 
          } else {
            console.error('No checkout URL returned');
          }
        } catch (err) {
          console.error('Error creating checkout session:', err);
        }
      };

    return (
      <div>
        {bookings.map(booking => (
          <div key={booking.id} className="card mb-3">
            <div className="card-body">
              <h5>Property: {booking.property_title}</h5>
              <p>From: {booking.start_date}</p>
              <p>To: {booking.end_date}</p>
              <p>Status: {booking.status}</p>
              {booking.paid ? (
                     <span className="badge badge-success">Paid</span>
                        ) : (
                     <button 
                       className="btn btn-warning"
                       onClick={() => handlePayNow(booking.id)}
                         >
                       Pay Now
                        </button>
                    )}
            </div>
          </div>
        ))}
      </div>
    );
  }
}

export default GuestBookings;

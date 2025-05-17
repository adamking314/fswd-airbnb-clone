import React, { Component } from 'react';
import layout from '@src/layout'; 
import { handleErrors } from '@utils/fetchHelper';
import './success.scss';

class SuccessPage extends Component {
  state = {
    booking: null,
    property: null,
    user: null,
    error: null,
    loading: true,
  };

  componentDidMount() {
    const { id } = this.props.match.params; 

    fetch(`/api/bookings/${id}/success`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          this.setState({ error: data.error, loading: false });
        } else {
          this.setState({
            booking: data.booking,
            property: data.property,
            user: data.user,
            loading: false,
          });
        }
      })
      .catch((err) => {
        this.setState({ error: 'Failed to load booking details', loading: false });
      });
  }

  render() {
    const { booking, property, user, error, loading } = this.state;

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
      <layout>
      <div>
        <h1>Booking Successful!</h1>
        <h3>Booking ID: {booking.id}</h3>
        <p>Guest: {user.username}</p>
        <p>Property: {property.title}</p>
        <p>Price: ${property.price_per_night} per night</p>
        <p>Check-in: {booking.start_date}</p>
        <p>Check-out: {booking.end_date}</p>

        {property.images && property.images.length > 0 && (
          <div>
            <img src={property.images[0].image_url} alt={property.title} />
          </div>
        )}

        <button onClick={() => window.location.href = '/'}>Back to Home</button>
      </div>
      </layout>
    );
  }
}

export default SuccessPage;

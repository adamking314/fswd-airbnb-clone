//src//SuccessPage.jsx
import React from 'react';
import ReactDOM from 'react-dom';
import Layout from '@src/layout';
import { handleErrors } from '@utils/fetchHelper';

import './successPage.scss'; 

class SuccessPage extends React.Component {
  state = {
    booking: null,
    property: null,
    loading: true,
    error: null,
  }

  componentDidMount() {
    const { id } = this.props.match.params; // Get booking id from URL
    fetch(`/booking/${id}/success`)  // Fetch success data for this booking
      .then(handleErrors)
      .then(data => {
        this.setState({
          booking: data.booking,
          property: data.property,
          loading: false,
        });
      })
      .catch(error => {
        this.setState({
          error: "Failed to load booking details",
          loading: false,
        });
      });
  }

  render() {
    const { booking, property, loading, error } = this.state;

    if (loading) {
      return <p>Loading...</p>;
    }

    if (error) {
      return <p>{error}</p>;
    }

    return (
      <Layout>
        <div className="container pt-4">
          <h4 className="mb-1">Booking Successful!</h4>
          <p className="text-secondary mb-3">
            Your booking at <strong>{property.title}</strong> has been successfully confirmed!
          </p>
          <div className="row">
            <div className="col-12">
              <div className="property-image mb-3 rounded" style={{ backgroundImage: `url(${property.image_url})` }} />
              <p><strong>Check-in Date:</strong> {new Date(booking.start_date).toLocaleDateString()}</p>
              <p><strong>Check-out Date:</strong> {new Date(booking.end_date).toLocaleDateString()}</p>
              <p><strong>Total Amount:</strong> ${booking.amount}</p>
            </div>
          </div>
          <div className="text-center">
            <a href={`/property/${property.id}`} className="btn btn-light mb-4">Back to Property</a>
          </div>
        </div>
      </Layout>
    );
  }
}

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <SuccessPage />,
    document.body.appendChild(document.createElement('div')),
  );
});

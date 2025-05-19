import React from 'react';
import ReactDOM from 'react-dom';
import PropertyCreate from './createProperty';
import Layout from '@src/layout';
import GuestBookings from './property/guestBookings';
import './user_page.scss';

class UserProfile extends React.Component {
  state = {
    properties: [],
    hostBookings: [],
    loading: true,
    error: null,
    showCreateForm: false,
    showGuestBookings: false, 
  }

  componentDidMount() {
    fetch('/api/authenticated')
      .then(res => res.json())
      .then(data => {
        if (data.username) {
          this.setState({ username: data.username }, () => {
            this.fetchProperties();
            this.fetchHostBookings(); 
       });
        } else {
          this.setState({ error: 'Not logged in' });
        }
      });
  }
  fetchProperties = () => {
    const { username } = this.state;
    fetch(`/api/users/${username}/property`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load');
        return res.json();
      })
      .then(data => this.setState({ properties: data, loading: false }))
      .catch(() => this.setState({ properties: [], loading: false }));
  }

  fetchHostBookings = () => {
    const { username } = this.state;
    fetch(`/api/users/${username}/host_bookings`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load host bookings');
        return res.json();
      })
      .then(data => this.setState({ hostBookings: data }))
      .catch(() => this.setState({ hostBookings: [] }));
  }

  toggleCreateForm = () => {
    this.setState(prevState => ({
      showCreateForm: !prevState.showCreateForm,
    }));
  }
  toggleGuestBookings = () => {
    this.setState(prevState => ({
      showGuestBookings: !prevState.showGuestBookings,
    }));
  }
  
  render() {
    const { properties, loading, error, showCreateForm } = this.state;

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
      <Layout>
        <div className="container mt-4">
          <div className="bookins-container">
            {/* Bookings Section */}
            <div className="bookings-container mb-5">
          <h2>My Bookings as a Guest</h2>
               <button 
            className="btn btn-primary mb-3" 
             onClick={this.toggleGuestBookings}
                 >
              {this.state.showGuestBookings ? 'Hide My Bookings' : 'View My Bookings'}
               </button>

           {this.state.showGuestBookings && (
           <GuestBookings username={this.state.username}/>
              )}
          </div>
          </div>
          <h2>My Properties</h2>
          <button 
            className="btn btn-primary mb-3" 
            onClick={this.toggleCreateForm}
          >
            {showCreateForm ? 'Hide Form' : 'Create New Property'}
          </button>

          {showCreateForm && (
            <PropertyCreate onSuccess={this.fetchProperties} />
          )}

          <div className="row mt-4">
            {properties.length === 0 ? (
              <p>You haven’t listed any properties yet. Use the button above to add one!</p>
            ) : (
              properties.map(property => (
                <div key={property.id} className="col-md-4 mb-3">
                  <div className="card">
                    {property.image_url && (
                      <img src={property.image_url} className="card-img-top" alt={property.title} />
                    )}
                    <div className="card-body">
                      <h5 className="card-title">{property.title}</h5>
                      <p className="card-text">{property.description}</p>
                      <a href={`/property/${property.id}`} className="btn btn-outline-primary btn-sm">Edit</a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <h2 className="mt-5">Bookings on My Properties</h2>
            <div className="row mt-3">
            {this.state.hostBookings.length === 0 ? (
              <p>No one has booked your properties yet.</p>
             ) : (
            this.state.hostBookings.map((booking) => (
             <div key={booking.id} className="card mb-3 p-3">
             <h4>{booking.property.title}</h4>
             <p>{booking.property.address}</p>
             <p><strong>Guest:</strong> {booking.guest_username}</p>
              <p><strong>Dates:</strong> {booking.start_date} → {booking.end_date}</p>
              <p><strong>Status: </strong>{booking.paid ? 'Paid' : 'Not Paid'}</p> 
             </div>
              ))
             )}
            </div>
        </div>
      </Layout>
    );
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('user-page-root');
  if (root) {
    ReactDOM.render(<UserProfile />, root);
  }
});

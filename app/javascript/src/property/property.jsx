// property.jsx
import React from 'react';
import Layout from '@src/layout';
import BookingWidget from './bookingWidget';
import { handleErrors } from '@utils/fetchHelper';

import './property.scss';

class Property extends React.Component {
  state = {
    property: {},
    loading: true,
    editing: false,
    form: {},
    saving: false,
    currentUser: null, 
  }

  componentDidMount() {
    // Fetch property details
    fetch(`/api/properties/${this.props.property_id}`)
      .then(handleErrors)
      .then(data => {
        this.setState({
          property: data.property,
          loading: false,
        })
      });

    // Fetch authenticated user info
    fetch('/api/authenticated')
    .then(res => res.json())
    .then(data => {
      if (data.authenticated) {
        this.setState({
          currentUser: {
            username: data.username,
            id: data.id,
          },
        });
      } else {
        this.setState({ error: 'Not logged in' });
      }
    });
  }
  

  startEditing = () => {
    const { property } = this.state;
    this.setState({
      editing: !this.state.editing,
      form: {
        title: property.title || '',
        description: property.description || '',
        city: property.city || '',
        country: property.country || '',
        property_type: property.property_type || '',
        price_per_night: property.price_per_night || '',
        max_guests: property.max_guests || '',
        bedrooms: property.bedrooms || '',
        beds: property.beds || '',
        baths: property.baths || '',
      }
    });
  }

  updateFormField = (field, value) => {
    this.setState(prevState => ({
      form: {
        ...prevState.form,
        [field]: value,
      }
    }));
  }

  saveChanges = () => {
    const { form, property } = this.state;
    this.setState({ saving: true });

    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      formData.append(`property[${key}]`, form[key]);
    });

    const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

    fetch(`/api/properties/${property.id}`, {
      method: 'PATCH',
      headers: {
        'X-CSRF-Token': csrfToken
      },
      body: formData,
      credentials: 'include',
    })
      .then(handleErrors)
      .then(data => {
        this.setState({
          property: data,
          editing: false,
          saving: false,
        })
      })
      .catch(error => {
        console.error("Update failed:", error);
        this.setState({ saving: false });
      });
  }
  get isOwner() {
    const { currentUser, property } = this.state;
    return currentUser && property.user && (currentUser.id === property.user.id);
  }

  render() {
    const { property, loading, editing, form, saving, error } = this.state;

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    const {
      id, title, description, city, country, property_type,
      price_per_night, max_guests, bedrooms, beds, baths, image_url,
    } = property;

console.log(this.isOwner);
console.log(this.currentUser);


    return (
      <Layout>
        <div className="property-image mb-3" style={{ backgroundImage: `url(${image_url})` }} />
        <div className="container">
          <div className="row">
            <div className="info col-12 col-lg-7">
              {this.isOwner && (
                <button className="btn btn-primary mb-3" onClick={this.startEditing}>
                  {editing ? 'Cancel Editing' : 'Edit Property'} 
                </button>
              )}
              {editing && (
                <div className="mb-3">
                  <button className="btn btn-success" onClick={this.saveChanges} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
              <div className="mb-3">
                {editing ? (
                  <input
                    type="text"
                    className="form-control mb-2"
                    value={form.title}
                    onChange={(e) => this.updateFormField('title', e.target.value)}
                  />
                ) : (
                  <h3 className="mb-0">{title}</h3>
                )}
                {editing ? (
                  <>
                    <input
                      type="text"
                      className="form-control mb-2"
                      value={form.city}
                      onChange={(e) => this.updateFormField('city', e.target.value)}
                      placeholder="City"
                    />
                    <input
                      type="text"
                      className="form-control mb-2"
                      value={form.country}
                      onChange={(e) => this.updateFormField('country', e.target.value)}
                      placeholder="Country"
                    />
                  </>
                ) : (
                  <p className="text-uppercase mb-0 text-secondary">
                    <small>{city},{country}</small>
                  </p>
                )}
                <p className="mb-0"><small>Hosted by <b>{this.state.property?.user?.username}</b></small></p>
              </div>
              <div>
                {editing ? (
                  <>
                    <input
                      type="text"
                      className="form-control mb-2"
                      value={form.property_type}
                      onChange={(e) => this.updateFormField('property_type', e.target.value)}
                      placeholder="Property Type"
                    />
                    <div className="d-flex flex-wrap mb-2">
                      <input
                        type="number"
                        className="form-control me-2 mb-2"
                        value={form.max_guests}
                        onChange={(e) => this.updateFormField('max_guests', e.target.value)}
                        placeholder="Guests"
                      />
                      <input
                        type="number"
                        className="form-control me-2 mb-2"
                        value={form.bedrooms}
                        onChange={(e) => this.updateFormField('bedrooms', e.target.value)}
                        placeholder="Bedrooms"
                      />
                      <input
                        type="number"
                        className="form-control me-2 mb-2"
                        value={form.beds}
                        onChange={(e) => this.updateFormField('beds', e.target.value)}
                        placeholder="Beds"
                      />
                      <input
                        type="number"
                        className="form-control mb-2"
                        value={form.baths}
                        onChange={(e) => this.updateFormField('baths', e.target.value)}
                        placeholder="Baths"
                      />
                    </div>
                    <input
                      type="number"
                      className="form-control mb-2"
                      value={form.price_per_night}
                      onChange={(e) => this.updateFormField('price_per_night', e.target.value)}
                      placeholder="Price per night"
                    />
                  </>
                ) : (
                  <>
                    <p className="mb-0 text-capitalize"><b>{property_type}</b></p>
                    <p>
                      <span className="me-3">{max_guests} guests</span>
                      <span className="me-3">{bedrooms} bedroom</span>
                      <span className="me-3">{beds} bed</span>
                      <span className="me-3">{baths} bath</span>
                    </p>
                  </>
                )}
              </div>
              <hr />
              {editing ? (
                <textarea
                  className="form-control"
                  value={form.description}
                  onChange={(e) => this.updateFormField('description', e.target.value)}
                  rows="5"
                  placeholder="Description"
                />
              ) : (
                <p>{description}</p>
              )}
            </div>
            <div className="col-12 col-lg-5">
              {!editing && (
                <BookingWidget property_id={id} price_per_night={price_per_night} />
              )}
            </div>
          </div>
        </div>
      </Layout>
    )
  }
}

export default Property;

//property.jsx
import React from 'react';
import { handleErrors } from '@utils/fetchHelper';
import Layout from '@src/layout';
import BookingWidget from './bookingWidget';
import './property.scss';

class Property extends React.Component {
  state = {
    property: {},
    currentUser: null,
    loading: true,
    error: null,
    editing: false,
    form: {},
    currentImageIndex: 0,
    newImages: [],
    imagesToDelete: [],
    saving: false,
  };

  componentDidMount() {
    fetch(`/api/properties/${this.props.property_id}`)
      .then(handleErrors)
      .then(data => {
        this.setState({
          property: data.property,
          loading: false,
        });
      });

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
          window.location.href = '/login'; // 👈 redirect to login if not auth
        }
      })
      .catch(() => {
        window.location.href = '/login';
      });
  }

  get isOwner() {
    const { currentUser, property } = this.state;
    return currentUser && property.user && currentUser.username === property.user.username;
  }
  

  updateFormField = (field, value) => {
    this.setState(prevState => ({
      form: {
        ...prevState.form,
        [field]: value
      }
    }));
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
      },
      newImages: [],
      imagesToDelete: [],
    });
  }

  saveChanges = () => {
    const { form, property, newImages, imagesToDelete } = this.state;

    if (!property || !property.id) {
      console.error('Property or property id is missing');
      this.setState({
        error: 'Unable to save changes - property information is missing',
        saving: false,
      });
      return;
    }

    this.setState({ saving: true });
    const formData = new FormData();

    Object.keys(form).forEach((key) => {
      formData.append(`property[${key}]`, form[key]);
    });

    newImages.forEach((image) => {
      formData.append('property[images][]', image);
    });

    if (imagesToDelete.length > 0) {
      formData.append('property[images_to_delete][]', JSON.stringify(imagesToDelete));
    }

    fetch(`/api/properties/${property.id}`, {
      method: 'PATCH',
      headers: {
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content,
      },
      body: formData,
      credentials: 'include',
    })
      .then(handleErrors)
      .then(response => {
        const updatedProperty = { ...response, user: property.user };
        fetch(`/api/properties/${updatedProperty.id}`)
        .then(handleErrors)
        .then(data => {
          this.setState({
            property: data.property, // Ensure images are included
            editing: false,
            saving: false,
            newImages: [],
            imagesToDelete: [],
            error: null,
          });
        });
    })
    .catch(error => {
      console.error("Update failed:", error);
      this.setState({
        saving: false,
        error: error.message || 'Failed to update property',
      });
    });
}

  render() {
    const { property, loading, editing, currentImageIndex, saving, form, error, currentUser } = this.state;

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    const { title, description, city, country, property_type, price_per_night, max_guests, bedrooms, beds, baths, images = [], user, id } = property;

    const isUserOwner = this.isOwner;
    return (
      <Layout>
        <div className="carousel-container">
          {editing ? (
            <div className="edit-images">
              {property.images.map((image, index) => (
                <div key={index} className="image-edit-item">
                  <img src={image.image_url} alt={`Property ${index + 1}`} />
                  <button
                    onClick={() => this.handleImageDelete(index)}
                    className="delete-image-btn"
                  >
                    Delete
                  </button>
                </div>
              ))}
              <input
                type="file"
                multiple
                onChange={this.handleImageChange}
                accept="image/*"
              />
            </div>
          ) : (
            images.length > 0 ? (
              <>
                <img
                  src={images[currentImageIndex]?.image_url}
                  alt={`Property ${title}`}
                  className="property-image"
                />
                <button onClick={this.prevImage} className="carousel-button prev">
                  &lt;
                </button>
                <button onClick={this.nextImage} className="carousel-button next">
                  &gt;
                </button>
                <div className="image-counter">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            ) : (
              <div className="no-image">No images available</div>
            )
          )}
        </div>
        <div className="container">
          <div className="row">
            <div className="info col-12 col-lg-7">
              {editing ? (
                <form onSubmit={(e) => { e.preventDefault(); this.saveChanges(); }}>
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.title}
                      onChange={(e) => this.updateFormField('title', e.target.value)}
                    />
                  </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    className="form-control"
                    value={form.description}
                    onChange={(e) => this.updateFormField('description', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.city}
                    onChange={(e) => this.updateFormField('city', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.country}
                    onChange={(e) => this.updateFormField('country', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Property Type</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.property_type}
                    onChange={(e) => this.updateFormField('property_type', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Price per Night</label>
                  <input
                    type="number"
                    className="form-control"
                    value={form.price_per_night}
                    onChange={(e) => this.updateFormField('price_per_night', e.target.value)}
                  />
                </div>
                <div className="row">
                  <div className="col">
                    <div className="form-group">
                      <label>Max Guests</label>
                      <input
                        type="number"
                        className="form-control"
                        value={form.max_guests}
                        onChange={(e) => this.updateFormField('max_guests', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col">
                    <div className="form-group">
                      <label>Bedrooms</label>
                      <input
                        type="number"
                        className="form-control"
                        value={form.bedrooms}
                        onChange={(e) => this.updateFormField('bedrooms', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col">
                    <div className="form-group">
                      <label>Beds</label>
                      <input
                        type="number"
                        className="form-control"
                        value={form.beds}
                        onChange={(e) => this.updateFormField('beds', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col">
                    <div className="form-group">
                      <label>Baths</label>
                      <input
                        type="number"
                        className="form-control"
                        value={form.baths}
                        onChange={(e) => this.updateFormField('baths', e.target.value)}
                      />
                    </div>
                  </div>
                </div>             <button type="submit" className="btn btn-primary mt-3" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" className="btn btn-secondary mt-3 ml-2" onClick={this.startEditing}>
                    Cancel
                  </button>
                </form>
              ) : (
                <>
                  <div className="mb-3">
                    <h3 className="mb-0">{title}</h3>
                    <p className="text-uppercase mb-0 text-secondary">
                      <small>{city}, {country}</small>
                    </p>
                    <p className="mb-0">
                      <small>Hosted by <b>{user?.username || 'Unknown'}</b></small>
                    </p>
                  </div>

                  {isUserOwner && (
                    <button onClick={this.startEditing} className="btn btn-primary mb-3">
                      Edit Property
                    </button>
                  )}

                  <div>
                    <p className="mb-0 text-capitalize"><b>{property_type}</b></p>
                    <p>{description}</p>
                    <div className="property-details">
                      <p><strong>Price:</strong> ${price_per_night} per night</p>
                      <p><strong>Max Guests:</strong> {max_guests}</p>
                      <p><strong>Rooms:</strong> {bedrooms} bedrooms, {beds} beds, {baths} baths</p>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="col-12 col-lg-5">
              {!editing && <BookingWidget property_id={property.id} price_per_night={price_per_night} />}
            </div>
          </div>
        </div>
      </Layout>
    );
  }
}

export default Property;
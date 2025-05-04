import React from 'react';
import { handleErrors } from '@utils/fetchHelper';
import './property/property.scss';

class PropertyCreate extends React.Component {
    state = {
      title: '',
      description: '',
      city: '',
      country: '',
      property_type: '',
      price_per_night: '',
      max_guests: '',
      bedrooms: '',
      beds: '',
      baths: '',
      image: [], 
      errors: [],
      success: false,
    }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  }

  handleFileChange = (e) => {
    this.setState({ images: [...e.target.files] });
  }
  handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("property[title]", this.state.title);
    formData.append("property[description]", this.state.description);
    formData.append("property[city]", this.state.city);
    formData.append("property[country]", this.state.country);
    formData.append("property[property_type]", this.state.property_type);
    formData.append("property[price_per_night]", this.state.price_per_night);
    formData.append("property[max_guests]", this.state.max_guests);
    formData.append("property[bedrooms]", this.state.bedrooms);
    formData.append("property[beds]", this.state.beds);
    formData.append("property[baths]", this.state.baths);
 
    // Add each image to the FormData
    if (this.state.images.length > 0) {
        this.state.images.forEach((image, index) => {
          formData.append(`property[images][]`, image);  
        });
      }
    const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
  
    fetch('/api/properties', {
      method: 'POST',
      headers: {
        'X-CSRF-Token': csrfToken,
      },
      body: formData,
      credentials: 'include',
    })
    .then(handleErrors)
    .then(data => {
      this.setState({ success: true });
      window.location.href = `/property/${data.property.id}`;
    })
    .catch(error => {
      this.setState({ errors: ['Failed to create property. Please try again.'] });
    });
  }
  
  render() {
    const {
        title,
        description,
        city,
        country,
        property_type,
        price_per_night,
        max_guests,
        bedrooms,
        beds,
        baths,
        errors,
      } = this.state;
      



    return (
          <div className="container mt-4">
            <h2>Create New Property</h2>
            {errors.length > 0 && (
              <div className="alert alert-danger">
                {errors.map((err, idx) => <p key={idx}>{err}</p>)}
              </div>
            )}
            <form onSubmit={this.handleSubmit} encType="multipart/form-data">
            <div className="mb-3">
              <label className="form-label">Title</label>
              <input name="title" className="form-control" value={title} onChange={this.handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea name="description" className="form-control" value={description} onChange={this.handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">City</label>
              <input name="city" className="form-control" value={city} onChange={this.handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Country</label>
              <input name="country" className="form-control" value={country} onChange={this.handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Property Type</label>
              <input name="property_type" className="form-control" value={property_type} onChange={this.handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Price per Night</label>
              <input type="number" name="price_per_night" className="form-control" value={price_per_night} onChange={this.handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Max Guests</label>
              <input type="number" name="max_guests" className="form-control" value={max_guests} onChange={this.handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Bedrooms</label>
              <input type="number" name="bedrooms" className="form-control" value={bedrooms} onChange={this.handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Beds</label>
              <input type="number" name="beds" className="form-control" value={beds} onChange={this.handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Baths</label>
              <input type="number" name="baths" className="form-control" value={baths} onChange={this.handleChange} required />
            </div>
            <div className="mb-3">
            <label className="form-label">Images</label>
            <input
              type="file"
              name="images"
              className="form-control"
              onChange={this.handleFileChange}
              accept="image/*"
              multiple 
            />
          </div>

            <button type="submit" className="btn btn-primary">Create Property</button>
          </form>
        </div>
    );
  }
}

export default PropertyCreate;

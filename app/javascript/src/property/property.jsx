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
    currentImageIndex: 0 
  }

  nextImage = () => {
    this.setState(prevState => ({
      currentImageIndex: (prevState.currentImageIndex + 1) % this.state.property.images.length
    }));
  }

  prevImage = () => {
    this.setState(prevState => ({
      currentImageIndex: prevState.currentImageIndex === 0 
        ? this.state.property.images.length - 1 
        : prevState.currentImageIndex - 1
    }));
  }


  componentDidMount() {
    fetch(`/api/properties/${this.props.property_id}`)
      .then(handleErrors)
      .then(data => {
        this.setState({
          property: data.property,
          loading: false,
        })
      })
  }

  render () {
    const { property, loading, currentImageIndex } = this.state;
    if (loading) {
      return <p>loading...</p>;
    };

    const {
      id,
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
      images = [],
      user,
    } = property

    const propertyImages = images?.map((image, index) => (
      <img 
        key={index}
        src={image.image_url}
        alt={`Property ${title} image ${index + 1}`}
        className="property-image"
      />
    ));

    return (
      <Layout>
        <div className="carousel-container">
          {images && images.length > 0 ? (
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
          )}
        </div>
        <div className="container">
          <div className="row">
            <div className="info col-12 col-lg-7">
              <div className="mb-3">
                <h3 className="mb-0">{title}</h3>
                <p className="text-uppercase mb-0 text-secondary"><small>{city}, {country}</small></p>
                <p className="mb-0"><small>Hosted by <b>{user.username}</b></small></p>
              </div>
              <div>
                <p className="mb-0 text-capitalize"><b>{property_type}</b></p>
                <p>
                  <span className="me-3">{max_guests} guests</span>
                  <span className="me-3">{bedrooms} bedroom</span>
                  <span className="me-3">{beds} bed</span>
                  <span className="me-3">{baths} bath</span>
                </p>
              </div>
              <hr />
              <p>{description}</p>
            </div>
            <div className="col-12 col-lg-5">
              <BookingWidget property_id={id} price_per_night={price_per_night} />
            </div>
          </div>
        </div>
      </Layout>
    )
  }
}

export default Property
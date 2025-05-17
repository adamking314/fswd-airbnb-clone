import React from 'react';

class SuccessPage extends React.Component {
  componentDidMount() {
    console.log('Success page loaded');
  }

  render() {
    return (
      <div>
        <h1>Booking Success</h1>
        <p>Your booking was successful!</p>
      </div>
    );
  }
}

export default SuccessPage;

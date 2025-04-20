// LogoutFunction.jsx
import React from 'react';
import { safeCredentials, handleErrors } from '@src/utils/fetchHelper';
import './login.scss';

class LogoutFunction extends React.Component {
  logout = () => {
    fetch('/api/sessions', safeCredentials({
      method: 'DELETE',
      credentials: 'include',
    }))
      .then(handleErrors)
      .then(() => {
        window.location = '/login';
      })
      .catch(error => {
        console.error('Logout failed:', error);
      });
  }

  render() {
    return (
      <button onClick={this.logout} className="log-out-btn btn btn-danger">Logout</button>
    );
  }
}

export default LogoutFunction;

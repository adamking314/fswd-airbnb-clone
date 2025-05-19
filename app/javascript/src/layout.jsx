import React from 'react';

const handleLogout = () => {
  fetch('/api/sessions/0', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(res => {
      if (res.ok) {
        window.location.href = '/'; // Redirect after logout
      } else {
        console.error('Failed to log out');
      }
    })
    .catch(err => console.error('Logout error:', err));
};

const Layout = (props) => {
  return (
    <React.Fragment>
      <nav className="navbar navbar-expand navbar-light bg-light">
        <div className="container-fluid">
          <a className="navbar-brand text-danger" href="/">Airbnb</a>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <a className="nav-link" href="/">Home</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/login">Login</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/user_page">Profile</a>
              </li>
              <li className="nav-item">
                <button className="btn btn-danger ms-2" onClick={handleLogout}>
                  Log Out
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {props.children}

      <footer className="p-3 bg-light">
        <div>
          <p className="me-3 mb-0 text-secondary">Airbnb Clone</p>
        </div>
      </footer>
    </React.Fragment>
  );
};

export default Layout;

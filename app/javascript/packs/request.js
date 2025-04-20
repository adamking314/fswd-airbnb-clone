const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

const fetchRequest = async (url, options = {}, callback) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
        ...options.headers
      },
      credentials: 'include',
    });
    const data = await response.json();
    if (callback) callback(data);
  } catch (error) {
    console.error('Request failed:', error);
  }
};

export const createUser = (username, email, password, callback) => {
  fetchRequest('api/users', {
    method: 'POST',
    body: JSON.stringify({ user: { username, email, password } })
  }, callback);
};

export const logInUser = (email, password, callback) => {
  fetchRequest('api/sessions', {
    method: 'POST',
    body: JSON.stringify({ user: { email, password } })
  }, callback);
};

export const logOutUser = (callback) => {
  fetchRequest('api/sessions', { method: 'DELETE' }, callback);
};

export const authenticateUser = (callback) => {
  fetchRequest('api/authenticated', { method: 'GET' }, callback);
};

export const getUserproperty = (username, callback) => {
  fetchRequest(`/api/users/${username}/property`, { method: 'GET' }, (response) => {
    if (response.error) {
      window.location.replace('/property');
    } else {
      callback(response);
    }
  });
};

export const createListing = (formData, callback) => {
  fetch('/api/properties', {
    method: 'POST',
    body: formData,
    headers: {
      'X-CSRF-Token': csrfToken,
    },
    credentials: 'include',
  })
    .then((response) => response.json())
    .then((data) => callback(data))
    .catch((error) => console.error('Request failed:', error));
};

export const deleteListing = (id, callback) => {
  fetchRequest(`api/properties/${id}`, { method: 'DELETE' }, (response) => {
    if (response.success) callback();
  });
};

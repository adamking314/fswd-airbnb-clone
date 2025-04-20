import { authenticateUser, getUserproperty } from "/app/javascript/packs/request.js";

//  check logged in user

export var getCurrentUser = function (callback) {
  authenticateUser(function (response) {
    if (response.authenticated == true) {
      callback(response);
    }
    else if (response.authenticated == false) {
       window.location.replace('/');
    }
  });
};

//  count properties for user stats

export var countUsersProperty = (username, callback) => {
  getUserproperty(username, function (response) {
    callback(response.properties.length);
  });
};
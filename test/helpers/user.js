const { SERVER_URL } = require('#config');

async function registerUser(username, password, role, bossId) {
  const response = await fetch(`${SERVER_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, role, bossId }),
  });

  const data = await response.json();
  return { data, status: response.status };
}

async function authenticateUser(username, password) {
  const response = await fetch(`${SERVER_URL}/users/authenticate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();
  return { data, status: response.status };
}

async function getToken(username, password) {
  const response = await fetch(`${SERVER_URL}/users/authenticate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  return await response.json();
}

async function getUsers(token) {
  const response = await fetch(`${SERVER_URL}/users`, {
    method: 'GET',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  const data = await response.json();
  return { data, status: response.status };
}

async function changeUserBoss(token, userId, bossId) {
  const response = await fetch(`${SERVER_URL}/users/${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ bossId }),
  });

  const data = await response.json();
  return { data, status: response.status };
}

async function refreshAccessToken(refreshToken) {
  const response = await fetch(`${SERVER_URL}/users/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await response.json();
  return { data, status: response.status };
}

module.exports = {
  registerUser,
  authenticateUser,
  getUsers,
  getToken,
  changeUserBoss,
  refreshAccessToken,
};

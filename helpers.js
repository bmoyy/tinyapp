function getUserByEmail(newEmail, database) {
  let foundUser = null;
  for (const user in database) {
    if (database[user].email === newEmail) {
      foundUser = database[user];
    }
  }
  return foundUser;
}

function generateRandomString() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

function urlsforUser(id, urlDatabase) {
  let userUrlDatabase = {};
  for (url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userUrlDatabase[url] = urlDatabase[url].longURL;
    }
  }
  return userUrlDatabase;
}


module.exports = { getUserByEmail, generateRandomString, urlsforUser };
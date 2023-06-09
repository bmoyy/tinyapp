const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');
const { getUserByEmail, generateRandomString, urlsforUser } = require('./helpers');

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['asdfcxvasdf']
}));

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "123" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "123" }
};

const users = {
  123: {
    id: "123",
    email: "a@a.com",
    password: bcrypt.hashSync("asdf", 10),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.get("/", (req, res) => {
  let user_id = req.session.user_id;
  if (users[user_id]) {
    return res.redirect('/urls');
  }
  res.redirect('/login');
});

app.get("/register", (req, res) => {
  let user_id = req.session.user_id;
  if (users[user_id]) {
    return res.redirect('/urls');
  }
  const templateVars = {
    user: users[user_id],
  };
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  if (getUserByEmail(req.body.email, users)) {
    return res.status(400).send("Email already registered");
  };
  if (!req.body.email || !req.body.password) {
    return res.status(400).send('Please provide an email and password');
  }
  let randID = generateRandomString();
  req.session.user_id = randID;
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  users[randID] = {
    id: randID,
    email: req.body.email,
    password: hashedPassword
  };
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  let user_id = req.session.user_id;
  if (users[user_id]) {
    return res.redirect('/urls');
  }
  const templateVars = {
    user: users[user_id],
  };
  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  let foundUser = getUserByEmail(req.body.email, users);
  if (!foundUser) {
    return res.status(400).send("Email not registered");
  };
  if (!bcrypt.compareSync(req.body.password, foundUser.password)) {
    return res.status(400).send('Passwords do not match');
  };
  req.session.user_id = foundUser.id;
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.get("/urls", (req, res) => {
  let user_id = req.session.user_id;
  if (!users[user_id]) {
    return res.send('Please log in or register an account');
  }
  const templateVars = {
    user: users[user_id],
    urls: urlsforUser(req.session.user_id, urlDatabase)
  };
  res.render('urls_index', templateVars);
});

app.post("/urls", (req, res) => {
  let user_id = req.session.user_id;
  if (!users[user_id]) {
    return res.send('Please log in to create URLs');
  }
  let randID = generateRandomString();
  urlDatabase[randID] = {};
  urlDatabase[randID].longURL = req.body.longURL;
  urlDatabase[randID].userID = user_id;
  res.redirect(`/urls/${randID}`);
});

app.get("/urls/new", (req, res) => {
  let user_id = req.session.user_id;
  if (!users[user_id]) {
    return res.redirect('/login');
  }
  const templateVars = {
    user: users[user_id],
  };
  res.render("urls_new", templateVars);
});


app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.status(403).send("The link does not exist.");
  }
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

app.post('/urls/:id/delete', (req, res) => {
  let user_id = req.session.user_id;
  let url = urlDatabase[req.params.id];
  if (!users[user_id]) {
    return res.status(400).send('Please log in or register an account');
  }
  if (!url) {
    return res.status(404).send("This link does not exist");
  }
  if (url.userID !== user_id) {
    return res.status(403).send("Access forbidden");
  }
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  let user_id = req.session.user_id;
  let url = urlDatabase[req.params.id];
  if (!users[user_id]) {
    return res.status(400).send('Please log in or register an account');
  }
  if (!url) {
    return res.status(404).send("This link does not exist");
  }
  if (url.userID !== user_id) {
    return res.status(403).send("Access forbidden");
  }
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  res.redirect(`/urls/${req.params.id}`);
});


app.get("/urls/:id", (req, res) => {
  let user_id = req.session.user_id;
  let url = urlDatabase[req.params.id];
  if (!users[user_id]) {
    return res.status(400).send('Please log in or register an account');
  }
  if (!url) {
    return res.status(404).send("This link does not exist");
  }
  if (url.userID !== user_id) {
    return res.status(403).send("This account does not have access to this link");
  }
  const templateVars = {
    id: req.params.id,
    user: users[user_id],
    longURL: urlDatabase
  };
  return res.render('urls_show', templateVars);

});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
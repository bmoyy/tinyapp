const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  123: {
    id: "123",
    email: "a@a.com",
    password: "asdf",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

function generateRandomString() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

function doesEmailExist(newEmail, password, users) {
  if (newEmail === '' || password === '') {
    return true;
  }
  for (user in users) {
    if (users[user].email === newEmail) {
      return true;
    }
  }
  return false;
}

app.get("/register", (req, res) => {
  const templateVars = {
    user_id: req.cookies['user_id'],
    users: users,
    urls: urlDatabase
  };
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  if (!doesEmailExist(req.body.email, req.body.password, users)) {
    let randID = generateRandomString();
    res.cookie('user_id', randID);
    users[randID] = {};
    users[randID].email = req.body.email;
    users[randID].password = req.body.password;
    res.redirect('/urls');
  };
  res.send("400 bad request");
});

app.get('/login', (req, res) => {
  const templateVars = {
    user_id: req.cookies['user_id'],
    users: users,
    urls: urlDatabase
  };
  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  if (doesEmailExist(req.body.email, req.body.password, users)) {
    console.log("yes");
    for (user in users) {
      if (users[user].email === req.body.email && users[user].password === req.body.password) {
        res.cookie('user_id', user);
        res.redirect('/urls');
      }
    }
  }
  res.send("403 Forbidden");
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

app.get("/urls", (req, res) => {
  const templateVars = {
    user_id: req.cookies['user_id'],
    users: users,
    urls: urlDatabase
  };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user_id: req.cookies['user_id'],
    users: users,
    urls: urlDatabase
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  let randID = generateRandomString();
  urlDatabase[randID] = req.body.longURL;
  res.redirect(`/urls/${randID}`);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.post('/urls/:id/update', (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  res.redirect(`/urls/${req.params.id}`);
});


app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    user_id: req.cookies['user_id'],
    users: users,
    longURL: urlDatabase
  };
  res.render('urls_show', templateVars);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
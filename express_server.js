const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "123" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "123" }
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

function urlsforUser(id) {
  let userUrlDatabase = {};
  for (url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userUrlDatabase[url] = urlDatabase[url].longURL;
    }
  }
  return userUrlDatabase;
}

app.get("/register", (req, res) => {
  if (req.cookies['user_id']) {
    res.redirect('/urls');
  }
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
    users[randID].id = randID;
    users[randID].email = req.body.email;
    users[randID].password = req.body.password;
    console.log(users);
    res.redirect('/urls');
  };
  res.send("400 bad request");
});

app.get('/login', (req, res) => {
  if (req.cookies['user_id']) {
    res.redirect('/urls');
  }
  const templateVars = {
    user_id: req.cookies['user_id'],
    users: users,
    urls: urlDatabase
  };
  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  if (doesEmailExist(req.body.email, req.body.password, users)) {
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
  let user = users[req.cookies['user_id']];
  if (!user) {
    res.send('Please log in or register an account');
  }
  const templateVars = {
    user_id: req.cookies['user_id'],
    users: users,
    urls: urlsforUser(user.id)
  };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  let user = users[req.cookies['user_id']];
  if (!user) {
    res.redirect('/login');
  }
  const templateVars = {
    user_id: req.cookies['user_id'],
    users: users,
    urls: urlDatabase
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  let user = users[req.cookies['user_id']];
  if (!user) {
    res.send('Please log in to create URLs');
  }
  let randID = generateRandomString();
  urlDatabase[randID] = {};
  urlDatabase[randID].longURL = req.body.longURL;
  urlDatabase[randID].userID = req.cookies['user_id'];
  res.redirect(`/urls/${randID}`);
});

app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.send("The link does not exist.");
  }
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

app.post('/urls/:id/delete', (req, res) => {
  let user = users[req.cookies['user_id']];
  if (!user) {
    res.send('Please log in or register an account');
  }
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === user.id) {
      console.log(urlDatabase[url].userID)
      delete urlDatabase[req.params.id];
      res.redirect('/urls');
    }
  } 
  res.send('403 Forbidden');
});

app.post('/urls/:id/update', (req, res) => {
  let user = users[req.cookies['user_id']];
  if (!user) {
    res.send('Please log in or register an account');
  }
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === user.id) {
      urlDatabase[req.params.id].longURL = req.body.longURL;
      res.redirect('/urls');
    }
  }
  res.send('403 Forbidden');
});

app.post('/urls/:id', (req, res) => {
  res.redirect(`/urls/${req.params.id}`);
});


app.get("/urls/:id", (req, res) => {
  let user = users[req.cookies['user_id']];
  if (!user) {
    res.send('Please log in or register an account');
  }
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === user.id) {
      const templateVars = {
        id: req.params.id,
        user_id: req.cookies['user_id'],
        users: users,
        longURL: urlDatabase
      };
      res.render('urls_show', templateVars);
    }
  }
  res.send('403 Forbidden');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
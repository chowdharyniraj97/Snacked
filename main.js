if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

var express = require("express");
var app = express();
var bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const session = require("express-session");

var path = require("path");
const passport = require("passport");

const flash = require("express-flash");

const initializePassport = require("./passport-config");
initializePassport(
  passport,
  (email) => user.find((user) => user.email === email),
  (id) => user.find((user) => user.id === id)
);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
user = [];

app.get("/", checkAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname + "/views/index.html"));
});

app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login");
});

app.get("/register", checkNotAuthenticated, (req, res) => {
  res.render("register");
});

app.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.post("/register", checkNotAuthenticated, async (req, res) => {
  try {
    console.log("het");
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    user.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });
    res.redirect("/login");
  } catch {
    res.redirect("/register");
  }
  console.log(user);
});
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/login");
}
function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
}
app.listen(3000, () => {
  console.log("server is running");
});

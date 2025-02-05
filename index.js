if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
const express = require("express");
const port = process.env.PORT || 8000;
const mongoose = require("mongoose");
const express_Session = require("express-session");
const MongoStore = require("connect-mongo");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const app = express();
const ExpressError = require("./utils/ExpressError.js");
const router = require("./Routers/route.js");
const user = require("./Routers/user.js");
const passport = require("passport");
const LocalStargy = require("passport-local");
const { User } = require("./models/user.js");

main()
  .then(() => {
    console.log("Connection Succesful");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
}
mongoose.set("strictPopulate", false);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
  mongoUrl: process.env.MONGO_URI,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("ERROR IN MONGO STORE", error);
});

app.use(
  express_Session({
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    },
  })
);

app.use(cookieParser("secretcode"));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStargy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

app.get("/", (req, res) => {
  res.render("Note/home.ejs");
});
app.use("/", user);
app.use("/notes", router);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "page not found"));
});

app.use((err, req, res, next) => {
  let { statusCode, message } = err;
  res.render("Note/error.ejs", { message });
  next();
});

app.listen(port, () => {
  console.log(`app is Listen on port ${port}`);
});

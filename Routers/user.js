require("dotenv").config();
const express = require("express");
const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
const crypto = require("crypto");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const { User } = require("../models/user");
const { saveRedirectUrl } = require("../middleware");
const { generateAccessToken, verifyToken } = require("../jwt");
const Mail = require("../mail");
const Route = express.Router();
const otpgenerator = require("../generateOTP");

// Middleware Setup
Route.use(express.json());
Route.use(express.urlencoded({ extended: true }));
Route.use(cookieParser());

Route.use(
  session({
    secret: process.env.SESSION_SECRET || "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

const generateOTP = () => {
  return crypto.randomInt(100000, 999999);
};

// Render Email Template
const render_Email_Template = async (data) => {
  try {
    const templatePath = path.join(__dirname, "../views/User/test.ejs");
    const template = fs.readFileSync(templatePath, "utf-8");
    return ejs.render(template, { data });
  } catch (err) {
    console.error("Error rendering email template:", err);
  }
};

Route.use(passport.initialize());
Route.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//  GET: Login Page
Route.get("/notes/login", (req, res) => {
  res.render("./User/login.ejs");
});

Route.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/notes/login",
    failureFlash: true,
  }),
  async (req, res) => {
    req.flash("success", "Welcome back to Facilitate!");
    res.redirect("/");
    // res.redirect(res.locals.redirectUrl);
  }
);

//  GET: Signup Page
Route.get("/notes/signup", (req, res) => {
  res.render("./User/signup.ejs");
});

Route.post("/signup", async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const BASE_URL = `${req.protocol}://${req.get("host")}`;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash("error", "Email is already registered.");
      return res.redirect("/notes/signup"); // ✅ Fixed: Added return
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      req.flash("error", "Username is already registered.");
      return res.redirect("/notes/signup"); // ✅ Fixed: Added return
    }

    // Generate email verification token
    let token = await generateAccessToken({ username, email, password });

    // Send verification email
    let mail = new Mail();
    mail.setTo(email);
    mail.setSubject("Email Verification");
    mail.sethtml(
      `<a href="${BASE_URL}/verify/${token}">Click here to verify your email</a>`
    );

    await mail
      .send()
      .then((result) => {
        req.flash("success", "Verification email sent! Check your inbox.");
        res.render("./User/verifyemailloading.ejs"); // ✅ Fixed: No extra response after this
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send("Internal server error");
      });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
});

//  EMAIL VERIFICATION ROUTE (Activates user account)
Route.get("/verify/:token", async (req, res) => {
  try {
    const { token } = req.params;
    //console.log("Received Token:", token); // Debugging

    let isVerified = await verifyToken(token);
    // console.log("Verification Result:", isVerified); // Debugging

    if (!isVerified?.status) {
      req.flash("error", "Invalid or expired verification link.");
      return res.redirect("/signup");
    }

    const { username, email, password } = isVerified.payload;

    // Ensure user is not already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash("error", "User already verified. Please log in.");
      return res.redirect("/login");
    }

    // ✅ Register user after successful verification
    const newUser = new User({ username, email, isVerified: true });
    await User.register(newUser, password);

    req.flash("success", "Email verified successfully! You can now log in.");
    res.redirect("/");
  } catch (e) {
    console.error(e);
    req.flash("error", " A user with the given username is already registered");
    res.redirect("/signup");
  }
});

//  GET: Forgot Password Page
Route.get("/forgot-password", (req, res) => {
  res.render("./User/forget-password.ejs");
});

//  POST: Forgot Password (OTP Generation)
Route.post("/forgot-password", async (req, res) => {
  try {
    let { email } = req.body;
    console.log(email);

    // Use await instead of a callback
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send("Invalid email");
    }

    let otp = generateOTP();
    otpgenerator.set(email, otp);
    req.session.email = email;
    req.session.otp = otp;

    res.redirect("/renderEmailTemplate");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// 🚀 GET: Render OTP Email
Route.get("/renderEmailTemplate", async (req, res) => {
  try {
    let { email, otp } = req.session;
    const htmlContent = await render_Email_Template({ email, otp });

    const mail = new Mail();
    mail.setTo(email);
    mail.setSubject("Password Reset");
    mail.sethtml(htmlContent);

    await mail.send();

    res.render("./User/verify-otp", { email: email });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

Route.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    let verify = otpgenerator.verify(email, otp);
    if (verify) {
      res.render("User/resetPassword", { email });
    } else {
      res.redirect("/notes/login");
    }

    res.render("User/resetPassword", { email }); // Pass email to template
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

Route.post("/update-password", async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).send("Passwords do not match!");
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send("User not found.");
    }

    // Use passport-local-mongoose's setPassword method to update the password
    await user.setPassword(password);

    // Save the user with the updated password
    await user.save();

    req.flash("Password reset successful!");
    res.redirect("/");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

//  GET: Logout
Route.get("/notes/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "logged you out!");
    res.redirect("/");
  });
});

module.exports = Route;

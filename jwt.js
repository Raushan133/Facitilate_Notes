const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { Token } = require("./models/user.js");

const secret = "Hello, I am a full stack developer";

// ✅ Generate a random 12-character string for short URLs
function generateShortId() {
  return crypto.randomBytes(6).toString("hex");
}

// ✅ Generate JWT token and store in MongoDB
const generateAccessToken = async (payload) => {
  if (!payload || typeof payload !== "object") {
    throw new Error("Payload must be a valid object");
  }

  // Generate JWT token (valid for 30 minutes)
  let token = jwt.sign(payload, secret, { expiresIn: "60m" });

  // Generate a unique short ID
  const shortId = generateShortId();
  console.log(token);
  console.log(shortId);

  // Store in MongoDB
  await Token.create({ shortId, token });

  return shortId; // Return short ID (to be sent in the email)
};

// ✅ Verify Token from MongoDB
const verifyToken = async (id) => {
  try {
    const tokenData = await Token.findOne({ shortId: id });
    if (!tokenData) {
      return { status: false, message: "Invalid or expired verification link" };
    }

    let decoded = jwt.verify(tokenData.token, secret);

    // ✅ Delete token after successful verification (prevent reuse)
    await Token.deleteOne({ shortId: id });

    return {
      status: true,
      payload: decoded,
      message: "Email verified successfully",
    };
  } catch (error) {
    return { status: false, message: error.message };
  }
};

module.exports = { generateAccessToken, verifyToken };

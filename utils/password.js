// password hashing w/ node's built in crypto module (no npm install needed)
const crypto = require("crypto");

// secret key mixed into every hash, keep it private (just like JWT_SECRET)
const PASSWORD_SECRET = "campus_password_secret_key";

// makes the HMAC-SHA256 hash of salt + password using our secret key
const makeHash = (salt, password) => {
  return crypto.createHmac("sha256", PASSWORD_SECRET).update(salt + password).digest("hex");
};

// plain password -> "salt:hash" (this is what we save in db)
// salt = random text, so 2 users w/ same password still get diff hashes
const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  return salt + ":" + makeHash(salt, password);
};

// chk a typed password against the saved "salt:hash" -> true / false
const checkPassword = (password, saved) => {
  // split saved value back into salt n hash, bad format -> false
  const [salt, hash] = String(saved).split(":");
  if (!salt || !hash) {
    return false;
  }
  // hash the typed password w/ the SAME salt, then compare
  const newHash = makeHash(salt, password);
  if (newHash.length !== hash.length) {
    return false;
  }
  // timingSafeEqual = compare w/o leaking how many chars matched
  return crypto.timingSafeEqual(Buffer.from(newHash), Buffer.from(hash));
};

module.exports = { hashPassword, checkPassword };

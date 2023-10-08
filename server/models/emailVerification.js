import mongoose, { Schema } from "mongoose";

const emailVerificationSchema = Schema({
  userId: String,
  token: String,
  createdAt: String,
  expiresAt: String,
});

const Verification = mongoose.model("Verification", emailVerificationSchema);
export default Verification;

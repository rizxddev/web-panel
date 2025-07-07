import mongoose from "mongoose";
const resellerSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String, // Saran: hash password di production!
});
export default mongoose.models.Reseller || mongoose.model("Reseller", resellerSchema);
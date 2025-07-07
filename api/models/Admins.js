import mongoose from "mongoose";
const adminSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  email: String,
  password: String, // hash di production!
  role: { type: String, default: "admin" }
});
export default mongoose.models.Admin || mongoose.model("Admin", adminSchema);
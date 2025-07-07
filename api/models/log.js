import mongoose from "mongoose";
const logSchema = new mongoose.Schema({
  time: String,
  user: String,
  action: String,
  desc: String,
});
export default mongoose.models.Log || mongoose.model("Log", logSchema);
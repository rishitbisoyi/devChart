import mongoose from "mongoose";

const AnnouncementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    author: { type: String, default: "Team", trim: true },
    pinned: { type: Boolean, default: false },
    emoji: { type: String, default: "📢" },
  },
  { timestamps: true }
);

const Announcement =
  mongoose.models.Announcement ||
  mongoose.model("Announcement", AnnouncementSchema);

export default Announcement;

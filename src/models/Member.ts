import mongoose from "mongoose";

const MemberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
    },

    role: {
      type: String,
      enum: ["admin", "lead", "member"],
      default: "member",
    },
  },
  {
    timestamps: true,
  }
);

const Member =
  mongoose.models.Member ||
  mongoose.model("Member", MemberSchema);

export default Member;
import mongoose from "mongoose";

const SprintSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    goal: { type: String, default: "", trim: true },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    status: { type: String, enum: ["planned", "active", "completed"], default: "planned" },
    color: { type: String, default: "#3ddc84" },
  },
  { timestamps: true }
);

const Sprint = mongoose.models.Sprint || mongoose.model("Sprint", SprintSchema);
export default Sprint;

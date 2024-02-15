import mongoose from "mongoose";

const appliedUserSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  user: {
    type: {
      _id: mongoose.Schema.Types.ObjectId,
      firstName: String,
      lastName: String,
      email: String,
    },
    required: true
  },
  job: {
    type: {
      _id: mongoose.Schema.Types.ObjectId,
      company: {
        _id: mongoose.Schema.Types.ObjectId,
        name: String
      },
      jobTitle: String
    },
    required: true
  },
  appliedAt: { type: Date, default: Date.now() }
});

const AppliedUser = mongoose.model("AppliedUser", appliedUserSchema);

export default AppliedUser;

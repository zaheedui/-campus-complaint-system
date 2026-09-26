const mongoose = require('mongoose');

const complaintReportSchema = new mongoose.Schema({
  postgresComplaintId: Number,   // links back to the MySQL `complaints.id` (name kept for consistency, still refers to your MySQL row)
  category: {
    type: String,
    enum: ['lost_item', 'found_item', 'maintenance', 'ragging'],
    required: true
  },
  description: { type: String, required: true },

  // lost_item / found_item only
  location: String,
  photoUrl: String,

  // maintenance only
  roomNumber: String,
  issueType: String,

  isAnonymous: { type: Boolean, default: false },
  filedByUserId: Number,   // deliberately omitted entirely when isAnonymous is true — see seed script

  comments: [{
    userId: Number,
    text: String,
    timestamp: { type: Date, default: Date.now }
  }],

  createdAt: { type: Date, default: Date.now }
});

complaintReportSchema.index({ description: 'text', location: 'text' });

module.exports = mongoose.model('ComplaintReport', complaintReportSchema);
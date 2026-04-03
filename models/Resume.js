const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  data: { type: Object, default: {} }, 
});

module.exports = mongoose.model('Resume', ResumeSchema);
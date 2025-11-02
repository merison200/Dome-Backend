import mongoose from 'mongoose';

const ClubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  date: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\d{4}-\d{2}-\d{2}$/.test(v);
      },
      message: 'Date must be in YYYY-MM-DD format'
    }
  },
  time: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^(1[0-2]|[1-9]):[0-5][0-9]\s?(AM|PM)$/i.test(v);
      },
      message: 'Time must be in format like "9:00 PM"'
    }
  },
  dj: [{
    type: String,
    required: true,
    trim: true
  }],
  hypeman: [{
    type: String,
    required: true,
    trim: true
  }],
  images: [{
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+\..+/.test(v);
      },
      message: 'Image must be a valid URL'
    }
  }],
  labels: [{
    type: String,
    required: true,
    trim: true
  }]
}, {
  timestamps: true,
});


const Event = mongoose.model('Event', ClubSchema);

export default Event;
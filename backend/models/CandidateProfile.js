const mongoose = require('mongoose');

const candidateProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: String,
  location: String,
  
  summary: String, // AI-generated
  
  experience: [{
    title: String,
    company: String,
    duration: String,
    description: String,
    highlights: [String]
  }],
  
  skills: [String],
  
  projects: [{
    name: String,
    description: String,
    technologies: [String],
    highlights: [String],
    link: String
  }],
  
  education: [{
    degree: String,
    institution: String,
    year: String,
    grade: String
  }],
  
  completionPercentage: {
    type: Number,
    default: 0
  },
  
  isComplete: {
    type: Boolean,
    default: false
  },
  
  shareId: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

// Calculate completion percentage
candidateProfileSchema.methods.calculateCompletion = function() {
  let score = 0;
  const weights = {
    fullName: 10,
    email: 10,
    phone: 5,
    location: 5,
    summary: 15,
    experience: 20,
    skills: 15,
    projects: 15,
    education: 5
  };

  if (this.fullName) score += weights.fullName;
  if (this.email) score += weights.email;
  if (this.phone) score += weights.phone;
  if (this.location) score += weights.location;
  if (this.summary) score += weights.summary;
  if (this.experience && this.experience.length > 0) score += weights.experience;
  if (this.skills && this.skills.length >= 5) score += weights.skills;
  if (this.projects && this.projects.length > 0) score += weights.projects;
  if (this.education && this.education.length > 0) score += weights.education;

  this.completionPercentage = score;
  this.isComplete = score >= 85;
};

module.exports = mongoose.model('CandidateProfile', candidateProfileSchema);
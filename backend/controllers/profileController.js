const CandidateProfile = require('../models/CandidateProfile');
const aiService = require('../services/aiService');

const calcCompletion = (profile) => {
  let score = 0;
  if (profile.fullName) score += 10;
  if (profile.email) score += 10;
  if (profile.phone) score += 5;
  if (profile.location) score += 5;
  if (profile.summary) score += 15;
  if (profile.experience?.length > 0) score += 20;
  if (profile.skills?.length >= 5) score += 15;
  if (profile.projects?.length > 0) score += 15;
  if (profile.education?.length > 0) score += 5;
  profile.completionPercentage = score;
  profile.isComplete = score >= 85;
};

exports.getProfile = async (req, res) => {
  try {
    let profile = await CandidateProfile.findOne({ userId: req.user.id });
    if (!profile) {
      profile = await CandidateProfile.create({
        userId: req.user.id,
        email: req.user.email,
        fullName: req.user.email.split('@')[0],
        experience: [], skills: [], projects: [], education: []
      });
    }
    res.json(profile);
  } catch (error) {
    console.error('getProfile error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.aiStructureExperience = async (req, res) => {
  try {
    const { rawText } = req.body;
    if (!rawText || rawText.trim().length < 10) return res.status(400).json({ error: 'Please provide more details' });
    const structured = await aiService.structureExperience(rawText);
    res.json({ success: true, data: structured });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.aiSuggestSkills = async (req, res) => {
  try {
    const { experience, projects } = req.body;
    const skills = await aiService.suggestSkills(experience || [], projects || []);
    res.json({ success: true, skills });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.aiGenerateSummary = async (req, res) => {
  try {
    const profile = await CandidateProfile.findOne({ userId: req.user.id });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    const summary = await aiService.generateSummary({
      fullName: profile.fullName,
      experience: profile.experience,
      skills: profile.skills,
      education: profile.education
    });
    profile.summary = summary;
    await profile.save();
    res.json({ success: true, summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.aiStructureProject = async (req, res) => {
  try {
    const { rawText } = req.body;
    const structured = await aiService.structureProject(rawText);
    res.json({ success: true, data: structured });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    let profile = await CandidateProfile.findOne({ userId: req.user.id });
    if (!profile) {
      profile = new CandidateProfile({
        userId: req.user.id,
        email: req.user.email,
        fullName: req.body.fullName || req.user.email.split('@')[0],
        ...req.body
      });
    } else {
      Object.keys(req.body).forEach(key => {
        if (req.body[key] !== undefined) profile[key] = req.body[key];
      });
    }
    calcCompletion(profile);
    await profile.save();
    res.json({ success: true, profile });
  } catch (error) {
    console.error('updateProfile error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.getAllCandidates = async (req, res) => {
  try {
    const profiles = await CandidateProfile.find({
      fullName: { $ne: '' },
      $or: [
        { experience: { $exists: true, $not: { $size: 0 } } },
        { skills: { $exists: true, $not: { $size: 0 } } }
      ]
    }).select('-userId').sort({ createdAt: -1 });
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCandidateById = async (req, res) => {
  try {
    const profile = await CandidateProfile.findById(req.params.id);
    if (!profile) return res.status(404).json({ error: 'Candidate not found' });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const CandidateProfile = require('../models/CandidateProfile');
const aiService = require('../services/aiService');

const calcScore = (body) => {
  let score = 0;
  if (body.fullName) score += 10;
  if (body.email) score += 10;
  if (body.phone) score += 5;
  if (body.location) score += 5;
  if (body.summary) score += 15;
  if (body.experience?.length > 0) score += 20;
  if (body.skills?.length >= 5) score += 15;
  if (body.projects?.length > 0) score += 15;
  if (body.education?.length > 0) score += 5;
  return score;
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
    // Use findOneAndUpdate to avoid version conflicts
    await CandidateProfile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { summary } },
      { new: true }
    );
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
    const body = req.body;
    const score = calcScore(body);

    const profile = await CandidateProfile.findOneAndUpdate(
      { userId: req.user.id },
      {
        $set: {
          ...body,
          completionPercentage: score,
          isComplete: score >= 85
        }
      },
      { new: true, upsert: true, runValidators: false }
    );

    res.json({ success: true, profile });
  } catch (error) {
    console.error('updateProfile error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.getAllCandidates = async (req, res) => {
  try {
    const profiles = await CandidateProfile.find({ fullName: { $ne: '' } })
      .select('-userId')
      .sort({ createdAt: -1 });
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
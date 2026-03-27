const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const auth = require('../middleware/auth');

// Candidate routes
router.get('/profile', auth, profileController.getProfile);
router.put('/profile', auth, profileController.updateProfile);

// AI routes
router.post('/ai/structure-experience', auth, profileController.aiStructureExperience);
router.post('/ai/structure-project', auth, profileController.aiStructureProject);
router.post('/ai/suggest-skills', auth, profileController.aiSuggestSkills);
router.post('/ai/generate-summary', auth, profileController.aiGenerateSummary);

// Recruiter routes
router.get('/candidates', auth, profileController.getAllCandidates);
router.get('/candidate/:id', auth, profileController.getCandidateById);

module.exports = router;
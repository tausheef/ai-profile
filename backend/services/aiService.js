const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const MODEL = 'llama-3.3-70b-versatile';

class AIService {

  // Structure work experience from natural language
  async structureExperience(rawText) {
    try {
      const response = await groq.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: "You are an expert at extracting structured job information. Always respond with valid JSON only, no markdown or explanations."
          },
          {
            role: "user",
            content: `Extract structured information from this work experience:
"${rawText}"

Return ONLY a JSON object with these fields:
{
  "title": "job title",
  "company": "company name",
  "duration": "time period",
  "description": "brief description",
  "highlights": ["key achievement 1", "key achievement 2"]
}`
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      });

      const content = response.choices[0].message.content;
      const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanedContent);

    } catch (error) {
      console.error('AI structure experience error:', error);
      throw new Error('Failed to structure experience');
    }
  }

  // Suggest skills based on experience and projects
  async suggestSkills(experience, projects) {
    try {
      const response = await groq.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: "You are a skilled technical recruiter. Extract relevant skills from job descriptions and projects. Return ONLY a JSON array of skills."
          },
          {
            role: "user",
            content: `Based on this experience and projects, suggest 10-15 relevant technical skills:

Experience: ${JSON.stringify(experience)}
Projects: ${JSON.stringify(projects)}

Return ONLY a JSON array like: ["React", "Node.js", "MongoDB", ...]`
          }
        ],
        temperature: 0.4,
        max_tokens: 300
      });

      const content = response.choices[0].message.content;
      const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanedContent);

    } catch (error) {
      console.error('AI suggest skills error:', error);
      throw new Error('Failed to suggest skills');
    }
  }

  // Generate professional summary from profile data
  async generateSummary(profileData) {
    try {
      const response = await groq.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: "You are a professional resume writer. Create compelling, concise professional summaries."
          },
          {
            role: "user",
            content: `Create a professional summary (2-3 sentences) for this candidate:

Name: ${profileData.fullName}
Experience: ${JSON.stringify(profileData.experience)}
Skills: ${JSON.stringify(profileData.skills)}
Education: ${JSON.stringify(profileData.education)}

Write in third person, highlight key strengths and experience.`
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      });

      return response.choices[0].message.content.trim();

    } catch (error) {
      console.error('AI generate summary error:', error);
      throw new Error('Failed to generate summary');
    }
  }

  // Extract project details
  async structureProject(rawText) {
    try {
      const response = await groq.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: "Extract structured project information. Return valid JSON only."
          },
          {
            role: "user",
            content: `Extract project details from:
"${rawText}"

Return ONLY JSON:
{
  "name": "project name",
  "description": "what it does",
  "technologies": ["tech1", "tech2"],
  "highlights": ["key feature 1", "key feature 2"]
}`
          }
        ],
        temperature: 0.3,
        max_tokens: 400
      });

      const content = response.choices[0].message.content;
      const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanedContent);

    } catch (error) {
      console.error('AI structure project error:', error);
      throw new Error('Failed to structure project');
    }
  }

  // Recommend job roles based on profile
  async recommendRoles(profileData) {
    try {
      const response = await groq.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: "You are a career counselor. Recommend suitable job roles based on candidate profiles."
          },
          {
            role: "user",
            content: `Based on this profile, suggest 5 suitable job roles:

Skills: ${JSON.stringify(profileData.skills)}
Experience: ${JSON.stringify(profileData.experience)}

Return ONLY a JSON array of role names: ["Role 1", "Role 2", ...]`
          }
        ],
        temperature: 0.5,
        max_tokens: 200
      });

      const content = response.choices[0].message.content;
      const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanedContent);

    } catch (error) {
      console.error('AI recommend roles error:', error);
      throw new Error('Failed to recommend roles');
    }
  }
}

module.exports = new AIService();
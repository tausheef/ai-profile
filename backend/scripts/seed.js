require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const CandidateProfile = require('../models/CandidateProfile');

const seedDemoUser = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete existing demo user if exists
    await User.deleteOne({ email: 'hire-me@anshumat.org' });
    await CandidateProfile.deleteOne({ email: 'hire-me@anshumat.org' });
    console.log('🗑️  Cleared existing demo data');

    // Create demo user
    const demoUser = await User.create({
      email: 'hire-me@anshumat.org',
      password: 'HireMe@2025!', // Will be hashed automatically by pre-save hook
      role: 'candidate'
    });
    console.log('✅ Demo user created');

    // Create demo profile
    const demoProfile = await CandidateProfile.create({
      userId: demoUser._id,
      fullName: 'Tauseex Ahmad',
      email: 'hire-me@anshumat.org',
      phone: '+91-9876543210',
      location: 'Delhi, India',
      
      summary: 'Experienced Full Stack Developer specializing in MERN stack with 2+ years of building scalable web applications. Proven track record in developing ERP systems, e-commerce platforms, and AI-powered solutions.',
      
      experience: [
        {
          title: 'Full Stack Developer',
          company: 'Urban Club Logistics',
          duration: '2023 - Present',
          description: 'Leading development of transport management ERP system',
          highlights: [
            'Built complete MERN stack ERP handling 1000+ daily dockets',
            'Implemented real-time tracking and automated invoicing',
            'Reduced manual data entry by 70% through AI-assisted forms'
          ]
        },
        {
          title: 'Frontend Developer',
          company: 'TechCorp Solutions',
          duration: '2021 - 2023',
          description: 'Developed responsive web applications for various clients',
          highlights: [
            'Created 15+ client projects using React and Vue.js',
            'Improved page load times by 40% through optimization',
            'Mentored 3 junior developers'
          ]
        }
      ],
      
      skills: [
        'JavaScript', 'React.js', 'Node.js', 'Express.js', 
        'MongoDB', 'MySQL', 'RESTful APIs', 'Git',
        'HTML5', 'CSS3', 'Tailwind CSS', 'Bootstrap',
        'Redux', 'JWT Authentication', 'Docker'
      ],
      
      projects: [
        {
          name: 'AI Recruitment Platform',
          description: 'Built an AI-powered recruitment system using Groq API for intelligent profile building',
          technologies: ['React', 'Node.js', 'MongoDB', 'Groq AI', 'Tailwind CSS'],
          highlights: [
            'Implemented AI-assisted profile creation',
            'Real-time skill suggestions and auto-complete',
            'PDF export and profile sharing features'
          ],
          link: 'https://github.com/yourusername/ai-recruiter'
        },
        {
          name: 'E-Commerce Dashboard',
          description: 'Admin panel for managing products, orders, and customer data',
          technologies: ['React', 'Redux', 'Chart.js', 'Express'],
          highlights: [
            'Real-time analytics and reporting',
            'Inventory management system',
            'Order tracking and fulfillment'
          ],
          link: 'https://github.com/yourusername/ecommerce-admin'
        }
      ],
      
      education: [
        {
          degree: 'Bachelor of Technology in Computer Science',
          institution: 'Delhi University',
          year: '2021',
          grade: '8.5 CGPA'
        }
      ],
      
      completionPercentage: 100,
      isComplete: true,
      shareId: 'demo-tauseex-' + Date.now()
    });

    console.log('✅ Demo profile created');
    console.log('\n📋 Demo Login Credentials:');
    console.log('   Email: hire-me@anshumat.org');
    console.log('   Password: HireMe@2025!');
    console.log('\n🎉 Seeding completed successfully!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDemoUser();
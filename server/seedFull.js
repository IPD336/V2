require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Swap = require('./models/Swap');
const Review = require('./models/Review');
const Team = require('./models/Team');
const Notification = require('./models/Notification');
const { SWAP_STATUS, TEAM_STATUS, MEMBER_STATUS, BADGES, AVATAR_COLORS, AVG_RATING_PRECISION } = require('./constants');

const PASSWORD = 'password123';

// ── 30 Users ───────────────────────────────────────────────────────────────
const userData = [
  { name: 'James Wilson',    email: 'james@skillswap.net',     location: 'San Francisco',  bio: 'Full-stack dev teaching Django, learning modern frontend.',         skillsOffered: [{name:'Python',category:'Backend',verified:true},{name:'Django',category:'Backend',verified:true}], skillsWanted: ['React','TypeScript'],         availability:'Evenings',        languages:['English'],                league:{name:'Silver',color:'#C0C0C0'}, badges:[BADGES.EARLY_BIRD] },
  { name: 'Priya Kapoor',     email: 'priya@skillswap.net',      location: 'London',         bio: 'Frontend lead who wants to go full-stack with Python and AWS.',      skillsOffered: [{name:'React',category:'Frontend',verified:true},{name:'TypeScript',category:'Frontend',verified:true}], skillsWanted: ['Python','AWS'],              availability:'Weekends',       languages:['English','Hindi'], league:{name:'Gold',color:'#FFD700'},   badges:[BADGES.SUPER_MENTOR,BADGES.EARLY_BIRD] },
  { name: 'Hiro Tanaka',      email: 'hiro@skillswap.net',       location: 'Tokyo',          bio: 'Infrastructure engineer shipping Go and K8s. Learning Rust.',          skillsOffered: [{name:'Go',category:'Backend',verified:true},{name:'Kubernetes',category:'DevOps',verified:false}], skillsWanted: ['Rust','WebAssembly'],       availability:'Weekday Mornings', languages:['Japanese','English'],  league:{name:'Bronze',color:'#CD7F32'}, badges:[] },
  { name: 'Maria Oliveira',   email: 'maria@skillswap.net',      location: 'São Paulo',      bio: 'Designer turned developer — teaching Figma, learning React.',          skillsOffered: [{name:'Figma',category:'Design',verified:true},{name:'UX Design',category:'Design',verified:true}], skillsWanted: ['React','Node.js'],          availability:'Evenings',       languages:['Portuguese','English'],  league:{name:'Silver',color:'#C0C0C0'}, badges:[BADGES.EARLY_BIRD] },
  { name: 'Oluwaseun Adeyemi',email: 'olu@skillswap.net',       location: 'Lagos',          bio: 'Java veteran exploring containers and microservices.',               skillsOffered: [{name:'Java',category:'Backend',verified:true},{name:'Spring Boot',category:'Backend',verified:true}], skillsWanted: ['Go','Docker'],             availability:'Flexible / Any Time', languages:['English','Yoruba'],  league:{name:'Bronze',color:'#CD7F32'}, badges:[] },
  { name: 'Emma Richardson',  email: 'emma@skillswap.net',       location: 'Sydney',         bio: 'Mobile dev with Flutter. Want to branch into AI/ML.',                 skillsOffered: [{name:'Flutter',category:'Mobile',verified:true},{name:'Dart',category:'Mobile',verified:true}], skillsWanted: ['Python','Machine Learning'], availability:'Weekends',      languages:['English'],  league:{name:'Silver',color:'#C0C0C0'}, badges:[BADGES.EARLY_BIRD] },
  { name: 'Dmitri Volkov',    email: 'dmitri@skillswap.net',     location: 'Berlin',         bio: 'Systems programmer diving into web tech for side projects.',           skillsOffered: [{name:'C++',category:'Backend',verified:true},{name:'Rust',category:'Backend',verified:false}], skillsWanted: ['React','TypeScript'],       availability:'Evenings',       languages:['Russian','German','English'], league:{name:'Bronze',color:'#CD7F32'}, badges:[] },
  { name: 'Aisha Mohammed',   email: 'aisha@skillswap.net',      location: 'Dubai',          bio: 'Data scientist who wants to build production mobile apps.',           skillsOffered: [{name:'Python',category:'Data Science',verified:true},{name:'Data Analysis',category:'Data Science',verified:true}], skillsWanted: ['Flutter','Mobile Dev'],   availability:'Flexible / Any Time', languages:['Arabic','English'],  league:{name:'Bronze',color:'#CD7F32'}, badges:[] },
  { name: 'Carlos Garcia',    email: 'carlos@skillswap.net',     location: 'Mexico City',    bio: 'Node.js backend dev wanting to own the full DevOps pipeline.',         skillsOffered: [{name:'Node.js',category:'Backend',verified:true},{name:'Express',category:'Backend',verified:true}], skillsWanted: ['AWS','DevOps'],            availability:'Evenings',       languages:['Spanish','English'],  league:{name:'Silver',color:'#C0C0C0'}, badges:[BADGES.EARLY_BIRD] },
  { name: 'Fatima Al-Rashid', email: 'fatima@skillswap.net',     location: 'Riyadh',         bio: 'UI/UX designer coding her own prototypes. Next stop: frontend dev.',    skillsOffered: [{name:'UI/UX',category:'Design',verified:true},{name:'Figma',category:'Design',verified:true}], skillsWanted: ['React','JavaScript'],      availability:'Weekends',       languages:['Arabic','English'], league:{name:'Gold',color:'#FFD700'},   badges:[BADGES.SUPER_MENTOR] },
  { name: 'Liam O\'Brien',    email: 'liam@skillswap.net',       location: 'Dublin',         bio: 'DevOps engineer automating everything. Curious about ML pipelines.',    skillsOffered: [{name:'Docker',category:'DevOps',verified:true},{name:'CI/CD',category:'DevOps',verified:true}], skillsWanted: ['Python','Machine Learning'], availability:'Flexible / Any Time', languages:['English'],  league:{name:'Silver',color:'#C0C0C0'}, badges:[BADGES.EARLY_BIRD] },
  { name: 'Wei Zhang',        email: 'wei@skillswap.net',        location: 'Singapore',      bio: 'ML engineer expanding into full-stack to ship end-to-end products.',   skillsOffered: [{name:'Machine Learning',category:'Data Science',verified:true},{name:'Python',category:'Data Science',verified:true}], skillsWanted: ['React','Node.js'],         availability:'Weekday Mornings', languages:['Mandarin','English'],  league:{name:'Silver',color:'#C0C0C0'}, badges:[BADGES.EARLY_BIRD] },
  { name: 'Amara Okafor',     email: 'amara@skillswap.net',      location: 'Accra',          bio: 'Flutter dev aiming for cloud-native mobile backends.',                skillsOffered: [{name:'Flutter',category:'Mobile',verified:true},{name:'Firebase',category:'Mobile',verified:false}], skillsWanted: ['AWS','Cloud'],             availability:'Evenings',       languages:['English','Twi'],  league:{name:'Bronze',color:'#CD7F32'}, badges:[] },
  { name: 'Luca Ricci',       email: 'luca@skillswap.net',       location: 'Milan',          bio: 'Graphic designer learning to code interactive web experiences.',      skillsOffered: [{name:'Graphic Design',category:'Design',verified:true},{name:'Illustration',category:'Design',verified:true}], skillsWanted: ['JavaScript','CSS/HTML'],    availability:'Evenings',       languages:['Italian','English'],  league:{name:'Bronze',color:'#CD7F32'}, badges:[] },
  { name: 'Omar Hassan',      email: 'omar@skillswap.net',       location: 'Cairo',          bio: 'Backend specialist diving into AI and data pipelines.',               skillsOffered: [{name:'Node.js',category:'Backend',verified:true},{name:'PostgreSQL',category:'Backend',verified:true}], skillsWanted: ['AI','Machine Learning'],    availability:'Flexible / Any Time', languages:['Arabic','English'],  league:{name:'Bronze',color:'#CD7F32'}, badges:[] },
  { name: 'Chloe Dubois',     email: 'chloe@skillswap.net',      location: 'Paris',          bio: 'Frontend engineer with an eye for design. Learning infra.',            skillsOffered: [{name:'React',category:'Frontend',verified:true},{name:'Vue.js',category:'Frontend',verified:true}], skillsWanted: ['Docker','AWS'],            availability:'Weekends',       languages:['French','English'], league:{name:'Gold',color:'#FFD700'},   badges:[BADGES.SUPER_MENTOR,BADGES.EARLY_BIRD] },
  { name: 'Hana Kim',         email: 'hana@skillswap.net',       location: 'Seoul',          bio: 'Frontend pro teaching React. Backend is the next frontier.',           skillsOffered: [{name:'React',category:'Frontend',verified:true},{name:'Next.js',category:'Frontend',verified:true}], skillsWanted: ['Java','Spring Boot'],      availability:'Weekday Mornings', languages:['Korean','English'],  league:{name:'Silver',color:'#C0C0C0'}, badges:[BADGES.EARLY_BIRD] },
  { name: 'Ingrid Johansson', email: 'ingrid@skillswap.net',     location: 'Oslo',           bio: 'UX researcher who builds her own prototypes. Now learning to code.',    skillsOffered: [{name:'UX Research',category:'Design',verified:true},{name:'User Testing',category:'Design',verified:true}], skillsWanted: ['React','JavaScript'],      availability:'Flexible / Any Time', languages:['Norwegian','English'],  league:{name:'Bronze',color:'#CD7F32'}, badges:[] },
  { name: 'Diego Fernandez',  email: 'diego@skillswap.net',      location: 'Buenos Aires',   bio: 'Full-stack JS dev transitioning to data science.',                    skillsOffered: [{name:'JavaScript',category:'Frontend',verified:true},{name:'Node.js',category:'Backend',verified:true}], skillsWanted: ['Python','Data Science'],    availability:'Evenings',       languages:['Spanish','English'],  league:{name:'Bronze',color:'#CD7F32'}, badges:[] },
  { name: 'Linh Nguyen',      email: 'linh@skillswap.net',       location: 'Ho Chi Minh City', bio: 'TypeScript dev going cloud-native with Kubernetes.',                skillsOffered: [{name:'TypeScript',category:'Frontend',verified:true},{name:'React',category:'Frontend',verified:true}], skillsWanted: ['Kubernetes','DevOps'],     availability:'Weekends',       languages:['Vietnamese','English'],  league:{name:'Silver',color:'#C0C0C0'}, badges:[BADGES.EARLY_BIRD] },
  { name: 'Sarah Cohen',      email: 'sarahc@skillswap.net',     location: 'Tel Aviv',       bio: 'Cybersecurity engineer who wants to build secure web apps.',           skillsOffered: [{name:'Cybersecurity',category:'DevOps',verified:true},{name:'Python',category:'Data Science',verified:true}], skillsWanted: ['React','Frontend'],        availability:'Weekday Mornings', languages:['Hebrew','English'],  league:{name:'Silver',color:'#C0C0C0'}, badges:[BADGES.EARLY_BIRD] },
  { name: 'Michael Brown',    email: 'michaelb@skillswap.net',   location: 'Johannesburg',   bio: 'Java monolithic dev modernising with cloud-native Go.',                skillsOffered: [{name:'Java',category:'Backend',verified:true},{name:'Spring',category:'Backend',verified:true}], skillsWanted: ['Go','Cloud Native'],       availability:'Flexible / Any Time', languages:['English','Afrikaans'],  league:{name:'Bronze',color:'#CD7F32'}, badges:[] },
  { name: 'Nina Kowalski',    email: 'nina@skillswap.net',       location: 'Warsaw',         bio: 'Kotlin mobile dev expanding into full-stack web development.',         skillsOffered: [{name:'Kotlin',category:'Mobile',verified:true},{name:'Android',category:'Mobile',verified:true}], skillsWanted: ['React','Node.js'],          availability:'Evenings',       languages:['Polish','English'],  league:{name:'Bronze',color:'#CD7F32'}, badges:[] },
  { name: 'Yuki Sato',        email: 'yuki@skillswap.net',       location: 'Osaka',          bio: 'React & Next.js developer learning backend with Go.',                  skillsOffered: [{name:'React',category:'Frontend',verified:true},{name:'Next.js',category:'Frontend',verified:true}], skillsWanted: ['Go','Backend'],            availability:'Weekends',       languages:['Japanese','English'],  league:{name:'Bronze',color:'#CD7F32'}, badges:[] },
  { name: 'Svetlana Petrov',  email: 'svetlana@skillswap.net',   location: 'Moscow',         bio: 'Python/Django veteran learning modern frontend frameworks.',          skillsOffered: [{name:'Python',category:'Backend',verified:true},{name:'Django',category:'Backend',verified:true}], skillsWanted: ['React','TypeScript'],       availability:'Flexible / Any Time', languages:['Russian','English'],  league:{name:'Silver',color:'#C0C0C0'}, badges:[BADGES.EARLY_BIRD] },
  { name: 'Ahmed Khan',       email: 'ahmedk@skillswap.net',     location: 'Karachi',        bio: 'PHP/Laravel dev modernising his stack with React and Node.',           skillsOffered: [{name:'PHP',category:'Backend',verified:true},{name:'Laravel',category:'Backend',verified:true}], skillsWanted: ['React','Node.js'],          availability:'Evenings',       languages:['Urdu','English'],  league:{name:'Bronze',color:'#CD7F32'}, badges:[] },
  { name: 'Aya Nakamura',     email: 'aya@skillswap.net',        location: 'Nagoya',         bio: 'CSS/HTML designer coding her way to full-stack React development.',     skillsOffered: [{name:'CSS/HTML',category:'Frontend',verified:true},{name:'Design',category:'Design',verified:true}], skillsWanted: ['JavaScript','React'],       availability:'Weekends',       languages:['Japanese','English'],  league:{name:'Silver',color:'#C0C0C0'}, badges:[BADGES.EARLY_BIRD] },
  { name: 'Bjorn Eriksson',   email: 'bjorn@skillswap.net',      location: 'Stockholm',      bio: 'React Native dev wanting to build backend services in Go.',            skillsOffered: [{name:'React Native',category:'Mobile',verified:true},{name:'TypeScript',category:'Frontend',verified:true}], skillsWanted: ['Go','Backend'],            availability:'Weekday Mornings', languages:['Swedish','English'],  league:{name:'Bronze',color:'#CD7F32'}, badges:[] },
  { name: 'Nalini Patel',     email: 'nalini@skillswap.net',     location: 'Toronto',        bio: 'Data analyst teaching SQL, picking up React for dashboards.',          skillsOffered: [{name:'SQL',category:'Data Science',verified:true},{name:'Data Analysis',category:'Data Science',verified:true}], skillsWanted: ['React','JavaScript'],       availability:'Evenings',       languages:['English','Hindi','Punjabi'], league:{name:'Silver',color:'#C0C0C0'}, badges:[BADGES.EARLY_BIRD] },
  { name: 'Raj Singh',        email: 'raj@skillswap.net',        location: 'Mumbai',         bio: 'Cloud architect teaching AWS, learning Python for data pipelines.',     skillsOffered: [{name:'AWS',category:'DevOps',verified:true},{name:'Terraform',category:'DevOps',verified:true}], skillsWanted: ['Python','FastAPI'],        availability:'Flexible / Any Time', languages:['Hindi','English'],  league:{name:'Gold',color:'#FFD700'},   badges:[BADGES.SUPER_MENTOR,BADGES.EARLY_BIRD] },
];

// ── Swap pair definitions (index pairs into createdUsers) ──────────────────
// Each entry: [senderIdx, receiverIdx, status, skillOffered, skillWanted, message]
const swapDefs = [
  // --- Completed swaps (will get reviews) ---
  [0, 1, 'completed', 'Python', 'React',       'Would love to learn React from you! Happy to teach Python.'],
  [2, 3, 'completed', 'Go', 'Figma',            'I can help you with Go if you show me Figma basics.'],
  [4, 5, 'completed', 'Java', 'Flutter',        'Java for Flutter trade — perfect match!'],
  [6, 7, 'completed', 'C++', 'Python',          'Teach you C++ in exchange for Python data skills.'],
  [8, 9, 'completed', 'Node.js', 'UI/UX',       'Backend for design swap — let\'s do it!'],
  [10, 11, 'completed', 'Docker', 'ML',         'DevOps for ML — interesting cross-pollination.'],
  [12, 13, 'completed', 'Flutter', 'Design',    'Mobile dev for design skills — ship apps with style.'],
  [14, 15, 'completed', 'PostgreSQL', 'Vue.js', 'Database expertise for frontend mastery.'],
  [16, 17, 'completed', 'Next.js', 'UX',        'Frontend framework for user research insights.'],
  [18, 19, 'completed', 'JavaScript', 'K8s',    'JS fundamentals for container orchestration.'],
  [20, 21, 'completed', 'TypeScript', 'Go',     'TypeScript patterns for Go concurrency.'],
  [22, 23, 'completed', 'Kotlin', 'React',      'Android dev skills for React expertise.'],
  [24, 25, 'completed', 'Django', 'Node.js',    'Django architecture for Node.js microservices.'],
  [26, 27, 'completed', 'React Native', 'AWS',  'Mobile dev for cloud infrastructure trade.'],
  [28, 29, 'completed', 'SQL', 'Terraform',     'Data querying skills for infrastructure as code.'],

  // --- Active swaps ---
  [1, 2, 'active', 'TypeScript', 'Go',          'TypeScript types for Go interfaces trade.'],
  [3, 4, 'active', 'React', 'Java',             'React components for Spring Boot APIs.'],
  [5, 6, 'active', 'Flutter', 'Rust',           'Cross-platform mobile for systems programming.'],
  [7, 8, 'active', 'Data Analysis', 'AWS',      'Analytics skills for cloud deployment expertise.'],
  [9, 10, 'active', 'Figma', 'DevOps',          'Design handoff for CI/CD pipeline knowledge.'],
  [11, 12, 'active', 'Python', 'Firebase',      'ML pipelines for Firebase backend skills.'],
  [13, 14, 'active', 'Illustration', 'Node.js', 'Visual assets for API development.'],
  [15, 16, 'active', 'React', 'Java',           'Frontend performance for Spring security.'],
  [17, 18, 'active', 'UX Research', 'React',    'User research methods for component library design.'],
  [19, 20, 'active', 'React', 'Python',         'React hooks for data science workflows.'],

  // --- Pending swaps ---
  [21, 22, 'pending', 'TypeScript', 'Kotlin',   'TypeScript generics for Kotlin coroutines trade.'],
  [23, 24, 'pending', 'React', 'Python',        'React state management for Django REST APIs.'],
  [25, 26, 'pending', 'PHP', 'React Native',    'Laravel backend for mobile frontend skills.'],
  [27, 28, 'pending', 'CSS/HTML', 'TypeScript', 'Responsive layouts for TypeScript patterns.'],
  [29, 0, 'pending',  'Terraform', 'Python',    'Infrastructure code for Python scripting.'],
  [1, 3, 'pending',   'React', 'Figma',         'Component development for design systems.'],
  [5, 7, 'pending',   'Dart', 'Python',         'Dart language for Python automation.'],
  [9, 11, 'pending',  'UI/UX', 'ML',            'Design thinking for machine learning basics.'],

  // --- Pending completion (one side confirmed) ---
  [13, 15, 'pending_completion', 'Design', 'React', 'Design tokens for React implementation — my side done!'],
  [17, 19, 'pending_completion', 'UX', 'Node.js',   'Research findings integrated, awaiting your Node.js API.'],
  [21, 23, 'pending_completion', 'Kotlin', 'React', 'Android app shipped, waiting for the frontend counterpart.'],
  [25, 27, 'pending_completion', 'Laravel', 'AWS',  'Backend APIs deployed, need cloud infrastructure setup.'],
  [29, 2, 'pending_completion',  'Terraform', 'Go', 'Infrastructure ready, waiting for Go microservices.'],

  // --- Declined swaps ---
  [2, 4, 'declined', 'Kubernetes', 'Java',      'Too busy this quarter, maybe next time!'],
  [6, 8, 'declined', 'Rust', 'Express',          'Already found a Rust study group, sorry!'],
  [10, 12, 'declined', 'CI/CD', 'Flutter',       'Not the right timing for me right now.'],
  [14, 16, 'declined', 'Illustration', 'AWS',    'Realised I need to focus on fundamentals first.'],
  [18, 20, 'declined', 'JavaScript', 'TypeScript','Already getting TypeScript training at work.'],
];

// ── Review data: [revieweeIdx, rating, learned, feedback] for completed swaps
const reviewDefs = [
  [1, 5, 'Building reusable components with React hooks.', 'Priya was an amazing teacher! My React skills skyrocketed.'],
  [0, 5, 'Python decorators and Django ORM best practices.', 'James explained Python concepts so clearly. Highly recommend!'],
  [3, 4, 'Figma component libraries and design tokens.', 'Maria showed me how to organise design systems properly.'],
  [2, 5, 'Go concurrency patterns and interfaces.', 'Hiro\'s Go expertise is incredible. Learned so much!'],
  [5, 4, 'Flutter widget tree and state management.', 'Emma helped me understand Flutter\'s reactive model.'],
  [4, 5, 'Spring Boot microservices and JPA.', 'Oluwaseun is a Spring Boot wizard! Great mentorship.'],
  [7, 4, 'Python pandas and data visualisation.', 'Aisha taught me practical data analysis workflows.'],
  [6, 5, 'Systems programming concepts and memory safety.', 'Dmitri made Rust understandable coming from C++.'],
  [9, 5, 'User research methods and usability testing.', 'Fatima\'s UX expertise transformed how I design interfaces.'],
  [8, 4, 'AWS EC2, S3, and basic Lambda functions.', 'Carlos demystified AWS for me. Great practical examples.'],
  [11, 5, 'Machine learning pipelines with scikit-learn.', 'Wei explained ML concepts with real-world applications.'],
  [10, 4, 'Docker compose and GitHub Actions CI/CD.', 'Liam showed me how to containerise my apps properly.'],
  [13, 4, 'Colour theory, typography, and visual hierarchy.', 'Luca has a great eye for design. Improved my UI skills.'],
  [12, 3, 'Firebase authentication and Firestore setup.', 'Decent intro to Firebase but wish we had more time.'],
  [15, 5, 'Vue.js composition API and state management.', 'Chloe is phenomenal! Vue.js finally clicks for me.'],
];

// ── Team definitions: [creatorIdx, name, description, purpose, maxSize, memberIdxs]
const teamDefs = [
  [0, 'Full-Stack Fellowship',   'A group for full-stack developers to share knowledge and review each other\'s code.', 'Code Review', 4, [1, 2, 3]],
  [4, 'Cloud Native Crew',       'Exploring Docker, K8s, and cloud deployment together.', 'Skill Building', 3, [5, 8]],
  [6, 'AI Explorers',            'Learning machine learning and AI fundamentals as a team.', 'Project Based', 4, [7, 11, 14]],
  [9, 'Design-to-Code',          'Designers learning to code and developers learning design.', 'Peer Learning', 4, [13, 17, 18]],
  [15, 'Mobile Builders',        'Building cross-platform mobile apps with Flutter and React Native.', 'Project Based', 3, [12, 27]],
  [20, 'TypeScript Guild',       'Deep-diving into advanced TypeScript patterns and best practices.', 'Skill Building', 4, [19, 21, 24]],
  [29, 'DevOps Circle',          'Infrastructure, CI/CD, and cloud automation study group.', 'Skill Building', 3, [10, 25]],
];

async function seed() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not defined in the environment variables.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI, { dbName: 'Skill-Swap' });
  console.log('Connected to database...');
  const salt = await bcrypt.genSalt(10);

  // ── Step 1: Create users ──────────────────────────
  console.log('\n--- Creating Users ---');
  const createdUsers = [];
  for (const u of userData) {
    const existing = await User.findOne({ email: u.email });
    if (existing) {
      console.log(`  SKIP ${u.email} — already exists`);
      createdUsers.push(existing);
      continue;
    }
    const passwordHash = await bcrypt.hash(PASSWORD, salt);
    const user = await User.create({ ...u, passwordHash, avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)] });
    createdUsers.push(user);
    console.log(`  CREATED ${user.name} (${user.email})`);
  }
  const newUsers = createdUsers.filter(u => userData.some(d => d.email === u.email));
  console.log(`  Total users: ${createdUsers.length} (${newUsers.length} new)`);

  // ── Step 2: Create swaps ──────────────────────────
  console.log('\n--- Creating Swaps ---');
  let swapCount = 0;
  const completedSwaps = [];
  for (const [sIdx, rIdx, status, skillOffered, skillWanted, message] of swapDefs) {
    const sender = createdUsers[sIdx];
    const receiver = createdUsers[rIdx];
    if (!sender || !receiver) continue;

    const existing = await Swap.findOne({ sender: sender._id, receiver: receiver._id, skillOffered });
    if (existing) {
      console.log(`  SKIP swap ${sender.name} → ${receiver.name} (${status})`);
      if (status === 'completed') completedSwaps.push(existing);
      continue;
    }

    const swapData = {
      sender: sender._id,
      receiver: receiver._id,
      skillOffered,
      skillWanted,
      message,
      status,
      format: ['Video Call', 'In Person', 'Async', 'Hybrid'][Math.floor(Math.random() * 4)],
      scheduledAt: status === 'completed' || status === 'active' || status === 'pending_completion' ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : undefined,
    };

    if (status === 'completed') {
      swapData.completedAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
      swapData.completedBy = [sender._id, receiver._id];
    }
    if (status === 'active' || status === 'pending_completion') {
      swapData.goals = [
        { text: `Complete ${skillOffered} basics`, completed: status === 'pending_completion', createdBy: sender._id },
        { text: `Complete ${skillWanted} basics`, completed: false, createdBy: receiver._id },
      ];
    }
    if (status === 'pending_completion') {
      swapData.completedBy = [sender._id];
      swapData.completionRequestedAt = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    }

    const swap = await Swap.create(swapData);
    swapCount++;
    console.log(`  CREATED ${status} swap: ${sender.name} ↔ ${receiver.name} (${skillOffered} ⇔ ${skillWanted})`);
    if (status === 'completed') completedSwaps.push(swap);
  }
  console.log(`  Total swaps created: ${swapCount}`);

  // ── Step 3: Create reviews (for completed swaps) ──
  console.log('\n--- Creating Reviews ---');
  let reviewCount = 0;
  for (let i = 0; i < reviewDefs.length; i++) {
    const [revieweeIdx, rating, learned, feedback] = reviewDefs[i];
    const swap = completedSwaps[i];
    if (!swap) continue;
    const reviewee = createdUsers[revieweeIdx];
    const reviewer = swap.sender.equals(reviewee._id) ? swap.receiver : swap.sender;

    const existing = await Review.findOne({ swap: swap._id, reviewer: reviewer._id });
    if (existing) {
      console.log(`  SKIP review for swap ${swap._id}`);
      continue;
    }

    await Review.create({ swap: swap._id, reviewer: reviewer._id, reviewee: reviewee._id, rating, learned, feedback });
    reviewCount++;
    console.log(`  CREATED ${rating}★ review from ${reviewer.name} for ${reviewee.name}`);
  }
  console.log(`  Total reviews created: ${reviewCount}`);

  // ── Step 4: Create teams ──────────────────────────
  console.log('\n--- Creating Teams ---');
  let teamCount = 0;
  for (const [creatorIdx, name, description, purpose, maxSize, memberIdxs] of teamDefs) {
    const creator = createdUsers[creatorIdx];
    const existing = await Team.findOne({ name });
    if (existing) {
      console.log(`  SKIP team "${name}" — already exists`);
      continue;
    }

    const allMemberIds = [creator._id, ...memberIdxs.map(idx => createdUsers[idx]._id)];
    const members = allMemberIds.map((userId, i) => {
      const isLast = i === allMemberIds.length - 1 && allMemberIds.length >= maxSize;
      return {
        user: userId,
        status: isLast ? 'invited' : 'accepted',
        joinedAt: isLast ? undefined : new Date(Date.now() - (14 - i) * 24 * 60 * 60 * 1000),
      };
    });

    await Team.create({ name, description, purpose, creator: creator._id, maxSize, members, status: 'open' });
    teamCount++;
    console.log(`  CREATED team "${name}" (${members.length} members, creator: ${creator.name})`);
  }
  console.log(`  Total teams created: ${teamCount}`);

  // ── Step 5: Update user ratings based on reviews ──
  console.log('\n--- Updating User Ratings ---');
  for (const user of createdUsers) {
    const stats = await Review.aggregate([
      { $match: { reviewee: user._id } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    await User.findByIdAndUpdate(user._id, {
      rating: stats.length > 0 ? Math.round(stats[0].avgRating * AVG_RATING_PRECISION) / AVG_RATING_PRECISION : 0,
      reviewCount: stats.length > 0 ? stats[0].count : 0,
    });
  }
  console.log('  Ratings synced with actual reviews.');

  console.log('\n✅ Seeding complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Error seeding data:', err);
  process.exit(1);
});

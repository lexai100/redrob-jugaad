// lib/store.ts
// In-memory data store with seeded demo data

export type Role = 'business' | 'student';
export type Track = 'Dev' | 'Design' | 'Content' | 'Marketing';
export type TaskStatus = 'open' | 'matched' | 'in-progress' | 'completed';
export type MilestoneStatus = 'pending' | 'submitted' | 'approved' | 'needs-revision';

export interface User {
  id: string;
  role: Role;
  name: string;
  email: string;
  college?: string;
  gradYear?: number;
  avatar: string;
}

export interface SkillProfile {
  userId: string;
  track: Track;
  seedScore: number;
  trackRecordScore: number;
  aiMatchToggle: boolean;
  completedGigs: number;
  badges: string[];
}

export interface Brief {
  title: string;
  scope: string;
  deliverables: string[];
  budget_range: string;
  timeline: string;
  acceptance_criteria: string[];
}

export interface Task {
  id: string;
  businessOwnerId: string;
  rawInput: string;
  brief: Brief;
  track: Track;
  budgetRange: string;
  urgency: 'normal' | 'urgent';
  status: TaskStatus;
  weightPreference: 'seedScore' | 'trackRecordScore';
  createdAt: string;
}

export interface Match {
  taskId: string;
  studentId: string;
  matchScore: number;
  matchBreakdown: {
    skillTrackMatch: number;
    budgetFit: number;
    trackRecord: number;
    availability: number;
  };
  matchedAt: string;
}

export interface Milestone {
  id: string;
  taskId: string;
  studentId: string;
  title: string;
  description: string;
  submissionText?: string;
  submissionLink?: string;
  status: MilestoneStatus;
  aiVerdict?: { approved: boolean; reason: string };
  dueDate: string;
  submittedAt?: string;
}

export interface Notification {
  id: string;
  studentId: string;
  taskId: string;
  message: string;
  createdAt: string;
  expiresAt: string;
  acted: boolean;
}

// ─────────────────────────────────────────────
// SEED DATA
// ─────────────────────────────────────────────

export const users: User[] = [
  // Business owners
  {
    id: 'b1',
    role: 'business',
    name: 'Rahul Sharma',
    email: 'rahul@threadhouse.in',
    avatar: 'RS',
  },
  {
    id: 'b2',
    role: 'business',
    name: 'Priya Iyer',
    email: 'priya@spiceboxd2c.in',
    avatar: 'PI',
  },
  // Students
  {
    id: 's1',
    role: 'student',
    name: 'Arjun Mehta',
    email: 'arjun@iitd.ac.in',
    college: 'IIT Delhi',
    gradYear: 2025,
    avatar: 'AM',
  },
  {
    id: 's2',
    role: 'student',
    name: 'Sanya Kapoor',
    email: 'sanya@nid.edu',
    college: 'NID Ahmedabad',
    gradYear: 2025,
    avatar: 'SK',
  },
  {
    id: 's3',
    role: 'student',
    name: 'Rohan Verma',
    email: 'rohan@bits.pilani.ac.in',
    college: 'BITS Pilani',
    gradYear: 2026,
    avatar: 'RV',
  },
  {
    id: 's4',
    role: 'student',
    name: 'Divya Nair',
    email: 'divya@symbiosis.ac.in',
    college: 'Symbiosis',
    gradYear: 2025,
    avatar: 'DN',
  },
  {
    id: 's5',
    role: 'student',
    name: 'Karan Singh',
    email: 'karan@iima.ac.in',
    college: 'IIM Ahmedabad',
    gradYear: 2025,
    avatar: 'KS',
  },
  {
    id: 's6',
    role: 'student',
    name: 'Neha Patel',
    email: 'neha@parsons.edu',
    college: 'Parsons School of Design',
    gradYear: 2026,
    avatar: 'NP',
  },
  {
    id: 's7',
    role: 'student',
    name: 'Aditya Kumar',
    email: 'aditya@du.ac.in',
    college: 'Delhi University',
    gradYear: 2026,
    avatar: 'AK',
  },
  {
    id: 's8',
    role: 'student',
    name: 'Ishita Rao',
    email: 'ishita@mica.ac.in',
    college: 'MICA Ahmedabad',
    gradYear: 2025,
    avatar: 'IR',
  },
];

export const skillProfiles: SkillProfile[] = [
  { userId: 's1', track: 'Dev', seedScore: 82, trackRecordScore: 91, aiMatchToggle: true, completedGigs: 7, badges: ['Fast Delivery', '5-Star Streak', 'Bug Squasher'] },
  { userId: 's2', track: 'Design', seedScore: 78, trackRecordScore: 85, aiMatchToggle: true, completedGigs: 5, badges: ['Pixel Perfect', 'Brand Wizard'] },
  { userId: 's3', track: 'Dev', seedScore: 90, trackRecordScore: 74, aiMatchToggle: false, completedGigs: 2, badges: ['High Potential'] },
  { userId: 's4', track: 'Content', seedScore: 71, trackRecordScore: 88, aiMatchToggle: true, completedGigs: 9, badges: ['Consistency King', 'Top Writer', 'Client Fav'] },
  { userId: 's5', track: 'Marketing', seedScore: 85, trackRecordScore: 82, aiMatchToggle: true, completedGigs: 4, badges: ['Campaign Pro', 'Growth Hacker'] },
  { userId: 's6', track: 'Design', seedScore: 69, trackRecordScore: 93, aiMatchToggle: true, completedGigs: 11, badges: ['Design Legend', 'Overachiever', 'Client Fav'] },
  { userId: 's7', track: 'Content', seedScore: 76, trackRecordScore: 67, aiMatchToggle: false, completedGigs: 3, badges: ['Rising Star'] },
  { userId: 's8', track: 'Marketing', seedScore: 88, trackRecordScore: 79, aiMatchToggle: true, completedGigs: 6, badges: ['Ad Wizard', 'ROI Master'] },
];

export const tasks: Task[] = [
  {
    id: 't1',
    businessOwnerId: 'b1',
    rawInput: 'I need a logo and brand kit for my streetwear brand ThreadHouse. Something urban, bold, young. Budget flexible.',
    brief: {
      title: 'Brand Identity Kit — ThreadHouse Streetwear',
      scope: 'Design a complete brand identity for ThreadHouse, an urban streetwear brand targeting 18–28 year olds in Tier 1 Indian cities.',
      deliverables: ['Primary logo (3 variants: color, mono, reversed)', 'Color palette with hex codes', 'Typography system', 'Brand usage guide (PDF)', 'Social media profile assets'],
      budget_range: '₹3,000 – ₹5,000',
      timeline: '5 days',
      acceptance_criteria: ['Logo reflects urban/street culture aesthetic', 'Minimum 3 logo variants delivered', 'All files in vector format (SVG/AI)', 'Brand guide covers do\'s and don\'ts', 'Assets optimized for Instagram and WhatsApp'],
    },
    track: 'Design',
    budgetRange: '₹3,000 – ₹5,000',
    urgency: 'normal',
    status: 'in-progress',
    weightPreference: 'trackRecordScore',
    createdAt: '2024-01-10T09:00:00Z',
  },
  {
    id: 't2',
    businessOwnerId: 'b2',
    rawInput: 'Need short reels and product videos for my spice brand SpiceBox. Desi home feel, warm lighting, must show cooking process.',
    brief: {
      title: 'Product Reels — SpiceBox D2C',
      scope: 'Create 5 short-form product videos (15–30 sec) for SpiceBox spice brand, optimized for Instagram Reels and WhatsApp Status.',
      deliverables: ['5 product reels (15–30 sec each)', 'Raw footage organized by product', 'Captions/text overlay scripts', 'Thumbnail images for each reel'],
      budget_range: '₹4,000 – ₹6,000',
      timeline: '7 days',
      acceptance_criteria: ['Warm, homely lighting aesthetic', 'Each reel shows cooking process with spice', 'Background music licensed/royalty-free', 'Exported in 9:16 and 1:1 formats', 'Delivered via Google Drive link'],
    },
    track: 'Content',
    budgetRange: '₹4,000 – ₹6,000',
    urgency: 'urgent',
    status: 'matched',
    weightPreference: 'trackRecordScore',
    createdAt: '2024-01-12T11:00:00Z',
  },
  {
    id: 't3',
    businessOwnerId: 'b1',
    rawInput: 'Simple landing page for my brand. Just needs to look good, have a product showcase and a WhatsApp order button.',
    brief: {
      title: 'Landing Page — ThreadHouse',
      scope: 'Build a single-page marketing website for ThreadHouse with product showcase and direct WhatsApp ordering integration.',
      deliverables: ['Responsive HTML/CSS/JS landing page', 'Product grid section (6 items)', 'WhatsApp order CTA button integration', 'Mobile-optimized layout', 'Deployed link (Vercel/Netlify)'],
      budget_range: '₹2,000 – ₹3,500',
      timeline: '4 days',
      acceptance_criteria: ['Works on mobile and desktop', 'WhatsApp button opens chat with pre-filled message', 'Page loads in under 3 seconds', 'Deployed and publicly accessible', 'Matches brand colors from ThreadHouse kit'],
    },
    track: 'Dev',
    budgetRange: '₹2,000 – ₹3,500',
    urgency: 'normal',
    status: 'open',
    weightPreference: 'seedScore',
    createdAt: '2024-01-14T14:00:00Z',
  },
  {
    id: 't4',
    businessOwnerId: 'b2',
    rawInput: 'Instagram growth strategy and 2 weeks of content calendar for SpiceBox. We have 800 followers and want to hit 5000.',
    brief: {
      title: 'Instagram Growth Strategy — SpiceBox',
      scope: 'Develop a 2-week Instagram growth strategy and full content calendar for SpiceBox targeting 800→5,000 follower growth.',
      deliverables: ['Competitor analysis report', '14-day content calendar (post type, caption, hashtags, time)', '5 caption templates', 'Hashtag sets (niche, mid, broad)', 'Weekly review metrics checklist'],
      budget_range: '₹1,500 – ₹2,500',
      timeline: '3 days',
      acceptance_criteria: ['Calendar covers all 14 days with no gaps', 'Each post has caption + hashtag set', 'Strategy doc explains growth logic', 'Hashtag sets researched for Indian food niche', 'Delivered as editable Google Sheet + PDF'],
    },
    track: 'Marketing',
    budgetRange: '₹1,500 – ₹2,500',
    urgency: 'normal',
    status: 'completed',
    weightPreference: 'trackRecordScore',
    createdAt: '2024-01-08T10:00:00Z',
  },
  // ── FAKE GIG for Demo: Dev task assigned to Arjun (s1) ──
  {
    id: 't5',
    businessOwnerId: 'b1',
    rawInput: 'Need a full landing page for ThreadHouse with product showcase, WhatsApp order button, and mobile-first design.',
    brief: {
      title: 'Landing Page — ThreadHouse Streetwear',
      scope: 'Build a responsive, mobile-first landing page for ThreadHouse featuring a product grid, hero section, and WhatsApp order integration.',
      deliverables: ['Responsive HTML/CSS/JS landing page', 'Hero section with brand imagery', 'Product grid (6 items)', 'WhatsApp CTA button with pre-filled message', 'Deployed on Vercel with public link'],
      budget_range: '₹6,000 – ₹8,000',
      timeline: '6 days',
      acceptance_criteria: ['Works on mobile and desktop', 'WhatsApp button opens chat with pre-filled order message', 'Page loads under 3 seconds', 'Matches ThreadHouse brand colors', 'Deployed and publicly accessible link delivered'],
    },
    track: 'Dev',
    budgetRange: '₹6,000 – ₹8,000',
    urgency: 'normal',
    status: 'in-progress',
    weightPreference: 'seedScore',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const matches: Match[] = [
  {
    taskId: 't1',
    studentId: 's2',
    matchScore: 87,
    matchBreakdown: { skillTrackMatch: 40, budgetFit: 18, trackRecord: 21, availability: 8 },
    matchedAt: '2024-01-10T10:00:00Z',
  },
  {
    taskId: 't1',
    studentId: 's6',
    matchScore: 91,
    matchBreakdown: { skillTrackMatch: 40, budgetFit: 17, trackRecord: 25, availability: 9 },
    matchedAt: '2024-01-10T10:00:00Z',
  },
  {
    taskId: 't2',
    studentId: 's4',
    matchScore: 84,
    matchBreakdown: { skillTrackMatch: 38, budgetFit: 18, trackRecord: 22, availability: 6 },
    matchedAt: '2024-01-12T12:00:00Z',
  },
  {
    taskId: 't4',
    studentId: 's5',
    matchScore: 89,
    matchBreakdown: { skillTrackMatch: 40, budgetFit: 20, trackRecord: 20, availability: 9 },
    matchedAt: '2024-01-08T11:00:00Z',
  },
  {
    taskId: 't4',
    studentId: 's8',
    matchScore: 82,
    matchBreakdown: { skillTrackMatch: 38, budgetFit: 19, trackRecord: 19, availability: 6 },
    matchedAt: '2024-01-08T11:00:00Z',
  },
  // Arjun (s1) assigned to ThreadHouse Landing Page (t5)
  {
    taskId: 't5',
    studentId: 's1',
    matchScore: 94,
    matchBreakdown: { skillTrackMatch: 40, budgetFit: 20, trackRecord: 25, availability: 9 },
    matchedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const milestones: Milestone[] = [
  {
    id: 'm1',
    taskId: 't1',
    studentId: 's6',
    title: 'Initial concepts & moodboard',
    description: 'Share 3 logo direction moodboards with color palette options',
    status: 'approved',
    aiVerdict: { approved: true, reason: 'Submission clearly shows 3 distinct direction moodboards with coherent color palettes. Urban/street aesthetic is evident in all concepts. Meets acceptance criteria.' },
    dueDate: '2024-01-12T23:59:00Z',
    submittedAt: '2024-01-12T18:00:00Z',
    submissionText: 'Here are the 3 moodboards. Direction A is gritty graffiti-inspired, B is clean minimalist with bold type, C is vintage retro street.',
    submissionLink: 'https://drive.google.com/moodboards-threadhouse',
  },
  {
    id: 'm2',
    taskId: 't1',
    studentId: 's6',
    title: 'Final logo files',
    description: 'Deliver final logo in all 3 variants with vector source files',
    status: 'submitted',
    dueDate: '2024-01-14T23:59:00Z',
    submittedAt: '2024-01-14T20:00:00Z',
    submissionText: 'Final logo files attached. Went with Direction B after client feedback. All 3 variants (color, mono, reversed) delivered in SVG, AI, and PNG.',
    submissionLink: 'https://drive.google.com/final-logo-threadhouse',
  },
  {
    id: 'm3',
    taskId: 't1',
    studentId: 's6',
    title: 'Brand guide + social assets',
    description: 'Complete brand usage guide PDF and social media profile assets',
    status: 'pending',
    dueDate: '2024-01-16T23:59:00Z',
  },
  {
    id: 'm4',
    taskId: 't4',
    studentId: 's5',
    title: 'Strategy document + competitor analysis',
    description: 'Instagram growth strategy with competitor benchmarking',
    status: 'approved',
    aiVerdict: { approved: true, reason: 'Comprehensive competitor analysis covering 5 direct competitors. Strategy document clearly explains growth logic with specific tactics for Indian food niche. All acceptance criteria met.' },
    dueDate: '2024-01-09T23:59:00Z',
    submittedAt: '2024-01-09T15:00:00Z',
    submissionText: 'Strategy doc ready. Analyzed 5 competitors, identified posting patterns and top hashtags for Indian spice niche.',
    submissionLink: 'https://docs.google.com/spicebox-strategy',
  },
  {
    id: 'm5',
    taskId: 't4',
    studentId: 's5',
    title: '14-day content calendar',
    description: 'Full content calendar with captions, hashtags, and posting times',
    status: 'approved',
    aiVerdict: { approved: true, reason: 'Calendar covers all 14 days with no gaps. Each post includes caption, hashtag set, and optimal posting time based on Indian audience data. Delivered as editable Google Sheet. All criteria satisfied.' },
    dueDate: '2024-01-10T23:59:00Z',
    submittedAt: '2024-01-10T12:00:00Z',
    submissionText: 'Full 14-day calendar with 3 posts/day structure, captions, and hashtag sets (niche + broad mix).',
    submissionLink: 'https://docs.google.com/spicebox-calendar',
  },
  // ── Arjun (s1) milestones for ThreadHouse Landing Page (t5) ──
  {
    id: 'm6',
    taskId: 't5',
    studentId: 's1',
    title: 'Wireframe + project setup',
    description: 'Share low-fidelity wireframe and confirm tech stack. Set up GitHub repo and Vercel project.',
    status: 'approved',
    aiVerdict: { approved: true, reason: 'Wireframe clearly shows hero, product grid, and WhatsApp CTA sections. GitHub repo is set up with Next.js. Vercel project linked and skeleton deployed. All setup criteria satisfied — milestone approved, ₹2,000 released from escrow.' },
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 3 * 60 * 60 * 1000).toISOString(),
    submissionText: 'Wireframe done in Figma — 3 screens (desktop hero, product grid, mobile). Repo at github.com/arjun-threadhouse, deployed skeleton on Vercel.',
    submissionLink: 'https://figma.com/threadhouse-wireframe-demo',
  },
  {
    id: 'm7',
    taskId: 't5',
    studentId: 's1',
    title: 'Responsive HTML/CSS build',
    description: 'Build the full responsive page — hero section, product grid (6 items), WhatsApp CTA button. Must work perfectly on mobile and desktop.',
    status: 'pending',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'm8',
    taskId: 't5',
    studentId: 's1',
    title: 'Final deployment + handoff',
    description: 'Deploy to Vercel, share public link, deliver source code zip and all asset files.',
    status: 'pending',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const notifications: Notification[] = [
  {
    id: 'n1',
    studentId: 's3',
    taskId: 't3',
    message: 'A new task matches your Dev profile: "Landing Page — ThreadHouse". Match score: 88%. You have 24 hours to respond.',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
    acted: false,
  },
  {
    id: 'n2',
    studentId: 's7',
    taskId: 't2',
    message: 'A new urgent task matches your Content profile: "Product Reels — SpiceBox". Urgent tasks skip the wait window — act now!',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString(),
    acted: false,
  },
];

// ─────────────────────────────────────────────
// STORE MUTATIONS
// ─────────────────────────────────────────────

export function addTask(task: Task) {
  tasks.push(task);
}

export function addMatches(newMatches: Match[]) {
  matches.push(...newMatches);
}

export function addMilestone(milestone: Milestone) {
  milestones.push(milestone);
}

export function updateMilestone(id: string, updates: Partial<Milestone>) {
  const idx = milestones.findIndex(m => m.id === id);
  if (idx !== -1) milestones[idx] = { ...milestones[idx], ...updates };
}

export function updateSkillProfile(userId: string, updates: Partial<SkillProfile>) {
  const idx = skillProfiles.findIndex(p => p.userId === userId);
  if (idx !== -1) skillProfiles[idx] = { ...skillProfiles[idx], ...updates };
}

export function addNotification(notification: Notification) {
  notifications.push(notification);
}

export function updateNotification(id: string, updates: Partial<Notification>) {
  const idx = notifications.findIndex(n => n.id === id);
  if (idx !== -1) notifications[idx] = { ...notifications[idx], ...updates };
}

export function getUser(id: string) {
  return users.find(u => u.id === id);
}

export function getStudentProfile(userId: string) {
  return skillProfiles.find(p => p.userId === userId);
}

export function getTaskMatches(taskId: string) {
  return matches.filter(m => m.taskId === taskId);
}

export function getTaskMilestones(taskId: string) {
  return milestones.filter(m => m.taskId === taskId);
}

export function getStudentNotifications(studentId: string) {
  return notifications.filter(n => n.studentId === studentId);
}

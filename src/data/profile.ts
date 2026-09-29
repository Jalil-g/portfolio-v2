// Everything personal lives here: edit this file to update the site.

export const profile = {
  name: 'Jalil Jabbarli',
  tagline: 'Software & AI engineer',
  current: 'MEng Computer Science @ Cornell Tech',
  email: 'jalil.jabbarli32@gmail.com',
  github: 'https://github.com/Jalil-g',
  linkedin: 'https://www.linkedin.com/in/jljalil/',
  resume: '/Jalil_Jabbarli_Resume.pdf',
}

export const mailto = `mailto:${profile.email}?subject=${encodeURIComponent("Let's work together")}`

export type Project = {
  title: string
  year: string
  summary: string
  highlights?: string[]
  tags: string[]
  image?: string
  link?: string
  nda?: boolean
  /** Accent used for the generated cover when there is no screenshot. */
  accent?: string
}

export const projects: Project[] = [
  {
    title: 'Immune Harness',
    year: '2026',
    summary:
      'A security layer for AI agents. It checks every tool call before it runs and blocks the risky ones. When a new attack is caught, it writes or rewrites a policy to cover the variant and tests it before it goes live.',
    highlights: [
      'Stops repeat threats 2.6× faster in testing',
      'FastAPI gateway combining policy checks with Jev risk scoring (30/30 live test cases)',
      'Led 4 engineers: 8 pull requests merged in 8 hours',
    ],
    tags: ['Python', 'FastAPI', 'MongoDB Atlas', 'AI Agents', 'Security'],
    link: 'https://github.com/Jalil-g/Immune-Harness',
    accent: '#2f7a66',
  },
  {
    title: '49 Agents IDE',
    year: '2026',
    summary:
      'An open-source 2D IDE for managing AI coding agents, terminals, git and files across projects and machines. Grew to 600+ GitHub stars.',
    highlights: [
      'Designed core features and led the Hacker News / Product Hunt launches',
      'Terminal security patch (localhost binding + per-process auth) blocked all 4 tested attack paths',
    ],
    tags: ['Node.js', 'WebSockets', 'tmux'],
    link: 'https://github.com/alpbahadur/49-IDE',
    accent: '#f2701b',
  },
  {
    title: 'Air-Traffic Safety Analytics',
    year: '2025',
    summary:
      'Consulting project with the International Air Transport Association (IATA): analyzing 100K+ flight trajectories to find air-traffic safety patterns under sparse TCAS event labels.',
    highlights: ['ETL pipelines feeding real-time dashboards with under 2 s latency'],
    tags: ['Python', 'PyTorch', 'FastAPI', 'SQL', 'Data Viz'],
    image: '/images/iata.webp',
    nda: true,
  },
  {
    title: 'Dinner With a Stranger',
    year: '2025',
    summary:
      'A full-stack app that pairs students for dinner based on shared interests. It replaced a university club’s manual Google Form matching and reached 400+ users.',
    tags: ['React', 'TypeScript', 'Tailwind', 'Node.js', 'Express', 'Prisma', 'PostgreSQL', 'Docker'],
    image: '/images/dws.webp',
    link: 'https://github.com/Jalil-g/dinner-with-a-stranger',
  },
  {
    title: 'Posely',
    year: '2024',
    summary:
      'An AI pose-suggestion app. It analyzes body posture in real time with OpenCV and MediaPipe, and a custom PyTorch CNN trained on a 10K+ image dataset suggests better poses.',
    tags: ['Python', 'PyTorch', 'OpenCV', 'MediaPipe', 'FastAPI', 'Computer Vision'],
    image: '/images/posely.webp',
    link: 'https://github.com/Jalil-g/Posely',
  },
  {
    title: 'Qarabağ vs Athletic Club Predictor',
    year: '2025',
    summary:
      'An end-to-end football analytics pipeline. It scrapes FBRef match data, engineers features and trains XGBoost and SVM models to output Win / Draw / Loss probabilities.',
    tags: ['Python', 'Pandas', 'BeautifulSoup', 'Scikit-learn', 'XGBoost', 'SVM'],
    image: '/images/qarabag_bilbao.webp',
    link: 'https://github.com/Jalil-g/match-prediction-champions-league-qarabag-vs-bilbao',
  },
  {
    title: 'DNA Evolution Simulator',
    year: '2025',
    summary:
      'An interactive simulation of genetic drift and natural selection across generations, with a FastAPI backend and a 3D React front end.',
    tags: ['FastAPI', 'Python', 'NumPy', 'React', 'Vite', 'Three.js', 'Spline'],
    image: '/images/evolution_simulator.webp',
    link: 'https://github.com/Jalil-g/evolution-simulation',
  },
]

export type Role = {
  org: string
  role: string
  when: string
  points: string[]
}

export const experience: Role[] = [
  {
    org: 'Michelin',
    role: 'Student Consultant, Machine Learning',
    when: 'Dec 2025 – Apr 2026',
    points: [
      'Predicted forklift-tire end-of-life from 3.5M+ observations across 82 variables, cutting MAE 15% vs. an age-based baseline.',
      'XGBoost + SHAP to prioritize high-risk tires for inspection.',
    ],
  },
  {
    org: 'IATA',
    role: 'Student Consultant, Data Science',
    when: 'Sep 2025 – Dec 2025',
    points: [
      'Studied air-traffic safety patterns across 100K+ flight trajectories.',
      'Built ETL pipelines and real-time dashboards (<2 s latency).',
    ],
  },
  {
    org: 'McGill University',
    role: 'Research Assistant, Reinforcement Learning',
    when: 'May 2025 – Aug 2025',
    points: [
      'Follow-up work to the NeurIPS 2024 paper “Learning Successor Features the Simple Way”, with Prof. Prémont-Schwarz and Raymond Chua.',
      'Built a configurable agent with TD(λ) eligibility traces.',
    ],
  },
  {
    org: 'Deloitte',
    role: 'Software Developer Intern',
    when: 'May 2024 – Aug 2024',
    points: [
      'Automated tender search across 20+ sources, from 3 hours to seconds.',
      'Dockerized aggregator on EC2, scheduled with Lambda, archived to S3.',
    ],
  },
  {
    org: 'IOMETE (YC W22)',
    role: 'Software Developer Intern',
    when: 'May 2023 – Aug 2023',
    points: [
      'MongoDB + LangChain semantic retrieval took complex-query handling from 40% to 80%.',
      'Wired LLM output into query execution, error handling and follow-ups.',
    ],
  },
]

export const education = [
  { school: 'Cornell Tech', degree: 'MEng, Computer Science', when: '2026 – 2027' },
  { school: 'McGill University', degree: 'BSc, Statistics & Computer Science', when: '2023 – 2026' },
]

export const skills = {
  Languages: ['Python', 'TypeScript', 'JavaScript', 'SQL', 'R', 'C', 'C++', 'Bash'],
  'Frameworks': ['PyTorch', 'FastAPI', 'LangChain', 'Node.js', 'React'],
  Tools: ['Git', 'Docker', 'Kafka', 'AWS', 'MongoDB', 'PostgreSQL', 'CI/CD'],
}

export const spoken = ['English', 'French', 'Azerbaijani', 'Turkish', 'Russian']

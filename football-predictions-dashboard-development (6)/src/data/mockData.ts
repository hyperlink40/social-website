export type Prediction = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo: string;
  awayLogo: string;
  league: string;
  leagueLogo?: string;
  date: string;
  prediction: string;
  confidence: number;
  odds: string;
  isPremium: boolean;
  rationale?: string;
  source?: 'mock' | 'live-api';
  federation?: string;
  market?: string;
  status?: string;
};

export type Result = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo: string;
  awayLogo: string;
  league: string;
  date: string;
  prediction: string;
  odds: string;
  confidence: number;
  isPremium: boolean;
  homeScore: number;
  awayScore: number;
  outcome: 'win' | 'loss' | 'push';
  profit: string;
  source?: 'mock' | 'betigolo-api';
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  bio: string;
  winRate: string;
  predictions: number;
};

export const MOCK_PREDICTIONS: Prediction[] = [
  {
    id: '1',
    homeTeam: 'Arsenal',
    awayTeam: 'Liverpool',
    homeLogo: 'https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg',
    awayLogo: 'https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg',
    league: 'Premier League',
    date: new Date(Date.now() + 86400000).toISOString(),
    prediction: 'Over 2.5 Goals',
    confidence: 85,
    odds: '1.85',
    isPremium: false,
    rationale: 'Both teams have high-scoring recent records. Arsenal has scored in their last 10 home games.',
  },
  {
    id: '2',
    homeTeam: 'Real Madrid',
    awayTeam: 'Barcelona',
    homeLogo: 'https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg',
    awayLogo: 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg',
    league: 'La Liga',
    date: new Date(Date.now() + 172800000).toISOString(),
    prediction: 'Real Madrid to Win',
    confidence: 92,
    odds: '2.10',
    isPremium: true,
    rationale: "Barcelona is missing key defenders due to injury. Real Madrid's home form is impeccable this season.",
  },
  {
    id: '3',
    homeTeam: 'Bayern Munich',
    awayTeam: 'Dortmund',
    homeLogo: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg',
    awayLogo: 'https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg',
    league: 'Bundesliga',
    date: new Date(Date.now() + 259200000).toISOString(),
    prediction: 'BTTS - Yes',
    confidence: 78,
    odds: '1.65',
    isPremium: false,
  },
  {
    id: '4',
    homeTeam: 'Man City',
    awayTeam: 'Aston Villa',
    homeLogo: 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg',
    awayLogo: 'https://upload.wikimedia.org/wikipedia/en/f/f9/Aston_Villa_FC_crest_%282016%29.svg',
    league: 'Premier League',
    date: new Date(Date.now() + 345600000).toISOString(),
    prediction: 'Man City -1.5 Handicap',
    confidence: 88,
    odds: '1.95',
    isPremium: true,
    rationale: 'City needs a big win to secure top spot. Villa historically struggles at the Etihad.',
  },
  {
    id: '5',
    homeTeam: 'Juventus',
    awayTeam: 'AC Milan',
    homeLogo: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Juventus_FC_2017_icon_%28black%29.svg',
    awayLogo: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg',
    league: 'Serie A',
    date: new Date(Date.now() + 432000000).toISOString(),
    prediction: 'Under 2.5 Goals',
    confidence: 75,
    odds: '1.70',
    isPremium: false,
  },
  {
    id: '6',
    homeTeam: 'PSG',
    awayTeam: 'Marseille',
    homeLogo: 'https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg',
    awayLogo: 'https://upload.wikimedia.org/wikipedia/en/4/43/Olympique_de_Marseille_logo.svg',
    league: 'Ligue 1',
    date: new Date(Date.now() + 518400000).toISOString(),
    prediction: 'PSG to Win & Over 1.5 Goals',
    confidence: 95,
    odds: '1.55',
    isPremium: true,
    rationale: 'Mbappe is in incredible form. Marseille has conceded 5 goals in their last 2 away games.',
  },
  {
    id: '7',
    homeTeam: 'Chelsea',
    awayTeam: 'Tottenham',
    homeLogo: 'https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg',
    awayLogo: 'https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg',
    league: 'Premier League',
    date: new Date(Date.now() + 604800000).toISOString(),
    prediction: 'Chelsea to Win',
    confidence: 72,
    odds: '2.05',
    isPremium: false,
  },
  {
    id: '8',
    homeTeam: 'Atletico Madrid',
    awayTeam: 'Sevilla',
    homeLogo: 'https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_Madrid_2017_logo.svg',
    awayLogo: 'https://upload.wikimedia.org/wikipedia/en/3/3b/Sevilla_FC_logo.svg',
    league: 'La Liga',
    date: new Date(Date.now() + 691200000).toISOString(),
    prediction: 'Atletico Madrid 1X',
    confidence: 81,
    odds: '1.45',
    isPremium: true,
    rationale: 'Atletico has an 8-game unbeaten run at home. Simeone is known to dominate mid-table sides.',
  },
];

export const MOCK_RESULTS: Result[] = [
  {
    id: 'r1',
    homeTeam: 'Man United',
    awayTeam: 'Newcastle',
    homeLogo: 'https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg',
    awayLogo: 'https://upload.wikimedia.org/wikipedia/en/5/56/Newcastle_United_Logo.svg',
    league: 'Premier League',
    date: new Date(Date.now() - 86400000).toISOString(),
    prediction: 'Over 2.5 Goals',
    odds: '1.80',
    confidence: 83,
    isPremium: false,
    homeScore: 3,
    awayScore: 1,
    outcome: 'win',
    profit: '+0.80',
  },
  {
    id: 'r2',
    homeTeam: 'Napoli',
    awayTeam: 'Inter Milan',
    homeLogo: 'https://upload.wikimedia.org/wikipedia/commons/2/2d/SSC_Napoli_logo.svg',
    awayLogo: 'https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg',
    league: 'Serie A',
    date: new Date(Date.now() - 172800000).toISOString(),
    prediction: 'BTTS - Yes',
    odds: '1.65',
    confidence: 79,
    isPremium: false,
    homeScore: 2,
    awayScore: 2,
    outcome: 'win',
    profit: '+0.65',
  },
  {
    id: 'r3',
    homeTeam: 'Dortmund',
    awayTeam: 'Leipzig',
    homeLogo: 'https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg',
    awayLogo: 'https://upload.wikimedia.org/wikipedia/en/0/04/RB_Leipzig_2014_logo.svg',
    league: 'Bundesliga',
    date: new Date(Date.now() - 259200000).toISOString(),
    prediction: 'Dortmund to Win',
    odds: '2.20',
    confidence: 68,
    isPremium: true,
    homeScore: 0,
    awayScore: 1,
    outcome: 'loss',
    profit: '-1.00',
  },
  {
    id: 'r4',
    homeTeam: 'Liverpool',
    awayTeam: 'Chelsea',
    homeLogo: 'https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg',
    awayLogo: 'https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg',
    league: 'Premier League',
    date: new Date(Date.now() - 345600000).toISOString(),
    prediction: 'Liverpool 1X',
    odds: '1.50',
    confidence: 88,
    isPremium: true,
    homeScore: 2,
    awayScore: 0,
    outcome: 'win',
    profit: '+0.50',
  },
  {
    id: 'r5',
    homeTeam: 'Barcelona',
    awayTeam: 'Atletico Madrid',
    homeLogo: 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg',
    awayLogo: 'https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_Madrid_2017_logo.svg',
    league: 'La Liga',
    date: new Date(Date.now() - 432000000).toISOString(),
    prediction: 'Under 2.5 Goals',
    odds: '1.75',
    confidence: 74,
    isPremium: false,
    homeScore: 1,
    awayScore: 0,
    outcome: 'win',
    profit: '+0.75',
  },
  {
    id: 'r6',
    homeTeam: 'Lyon',
    awayTeam: 'Monaco',
    homeLogo: 'https://upload.wikimedia.org/wikipedia/en/e/e2/Olympique_Lyonnais_logo.svg',
    awayLogo: 'https://upload.wikimedia.org/wikipedia/en/e/ea/AS_Monaco_FC.svg',
    league: 'Ligue 1',
    date: new Date(Date.now() - 518400000).toISOString(),
    prediction: 'Over 2.5 Goals',
    odds: '1.90',
    confidence: 76,
    isPremium: true,
    homeScore: 3,
    awayScore: 2,
    outcome: 'win',
    profit: '+0.90',
  },
  {
    id: 'r7',
    homeTeam: 'Tottenham',
    awayTeam: 'Arsenal',
    homeLogo: 'https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg',
    awayLogo: 'https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg',
    league: 'Premier League',
    date: new Date(Date.now() - 604800000).toISOString(),
    prediction: 'Arsenal to Win',
    odds: '2.30',
    confidence: 71,
    isPremium: false,
    homeScore: 2,
    awayScore: 3,
    outcome: 'win',
    profit: '+1.30',
  },
  {
    id: 'r8',
    homeTeam: 'AC Milan',
    awayTeam: 'Roma',
    homeLogo: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg',
    awayLogo: 'https://upload.wikimedia.org/wikipedia/en/f/f7/AS_Roma_logo_%282017%29.svg',
    league: 'Serie A',
    date: new Date(Date.now() - 691200000).toISOString(),
    prediction: 'AC Milan to Win',
    odds: '1.85',
    confidence: 80,
    isPremium: true,
    homeScore: 1,
    awayScore: 2,
    outcome: 'loss',
    profit: '-1.00',
  },
];

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 't1',
    name: 'Marcus Holloway',
    role: 'Lead Analyst & Founder',
    avatar: '🧠',
    bio: '15 years of professional football betting analysis. Former statistical consultant for 3 Premier League clubs.',
    winRate: '82%',
    predictions: 3240,
  },
  {
    id: 't2',
    name: 'Sofia Renner',
    role: 'Data Scientist',
    avatar: '📊',
    bio: 'PhD in Sports Analytics from UCL. Designed our AI confidence-scoring engine used across all prediction categories.',
    winRate: '79%',
    predictions: 2180,
  },
  {
    id: 't3',
    name: 'James Okafor',
    role: 'European Leagues Expert',
    avatar: '⚽',
    bio: 'Specialist in La Liga, Serie A and Bundesliga. Grew up in Spain, brings deep tactical knowledge to every pick.',
    winRate: '77%',
    predictions: 1950,
  },
  {
    id: 't4',
    name: 'Priya Nair',
    role: 'Asian Leagues Specialist',
    avatar: '🌏',
    bio: 'Covers J-League, K-League, and AFC Champions League. Award-winning sports journalist turned analyst.',
    winRate: '75%',
    predictions: 1430,
  },
];

export const STATS = {
  totalPredictions: 8800,
  overallWinRate: 79,
  premiumWinRate: 85,
  freeWinRate: 65,
  avgOdds: 1.87,
  leaguesCovered: 42,
  activeUsers: 24500,
  monthlyROI: 22,
};

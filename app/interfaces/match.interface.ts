
export interface IMatchData {
  score: number;
  percentage: number;
  youCanHelp: string[];
  theyCanHelp: string[];
  matchQuality: 'excellent' | 'good' | 'moderate' | 'low';
  badgeColor: string;
}

export interface IMatchedUser {
  user: any; 
  matchData: IMatchData;
}

export interface ITopMatch {
  user: {
    _id: string;
    name: string;
    email: string;
    profile?: {
      avatar?: string;
      location?: string;
      bio?: string;
      teachSkills?: string[];
      learnSkills?: string[];
      availability?: string;
    };
  };
  matchData: IMatchData;
}
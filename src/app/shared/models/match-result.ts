import { MatchDocument } from './match-document';

export interface MatchResult {
  matchId: number;
  homeGoals: number;
  awayGoals: number;
  result: 'HOME_WIN' | 'AWAY_WIN' | 'DRAW';
  scorers?: { playerId: number; teamId: number; minute: number }[];
  cards?: { playerId: number; teamId: number; type: 'YELLOW' | 'RED'; minute: number }[];
  documents?: MatchDocument[];
}



import { Team } from './team';
import { MatchDocument } from './match-document';

export interface Match {
  id: number;
  tournamentId: number;
  groupId?: number;
  phase: string;                 // GROUPS, SEMIFINALS, FINALS
  homeTeamId: number;
  awayTeamId: number;
  homeTeam?: Team;
  awayTeam?: Team;
  matchDate: Date | string;
  venue: string;
  referee?: string;
  homeTeamGoals?: number;
  awayTeamGoals?: number;
  status: string;                // SCHEDULED, LIVE, FINISHED, POSTPONED, CANCELLED
  result?: string;               // HOME_WIN, AWAY_WIN, DRAW
  arbitralDocument?: MatchDocument;
}

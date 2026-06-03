export interface PlayerStatistic {
  playerId: number;
  teamId?: number;
  matchesPlayed: number;
  minutesPlayed: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  cleanSheets?: number; // for goalkeepers
}



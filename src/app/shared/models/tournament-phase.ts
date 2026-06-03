export interface TournamentPhase {
  id: number;
  tournamentId: number;
  name: string;
  type: 'GROUP' | 'KNOCKOUT' | 'LEAGUE';
  groups?: { id: number; name: string; teamIds: number[] }[];
  knockoutConfig?: {
	rounds: number;
	teamsPerRound: number;
  };
}



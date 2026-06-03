interface Card {
  id: number;
  matchId: number;
  playerId: number;
  teamId: number;
  cardType: string;              // YELLOW, RED
  minute: number;
  reason: string;
  issuedBy: User;
  created_at: Date;
}

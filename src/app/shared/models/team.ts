import { Player } from './player';

export interface Team {
  id: number;
  tournamentId: number;
  name: string;
  abbreviation: string;
  city: string;
  coach: string;
  manager: string;
  players: Player[];
  status: string;                // REGISTERED, VERIFIED, SUSPENDED, ELIMINATED
  inscriptionPaymentStatus: string;  // PENDING, PAID, OVERDUE
  created_at: Date;
}



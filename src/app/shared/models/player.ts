export interface Player {
  id: number;
  teamId: number;
  name: string;
  documentType: string;          // CC, PASSPORT
  documentNumber: string;
  birthDate: Date;
  position: string;              // PORTERO, DEFENSA, MEDIOCAMPISTA, DELANTERO
  number: number;                // dorsal
  yellowCards: number;
  redCards: number;
  goalsScored: number;
  status: string;                // ACTIVE, INJURED, SUSPENDED, INACTIVE
}

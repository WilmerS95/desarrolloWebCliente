import { User } from './user';

export interface Tournament {
  tournamentID: number;
  name: string;
  description: string;
  type: string;                  // FUTBOL_7, FUTBOL_11, PAPI_FUTBOL, etc.
  season?: string;
  startDate: Date | string;
  endDate: Date | string;
  status: string;                // PLANNING, ONGOING, FINISHED
  location?: string;
  maxTeams: number;              // cantidad máxima de equipos
  teamsPerGroup: number;         // cantidad de equipos por grupo
  advanceTeams: number;          // cuántos pasan a eliminatoria
  createdAt?: Date | string;
  updatedAt?: Date | string;
  createdBy?: User;
}



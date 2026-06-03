/**
 * Modelos de configuración avanzada para torneos deportivos
 */

export enum TournamentFormatType {
  ROUND_ROBIN = 'ROUND_ROBIN',
  GROUP_PHASE = 'GROUP_PHASE',
  KNOCKOUT = 'KNOCKOUT',
  MIXED = 'MIXED'
}

export enum PairingType {
  FIRST_VS_LAST = 'FIRST_VS_LAST',
  RANDOM = 'RANDOM'
}

export interface TeamEntry {
  id?: number;
  name: string;
  groupAssignedTo?: number;
}

export interface GroupConfiguration {
  groupNumber: number;
  teams: TeamEntry[];
  teamsAdvancing: number;
}

export interface RoundRobinConfig {
  legs: 1 | 2; // Una o dos vueltas
}

export interface GroupPhaseConfig {
  numberOfGroups: number;
  teamsPerGroup: number;
  teamsAdvancingPerGroup: number;
  groups?: GroupConfiguration[];
}

export interface KnockoutConfig {
  pairingType: PairingType;
  allowByes: boolean;
  twoLegs: boolean; // Ida y vuelta
  finalTwoLegs: boolean; // La final es a dos partidos
}

export interface MixedFormatConfig {
  groupPhase: GroupPhaseConfig;
  knockout: KnockoutConfig;
  teamsAdvancingToKnockout: number;
}

export interface CalendarConfiguration {
  matchDuration: number; // en minutos
  firstMatchStartTime: string; // HH:mm
  playDays: string[]; // ['Monday', 'Wednesday', 'Friday']
  matchesPerDay: number;
  pauseDaysBetweenRounds?: number; // Días de descanso entre jornadas
}

export interface Match {
  id?: number;
  matchNumber: number;
  round: number;
  homeTeam: TeamEntry;
  awayTeam: TeamEntry;
  scheduledDate?: Date;
  scheduledTime?: string;
  location?: string;
  homeTeamGoals?: number;
  awayTeamGoals?: number;
  status: 'PENDING' | 'PLAYED' | 'CANCELLED';
  isKnockoutMatch?: boolean;
  isFinal?: boolean;
}

export interface TournamentConfigurationData {
  // Información básica
  name: string;
  description?: string;
  location?: string;

  // Configuración de equipos
  teams: TeamEntry[];
  numberOfTeams: number;

  // Formato del torneo
  formatType: TournamentFormatType;
  roundRobinConfig?: RoundRobinConfig;
  groupPhaseConfig?: GroupPhaseConfig;
  knockoutConfig?: KnockoutConfig;
  mixedFormatConfig?: MixedFormatConfig;

  // Configuración del calendario
  calendarConfig: CalendarConfiguration;

  // Calendario generado
  matches?: Match[];

  // Metadatos
  createdAt?: Date;
  updatedAt?: Date;
  status: 'DRAFT' | 'CONFIGURED' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface TournamentWizardState {
  currentStep: number;
  totalSteps: number;
  completedSteps: Set<number>;
  data: TournamentConfigurationData;
  isValid: boolean;
  errors: Map<string, string[]>;
}

export interface FixtureGenerationResult {
  success: boolean;
  matches: Match[];
  warnings?: string[];
  errors?: string[];
}


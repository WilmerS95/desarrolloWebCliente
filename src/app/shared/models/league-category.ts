export type LeagueCategory = 'FUTBOL_7' | 'FUTBOL_11' | 'PAPI_FUTBOL' | 'FUTSAL' | 'AMATEUR' | 'PRO';

export const LEAGUE_CATEGORY_NAMES: { [key in LeagueCategory]: string } = {
  FUTBOL_7: 'Fútbol 7',
  FUTBOL_11: 'Fútbol 11',
  PAPI_FUTBOL: 'Papi Fútbol',
  FUTSAL: 'Futsal',
  AMATEUR: 'Amateur',
  PRO: 'Profesional'
};

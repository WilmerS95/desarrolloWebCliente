import { Injectable } from '@angular/core';
import {
  TournamentFormatType,
  Match,
  TeamEntry,
  GroupConfiguration,
  TournamentConfigurationData,
  FixtureGenerationResult,
  PairingType,
} from '../models/tournament-configuration';

@Injectable({
  providedIn: 'root',
})
export class FixtureGenerationService {
  generateFixtures(config: TournamentConfigurationData): FixtureGenerationResult {
    try {
      let matches: Match[] = [];

      switch (config.formatType) {
        case TournamentFormatType.ROUND_ROBIN:
          matches = this.generateRoundRobin(config);
          break;
        case TournamentFormatType.GROUP_PHASE:
          matches = this.generateGroupPhase(config);
          break;
        case TournamentFormatType.KNOCKOUT:
          matches = this.generateKnockout(config);
          break;
        case TournamentFormatType.MIXED:
          matches = this.generateMixedFormat(config);
          break;
      }

      return {
        success: true,
        matches: this.scheduleMatches(matches, config),
      };
    } catch (error) {
      return {
        success: false,
        matches: [],
        errors: [(error as Error).message],
      };
    }
  }

  private generateRoundRobin(config: TournamentConfigurationData): Match[] {
    const matches: Match[] = [];
    const teams = config.teams;
    const legs = config.roundRobinConfig?.legs || 1;
    let matchNumber = 1;

    for (let leg = 0; leg < legs; leg++) {
      for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          // Primera vuelta: equipo i vs equipo j
          matches.push({
            matchNumber: matchNumber++,
            round: leg + 1,
            homeTeam: teams[i],
            awayTeam: teams[j],
            status: 'PENDING',
          });

          // Si hay segunda vuelta, invertimos
          if (legs === 2 && leg === 0) {
            matches.push({
              matchNumber: matchNumber++,
              round: 1,
              homeTeam: teams[j],
              awayTeam: teams[i],
              status: 'PENDING',
            });
          }
        }
      }
    }

    return matches;
  }

  private generateGroupPhase(config: TournamentConfigurationData): Match[] {
    const matches: Match[] = [];
    const groupConfig = config.groupPhaseConfig;

    if (!groupConfig) {
      throw new Error('Group phase configuration is required');
    }

    // Distribuir equipos en grupos
    const groups = this.distributeTeamsIntoGroups(
      config.teams,
      groupConfig.numberOfGroups,
      groupConfig.teamsPerGroup
    );

    let matchNumber = 1;

    // Generar matches dentro de cada grupo (todos contra todos en cada grupo)
    groups.forEach((group, index) => {
      for (let i = 0; i < group.teams.length; i++) {
        for (let j = i + 1; j < group.teams.length; j++) {
          // Ida
          matches.push({
            matchNumber: matchNumber++,
            round: 1,
            homeTeam: group.teams[i],
            awayTeam: group.teams[j],
            status: 'PENDING',
          });

          // Vuelta
          matches.push({
            matchNumber: matchNumber++,
            round: 2,
            homeTeam: group.teams[j],
            awayTeam: group.teams[i],
            status: 'PENDING',
          });
        }
      }
    });

    return matches;
  }

  private generateKnockout(config: TournamentConfigurationData): Match[] {
    const matches: Match[] = [];
    const knockoutConfig = config.knockoutConfig;

    if (!knockoutConfig) {
      throw new Error('Knockout configuration is required');
    }

    let teams = [...config.teams];

    // Emparejar según tipo
    if (knockoutConfig.pairingType === PairingType.FIRST_VS_LAST) {
      teams = teams; // Los equipos deberían estar ordenados
    } else if (knockoutConfig.pairingType === PairingType.RANDOM) {
      teams = this.shuffleArray([...teams]);
    }

    // Generar ronda actual
    let round = 1;
    let matchNumber = 1;
    let currentTeams = teams;

    while (currentTeams.length > 1) {
      const roundMatches: Match[] = [];

      for (let i = 0; i < currentTeams.length; i += 2) {
        const homeTeam = currentTeams[i];
        const awayTeam = i + 1 < currentTeams.length ? currentTeams[i + 1] : null;

        if (awayTeam) {
          const isFinal = currentTeams.length === 2;
          const matchesNeeded = isFinal && knockoutConfig.finalTwoLegs ? 2 : knockoutConfig.twoLegs ? 2 : 1;

          for (let leg = 0; leg < matchesNeeded; leg++) {
            roundMatches.push({
              matchNumber: matchNumber++,
              round: round + leg,
              homeTeam: leg === 0 ? homeTeam : awayTeam,
              awayTeam: leg === 0 ? awayTeam : homeTeam,
              status: 'PENDING',
              isKnockoutMatch: true,
              isFinal: isFinal,
            });
          }
        } else if (knockoutConfig.allowByes) {
          // Bye: el equipo avanza automáticamente
          roundMatches.push({
            matchNumber: matchNumber++,
            round: round,
            homeTeam: homeTeam,
            awayTeam: { id: -1, name: 'BYE' }, // Marcador especial
            status: 'PLAYED',
            homeTeamGoals: 1,
            awayTeamGoals: 0,
            isKnockoutMatch: true,
          });
        }
      }

      matches.push(...roundMatches);

      // Simular que los ganadores avanzan a la siguiente ronda
      currentTeams = roundMatches
        .filter(m => m.awayTeam.id !== -1)
        .slice(0, Math.ceil(currentTeams.length / 2))
        .map((_, i) => currentTeams[i * 2]);

      round++;
    }

    return matches;
  }

  private generateMixedFormat(config: TournamentConfigurationData): Match[] {
    const matches: Match[] = [];

    // Primero generar fase de grupos
    const groupMatches = this.generateGroupPhase(config);
    matches.push(...groupMatches);

    // Luego generar fase de knockout
    const topTeams = this.getTopTeamsFromGroups(config, config.mixedFormatConfig?.teamsAdvancingToKnockout || 4);

    const knockoutConfig: TournamentConfigurationData = {
      ...config,
      teams: topTeams,
      formatType: TournamentFormatType.KNOCKOUT,
    };

    const knockoutMatches = this.generateKnockout(knockoutConfig);
    const adjustedMatches = knockoutMatches.map((match, index) => ({
      ...match,
      matchNumber: matches.length + index + 1,
      round: Math.ceil((matches.length + index + 1) / 2),
    }));

    matches.push(...adjustedMatches);
    return matches;
  }

  private scheduleMatches(matches: Match[], config: TournamentConfigurationData): Match[] {
    const calendarConfig = config.calendarConfig;
    const dayMap: { [key: string]: number } = {
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
      Sunday: 0,
    };

    let currentDate = new Date();
    let matchIndex = 0;
    let matchPerDay = 0;

    return matches.map((match, index) => {
      // Avanzar al siguiente día de juego si ya hemos jugado suficientes partidos
      if (matchPerDay >= calendarConfig.matchesPerDay) {
        currentDate.setDate(currentDate.getDate() + 1);
        matchPerDay = 0;

        // Saltar días que no sean de juego
        while (!calendarConfig.playDays.includes(this.getDayName(currentDate))) {
          currentDate.setDate(currentDate.getDate() + 1);
        }

        // Agregar pausa entre rondas si está configurada
        if (calendarConfig.pauseDaysBetweenRounds && index > 0 && index % 4 === 0) {
          currentDate.setDate(currentDate.getDate() + calendarConfig.pauseDaysBetweenRounds);
        }
      }

      const [hours, minutes] = calendarConfig.firstMatchStartTime.split(':').map(Number);
      const matchTime = new Date(currentDate);
      matchTime.setHours(hours + matchPerDay * 2, minutes, 0); // Cada partido 2 horas de diferencia

      match.scheduledDate = new Date(matchTime);
      match.scheduledTime = `${String(matchTime.getHours()).padStart(2, '0')}:${String(matchTime.getMinutes()).padStart(2, '0')}`;

      matchPerDay++;
      return match;
    });
  }

  private distributeTeamsIntoGroups(
    teams: TeamEntry[],
    numberOfGroups: number,
    teamsPerGroup: number
  ): GroupConfiguration[] {
    const groups: GroupConfiguration[] = [];
    const shuffled = this.shuffleArray([...teams]);

    for (let i = 0; i < numberOfGroups; i++) {
      const groupTeams = shuffled.slice(i * teamsPerGroup, (i + 1) * teamsPerGroup);
      groups.push({
        groupNumber: i + 1,
        teams: groupTeams,
        teamsAdvancing: 2, // Por defecto 2 clasificados por grupo
      });
    }

    return groups;
  }

  private getTopTeamsFromGroups(
    config: TournamentConfigurationData,
    count: number
  ): TeamEntry[] {
    // En un escenario real, esto requeriría tabla de posiciones
    // Por ahora, retornamos los primeros equipos de cada grupo
    return config.teams.slice(0, Math.min(count, config.teams.length));
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private getDayName(date: Date): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  }
}


import { Injectable } from '@angular/core';
import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { TournamentConfigurationData, TournamentFormatType } from '../models/tournament-configuration';

@Injectable({
  providedIn: 'root',
})
export class TournamentValidationService {
  /**
   * Validadores personalizados para formularios reactivos
   */

  // Validador de nombre de torneo
  tournamentNameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const value = control.value.trim();

      if (value.length < 3) {
        return { minLength: { requiredLength: 3, actualLength: value.length } };
      }

      if (value.length > 100) {
        return { maxLength: { requiredLength: 100, actualLength: value.length } };
      }

      // No permitir números al inicio
      if (/^\d/.test(value)) {
        return { invalidStart: true };
      }

      return null;
    };
  }

  // Validador de cantidad de equipos
  numberOfTeamsValidator(min: number = 2, max: number = 128): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const value = Number(control.value);

      if (isNaN(value)) {
        return { notANumber: true };
      }

      if (value < min) {
        return { min: { min, actual: value } };
      }

      if (value > max) {
        return { max: { max, actual: value } };
      }

      // La cantidad de equipos debe ser válida según el formato
      if (![2, 3, 4, 6, 8, 12, 16, 32, 64, 128].includes(value)) {
        return { invalidTeamCount: { value } };
      }

      return null;
    };
  }

  // Validador de equipos por grupo
  teamsPerGroupValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const value = Number(control.value);

      // Valores válidos: 2, 3, 4, 5, etc. (mínimo 2)
      if (value < 2 || value > 12) {
        return { invalidTeamsPerGroup: true };
      }

      return null;
    };
  }

  // Validador de cantidad de grupos
  numberOfGroupsValidator(teams: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const groups = Number(control.value);
      const teamsPerGroup = Math.ceil(teams / groups);

      if (teamsPerGroup < 2) {
        return { tooManyGroups: { teams, groups, teamsPerGroup } };
      }

      if (teamsPerGroup > 12) {
        return { tooFewGroups: { teams, groups, teamsPerGroup } };
      }

      return null;
    };
  }

  // Validador de hora
  timeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

      if (!timePattern.test(control.value)) {
        return { invalidTime: true };
      }

      return null;
    };
  }

  // Validador de duración de partido
  matchDurationValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const duration = Number(control.value);

      if (duration < 30 || duration > 180) {
        return { invalidDuration: { min: 30, max: 180, actual: duration } };
      }

      return null;
    };
  }

  /**
   * Validaciones de reglas de negocio
   */

  validateTournamentConfiguration(config: TournamentConfigurationData): Map<string, string[]> {
    const errors = new Map<string, string[]>();

    // Validar información básica
    if (!config.name || config.name.trim().length < 3) {
      errors.set('name', ['El nombre debe tener al menos 3 caracteres']);
    }

    // Validar equipos
    if (config.numberOfTeams < 2) {
      errors.set('numberOfTeams', ['Se requieren al menos 2 equipos']);
    }

    if (config.teams.length !== config.numberOfTeams) {
      errors.set('teams', [`Se requieren ${config.numberOfTeams} equipos. Actual: ${config.teams.length}`]);
    }

    // Validaciones específicas por formato
    switch (config.formatType) {
      case TournamentFormatType.ROUND_ROBIN:
        this.validateRoundRobin(config, errors);
        break;
      case TournamentFormatType.GROUP_PHASE:
        this.validateGroupPhase(config, errors);
        break;
      case TournamentFormatType.KNOCKOUT:
        this.validateKnockout(config, errors);
        break;
      case TournamentFormatType.MIXED:
        this.validateMixedFormat(config, errors);
        break;
    }

    // Validar calendario
    this.validateCalendar(config, errors);

    return errors;
  }

  private validateRoundRobin(config: TournamentConfigurationData, errors: Map<string, string[]>): void {
    // Round Robin funciona con cualquier cantidad de equipos
    if (config.numberOfTeams < 2) {
      if (!errors.has('roundRobinTeams')) {
        errors.set('roundRobinTeams', []);
      }
      errors.get('roundRobinTeams')?.push('Se requieren al menos 2 equipos para Round Robin');
    }
  }

  private validateGroupPhase(config: TournamentConfigurationData, errors: Map<string, string[]>): void {
    const groupConfig = config.groupPhaseConfig;

    if (!groupConfig) {
      errors.set('groupPhase', ['Configuración de grupos requerida']);
      return;
    }

    if (groupConfig.numberOfGroups < 2) {
      if (!errors.has('numberOfGroups')) {
        errors.set('numberOfGroups', []);
      }
      errors.get('numberOfGroups')?.push('Se requieren al menos 2 grupos');
    }

    if (groupConfig.teamsPerGroup < 2) {
      if (!errors.has('teamsPerGroup')) {
        errors.set('teamsPerGroup', []);
      }
      errors.get('teamsPerGroup')?.push('Se requieren al menos 2 equipos por grupo');
    }

    const totalCapacity = groupConfig.numberOfGroups * groupConfig.teamsPerGroup;
    if (totalCapacity < config.numberOfTeams) {
      if (!errors.has('groupCapacity')) {
        errors.set('groupCapacity', []);
      }
      errors.get('groupCapacity')?.push(
        `La capacidad total (${totalCapacity}) no puede ser menor que los equipos (${config.numberOfTeams})`
      );
    }

    if (groupConfig.teamsAdvancingPerGroup > groupConfig.teamsPerGroup) {
      if (!errors.has('advancingTeams')) {
        errors.set('advancingTeams', []);
      }
      errors.get('advancingTeams')?.push(
        `No pueden avanzar ${groupConfig.teamsAdvancingPerGroup} equipos si el grupo tiene ${groupConfig.teamsPerGroup}`
      );
    }
  }

  private validateKnockout(config: TournamentConfigurationData, errors: Map<string, string[]>): void {
    // Validar que la cantidad de equipos sea potencia de 2 para knockout puro
    const teamCount = config.numberOfTeams;
    const isPowerOfTwo = (teamCount & (teamCount - 1)) === 0 && teamCount > 0;

    if (!isPowerOfTwo && !config.knockoutConfig?.allowByes) {
      if (!errors.has('knockoutTeams')) {
        errors.set('knockoutTeams', []);
      }
      errors.get('knockoutTeams')?.push(
        `Para knockout sin byes, se requiere potencia de 2 equipos. Actual: ${teamCount}. (Habilitar byes o seleccionar ${this.getClosestPowerOfTwo(teamCount)} equipos)`
      );
    }
  }

  private validateMixedFormat(config: TournamentConfigurationData, errors: Map<string, string[]>): void {
    // Validar ambas configuraciones
    this.validateGroupPhase(config, errors);

    const teamsAdvancing = config.mixedFormatConfig?.teamsAdvancingToKnockout || 4;
    if (teamsAdvancing < 2) {
      if (!errors.has('mixedTeamsAdvancing')) {
        errors.set('mixedTeamsAdvancing', []);
      }
      errors.get('mixedTeamsAdvancing')?.push('Se requieren al menos 2 equipos para avanzar a knockout');
    }

    if (!((teamsAdvancing & (teamsAdvancing - 1)) === 0)) {
      if (!errors.has('advancingTeamsPowerOfTwo')) {
        errors.set('advancingTeamsPowerOfTwo', []);
      }
      errors.get('advancingTeamsPowerOfTwo')?.push(
        `Los equipos que avanzan deben ser potencia de 2. Actual: ${teamsAdvancing}`
      );
    }
  }

  private validateCalendar(config: TournamentConfigurationData, errors: Map<string, string[]>): void {
    const calendarConfig = config.calendarConfig;

    if (!calendarConfig) {
      errors.set('calendar', ['Configuración de calendario requerida']);
      return;
    }

    if (calendarConfig.matchDuration < 30 || calendarConfig.matchDuration > 180) {
      if (!errors.has('matchDuration')) {
        errors.set('matchDuration', []);
      }
      errors.get('matchDuration')?.push(
        `La duración debe estar entre 30 y 180 minutos. Actual: ${calendarConfig.matchDuration}`
      );
    }

    if (calendarConfig.playDays.length === 0) {
      if (!errors.has('playDays')) {
        errors.set('playDays', []);
      }
      errors.get('playDays')?.push('Selecciona al menos un día de juego');
    }

    if (calendarConfig.matchesPerDay < 1 || calendarConfig.matchesPerDay > 10) {
      if (!errors.has('matchesPerDay')) {
        errors.set('matchesPerDay', []);
      }
      errors.get('matchesPerDay')?.push('Selecciona entre 1 y 10 partidos por día');
    }
  }

  private getClosestPowerOfTwo(num: number): number {
    let power = 1;
    while (power < num) {
      power *= 2;
    }
    return power;
  }

  /**
   * Utilidades de validación
   */

  getErrorMessage(errorObj: ValidationErrors | null, fieldName: string): string {
    if (!errorObj) {
      return '';
    }

    if (errorObj['required']) {
      return `${fieldName} es requerido`;
    }

    if (errorObj['minLength']) {
      return `${fieldName} debe tener al menos ${errorObj['minLength'].requiredLength} caracteres`;
    }

    if (errorObj['maxLength']) {
      return `${fieldName} no puede exceder ${errorObj['maxLength'].requiredLength} caracteres`;
    }

    if (errorObj['min']) {
      return `${fieldName} debe ser al menos ${errorObj['min'].min}`;
    }

    if (errorObj['max']) {
      return `${fieldName} no puede exceder ${errorObj['max'].max}`;
    }

    if (errorObj['pattern']) {
      return `${fieldName} tiene un formato inválido`;
    }

    return `${fieldName} es inválido`;
  }
}


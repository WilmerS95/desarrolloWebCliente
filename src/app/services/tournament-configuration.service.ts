import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  TournamentConfigurationData,
  TournamentWizardState,
  TournamentFormatType,
} from '../models/tournament-configuration';

@Injectable({
  providedIn: 'root',
})
export class TournamentConfigurationService {
  private readonly TOTAL_STEPS = 6;

  private wizardStateSubject = new BehaviorSubject<TournamentWizardState>(
    this.createInitialState()
  );

  public wizardState$ = this.wizardStateSubject.asObservable();

  constructor() {}

  private createInitialState(): TournamentWizardState {
    return {
      currentStep: 1,
      totalSteps: this.TOTAL_STEPS,
      completedSteps: new Set(),
      data: {
        name: '',
        description: '',
        location: '',
        teams: [],
        numberOfTeams: 0,
        formatType: TournamentFormatType.ROUND_ROBIN,
        calendarConfig: {
          matchDuration: 90,
          firstMatchStartTime: '09:00',
          playDays: ['Saturday', 'Sunday'],
          matchesPerDay: 2,
          pauseDaysBetweenRounds: 1,
        },
        status: 'DRAFT',
      },
      isValid: false,
      errors: new Map(),
    };
  }

  getCurrentState(): TournamentWizardState {
    return this.wizardStateSubject.value;
  }

  updateData(data: Partial<TournamentConfigurationData>): void {
    const currentState = this.getCurrentState();
    currentState.data = { ...currentState.data, ...data };
    this.wizardStateSubject.next({ ...currentState });
  }

  nextStep(): void {
    const currentState = this.getCurrentState();
    if (currentState.currentStep < currentState.totalSteps) {
      currentState.completedSteps.add(currentState.currentStep);
      currentState.currentStep += 1;
      this.wizardStateSubject.next({ ...currentState });
    }
  }

  previousStep(): void {
    const currentState = this.getCurrentState();
    if (currentState.currentStep > 1) {
      currentState.currentStep -= 1;
      this.wizardStateSubject.next({ ...currentState });
    }
  }

  goToStep(step: number): void {
    const currentState = this.getCurrentState();
    if (step >= 1 && step <= currentState.totalSteps) {
      currentState.currentStep = step;
      this.wizardStateSubject.next({ ...currentState });
    }
  }

  markStepAsCompleted(step: number): void {
    const currentState = this.getCurrentState();
    currentState.completedSteps.add(step);
    this.wizardStateSubject.next({ ...currentState });
  }

  setErrors(stepErrors: Map<string, string[]>): void {
    const currentState = this.getCurrentState();
    currentState.errors = stepErrors;
    this.wizardStateSubject.next({ ...currentState });
  }

  clearErrors(): void {
    const currentState = this.getCurrentState();
    currentState.errors.clear();
    this.wizardStateSubject.next({ ...currentState });
  }

  resetWizard(): void {
    this.wizardStateSubject.next(this.createInitialState());
  }

  getConfigurationData(): TournamentConfigurationData {
    return this.getCurrentState().data;
  }

  saveConfiguration(): Observable<TournamentConfigurationData> {
    const data = this.getConfigurationData();
    data.status = 'CONFIGURED';
    return new Observable(observer => {
      setTimeout(() => {
        observer.next(data);
        observer.complete();
      }, 500);
    });
  }

  validateStep(step: number): boolean {
    const state = this.getCurrentState();

    switch (step) {
      case 1: // Información básica
        return state.data.name && state.data.name.trim().length >= 3;
      case 2: // Equipos
        return state.data.numberOfTeams >= 2 && state.data.teams.length === state.data.numberOfTeams;
      case 3: // Formato
        return !!state.data.formatType;
      case 4: // Calendario
        return !!state.data.calendarConfig && state.data.calendarConfig.matchDuration > 0;
      case 5: // Vista previa del calendario
        return state.data.matches && state.data.matches.length > 0;
      case 6: // Revisión
        return true;
      default:
        return false;
    }
  }
}


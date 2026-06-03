import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TournamentConfigurationService } from '../services/tournament-configuration.service';
import { FixtureGenerationService } from '../services/fixture-generation.service';
import { TournamentValidationService } from '../services/tournament-validation.service';
import { TournamentWizardState } from '../shared/models/tournament-configuration';

import { TournamentBasicInfoComponent } from './tournament-wizard/tournament-basic-info.component';
import { TournamentTeamsConfigComponent } from './tournament-wizard/tournament-teams-config.component';
import { TournamentFormatConfigComponent } from './tournament-wizard/tournament-format-config.component';
import { TournamentCalendarConfigComponent } from './tournament-wizard/tournament-calendar-config.component';
import { TournamentCalendarPreviewComponent } from './tournament-wizard/tournament-calendar-preview.component';
import { TournamentReviewComponent } from './tournament-wizard/tournament-review.component';

@Component({
  selector: 'app-tournament-wizard',
  standalone: true,
  imports: [
    CommonModule,
    TournamentBasicInfoComponent,
    TournamentTeamsConfigComponent,
    TournamentFormatConfigComponent,
    TournamentCalendarConfigComponent,
    TournamentCalendarPreviewComponent,
    TournamentReviewComponent,
  ],
  template: `
    <div class="tournament-wizard-container">
      <div class="wizard-header">
        <h1>Creador de Torneos - Configuración Avanzada</h1>
        <p class="subtitle">Configura tu torneo deportivo paso a paso</p>
      </div>

      <!-- Progress Stepper -->
      <div class="wizard-stepper">
        <div class="steps-container">
          <button
            *ngFor="let step of getSteps()"
            [ngClass]="getStepClasses(step.number)"
            (click)="goToStep(step.number)"
            [disabled]="!isStepAccessible(step.number)"
          >
            <span class="step-number">{{ step.number }}</span>
            <span class="step-title">{{ step.title }}</span>
          </button>
        </div>
        <div class="progress-line">
          <div
            class="progress-fill"
            [style.width.%]="(wizardState?.currentStep || 0) * (100 / 6)"
          ></div>
        </div>
      </div>

      <!-- Wizard Content -->
      <div class="wizard-content">
        <!-- Step 1: Información Básica -->
        <app-tournament-basic-info
          *ngIf="wizardState?.currentStep === 1"
          (next)="nextStep()"
        ></app-tournament-basic-info>

        <!-- Step 2: Configuración de Equipos -->
        <app-tournament-teams-config
          *ngIf="wizardState?.currentStep === 2"
          (next)="nextStep()"
          (previous)="previousStep()"
        ></app-tournament-teams-config>

        <!-- Step 3: Configuración del Formato -->
        <app-tournament-format-config
          *ngIf="wizardState?.currentStep === 3"
          (next)="nextStep()"
          (previous)="previousStep()"
        ></app-tournament-format-config>

        <!-- Step 4: Configuración del Calendario -->
        <app-tournament-calendar-config
          *ngIf="wizardState?.currentStep === 4"
          (next)="nextStep()"
          (previous)="previousStep()"
        ></app-tournament-calendar-config>

        <!-- Step 5: Vista Previa del Calendario -->
        <app-tournament-calendar-preview
          *ngIf="wizardState?.currentStep === 5"
          (next)="nextStep()"
          (previous)="previousStep()"
        ></app-tournament-calendar-preview>

        <!-- Step 6: Revisión y Confirmación -->
        <app-tournament-review
          *ngIf="wizardState?.currentStep === 6"
          (previous)="previousStep()"
          (submit)="submitTournament()"
        ></app-tournament-review>
      </div>

      <!-- Action Buttons -->
      <div class="wizard-actions" *ngIf="wizardState">
        <button
          class="btn btn-secondary"
          (click)="resetWizard()"
          [disabled]="wizardState.currentStep === 1"
        >
          Cancelar
        </button>
        <div class="spacer"></div>
        <button
          class="btn btn-info"
          (click)="previousStep()"
          [disabled]="wizardState.currentStep === 1"
        >
          ← Anterior
        </button>
        <button
          class="btn btn-primary"
          (click)="nextStep()"
          [disabled]="wizardState.currentStep === 6"
        >
          Siguiente →
        </button>
        <button
          class="btn btn-success"
          (click)="submitTournament()"
          [disabled]="wizardState.currentStep !== 6"
        >
          Crear Torneo
        </button>
      </div>
    </div>
  `,
  styles: [`
    .tournament-wizard-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .wizard-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .wizard-header h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      color: #2c3e50;
    }

    .subtitle {
      font-size: 1.1rem;
      color: #7f8c8d;
    }

    .wizard-stepper {
      position: relative;
      margin-bottom: 3rem;
    }

    .steps-container {
      display: flex;
      justify-content: space-between;
      position: relative;
      z-index: 2;
    }

    .steps-container button {
      background: white;
      border: 2px solid #bdc3c7;
      border-radius: 50%;
      width: 60px;
      height: 60px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      font-weight: bold;
    }

    .steps-container button .step-number {
      font-size: 1.5rem;
      color: #2c3e50;
    }

    .steps-container button .step-title {
      font-size: 0.65rem;
      text-align: center;
      max-width: 90px;
      line-height: 1.2;
      margin-top: 0.25rem;
      color: #7f8c8d;
    }

    .steps-container button.completed {
      background: #27ae60;
      border-color: #27ae60;
      color: white;
    }

    .steps-container button.completed .step-number,
    .steps-container button.completed .step-title {
      color: white;
    }

    .steps-container button.active {
      background: #3498db;
      border-color: #3498db;
      box-shadow: 0 0 10px rgba(52, 152, 219, 0.5);
    }

    .steps-container button.active .step-number,
    .steps-container button.active .step-title {
      color: white;
    }

    .steps-container button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .progress-line {
      position: absolute;
      top: 30px;
      left: 0;
      right: 0;
      height: 2px;
      background: #ecf0f1;
      z-index: 1;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #3498db, #27ae60);
      transition: width 0.3s ease;
    }

    .wizard-content {
      background: white;
      border-radius: 8px;
      padding: 2rem;
      min-height: 600px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
    }

    .wizard-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-top: 2rem;
    }

    .spacer {
      flex: 1;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-primary {
      background: #3498db;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #2980b9;
    }

    .btn-secondary {
      background: #95a5a6;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #7f8c8d;
    }

    .btn-success {
      background: #27ae60;
      color: white;
    }

    .btn-success:hover:not(:disabled) {
      background: #229954;
    }

    .btn-info {
      background: #16a085;
      color: white;
    }

    .btn-info:hover:not(:disabled) {
      background: #138d75;
    }
  `]
})
export class TournamentWizardComponent implements OnInit, OnDestroy {
  wizardState: TournamentWizardState | null = null;
  private destroy$ = new Subject<void>();

  private readonly STEPS = [
    { number: 1, title: 'Información Básica' },
    { number: 2, title: 'Configuración de Equipos' },
    { number: 3, title: 'Formato del Torneo' },
    { number: 4, title: 'Calendario' },
    { number: 5, title: 'Vista Previa' },
    { number: 6, title: 'Revisión' },
  ];

  constructor(
    private configService: TournamentConfigurationService,
    private fixtureService: FixtureGenerationService,
    private validationService: TournamentValidationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.configService.wizardState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.wizardState = state;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getSteps() {
    return this.STEPS;
  }

  getStepClasses(step: number): string {
    const classes = ['step-button'];

    if (this.wizardState?.currentStep === step) {
      classes.push('active');
    }

    if ((this.wizardState?.completedSteps || new Set()).has(step)) {
      classes.push('completed');
    }

    return classes.join(' ');
  }

  isStepAccessible(step: number): boolean {
    return step === 1 || (this.wizardState?.completedSteps || new Set()).has(step - 1);
  }

  goToStep(step: number): void {
    if (this.isStepAccessible(step)) {
      this.configService.goToStep(step);
    }
  }

  nextStep(): void {
    if (this.wizardState && this.configService.validateStep(this.wizardState.currentStep)) {
      this.configService.markStepAsCompleted(this.wizardState.currentStep);
      this.configService.nextStep();
    }
  }

  previousStep(): void {
    this.configService.previousStep();
  }

  resetWizard(): void {
    if (confirm('¿Estás seguro que deseas cancelar? Se perderán todos los cambios.')) {
      this.configService.resetWizard();
      this.router.navigate(['/tournaments']);
    }
  }

  submitTournament(): void {
    const config = this.configService.getConfigurationData();
    const errors = this.validationService.validateTournamentConfiguration(config);

    if (errors.size > 0) {
      alert('Hay errores en la configuración. Por favor, revisa cada paso.');
      return;
    }

    this.configService.saveConfiguration().subscribe({
      next: (savedConfig) => {
        alert('¡Torneo creado exitosamente!');
        this.router.navigate(['/tournaments']);
      },
      error: (error) => {
        alert('Error al crear el torneo. Intenta de nuevo.');
        console.error(error);
      }
    });
  }
}


import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TournamentConfigurationService } from '../../services/tournament-configuration.service';
import { TournamentValidationService } from '../../services/tournament-validation.service';

@Component({
  selector: 'app-tournament-calendar-config',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="calendar-config">
      <h2>Configuración del Calendario</h2>

      <form [formGroup]="form">
        <!-- Duración de Partidos -->
        <div class="form-row">
          <div class="form-group">
            <label for="matchDuration">Duración de cada Partido (minutos) *</label>
            <input
              id="matchDuration"
              type="number"
              formControlName="matchDuration"
              min="30"
              max="180"
              step="15"
              class="form-control"
            />
            <small class="error-message" *ngIf="getFieldError('matchDuration')">
              {{ getErrorMessage('matchDuration') }}
            </small>
            <small class="help-text">Min: 30, Max: 180 minutos</small>
          </div>

          <div class="form-group">
            <label for="firstMatchStartTime">Hora del Primer Partido *</label>
            <input
              id="firstMatchStartTime"
              type="time"
              formControlName="firstMatchStartTime"
              class="form-control"
            />
            <small class="error-message" *ngIf="getFieldError('firstMatchStartTime')">
              {{ getErrorMessage('firstMatchStartTime') }}
            </small>
          </div>

          <div class="form-group">
            <label for="matchesPerDay">Partidos por Día *</label>
            <input
              id="matchesPerDay"
              type="number"
              formControlName="matchesPerDay"
              min="1"
              max="10"
              class="form-control"
            />
            <small class="help-text">1-10 partidos</small>
          </div>
        </div>

        <!-- Días de Juego -->
        <div class="form-group">
          <label>Días de Juego *</label>
          <div class="days-selector">
            <label *ngFor="let day of daysOfWeek" class="day-checkbox">
              <input
                type="checkbox"
                [value]="day"
                (change)="onDayChange($event)"
              />
              <span>{{ day }}</span>
            </label>
          </div>
          <small class="error-message" *ngIf="getSelectedDays().length === 0">
            Selecciona al menos un día de juego
          </small>
        </div>

        <!-- Pausa entre Rondas -->
        <div class="form-group">
          <label for="pauseDays">Días de Pausa entre Rondas</label>
          <input
            id="pauseDays"
            type="number"
            formControlName="pauseDaysBetweenRounds"
            min="0"
            max="10"
            class="form-control"
          />
          <small class="help-text">Días de descanso entre jornadas (0 = sin pausa)</small>
        </div>

        <!-- Resumen del Calendario -->
        <div class="calendar-summary">
          <h3>Resumen de Configuración</h3>
          <div class="summary-items">
            <div class="summary-item">
              <span class="label">Duración por Partido:</span>
              <span class="value">{{ form.get('matchDuration')?.value }} minutos</span>
            </div>
            <div class="summary-item">
              <span class="label">Primer Partido:</span>
              <span class="value">{{ form.get('firstMatchStartTime')?.value }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Partidos por Día:</span>
              <span class="value">{{ form.get('matchesPerDay')?.value }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Días de Juego:</span>
              <span class="value">{{ getSelectedDays().join(', ') || 'Ninguno seleccionado' }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Duración Total Estimada:</span>
              <span class="value">{{ getEstimatedDuration() }} días</span>
            </div>
          </div>
        </div>

        <!-- Info Box -->
        <div class="info-box">
          <h4>Consejos:</h4>
          <ul>
            <li>La duración estimada se calcula con los días de juego seleccionados</li>
            <li>Consider separar los partidos para que los equipos tengan tiempo de recuperación</li>
            <li>Partidos importantes podrían necesitar más tiempo de preparación</li>
          </ul>
        </div>

        <!-- Botones de navegación -->
        <div class="form-actions">
          <button
            type="button"
            class="btn btn-info"
            (click)="onPrevious()"
          >
            ← Anterior
          </button>
          <button
            type="button"
            class="btn btn-primary"
            (click)="onNext()"
            [disabled]="!isFormValid()"
          >
            Siguiente →
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .calendar-config {
      animation: slideIn 0.3s ease-out;
    }

    h2 {
      color: #2c3e50;
      margin-bottom: 2rem;
      font-size: 1.8rem;
    }

    h3 {
      color: #34495e;
      margin: 1.5rem 0 1rem 0;
      font-size: 1.2rem;
    }

    h4 {
      color: #2c3e50;
      margin: 0.5rem 0 0.25rem 0;
      font-size: 0.95rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #2c3e50;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #bdc3c7;
      border-radius: 4px;
      font-size: 1rem;
      transition: border-color 0.3s ease;
    }

    .form-control:focus {
      outline: none;
      border-color: #3498db;
      box-shadow: 0 0 5px rgba(52, 152, 219, 0.3);
    }

    .error-message {
      display: block;
      color: #e74c3c;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .help-text {
      display: block;
      color: #7f8c8d;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .days-selector {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 4px;
    }

    .day-checkbox {
      display: flex;
      align-items: center;
      cursor: pointer;
      user-select: none;
    }

    .day-checkbox input {
      margin-right: 0.5rem;
      cursor: pointer;
    }

    .day-checkbox span {
      color: #2c3e50;
    }

    .calendar-summary {
      background: #ecf0f1;
      padding: 1.5rem;
      border-radius: 8px;
      margin: 2rem 0;
      border-left: 4px solid #3498db;
    }

    .summary-items {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }

    .summary-item {
      background: white;
      padding: 1rem;
      border-radius: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border: 1px solid #bdc3c7;
    }

    .summary-item .label {
      font-weight: 500;
      color: #34495e;
    }

    .summary-item .value {
      color: #3498db;
      font-weight: bold;
      text-align: right;
    }

    .info-box {
      background: #fff;
      padding: 1rem;
      border-radius: 4px;
      margin: 1.5rem 0;
      border: 1px solid #bdc3c7;
      border-left: 4px solid #16a085;
    }

    .info-box ul {
      margin: 0.5rem 0 0 0;
      padding-left: 1.5rem;
      font-size: 0.9rem;
      color: #34495e;
    }

    .info-box li {
      margin-bottom: 0.25rem;
    }

    .form-actions {
      margin-top: 2rem;
      display: flex;
      gap: 1rem;
      justify-content: space-between;
    }

    .btn {
      padding: 0.75rem 2rem;
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
      transform: translateY(-2px);
    }

    .btn-info {
      background: #16a085;
      color: white;
    }

    .btn-info:hover:not(:disabled) {
      background: #138d75;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class TournamentCalendarConfigComponent implements OnInit, OnDestroy {
  @Output() next = new EventEmitter<void>();
  @Output() previous = new EventEmitter<void>();

  form: FormGroup;
  daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  private destroy$ = new Subject<void>();
  private selectedDays: string[] = [];

  constructor(
    private fb: FormBuilder,
    private configService: TournamentConfigurationService,
    private validationService: TournamentValidationService
  ) {
    this.form = this.createForm();
  }

  ngOnInit(): void {
    const config = this.configService.getConfigurationData();

    if (config.calendarConfig) {
      this.form.patchValue({
        matchDuration: config.calendarConfig.matchDuration,
        firstMatchStartTime: config.calendarConfig.firstMatchStartTime,
        matchesPerDay: config.calendarConfig.matchesPerDay,
        pauseDaysBetweenRounds: config.calendarConfig.pauseDaysBetweenRounds || 0,
      });
      this.selectedDays = [...config.calendarConfig.playDays];
    }

    this.form.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateConfiguration());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      matchDuration: [90, [
        Validators.required,
        this.validationService.matchDurationValidator()
      ]],
      firstMatchStartTime: ['09:00', [
        Validators.required,
        this.validationService.timeValidator()
      ]],
      matchesPerDay: [2, [Validators.required, Validators.min(1), Validators.max(10)]],
      pauseDaysBetweenRounds: [1, [Validators.required, Validators.min(0), Validators.max(10)]],
    });
  }

  getSelectedDays(): string[] {
    return this.selectedDays;
  }

  onDayChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const day = checkbox.value;

    if (checkbox.checked) {
      if (!this.selectedDays.includes(day)) {
        this.selectedDays.push(day);
      }
    } else {
      this.selectedDays = this.selectedDays.filter(d => d !== day);
    }

    this.updateConfiguration();
  }

  getEstimatedDuration(): number {
    const config = this.configService.getConfigurationData();
    const numberOfTeams = config.numberOfTeams;

    // Calcular cantidad estimada de partidos según el formato
    let totalMatches = 0;
    switch (config.formatType) {
      case 'ROUND_ROBIN':
        totalMatches = (numberOfTeams * (numberOfTeams - 1)) / 2;
        if (config.roundRobinConfig?.legs === 2) {
          totalMatches *= 2;
        }
        break;
      case 'GROUP_PHASE':
        const groupConfig = config.groupPhaseConfig;
        if (groupConfig) {
          const matchesPerGroup = (groupConfig.teamsPerGroup * (groupConfig.teamsPerGroup - 1)) / 2;
          totalMatches = groupConfig.numberOfGroups * matchesPerGroup * 2; // Ida y vuelta
        }
        break;
      case 'KNOCKOUT':
        totalMatches = numberOfTeams - 1;
        break;
      case 'MIXED':
        totalMatches = Math.ceil(numberOfTeams * 1.5);
        break;
    }

    const matchDuration = this.form.get('matchDuration')?.value || 90;
    const matchesPerDay = this.form.get('matchesPerDay')?.value || 1;
    const playDays = this.selectedDays.length || 1;

    // Calcular días requeridos
    const totalDuration = Math.ceil((totalMatches / matchesPerDay) / (playDays / 7));
    return Math.max(1, totalDuration);
  }

  isFormValid(): boolean {
    return this.form.valid && this.selectedDays.length > 0;
  }

  getFieldError(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  getErrorMessage(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (control?.errors) {
      return this.validationService.getErrorMessage(control.errors, fieldName);
    }
    return '';
  }

  private updateConfiguration(): void {
    this.configService.updateData({
      calendarConfig: {
        matchDuration: this.form.get('matchDuration')?.value || 90,
        firstMatchStartTime: this.form.get('firstMatchStartTime')?.value || '09:00',
        playDays: this.selectedDays,
        matchesPerDay: this.form.get('matchesPerDay')?.value || 1,
        pauseDaysBetweenRounds: this.form.get('pauseDaysBetweenRounds')?.value || 0,
      },
    });
  }

  onNext(): void {
    if (this.isFormValid()) {
      this.next.emit();
    }
  }

  onPrevious(): void {
    this.previous.emit();
  }
}


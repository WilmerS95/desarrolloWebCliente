import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TournamentConfigurationService } from '../../services/tournament-configuration.service';
import { TournamentValidationService } from '../../services/tournament-validation.service';
import { TournamentFormatType } from '../../shared/models/tournament-configuration';

@Component({
  selector: 'app-tournament-basic-info',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="tournament-basic-info">
      <h2>Información Básica del Torneo</h2>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <!-- Nombre del Torneo -->
        <div class="form-group">
          <label for="name">Nombre del Torneo *</label>
          <input
            id="name"
            type="text"
            formControlName="name"
            placeholder="Ej: Liga de Fut 2026"
            class="form-control"
          />
          <small class="error-message" *ngIf="getFieldError('name')">
            {{ getErrorMessage('name') }}
          </small>
          <small class="help-text">Mínimo 3 caracteres, máximo 100</small>
        </div>

        <!-- Descripción -->
        <div class="form-group">
          <label for="description">Descripción</label>
          <textarea
            id="description"
            formControlName="description"
            placeholder="Describe brevemente el torneo (opcional)"
            class="form-control"
            rows="3"
          ></textarea>
          <small class="help-text">Máximo 500 caracteres</small>
        </div>

        <!-- Ubicación -->
        <div class="form-group">
          <label for="location">Ubicación</label>
          <input
            id="location"
            type="text"
            formControlName="location"
            placeholder="Ej: Estadio Municipal"
            class="form-control"
          />
          <small class="help-text">Donde se jugarán los partidos (opcional)</small>
        </div>

        <!-- Tipo de Torneo -->
        <div class="form-group">
          <label for="formatType">Tipo de Torneo *</label>
          <select
            id="formatType"
            formControlName="formatType"
            class="form-control"
          >
            <option value="">Selecciona un tipo</option>
            <option value="ROUND_ROBIN">Round Robin (Todos contra todos)</option>
            <option value="GROUP_PHASE">Fase de Grupos</option>
            <option value="KNOCKOUT">Eliminatoria Directa</option>
            <option value="MIXED">Formato Mixto (Grupos + Eliminatoria)</option>
          </select>
          <small class="error-message" *ngIf="getFieldError('formatType')">
            {{ getErrorMessage('formatType') }}
          </small>
          <small class="help-text">Selecciona el formato que deseas usar</small>
        </div>

        <!-- Descripción del Formato Seleccionado -->
        <div class="format-description" *ngIf="form.get('formatType')?.value">
          {{ getFormatDescription(form.get('formatType')?.value) }}
        </div>

        <!-- Botón Siguiente -->
        <div class="form-actions">
          <button
            type="button"
            class="btn btn-primary"
            (click)="goToNext()"
            [disabled]="!form.valid"
          >
            Siguiente →
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .tournament-basic-info {
      animation: slideIn 0.3s ease-out;
    }

    h2 {
      color: #2c3e50;
      margin-bottom: 2rem;
      font-size: 1.8rem;
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

    .form-control.ng-invalid.ng-touched {
      border-color: #e74c3c;
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

    .format-description {
      background: #ecf0f1;
      padding: 1rem;
      border-left: 4px solid #3498db;
      border-radius: 4px;
      margin: 2rem 0;
      color: #2c3e50;
      line-height: 1.6;
    }

    .form-actions {
      margin-top: 2rem;
      display: flex;
      justify-content: flex-end;
    }

    .btn {
      padding: 0.75rem 2rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background: #3498db;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #2980b9;
      transform: translateY(-2px);
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
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
export class TournamentBasicInfoComponent implements OnInit, OnDestroy {
  @Output() next = new EventEmitter<void>();

  form: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private configService: TournamentConfigurationService,
    private validationService: TournamentValidationService
  ) {
    this.form = this.createForm();
  }

  ngOnInit(): void {
    const config = this.configService.getConfigurationData();
    this.form.patchValue({
      name: config.name,
      description: config.description,
      location: config.location,
      formatType: config.formatType,
    });

    this.form.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(values => {
        this.configService.updateData(values);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, this.validationService.tournamentNameValidator()]],
      description: ['', [Validators.maxLength(500)]],
      location: [''],
      formatType: ['', Validators.required],
    });
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

  getFormatDescription(format: string): string {
    const descriptions: { [key: string]: string } = {
      ROUND_ROBIN: `Round Robin: Todos los equipos juegan contra todos los demás.
                    Sencillo y justo, pero requiere muchos partidos. Ideal para torneos pequeños.`,
      GROUP_PHASE: `Fase de Grupos: Los equipos se dividen en grupos. Cada equipo juega contra otros
                    en su grupo. Los mejores avanzan a la siguiente fase. Eficiente para muchos equipos.`,
      KNOCKOUT: `Eliminatoria Directa: Torneo de eliminación simple. Un equipo es eliminado cuando pierde.
                  Los ganadores avanzan a la siguiente ronda hasta determinar un campeón.`,
      MIXED: `Formato Mixto: Combina fase de grupos con eliminatoria. Los equipos comienzan en grupos,
              y los mejores avanzan a la fase de eliminación. Lo mejor de ambos mundos.`,
    };
    return descriptions[format] || '';
  }

  goToNext(): void {
    if (this.form.valid) {
      this.next.emit();
    }
  }
}


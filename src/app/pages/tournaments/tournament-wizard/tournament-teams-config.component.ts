import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TournamentConfigurationService } from '../../services/tournament-configuration.service';
import { TournamentValidationService } from '../../services/tournament-validation.service';
import { TeamEntry } from '../../shared/models/tournament-configuration';

@Component({
  selector: 'app-tournament-teams-config',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="teams-config">
      <h2>Configuración de Equipos</h2>

      <form [formGroup]="form">
        <!-- Cantidad de Equipos -->
        <div class="form-group">
          <label for="numberOfTeams">Cantidad de Equipos *</label>
          <input
            id="numberOfTeams"
            type="number"
            formControlName="numberOfTeams"
            min="2"
            max="128"
            class="form-control"
          />
          <small class="error-message" *ngIf="getFieldError('numberOfTeams')">
            {{ getErrorMessage('numberOfTeams') }}
          </small>
          <small class="help-text">Mínimo: 2, Máximo: 128</small>
        </div>

        <!-- Listado de Equipos -->
        <div class="teams-list-section" *ngIf="numberOfTeams > 0">
          <h3>Ingresa los nombres de los equipos</h3>
          <div class="teams-grid">
            <div
              *ngFor="let teamForm of getTeamsFormArray(); let i = index"
              class="team-input-group"
            >
              <label for="team-{{ i }}">Equipo {{ i + 1 }}</label>
              <input
                [id]="'team-' + i"
                type="text"
                [formControl]="teamForm"
                placeholder="Nombre del equipo"
                class="form-control"
              />
              <button
                type="button"
                class="btn-remove"
                (click)="removeTeam(i)"
                title="Eliminar equipo"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- Acciones para los equipos -->
          <div class="teams-actions">
            <button
              type="button"
              class="btn btn-secondary"
              (click)="generateRandomTeamNames()"
              [disabled]="teams.length === 0"
            >
              Generar Nombres Aleatorios
            </button>
            <button
              type="button"
              class="btn btn-secondary"
              (click)="clearAllTeams()"
              [disabled]="teams.length === 0"
            >
              Limpiar Todo
            </button>
          </div>

          <!-- Resumen -->
          <div class="summary">
            <p>
              Equipos ingresados: <strong>{{ teams.length }}</strong> de
              <strong>{{ numberOfTeams }}</strong>
            </p>
            <div class="progress-bar">
              <div
                class="progress-fill"
                [style.width.%]="(teams.length / numberOfTeams) * 100"
              ></div>
            </div>
          </div>
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
    .teams-config {
      animation: slideIn 0.3s ease-out;
    }

    h2 {
      color: #2c3e50;
      margin-bottom: 2rem;
      font-size: 1.8rem;
    }

    h3 {
      color: #34495e;
      margin-top: 2rem;
      margin-bottom: 1rem;
      font-size: 1.2rem;
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

    .teams-list-section {
      margin-top: 2rem;
    }

    .teams-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .team-input-group {
      position: relative;
    }

    .team-input-group label {
      font-size: 0.9rem;
      margin-bottom: 0.25rem;
    }

    .team-input-group .form-control {
      padding-right: 40px;
    }

    .btn-remove {
      position: absolute;
      right: 8px;
      top: 32px;
      background: #e74c3c;
      border: none;
      color: white;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-remove:hover {
      background: #c0392b;
      transform: scale(1.1);
    }

    .teams-actions {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
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
      transform: translateY(-2px);
    }

    .btn-secondary {
      background: #95a5a6;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #7f8c8d;
    }

    .btn-info {
      background: #16a085;
      color: white;
    }

    .btn-info:hover:not(:disabled) {
      background: #138d75;
    }

    .summary {
      background: #ecf0f1;
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 1.5rem;
    }

    .summary p {
      margin: 0 0 0.5rem 0;
      color: #2c3e50;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: #bdc3c7;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #3498db, #27ae60);
      transition: width 0.3s ease;
    }

    .form-actions {
      margin-top: 2rem;
      display: flex;
      gap: 1rem;
      justify-content: space-between;
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
export class TournamentTeamsConfigComponent implements OnInit, OnDestroy {
  @Output() next = new EventEmitter<void>();
  @Output() previous = new EventEmitter<void>();

  form: FormGroup;
  numberOfTeams = 0;
  teams: TeamEntry[] = [];
  private destroy$ = new Subject<void>();

  private readonly RANDOM_TEAM_NAMES = [
    'Águilas', 'Bravos', 'Cóndores', 'Dragones', 'Élite',
    'Fuegos', 'Gigantes', 'Halcones', 'Íconos', 'Jaguares',
    'Kamikaze', 'Leones', 'Maestros', 'Nómadas', 'Osos',
    'Panteras', 'Que Vueltas', 'Reyes', 'Sabuesos', 'Titanes',
    'Uraganés', 'Vencedores', 'Warriors', 'Xanthos', 'Yunque',
    'Zófar', 'Acero', 'Brújula', 'Centella', 'Desvelo'
  ];

  constructor(
    private fb: FormBuilder,
    private configService: TournamentConfigurationService,
    private validationService: TournamentValidationService
  ) {
    this.form = this.createForm();
  }

  ngOnInit(): void {
    const config = this.configService.getConfigurationData();
    this.numberOfTeams = config.numberOfTeams;
    this.teams = [...config.teams];

    this.form.get('numberOfTeams')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.numberOfTeams = value;
        if (this.teams.length > value) {
          this.teams = this.teams.slice(0, value);
        }
        // Agregar campos vacíos si faltan
        while (this.teams.length < value) {
          this.teams.push({ id: undefined, name: '' });
        }
        this.updateConfiguration();
      });

    if (this.numberOfTeams > 0) {
      this.form.patchValue({ numberOfTeams: this.numberOfTeams });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      numberOfTeams: ['', [
        Validators.required,
        this.validationService.numberOfTeamsValidator()
      ]],
    });
  }

  getTeamsFormArray() {
    return this.teams.map((team, index) => {
      const control = this.fb.control(team.name, [Validators.required, Validators.minLength(2)]);
      control.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => {
        this.teams[index].name = value;
        this.updateConfiguration();
      });
      return control;
    });
  }

  removeTeam(index: number): void {
    this.teams.splice(index, 1);
    this.updateConfiguration();
  }

  generateRandomTeamNames(): void {
    const shuffled = [...this.RANDOM_TEAM_NAMES].sort(() => 0.5 - Math.random());
    this.teams = shuffled.slice(0, this.numberOfTeams).map((name) => ({
      id: undefined,
      name,
    }));
    this.updateConfiguration();
  }

  clearAllTeams(): void {
    this.teams = Array(this.numberOfTeams)
      .fill(null)
      .map(() => ({ id: undefined, name: '' }));
    this.updateConfiguration();
  }

  isFormValid(): boolean {
    return (
      this.numberOfTeams > 0 &&
      this.teams.length === this.numberOfTeams &&
      this.teams.every((team) => team.name && team.name.trim().length > 0)
    );
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

  updateConfiguration(): void {
    this.configService.updateData({
      numberOfTeams: this.numberOfTeams,
      teams: this.teams,
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


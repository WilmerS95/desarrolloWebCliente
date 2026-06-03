import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TournamentConfigurationService } from '../../services/tournament-configuration.service';
import { TournamentValidationService } from '../../services/tournament-validation.service';
import {
  TournamentFormatType,
  PairingType,
} from '../../shared/models/tournament-configuration';

@Component({
  selector: 'app-tournament-format-config',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="format-config">
      <h2>Configuración del Formato del Torneo</h2>

      <form [formGroup]="form">
        <!-- Selector del tipo de formato -->
        <div class="format-tabs">
          <button
            *ngFor="let format of formatTypes"
            type="button"
            class="tab-button"
            [class.active]="selectedFormat === format.value"
            (click)="selectFormat(format.value)"
          >
            {{ format.label }}
          </button>
        </div>

        <!-- Round Robin Configuration -->
        <div *ngIf="selectedFormat === 'ROUND_ROBIN'" class="format-section">
          <h3>Configuración: Round Robin</h3>

          <div class="form-group">
            <label for="roundRobinLegs">Número de Vueltas *</label>
            <select
              id="roundRobinLegs"
              formControlName="roundRobinLegs"
              class="form-control"
            >
              <option value="1">Una vuelta (simple)</option>
              <option value="2">Dos vueltas (ida y vuelta)</option>
            </select>
            <small class="help-text">
              Una vuelta: cada equipo juega una sola vez contra cada rival.
              Dos vueltas: ida y vuelta.
            </small>
          </div>

          <div class="info-box">
            <h4>Ventajas:</h4>
            <ul>
              <li>Totalmente equitativo para todos los equipos</li>
              <li>Todos juegan la misma cantidad de partidos</li>
              <li>Apropiado para ligas ordinarias</li>
            </ul>
            <h4>Desventajas:</h4>
            <ul>
              <li>Requiere muchos partidos (N×(N-1)/2 o N×(N-1))</li>
              <li>Toma bastante tiempo</li>
            </ul>
          </div>
        </div>

        <!-- Group Phase Configuration -->
        <div *ngIf="selectedFormat === 'GROUP_PHASE'" class="format-section">
          <h3>Configuración: Fase de Grupos</h3>

          <div class="form-row">
            <div class="form-group">
              <label for="numberOfGroups">Cantidad de Grupos *</label>
              <input
                id="numberOfGroups"
                type="number"
                formControlName="numberOfGroups"
                min="2"
                max="16"
                class="form-control"
              />
              <small class="help-text">Mínimo 2, máximo 16</small>
            </div>

            <div class="form-group">
              <label for="teamsPerGroup">Equipos por Grupo *</label>
              <input
                id="teamsPerGroup"
                type="number"
                formControlName="teamsPerGroup"
                min="2"
                max="12"
                class="form-control"
                [readonly]="true"
              />
              <small class="help-text">Calculado automaticamente</small>
            </div>

            <div class="form-group">
              <label for="teamsAdvancingPerGroup">Clasificados por Grupo *</label>
              <input
                id="teamsAdvancingPerGroup"
                type="number"
                formControlName="teamsAdvancingPerGroup"
                min="1"
                [max]="form.get('teamsPerGroup')?.value || 1"
                class="form-control"
              />
              <small class="help-text">Cuántos avanzan de cada grupo</small>
            </div>
          </div>

          <div class="calculation-info" *ngIf="form.get('numberOfGroups')?.value">
            <p>
              Con {{ form.get('numberOfGroups')?.value }} grupos de
              {{ form.get('teamsPerGroup')?.value }} equipos:
            </p>
            <ul>
              <li>Total de partidos por grupo: {{ partidosPorGrupo }}</li>
              <li>Total de partidos en grupos: {{ totalPartidosGrupos }}</li>
              <li>Equipos clasificados: {{ teamsClassified }}</li>
            </ul>
          </div>

          <div class="info-box">
            <h4>Ventajas:</h4>
            <ul>
              <li>Reduce la cantidad total de partidos</li>
              <li>Garantiza que todos jueguen al menos una ronda</li>
              <li>Flexible en cuanto a cantidad de equipos</li>
            </ul>
          </div>
        </div>

        <!-- Knockout Configuration -->
        <div *ngIf="selectedFormat === 'KNOCKOUT'" class="format-section">
          <h3>Configuración: Eliminatoria Directa</h3>

          <div class="form-row">
            <div class="form-group">
              <label for="pairingType">Tipo de Emparejamiento *</label>
              <select
                id="pairingType"
                formControlName="pairingType"
                class="form-control"
              >
                <option value="FIRST_VS_LAST">1º vs Último (ordenado)</option>
                <option value="RANDOM">Aleatorio</option>
              </select>
            </div>

            <div class="form-group">
              <label>
                <input
                  type="checkbox"
                  formControlName="allowByes"
                />
                Permitir Byes (equipos que avanzan automáticamente)
              </label>
            </div>

            <div class="form-group">
              <label>
                <input
                  type="checkbox"
                  formControlName="twoLegs"
                />
                Ida y Vuelta (excepto final)
              </label>
            </div>

            <div class="form-group">
              <label>
                <input
                  type="checkbox"
                  formControlName="finalTwoLegs"
                />
                Final a dos partidos
              </label>
            </div>
          </div>

          <div class="info-box">
            <h4>Ventajas:</h4>
            <ul>
              <li>Rápido y emocionante</li>
              <li>Pocas rondas hasta determinar campeón</li>
            </ul>
            <h4>Desventajas:</h4>
            <ul>
              <li>Equipos débiles pueden quedar eliminados temprano</li>
              <li>Requiere seeding (semillero) para equidad</li>
            </ul>
          </div>
        </div>

        <!-- Mixed Format Configuration -->
        <div *ngIf="selectedFormat === 'MIXED'" class="format-section">
          <h3>Configuración: Formato Mixto</h3>

          <div class="form-group">
            <label for="mixedTeamsAdvancing">Equipos que avanzan a Knockout *</label>
            <input
              id="mixedTeamsAdvancing"
              type="number"
              formControlName="mixedTeamsAdvancing"
              min="2"
              max="32"
              class="form-control"
            />
            <small class="help-text">Debe ser potencia de 2 (2, 4, 8, 16, 32...)</small>
          </div>

          <p class="info-text">
            Primero se juega una fase de grupos, luego los mejores equipos
            avanzan a una eliminatoria directa.
          </p>

          <div class="info-box">
            <h4>Ventajas:</h4>
            <ul>
              <li>Combina equidad de grupos con emoción de knockout</li>
              <li>Eficiente para muchos equipos (16+)</li>
              <li>Todos juegan al menos una fase completa</li>
            </ul>
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
            [disabled]="!form.valid"
          >
            Siguiente →
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .format-config {
      animation: slideIn 0.3s ease-out;
    }

    h2 {
      color: #2c3e50;
      margin-bottom: 2rem;
      font-size: 1.8rem;
    }

    h3 {
      color: #34495e;
      margin-bottom: 1rem;
      font-size: 1.2rem;
    }

    .format-tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .tab-button {
      padding: 0.75rem 1.5rem;
      border: 2px solid #bdc3c7;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
      color: #2c3e50;
    }

    .tab-button.active {
      background: #3498db;
      border-color: #3498db;
      color: white;
    }

    .tab-button:hover {
      border-color: #3498db;
    }

    .format-section {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #2c3e50;
    }

    input[type="checkbox"] {
      margin-right: 0.5rem;
      cursor: pointer;
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

    .form-control:readonly {
      background: #ecf0f1;
      cursor: not-allowed;
    }

    .help-text {
      display: block;
      color: #7f8c8d;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .calculation-info {
      background: #fff;
      padding: 1rem;
      border-left: 4px solid #3498db;
      border-radius: 4px;
      margin: 1.5rem 0;
    }

    .calculation-info p {
      margin: 0 0 0.75rem 0;
      font-weight: 500;
      color: #2c3e50;
    }

    .calculation-info ul {
      margin: 0;
      padding-left: 1.5rem;
      color: #34495e;
    }

    .calculation-info li {
      margin-bottom: 0.25rem;
    }

    .info-text {
      color: #34495e;
      font-size: 1rem;
      margin: 1rem 0;
      padding: 1rem;
      background: #ecf0f1;
      border-radius: 4px;
      border-left: 4px solid #16a085;
    }

    .info-box {
      background: #fff;
      padding: 1rem;
      border-radius: 4px;
      margin: 1rem 0;
      border: 1px solid #bdc3c7;
    }

    .info-box h4 {
      color: #2c3e50;
      margin: 0.5rem 0 0.25rem 0;
      font-size: 0.95rem;
    }

    .info-box ul {
      margin: 0.5rem 0;
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
export class TournamentFormatConfigComponent implements OnInit, OnDestroy {
  @Output() next = new EventEmitter<void>();
  @Output() previous = new EventEmitter<void>();

  form: FormGroup;
  selectedFormat: TournamentFormatType = TournamentFormatType.ROUND_ROBIN;
  private destroy$ = new Subject<void>();

  formatTypes = [
    { value: TournamentFormatType.ROUND_ROBIN, label: 'Round Robin' },
    { value: TournamentFormatType.GROUP_PHASE, label: 'Fase de Grupos' },
    { value: TournamentFormatType.KNOCKOUT, label: 'Eliminatoria' },
    { value: TournamentFormatType.MIXED, label: 'Mixto' },
  ];

  get partidosPorGrupo(): number {
    const teamsPerGroup = this.form.get('teamsPerGroup')?.value || 0;
    return (teamsPerGroup * (teamsPerGroup - 1)) / 2;
  }

  get totalPartidosGrupos(): number {
    const groups = this.form.get('numberOfGroups')?.value || 0;
    return groups * this.partidosPorGrupo;
  }

  get teamsClassified(): number {
    const groups = this.form.get('numberOfGroups')?.value || 0;
    const advancing = this.form.get('teamsAdvancingPerGroup')?.value || 0;
    return groups * advancing;
  }

  constructor(
    private fb: FormBuilder,
    private configService: TournamentConfigurationService,
    private validationService: TournamentValidationService
  ) {
    this.form = this.createForm();
  }

  ngOnInit(): void {
    const config = this.configService.getConfigurationData();
    this.selectedFormat = config.formatType;

    switch (this.selectedFormat) {
      case TournamentFormatType.ROUND_ROBIN:
        this.form.patchValue({
          roundRobinLegs: config.roundRobinConfig?.legs || 1,
        });
        break;
      case TournamentFormatType.GROUP_PHASE:
        this.form.patchValue({
          numberOfGroups: config.groupPhaseConfig?.numberOfGroups || 2,
          teamsAdvancingPerGroup: config.groupPhaseConfig?.teamsAdvancingPerGroup || 2,
        });
        this.updateTeamsPerGroup();
        break;
      case TournamentFormatType.KNOCKOUT:
        this.form.patchValue({
          pairingType: config.knockoutConfig?.pairingType || PairingType.FIRST_VS_LAST,
          allowByes: config.knockoutConfig?.allowByes || false,
          twoLegs: config.knockoutConfig?.twoLegs || false,
          finalTwoLegs: config.knockoutConfig?.finalTwoLegs || false,
        });
        break;
      case TournamentFormatType.MIXED:
        this.form.patchValue({
          mixedTeamsAdvancing: config.mixedFormatConfig?.teamsAdvancingToKnockout || 4,
          numberOfGroups: config.mixedFormatConfig?.groupPhase.numberOfGroups || 2,
          teamsAdvancingPerGroup: config.mixedFormatConfig?.groupPhase.teamsAdvancingPerGroup || 2,
        });
        this.updateTeamsPerGroup();
        break;
    }

    this.form.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateConfiguration());

    this.form.get('numberOfGroups')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateTeamsPerGroup());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      roundRobinLegs: [1],
      numberOfGroups: [2],
      teamsPerGroup: [{ value: 4, disabled: true }],
      teamsAdvancingPerGroup: [2],
      pairingType: [PairingType.FIRST_VS_LAST],
      allowByes: [false],
      twoLegs: [false],
      finalTwoLegs: [false],
      mixedTeamsAdvancing: [4],
    });
  }

  private updateTeamsPerGroup(): void {
    const config = this.configService.getConfigurationData();
    const numberOfTeams = config.numberOfTeams;
    const numberOfGroups = this.form.get('numberOfGroups')?.value || 1;
    const teamsPerGroup = Math.ceil(numberOfTeams / numberOfGroups);
    this.form.get('teamsPerGroup')?.setValue(teamsPerGroup);
  }

  selectFormat(format: TournamentFormatType): void {
    this.selectedFormat = format;
    this.configService.updateData({ formatType: format });
    this.updateConfiguration();
  }

  private updateConfiguration(): void {
    const formatType = this.selectedFormat;
    const baseData = { formatType };

    switch (formatType) {
      case TournamentFormatType.ROUND_ROBIN:
        this.configService.updateData({
          ...baseData,
          roundRobinConfig: {
            legs: Number(this.form.get('roundRobinLegs')?.value) as 1 | 2,
          },
        });
        break;
      case TournamentFormatType.GROUP_PHASE:
        this.configService.updateData({
          ...baseData,
          groupPhaseConfig: {
            numberOfGroups: this.form.get('numberOfGroups')?.value,
            teamsPerGroup: this.form.get('teamsPerGroup')?.value,
            teamsAdvancingPerGroup: this.form.get('teamsAdvancingPerGroup')?.value,
          },
        });
        break;
      case TournamentFormatType.KNOCKOUT:
        this.configService.updateData({
          ...baseData,
          knockoutConfig: {
            pairingType: this.form.get('pairingType')?.value,
            allowByes: this.form.get('allowByes')?.value,
            twoLegs: this.form.get('twoLegs')?.value,
            finalTwoLegs: this.form.get('finalTwoLegs')?.value,
          },
        });
        break;
      case TournamentFormatType.MIXED:
        this.configService.updateData({
          ...baseData,
          mixedFormatConfig: {
            groupPhase: {
              numberOfGroups: this.form.get('numberOfGroups')?.value,
              teamsPerGroup: this.form.get('teamsPerGroup')?.value,
              teamsAdvancingPerGroup: this.form.get('teamsAdvancingPerGroup')?.value,
            },
            knockout: {
              pairingType: PairingType.FIRST_VS_LAST,
              allowByes: false,
              twoLegs: false,
              finalTwoLegs: false,
            },
            teamsAdvancingToKnockout: this.form.get('mixedTeamsAdvancing')?.value,
          },
        });
        break;
    }
  }

  onNext(): void {
    if (this.form.valid) {
      this.next.emit();
    }
  }

  onPrevious(): void {
    this.previous.emit();
  }
}


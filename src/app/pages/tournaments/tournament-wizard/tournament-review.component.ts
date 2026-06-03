import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TournamentConfigurationService } from '../../services/tournament-configuration.service';
import {
  TournamentConfigurationData,
  TournamentFormatType,
} from '../../shared/models/tournament-configuration';

@Component({
  selector: 'app-tournament-review',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="review-section">
      <h2>Revisión de la Configuración</h2>
      <p class="subtitle">Por favor verifica que toda la información sea correcta antes de crear el torneo</p>

      <!-- Información Básica -->
      <div class="review-card">
        <h3>Información Básica</h3>
        <div class="review-grid">
          <div class="review-item">
            <span class="label">Nombre:</span>
            <span class="value">{{ config.name }}</span>
          </div>
          <div class="review-item">
            <span class="label">Descripción:</span>
            <span class="value">{{ config.description || 'No especificada' }}</span>
          </div>
          <div class="review-item">
            <span class="label">Ubicación:</span>
            <span class="value">{{ config.location || 'No especificada' }}</span>
          </div>
          <div class="review-item">
            <span class="label">Formato:</span>
            <span class="value">{{ getFormatLabel(config.formatType) }}</span>
          </div>
        </div>
      </div>

      <!-- Configuración de Equipos -->
      <div class="review-card">
        <h3>Equipos ({{ config.numberOfTeams }})</h3>
        <div class="teams-grid">
          <div *ngFor="let team of config.teams; let i = index" class="team-badge">
            {{ i + 1 }}. {{ team.name }}
          </div>
        </div>
      </div>

      <!-- Configuración del Formato -->
      <div class="review-card">
        <h3>Configuración del Torneo</h3>

        <div *ngIf="config.formatType === 'ROUND_ROBIN'" class="format-details">
          <div class="detail-row">
            <span class="label">Tipo:</span>
            <span class="value">Round Robin</span>
          </div>
          <div class="detail-row">
            <span class="label">Vueltas:</span>
            <span class="value">{{ config.roundRobinConfig?.legs === 1 ? 'Una vuelta' : 'Dos vueltas (Ida y vuelta)' }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Partidos esperados:</span>
            <span class="value">{{ getRoundRobinMatches() }}</span>
          </div>
        </div>

        <div *ngIf="config.formatType === 'GROUP_PHASE'" class="format-details">
          <div class="detail-row">
            <span class="label">Grupos:</span>
            <span class="value">{{ config.groupPhaseConfig?.numberOfGroups }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Equipos por grupo:</span>
            <span class="value">{{ config.groupPhaseConfig?.teamsPerGroup }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Clasificados por grupo:</span>
            <span class="value">{{ config.groupPhaseConfig?.teamsAdvancingPerGroup }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Total clasificados:</span>
            <span class="value">{{ getTotalClassified() }}</span>
          </div>
        </div>

        <div *ngIf="config.formatType === 'KNOCKOUT'" class="format-details">
          <div class="detail-row">
            <span class="label">Tipo de emparejamiento:</span>
            <span class="value">{{ config.knockoutConfig?.pairingType === 'FIRST_VS_LAST' ? '1º vs Último' : 'Aleatorio' }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Permite byes:</span>
            <span class="value">{{ config.knockoutConfig?.allowByes ? 'Sí' : 'No' }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Ida y vuelta:</span>
            <span class="value">{{ config.knockoutConfig?.twoLegs ? 'Sí' : 'No' }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Final a dos partidos:</span>
            <span class="value">{{ config.knockoutConfig?.finalTwoLegs ? 'Sí' : 'No' }}</span>
          </div>
        </div>

        <div *ngIf="config.formatType === 'MIXED'" class="format-details">
          <div class="detail-row">
            <span class="label">Fase inicial:</span>
            <span class="value">Grupos</span>
          </div>
          <div class="detail-row">
            <span class="label">Fase final:</span>
            <span class="value">Eliminatoria</span>
          </div>
          <div class="detail-row">
            <span class="label">Equipos a knockout:</span>
            <span class="value">{{ config.mixedFormatConfig?.teamsAdvancingToKnockout }}</span>
          </div>
        </div>
      </div>

      <!-- Configuración del Calendario -->
      <div class="review-card">
        <h3>Calendario</h3>
        <div class="calendar-details">
          <div class="detail-row">
            <span class="label">Duración por partido:</span>
            <span class="value">{{ config.calendarConfig.matchDuration }} minutos</span>
          </div>
          <div class="detail-row">
            <span class="label">Primer partido a las:</span>
            <span class="value">{{ config.calendarConfig.firstMatchStartTime }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Partidos por día:</span>
            <span class="value">{{ config.calendarConfig.matchesPerDay }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Días de juego:</span>
            <span class="value">{{ config.calendarConfig.playDays.join(', ') }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Pausa entre rondas:</span>
            <span class="value">{{ config.calendarConfig.pauseDaysBetweenRounds || 0 }} días</span>
          </div>
        </div>
      </div>

      <!-- Resumen de Partidos -->
      <div class="review-card" *ngIf="config.matches && config.matches.length > 0">
        <h3>Resumen de Partidos</h3>
        <div class="summary-grid">
          <div class="summary-stat">
            <h4>Total de Partidos</h4>
            <p class="number">{{ config.matches.length }}</p>
          </div>
          <div class="summary-stat">
            <h4>Rondas</h4>
            <p class="number">{{ getTotalRounds() }}</p>
          </div>
          <div class="summary-stat">
            <h4>Duración Estimada</h4>
            <p class="number">{{ getEstimatedDays() }} días</p>
          </div>
          <div class="summary-stat">
            <h4>Partidos Programados</h4>
            <p class="number">{{ config.matches.filter(m => m.scheduledDate).length }}</p>
          </div>
        </div>
      </div>

      <!-- Confirmación -->
      <div class="confirmation-box">
        <h3>¿Listo para crear el torneo?</h3>
        <p>
          Verifica que toda la información sea correcta. Podrás editar los detalles después de crear el torneo.
        </p>
      </div>

      <!-- Botones de acción -->
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
          class="btn btn-success"
          (click)="onSubmit()"
        >
          ✓ Crear Torneo
        </button>
      </div>
    </div>
  `,
  styles: [`
    .review-section {
      animation: slideIn 0.3s ease-out;
    }

    h2 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
      font-size: 1.8rem;
    }

    .subtitle {
      color: #7f8c8d;
      margin-bottom: 2rem;
      font-size: 1rem;
    }

    h3 {
      color: white;
      margin: 0;
      font-size: 1.1rem;
    }

    h4 {
      color: #2c3e50;
      margin: 0;
      font-size: 0.85rem;
      font-weight: 500;
    }

    .review-card {
      background: white;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .review-card > h3 {
      background: linear-gradient(135deg, #3498db, #2980b9);
      padding: 1rem;
    }

    .review-card > div:not(h3) {
      padding: 1.5rem;
    }

    .review-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .review-item {
      border-left: 4px solid #3498db;
      padding-left: 1rem;
    }

    .label {
      display: block;
      font-weight: 600;
      color: #34495e;
      margin-bottom: 0.25rem;
      font-size: 0.9rem;
    }

    .value {
      display: block;
      color: #2c3e50;
      font-size: 1rem;
      word-wrap: break-word;
    }

    .teams-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 0.75rem;
    }

    .team-badge {
      background: #ecf0f1;
      padding: 0.75rem;
      border-radius: 4px;
      color: #2c3e50;
      font-size: 0.9rem;
      border: 1px solid #bdc3c7;
    }

    .format-details {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .calendar-details {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .detail-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      padding: 0.5rem 0;
      border-bottom: 1px solid #ecf0f1;
    }

    .detail-row:last-child {
      border-bottom: none;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
    }

    .summary-stat {
      background: linear-gradient(135deg, #3498db, #2980b9);
      color: white;
      padding: 1.5rem;
      border-radius: 8px;
      text-align: center;
    }

    .summary-stat .number {
      font-size: 2.5rem;
      font-weight: bold;
      margin: 0.5rem 0 0 0;
    }

    .confirmation-box {
      background: #d4edda;
      border: 2px solid #28a745;
      border-radius: 8px;
      padding: 1.5rem;
      margin: 2rem 0;
      color: #155724;
    }

    .confirmation-box h3 {
      color: #155724;
      margin-bottom: 0.5rem;
    }

    .confirmation-box p {
      margin: 0;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: space-between;
      margin-top: 2rem;
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

    .btn-info {
      background: #16a085;
      color: white;
    }

    .btn-info:hover {
      background: #138d75;
    }

    .btn-success {
      background: #27ae60;
      color: white;
      flex: 1;
    }

    .btn-success:hover {
      background: #229954;
      transform: translateY(-2px);
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
export class TournamentReviewComponent implements OnInit {
  @Output() previous = new EventEmitter<void>();
  @Output() submit = new EventEmitter<void>();

  config: TournamentConfigurationData | null = null;

  constructor(private configService: TournamentConfigurationService) {}

  ngOnInit(): void {
    this.config = this.configService.getConfigurationData();
  }

  getFormatLabel(format: TournamentFormatType): string {
    const labels: { [key in TournamentFormatType]: string } = {
      ROUND_ROBIN: 'Round Robin (Todos contra todos)',
      GROUP_PHASE: 'Fase de Grupos',
      KNOCKOUT: 'Eliminatoria Directa',
      MIXED: 'Formato Mixto (Grupos + Eliminatoria)',
    };
    return labels[format];
  }

  getRoundRobinMatches(): number {
    if (!this.config) return 0;
    let matches = (this.config.numberOfTeams * (this.config.numberOfTeams - 1)) / 2;
    if (this.config.roundRobinConfig?.legs === 2) {
      matches *= 2;
    }
    return matches;
  }

  getTotalClassified(): number {
    if (!this.config?.groupPhaseConfig) return 0;
    return (
      this.config.groupPhaseConfig.numberOfGroups *
      this.config.groupPhaseConfig.teamsAdvancingPerGroup
    );
  }

  getTotalRounds(): number {
    if (!this.config?.matches) return 0;
    return Math.max(...this.config.matches.map(m => m.round), 0);
  }

  getEstimatedDays(): number {
    if (!this.config?.matches || this.config.matches.length === 0) return 0;
    const dates = this.config.matches
      .filter(m => m.scheduledDate)
      .map(m => new Date(m.scheduledDate || new Date()).getTime());

    if (dates.length === 0) return 0;

    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    return Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1;
  }

  onPrevious(): void {
    this.previous.emit();
  }

  onSubmit(): void {
    // Aquí se podría hacer validación final si es necesario
    this.submit.emit();
  }
}


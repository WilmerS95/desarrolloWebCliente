import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TournamentConfigurationService } from '../../services/tournament-configuration.service';
import { FixtureGenerationService } from '../../services/fixture-generation.service';
import { Match } from '../../shared/models/tournament-configuration';

@Component({
  selector: 'app-tournament-calendar-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="calendar-preview">
      <h2>Vista Previa del Calendario</h2>

      <div class="preview-controls">
        <button
          type="button"
          class="btn btn-secondary"
          (click)="generateFixtures()"
          [disabled]="isGenerating"
        >
          {{ isGenerating ? 'Generando...' : 'Generar Calendario' }}
        </button>

        <div class="filter-buttons">
          <button
            *ngFor="let view of viewTypes"
            type="button"
            class="btn-toggle"
            [class.active]="currentView === view"
            (click)="currentView = view"
          >
            {{ view === 'list' ? 'Lista' : 'Tabla' }}
          </button>
        </div>
      </div>

      <!-- Modo Lista -->
      <div *ngIf="currentView === 'list'" class="matches-list">
        <div *ngIf="matches.length === 0" class="empty-state">
          <p>Haz clic en "Generar Calendario" para crear los partidos</p>
        </div>

        <div *ngFor="let match of groupedMatches | keyvalue" class="round-group">
          <h3 class="round-header">Ronda {{ match.key }}</h3>
          <div class="matches-scroll">
            <div *ngFor="let m of match.value" class="match-card">
              <div class="match-header">
                <span class="match-number">Partido #{{ m.matchNumber }}</span>
                <span class="match-date" *ngIf="m.scheduledDate">
                  {{ formatDate(m.scheduledDate) }}
                </span>
              </div>
              <div class="match-teams">
                <div class="team home">
                  <span class="team-name">{{ m.homeTeam.name }}</span>
                  <span class="team-goals" *ngIf="m.homeTeamGoals !== undefined">
                    {{ m.homeTeamGoals }}
                  </span>
                </div>
                <div class="match-separator">vs</div>
                <div class="team away">
                  <span class="team-goals" *ngIf="m.awayTeamGoals !== undefined">
                    {{ m.awayTeamGoals }}
                  </span>
                  <span class="team-name">{{ m.awayTeam.name }}</span>
                </div>
              </div>
              <div class="match-time" *ngIf="m.scheduledTime">
                <span>{{ m.scheduledTime }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modo Tabla -->
      <div *ngIf="currentView === 'table'" class="matches-table">
        <div *ngIf="matches.length === 0" class="empty-state">
          <p>Haz clic en "Generar Calendario" para crear los partidos</p>
        </div>

        <table *ngIf="matches.length > 0">
          <thead>
            <tr>
              <th>Partido</th>
              <th>Ronda</th>
              <th>Equipo Local</th>
              <th>Resultado</th>
              <th>Equipo Visitante</th>
              <th>Fecha</th>
              <th>Hora</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let match of matches" [class.played]="match.status === 'PLAYED'">
              <td>{{ match.matchNumber }}</td>
              <td>{{ match.round }}</td>
              <td>{{ match.homeTeam.name }}</td>
              <td class="result">
                {{ match.homeTeamGoals ?? '-' }} - {{ match.awayTeamGoals ?? '-' }}
              </td>
              <td>{{ match.awayTeam.name }}</td>
              <td>{{ formatDate(match.scheduledDate) }}</td>
              <td>{{ match.scheduledTime || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Resumen -->
      <div class="summary">
        <div class="summary-card">
          <h4>Total de Partidos</h4>
          <p class="number">{{ matches.length }}</p>
        </div>
        <div class="summary-card">
          <h4>Rondas</h4>
          <p class="number">{{ getTotalRounds() }}</p>
        </div>
        <div class="summary-card">
          <h4>Estado</h4>
          <p class="number">{{ getPlayedMatches() }} jugados</p>
        </div>
        <div class="summary-card">
          <h4>Duración</h4>
          <p class="number">{{ getEstimatedDaysNeeded() }} días</p>
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
          [disabled]="matches.length === 0"
        >
          Siguiente →
        </button>
      </div>
    </div>
  `,
  styles: [`
    .calendar-preview {
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
      margin: 0;
      font-size: 0.9rem;
    }

    .preview-controls {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
    }

    .filter-buttons {
      display: flex;
      gap: 0.5rem;
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

    .btn-secondary {
      background: #95a5a6;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #7f8c8d;
    }

    .btn-toggle {
      padding: 0.5rem 1rem;
      border: 2px solid #bdc3c7;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
      color: #2c3e50;
    }

    .btn-toggle.active {
      background: #3498db;
      border-color: #3498db;
      color: white;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      background: #ecf0f1;
      border-radius: 8px;
      color: #7f8c8d;
    }

    .matches-list {
      margin-bottom: 2rem;
    }

    .round-group {
      margin-bottom: 2rem;
    }

    .round-header {
      background: #34495e;
      color: white;
      padding: 0.75rem 1rem;
      border-radius: 4px;
      margin: 1rem 0 0.75rem 0;
    }

    .matches-scroll {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .match-card {
      background: white;
      border: 1px solid #bdc3c7;
      border-radius: 8px;
      padding: 1rem;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .match-card:hover {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
    }

    .match-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #ecf0f1;
    }

    .match-number {
      font-weight: bold;
      color: #3498db;
      font-size: 0.9rem;
    }

    .match-date {
      font-size: 0.85rem;
      color: #7f8c8d;
    }

    .match-teams {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 0.75rem;
    }

    .team {
      flex: 1;
      text-align: center;
    }

    .team-name {
      display: block;
      font-weight: 500;
      color: #2c3e50;
      margin-bottom: 0.25rem;
      word-wrap: break-word;
    }

    .team-goals {
      font-size: 1.5rem;
      font-weight: bold;
      color: #27ae60;
    }

    .match-separator {
      color: #bdc3c7;
      font-size: 0.9rem;
    }

    .match-time {
      text-align: center;
      color: #7f8c8d;
      font-size: 0.9rem;
    }

    .matches-table {
      margin-bottom: 2rem;
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      overflow: hidden;
    }

    th {
      background: #34495e;
      color: white;
      padding: 1rem;
      text-align: left;
      font-weight: 500;
    }

    td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #ecf0f1;
    }

    tr:hover {
      background: #f8f9fa;
    }

    tr.played {
      opacity: 0.7;
    }

    .result {
      font-weight: bold;
      color: #3498db;
      text-align: center;
    }

    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin: 2rem 0;
    }

    .summary-card {
      background: linear-gradient(135deg, #3498db, #2980b9);
      color: white;
      padding: 1.5rem;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .summary-card h4 {
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 0.5rem;
    }

    .summary-card .number {
      font-size: 2rem;
      font-weight: bold;
      margin: 0;
    }

    .form-actions {
      margin-top: 2rem;
      display: flex;
      gap: 1rem;
      justify-content: space-between;
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
export class TournamentCalendarPreviewComponent implements OnInit, OnDestroy {
  @Output() next = new EventEmitter<void>();
  @Output() previous = new EventEmitter<void>();

  matches: Match[] = [];
  currentView: 'list' | 'table' = 'list';
  viewTypes: ('list' | 'table')[] = ['list', 'table'];
  isGenerating = false;
  private destroy$ = new Subject<void>();

  get groupedMatches() {
    const grouped = new Map<number, Match[]>();
    this.matches.forEach(match => {
      if (!grouped.has(match.round)) {
        grouped.set(match.round, []);
      }
      grouped.get(match.round)?.push(match);
    });
    return grouped;
  }

  constructor(
    private configService: TournamentConfigurationService,
    private fixtureService: FixtureGenerationService
  ) {}

  ngOnInit(): void {
    const config = this.configService.getConfigurationData();
    if (config.matches && config.matches.length > 0) {
      this.matches = config.matches;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  generateFixtures(): void {
    this.isGenerating = true;
    const config = this.configService.getConfigurationData();

    setTimeout(() => {
      const result = this.fixtureService.generateFixtures(config);
      if (result.success) {
        this.matches = result.matches;
        this.configService.updateData({ matches: result.matches });
      } else {
        alert('Error al generar el calendario:\n' + result.errors?.join('\n'));
      }
      this.isGenerating = false;
    }, 500);
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getTotalRounds(): number {
    if (this.matches.length === 0) return 0;
    return Math.max(...this.matches.map(m => m.round), 0);
  }

  getPlayedMatches(): number {
    return this.matches.filter(m => m.status === 'PLAYED').length;
  }

  getEstimatedDaysNeeded(): number {
    if (this.matches.length === 0) return 0;
    const firstDate = new Date(this.matches[0].scheduledDate || new Date());
    const lastDate = new Date(this.matches[this.matches.length - 1].scheduledDate || new Date());
    return Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }

  onNext(): void {
    if (this.matches.length > 0) {
      this.next.emit();
    }
  }

  onPrevious(): void {
    this.previous.emit();
  }
}


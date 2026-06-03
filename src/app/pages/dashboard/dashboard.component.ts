import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { TournamentParameterService } from '../../services/tournament-parameters.service';
import { TournamentService } from '../../services/tournament.service';
import { MatchService } from '../../services/match.service';
import { StatisticsService } from '../../services/statistics.service';
import { ParameterHistory } from '../../shared/models/TournamentParameter';
import { Tournament } from '../../shared/models/tournament';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // Parámetros
  recentChanges: ParameterHistory[] = [];

  // Campeonatos
  tournaments: Tournament[] = [];
  upcomingMatches: any[] = [];
  topScorers: any[] = [];

  loading = false;
  currentUser: any = null;

  constructor(
    private paramService: TournamentParameterService,
    private tournamentService: TournamentService,
    private matchService: MatchService,
    private statisticsService: StatisticsService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = {
      name: this.authService.getUserName(),
      role: this.authService.getUserRole()
    };

    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;

    if (this.canViewParameters()) {
      this.loadRecentChanges();
    }

    // Cargar información de campeonatos
    this.loadTournaments();
  }

  loadRecentChanges() {
    this.paramService.getRecentChanges().subscribe({
      next: (changes) => {
        this.recentChanges = changes.slice(0, 5);
      },
      error: (err) => {
        console.error('Error cargando cambios recientes:', err);
      }
    });
  }

  loadTournaments() {
    this.tournamentService.getAll().subscribe({
      next: (data) => {
        this.tournaments = data;
        console.log('Campeonatos cargados:', data);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando campeonatos:', err);
        this.loading = false;
      }
    });
  }

  canViewParameters(): boolean {
    return this.authService.hasPermission('MANAGE_PARAMETERS') ||
           this.authService.isAdmin();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  goToParameters() {
    this.router.navigate(['/tournament-parameters']);
  }

  goToTournaments() {
    this.router.navigate(['/tournaments']);
  }

  goToMatches(tournamentId: number) {
    this.router.navigate([`/tournaments/${tournamentId}/matches`]);
  }

  goToTournament(tournamentId: number) {
    this.router.navigate([`/tournaments/${tournamentId}`]);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  getActionBadgeClass(action: string): string {
    const classes: { [key: string]: string } = {
      'CREATE': 'bg-success',
      'UPDATE': 'bg-warning',
      'DELETE': 'bg-danger'
    };
    return classes[action] || 'bg-secondary';
  }

  getTournamentStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      'PLANNING': 'bg-secondary',
      'ONGOING': 'bg-primary',
      'FINISHED': 'bg-success'
    };
    return classes[status] || 'bg-dark';
  }

  getTournamentStatusText(status: string): string {
    const texts: { [key: string]: string } = {
      'PLANNING': 'Planificación',
      'ONGOING': 'En progreso',
      'FINISHED': 'Finalizado'
    };
    return texts[status] || status;
  }

  getCategoryDisplay(type: string): string {
    const categories: { [key: string]: string } = {
      'FUTBOL_7': 'Fútbol 7',
      'FUTBOL_11': 'Fútbol 11',
      'PAPI_FUTBOL': 'Papi Fútbol',
      'FUTSAL': 'Futsal',
      'AMATEUR': 'Amateur',
      'PRO': 'Profesional'
    };
    return categories[type] || type;
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TournamentService } from '../../../services/tournament.service';
import { Tournament } from '../../../shared/models/tournament';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tournament-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tournament-detail.component.html',
  styleUrl: './tournament-detail.component.css'
})
export class TournamentDetailComponent implements OnInit {
  tournament: Tournament | null = null;
  loading = false;
  tournamentId: number = 0;

  constructor(
    private tournamentService: TournamentService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.tournamentId = +params['id'];
      if (this.tournamentId) {
        this.loadTournament();
      }
    });
  }

  loadTournament() {
    this.loading = true;
    this.tournamentService.getById(this.tournamentId).subscribe({
      next: (data) => {
        this.tournament = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando torneo:', err);
        Swal.fire('Error', 'No se pudo cargar el torneo', 'error');
        this.router.navigate(['/tournaments']);
      }
    });
  }

  goToTeams() {
    this.router.navigate([`/tournaments/${this.tournamentId}/teams`]);
  }

  goToMatches() {
    this.router.navigate([`/tournaments/${this.tournamentId}/matches`]);
  }

  goToStandings() {
    this.router.navigate([`/tournaments/${this.tournamentId}/standings`]);
  }

  goToStatistics() {
    this.router.navigate([`/tournaments/${this.tournamentId}/statistics/scorers`]);
  }

  editTournament() {
    this.router.navigate([`/tournaments/${this.tournamentId}/edit`]);
  }

  goBack() {
    this.router.navigate(['/tournaments']);
  }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      'PLANNING': 'bg-secondary',
      'ONGOING': 'bg-primary',
      'FINISHED': 'bg-success'
    };
    return classes[status] || 'bg-dark';
  }

  getStatusText(status: string): string {
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

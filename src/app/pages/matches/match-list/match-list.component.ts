import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatchService } from '../../../services/match.service';
import { Match } from '../../../shared/models/match';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-match-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './match-list.component.html',
  styleUrl: './match-list.component.css'
})
export class MatchListComponent implements OnInit {
  matches: Match[] = [];
  loading = false;
  tournamentId: number = 0;

  constructor(
    private matchService: MatchService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.parent?.params.subscribe(params => {
      this.tournamentId = +params['tournamentId'];
      if (this.tournamentId) {
        this.loadMatches();
      }
    });
  }

  loadMatches() {
    this.loading = true;
    this.matchService.getMatches(this.tournamentId).subscribe({
      next: (data) => {
        this.matches = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando partidos:', err);
        Swal.fire('Error', 'No se pudieron cargar los partidos', 'error');
        this.loading = false;
      }
    });
  }

  createMatch() {
    this.router.navigate([`/tournaments/${this.tournamentId}/matches/create`]);
  }

  viewMatch(matchId: number) {
    this.router.navigate([`/tournaments/${this.tournamentId}/matches/${matchId}`]);
  }

  editResult(matchId: number) {
    this.router.navigate([`/tournaments/${this.tournamentId}/matches/${matchId}/result`]);
  }

  deleteMatch(match: Match) {
    Swal.fire({
      title: '¿Eliminar partido?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        this.matchService.deleteMatch(this.tournamentId, match.id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Partido eliminado', 'success');
            this.loadMatches();
          },
          error: (err) => {
            console.error('Error eliminando partido:', err);
            Swal.fire('Error', 'No se pudo eliminar el partido', 'error');
          }
        });
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      'SCHEDULED': 'bg-secondary',
      'LIVE': 'bg-danger',
      'FINISHED': 'bg-success',
      'POSTPONED': 'bg-warning',
      'CANCELLED': 'bg-dark'
    };
    return classes[status] || 'bg-info';
  }

  getStatusText(status: string): string {
    const texts: { [key: string]: string } = {
      'SCHEDULED': 'Programado',
      'LIVE': 'En vivo',
      'FINISHED': 'Finalizado',
      'POSTPONED': 'Aplazado',
      'CANCELLED': 'Cancelado'
    };
    return texts[status] || status;
  }

  goBack() {
    this.router.navigate(['/tournaments', this.tournamentId]);
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TournamentService } from '../../../services/tournament.service';
import { Tournament } from '../../../shared/models/tournament';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tournament-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tournament-list.component.html',
  styleUrl: './tournament-list.component.css'
})
export class TournamentListComponent implements OnInit {
  tournaments: Tournament[] = [];
  loading = false;
  searchTerm = '';

  constructor(
    private tournamentService: TournamentService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadTournaments();
  }

  loadTournaments() {
    this.loading = true;
    this.tournamentService.getAll().subscribe({
      next: (data) => {
        this.tournaments = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando torneos:', err);
        Swal.fire('Error', 'No se pudieron cargar los torneos', 'error');
        this.loading = false;
      }
    });
  }

  get filteredTournaments(): Tournament[] {
    if (!this.searchTerm) return this.tournaments;
    return this.tournaments.filter(t =>
      t.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      t.description?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  viewTournament(tournament: Tournament) {
    this.router.navigate(['/tournaments', tournament.tournamentID]);
  }

  editTournament(tournament: Tournament) {
    this.router.navigate(['/tournaments', tournament.tournamentID, 'edit']);
  }

  deleteTournament(tournament: Tournament) {
    Swal.fire({
      title: '¿Eliminar torneo?',
      text: `¿Estás seguro de que deseas eliminar "${tournament.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        this.tournamentService.delete(tournament.tournamentID).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Torneo eliminado correctamente', 'success');
            this.loadTournaments();
          },
          error: (err) => {
            console.error('Error eliminando torneo:', err);
            Swal.fire('Error', 'No se pudo eliminar el torneo', 'error');
          }
        });
      }
    });
  }

  createTournament() {
    this.router.navigate(['/tournaments/create']);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
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

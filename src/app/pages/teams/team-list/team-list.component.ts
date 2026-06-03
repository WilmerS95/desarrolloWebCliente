import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TeamService } from '../../../services/team.service';
import { Team } from '../../../shared/models/team';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-team-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team-list.component.html',
  styleUrl: './team-list.component.css'
})
export class TeamListComponent implements OnInit {
  teams: Team[] = [];
  loading = false;
  tournamentId: number = 0;

  constructor(
    private teamService: TeamService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.parent?.params.subscribe(params => {
      this.tournamentId = +params['tournamentId'];
      if (this.tournamentId) {
        this.loadTeams();
      }
    });
  }

  loadTeams() {
    this.loading = true;
    this.teamService.getTeams(this.tournamentId).subscribe({
      next: (data) => {
        this.teams = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando equipos:', err);
        Swal.fire('Error', 'No se pudieron cargar los equipos', 'error');
        this.loading = false;
      }
    });
  }

  createTeam() {
    this.router.navigate([`/tournaments/${this.tournamentId}/teams/create`]);
  }

  viewTeam(teamId: number) {
    this.router.navigate([`/tournaments/${this.tournamentId}/teams/${teamId}`]);
  }

  editTeam(teamId: number) {
    this.router.navigate([`/tournaments/${this.tournamentId}/teams/${teamId}/edit`]);
  }

  deleteTeam(team: Team) {
    Swal.fire({
      title: '¿Eliminar equipo?',
      text: `¿Estás seguro de que deseas eliminar "${team.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        this.teamService.deleteTeam(this.tournamentId, team.id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Equipo eliminado', 'success');
            this.loadTeams();
          },
          error: (err) => {
            console.error('Error eliminando equipo:', err);
            Swal.fire('Error', 'No se pudo eliminar el equipo', 'error');
          }
        });
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      'REGISTERED': 'bg-secondary',
      'VERIFIED': 'bg-success',
      'SUSPENDED': 'bg-warning',
      'ELIMINATED': 'bg-danger'
    };
    return classes[status] || 'bg-info';
  }

  getStatusText(status: string): string {
    const texts: { [key: string]: string } = {
      'REGISTERED': 'Registrado',
      'VERIFIED': 'Verificado',
      'SUSPENDED': 'Suspendido',
      'ELIMINATED': 'Eliminado'
    };
    return texts[status] || status;
  }

  goBack() {
    this.router.navigate(['/tournaments', this.tournamentId]);
  }
}

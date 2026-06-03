import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TournamentService } from '../../../services/tournament.service';
import { Tournament } from '../../../shared/models/tournament';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tournament-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tournament-create.component.html',
  styleUrl: './tournament-create.component.css'
})
export class TournamentCreateComponent implements OnInit {
  form: FormGroup;
  loading = false;
  isEditMode = false;
  tournamentId: number | null = null;

  types = [
    { value: 'FUTBOL_7', label: 'Fútbol 7' },
    { value: 'FUTBOL_11', label: 'Fútbol 11' },
    { value: 'PAPI_FUTBOL', label: 'Papi Fútbol' },
    { value: 'FUTSAL', label: 'Futsal' },
    { value: 'AMATEUR', label: 'Amateur' },
    { value: 'PRO', label: 'Profesional' }
  ];

  statuses = [
    { value: 'PLANNING', label: 'Planificación' },
    { value: 'ONGOING', label: 'En progreso' },
    { value: 'FINISHED', label: 'Finalizado' }
  ];

  constructor(
    private fb: FormBuilder,
    private tournamentService: TournamentService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.minLength(5)]],
      type: ['FUTBOL_11', Validators.required],
      status: ['PLANNING', Validators.required],
      location: [''],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      maxTeams: [8, [Validators.required, Validators.min(2)]],
      teamsPerGroup: [4, [Validators.required, Validators.min(2)]],
      advanceTeams: [2, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.tournamentId = +params['id'];
        this.loadTournament();
      }
    });
  }

  loadTournament() {
    if (!this.tournamentId) return;

    this.loading = true;
    this.tournamentService.getById(this.tournamentId).subscribe({
      next: (tournament) => {
        this.form.patchValue({
          name: tournament.name,
          description: tournament.description,
          type: tournament.type,
          status: tournament.status,
          location: tournament.location,
          startDate: this.formatDateForInput(tournament.startDate),
          endDate: this.formatDateForInput(tournament.endDate),
          maxTeams: tournament.maxTeams,
          teamsPerGroup: tournament.teamsPerGroup,
          advanceTeams: tournament.advanceTeams
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando torneo:', err);
        Swal.fire('Error', 'No se pudo cargar el torneo', 'error');
        this.router.navigate(['/tournaments']);
      }
    });
  }

  formatDateForInput(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;
    const payload = this.form.value;

    const observable = this.isEditMode
      ? this.tournamentService.update(this.tournamentId!, payload)
      : this.tournamentService.create(payload);

    observable.subscribe({
      next: () => {
        const message = this.isEditMode ? 'Torneo actualizado' : 'Torneo creado';
        Swal.fire('Éxito', message, 'success');
        this.router.navigate(['/tournaments']);
      },
      error: (err) => {
        console.error('Error guardando torneo:', err);
        Swal.fire('Error', 'No se pudo guardar el torneo', 'error');
        this.loading = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/tournaments']);
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TeamService } from '../../../services/team.service';
import { Team } from '../../../shared/models/team';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-team-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './team-create.component.html',
  styleUrl: './team-create.component.css'
})
export class TeamCreateComponent implements OnInit {
  form: FormGroup;
  loading = false;
  isEditMode = false;
  tournamentId: number = 0;
  teamId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private teamService: TeamService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      abbreviation: ['', [Validators.required, Validators.maxLength(5)]],
      city: ['', Validators.required],
      coach: ['', Validators.required],
      manager: [''],
      status: ['REGISTERED', Validators.required],
      inscriptionPaymentStatus: ['PENDING', Validators.required]
    });
  }

  ngOnInit() {
    this.route.parent?.params.subscribe(params => {
      this.tournamentId = +params['tournamentId'];
      if (params['teamId']) {
        this.isEditMode = true;
        this.teamId = +params['teamId'];
        this.loadTeam();
      }
    });
  }

  loadTeam() {
    if (!this.teamId || !this.tournamentId) return;

    this.loading = true;
    this.teamService.getTeam(this.tournamentId, this.teamId).subscribe({
      next: (team) => {
        this.form.patchValue(team);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando equipo:', err);
        Swal.fire('Error', 'No se pudo cargar el equipo', 'error');
        this.goBack();
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;
    const payload = this.form.value;

    const observable = this.isEditMode
      ? this.teamService.updateTeam(this.tournamentId, this.teamId!, payload)
      : this.teamService.createTeam(this.tournamentId, payload);

    observable.subscribe({
      next: () => {
        const message = this.isEditMode ? 'Equipo actualizado' : 'Equipo creado';
        Swal.fire('Éxito', message, 'success');
        this.goBack();
      },
      error: (err) => {
        console.error('Error guardando equipo:', err);
        Swal.fire('Error', 'No se pudo guardar el equipo', 'error');
        this.loading = false;
      }
    });
  }

  goBack() {
    this.router.navigate([`/tournaments/${this.tournamentId}/teams`]);
  }
}

/**
 * GUÍA DE INTEGRACIÓN DEL MÓDULO DE WIZARD DE TORNEOS
 *
 * Este archivo muestra cómo integrar completamente el módulo de configuración
 * avanzada de torneos en tu aplicación Angular.
 */

// ============================================================================
// 1. ACTUALIZAR app.routes.ts
// ============================================================================

import { TournamentWizardComponent } from './pages/tournaments/tournament-wizard.component';

// Agregar esta ruta a tu archivo de rutas:
export const TOURNAMENT_ROUTES = [
  {
    path: 'tournaments',
    children: [
      {
        path: 'create',
        component: TournamentWizardComponent,
        canActivate: [AuthGuard] // Requiere autenticación
      },
      {
        path: '',
        component: TournamentListComponent
      },
      {
        path: ':id',
        component: TournamentDetailComponent
      },
      // ... otras rutas de torneos
    ]
  }
];

// ============================================================================
// 2. EN TU DASHBOARD O COMPONENTE PRINCIPAL
// ============================================================================

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TournamentConfigurationService } from '@app/services/tournament-configuration.service';

@Component({
  selector: 'app-tournament-management',
  template: `
    <div class="tournament-management">
      <button class="btn btn-primary" (click)="crearNuevoTorneo()">
        + Crear Nuevo Torneo
      </button>

      <app-tournament-list [tournaments]="tournaments"></app-tournament-list>
    </div>
  `
})
export class TournamentManagementComponent {
  tournaments: any[] = [];

  constructor(
    private router: Router,
    private configService: TournamentConfigurationService,
    private tournamentService: TournamentService
  ) {}

  ngOnInit() {
    this.cargarTorneos();
  }

  crearNuevoTorneo() {
    // Resetear el wizard para comenzar desde cero
    this.configService.resetWizard();

    // Navegar al wizard
    this.router.navigate(['/tournaments/create']);
  }

  cargarTorneos() {
    this.tournamentService.getAll().subscribe(
      data => this.tournaments = data
    );
  }
}

// ============================================================================
// 3. INTERCEPTAR LA CREACIÓN DEL TORNEO
// ============================================================================

// Modificar tournament-wizard.component.ts submitTournament():

submitTournament(): void {
  const config = this.configService.getConfigurationData();
  const errors = this.validationService.validateTournamentConfiguration(config);

  if (errors.size > 0) {
    this.mostrarErrores(errors);
    return;
  }

  this.isSubmitting = true;

  // Crear el torneo en el backend
  this.tournamentService.crearTorneo(config).subscribe({
    next: (torneoCreado) => {
      console.log('Torneo creado:', torneoCreado);

      // Si hay equipos, crearlos
      if (config.teams.length > 0) {
        this.crearEquipos(torneoCreado.id, config.teams);
      }

      // Si hay partidos generados, crearlos
      if (config.matches && config.matches.length > 0) {
        this.crearPartidos(torneoCreado.id, config.matches);
      }

      // Mostrar mensaje de éxito
      this.mostrarExito('Torneo creado exitosamente');

      // Navegar a la página del torneo
      this.router.navigate(['/tournaments', torneoCreado.id]);

      // Resetear el wizard para el siguiente torneo
      this.configService.resetWizard();

      this.isSubmitting = false;
    },
    error: (error) => {
      this.mostrarError('Error al crear el torneo: ' + error.message);
      this.isSubmitting = false;
    }
  });
}

private crearEquipos(torneoId: number, equipos: TeamEntry[]) {
  this.tournamentService.crearEquipos(torneoId, equipos).subscribe({
    next: () => console.log(`${equipos.length} equipos creados`),
    error: (error) => console.error('Error al crear equipos:', error)
  });
}

private crearPartidos(torneoId: number, partidos: Match[]) {
  this.tournamentService.crearPartidos(torneoId, partidos).subscribe({
    next: () => console.log(`${partidos.length} partidos creados`),
    error: (error) => console.error('Error al crear partidos:', error)
  });
}

// ============================================================================
// 4. SERVICIO DE INTEGRACIÓN CON BACKEND
// ============================================================================

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TournamentConfigurationData, TeamEntry, Match } from '@app/shared/models/tournament-configuration';

@Injectable({
  providedIn: 'root'
})
export class TournamentBackendService {
  private readonly API_URL = 'http://localhost:8080/api/competitions';

  constructor(private http: HttpClient) {}

  /**
   * Crear un nuevo torneo
   */
  crearTorneo(config: TournamentConfigurationData): Observable<any> {
    const datosEnvio = {
      name: config.name,
      description: config.description,
      location: config.location,
      type: config.formatType,
      startDate: config.calendarConfig.firstMatchStartTime,
      teamsPerGroup: config.groupPhaseConfig?.teamsPerGroup || 0,
      advanceTeams: config.groupPhaseConfig?.teamsAdvancingPerGroup ||
                    config.mixedFormatConfig?.groupPhase.teamsAdvancingPerGroup || 0,
      maxTeams: config.numberOfTeams,
      status: 'PLANNING'
    };

    return this.http.post(`${this.API_URL}/tournaments`, datosEnvio);
  }

  /**
   * Crear equipos para un torneo
   */
  crearEquipos(torneoId: number, equipos: TeamEntry[]): Observable<any> {
    const datosEnvio = {
      teams: equipos.map(team => ({
        name: team.name,
        // ... otros campos según tu modelo backend
      }))
    };

    return this.http.post(`${this.API_URL}/tournaments/${torneoId}/teams`, datosEnvio);
  }

  /**
   * Crear partidos para un torneo
   */
  crearPartidos(torneoId: number, partidos: Match[]): Observable<any> {
    const datosEnvio = {
      matches: partidos.map(match => ({
        matchNumber: match.matchNumber,
        round: match.round,
        homeTeamId: match.homeTeam.id,
        awayTeamId: match.awayTeam.id,
        scheduledDate: match.scheduledDate,
        scheduledTime: match.scheduledTime,
        location: match.location,
        status: match.status
      }))
    };

    return this.http.post(`${this.API_URL}/tournaments/${torneoId}/matches`, datosEnvio);
  }

  /**
   * Obtener todos los torneos
   */
  getTorneos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/tournaments`);
  }

  /**
   * Obtener un torneo por ID
   */
  getTorneo(id: number): Observable<any> {
    return this.http.get(`${this.API_URL}/tournaments/${id}`);
  }

  /**
   * Actualizar un torneo
   */
  actualizarTorneo(id: number, datos: any): Observable<any> {
    return this.http.put(`${this.API_URL}/tournaments/${id}`, datos);
  }

  /**
   * Eliminar un torneo
   */
  eliminarTorneo(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/tournaments/${id}`);
  }
}

// ============================================================================
// 5. GUARDAR BORRADORES (OPCIONAL)
// ============================================================================

import { Injectable } from '@angular/core';
import { TournamentConfigurationData } from '@app/shared/models/tournament-configuration';

@Injectable({
  providedIn: 'root'
})
export class TournamentDraftService {
  private readonly DRAFT_KEY = 'tournament_draft';

  guardarBorrador(config: TournamentConfigurationData): void {
    const borrador = {
      ...config,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(this.DRAFT_KEY, JSON.stringify(borrador));
    console.log('Borrador guardado');
  }

  obtenerBorrador(): TournamentConfigurationData | null {
    const borrador = localStorage.getItem(this.DRAFT_KEY);
    return borrador ? JSON.parse(borrador) : null;
  }

  eliminarBorrador(): void {
    localStorage.removeItem(this.DRAFT_KEY);
  }

  tieneBorrador(): boolean {
    return !!localStorage.getItem(this.DRAFT_KEY);
  }
}

// EN tournament-wizard.component.ts, agregar:
ngOnInit() {
  // Restaurar borrador si existe
  if (this.draftService.tieneBorrador()) {
    const borrador = this.draftService.obtenerBorrador();
    if (borrador) {
      this.configService.updateData(borrador);
    }
  }

  // Guardar borrador automáticamente cada 30 segundos
  setInterval(() => {
    const config = this.configService.getConfigurationData();
    this.draftService.guardarBorrador(config);
  }, 30000);
}

// ============================================================================
// 6. NOTIFICACIONES Y FEEDBACK
// ============================================================================

// Agregar toastr o snackbar para mejor UX
import { ToastrService } from 'ngx-toastr';

export class TournamentWizardComponent {
  constructor(
    private toastr: ToastrService,
    // ... otros servicios
  ) {}

  nextStep(): void {
    if (this.wizardState && this.configService.validateStep(this.wizardState.currentStep)) {
      this.configService.markStepAsCompleted(this.wizardState.currentStep);
      this.configService.nextStep();
      this.toastr.success(`Paso ${this.wizardState.currentStep} completado`);
    } else {
      this.toastr.error('Por favor completa este paso correctamente');
    }
  }

  submitTournament(): void {
    // ... lógica anterior
    this.toastr.success('¡Torneo creado exitosamente!');
    // ...
  }
}

// ============================================================================
// 7. IMPORTACIONES NECESARIAS EN app.config.ts
// ============================================================================

import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AuthInterceptor } from './auth/interceptors/auth.interceptor';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([AuthInterceptor])
    ),
    provideAnimations(),
    // ... otros providers
  ]
};

// ============================================================================
// 8. EJEMPLO DE USO EN TEMPLATE
// ============================================================================

@Component({
  selector: 'app-tournaments-page',
  template: `
    <div class="tournaments-container">
      <header>
        <h1>Gestión de Torneos</h1>
        <button class="btn btn-primary" (click)="crearTorneo()">
          + Crear Torneo
        </button>
      </header>

      <main>
        <ng-container *ngIf="!mostrarWizard">
          <app-tournament-list [tournaments]="torneos"></app-tournament-list>
        </ng-container>

        <ng-container *ngIf="mostrarWizard">
          <app-tournament-wizard
            (onComplete)="onTorneoCreado()"
            (onCancel)="cancelarWizard()"
          ></app-tournament-wizard>
        </ng-container>
      </main>
    </div>
  `
})
export class TournamentsPageComponent {
  torneos: any[] = [];
  mostrarWizard = false;

  constructor(
    private tournamentService: TournamentBackendService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarTorneos();
  }

  crearTorneo() {
    this.mostrarWizard = true;
  }

  cargarTorneos() {
    this.tournamentService.getTorneos().subscribe(
      data => this.torneos = data
    );
  }

  onTorneoCreado() {
    this.mostrarWizard = false;
    this.cargarTorneos();
  }

  cancelarWizard() {
    if (confirm('¿Deseas cancelar? Se perderán los cambios.')) {
      this.mostrarWizard = false;
    }
  }
}

// ============================================================================
// 9. TESTING (OPCIONAL)
// ============================================================================

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TournamentWizardComponent } from './tournament-wizard.component';
import { TournamentConfigurationService } from '@app/services/tournament-configuration.service';

describe('TournamentWizardComponent', () => {
  let component: TournamentWizardComponent;
  let fixture: ComponentFixture<TournamentWizardComponent>;
  let configService: TournamentConfigurationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TournamentWizardComponent],
      providers: [TournamentConfigurationService]
    }).compileComponents();

    fixture = TestBed.createComponent(TournamentWizardComponent);
    component = fixture.componentInstance;
    configService = TestBed.inject(TournamentConfigurationService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start at step 1', () => {
    expect(component.wizardState?.currentStep).toBe(1);
  });

  it('should advance to next step when valid', () => {
    const initialStep = component.wizardState?.currentStep;
    component.nextStep();
    expect(component.wizardState?.currentStep).toBeGreaterThan(initialStep);
  });
});

// ============================================================================
// FIN DE LA GUÍA DE INTEGRACIÓN
// ============================================================================


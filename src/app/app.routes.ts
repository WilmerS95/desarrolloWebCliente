import { Routes } from '@angular/router';
import { LoginComponent } from './auth/components/login/login.component';
import { RegisterComponent } from './auth/components/register/register.component';
import { ForgotPasswordComponent } from './auth/components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './auth/components/reset-password/reset-password.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { RolesComponent } from './pages/roles/roles.component';
import { UsersManagementComponent } from './pages/users-management/users-management.component';
import { authGuard } from './auth/guards/auth.guard';
import { parameterAdminGuard } from './auth/guards/role-admin.guard';
import { TournamentParametersComponent } from './pages/tournament-parameters/tournament-parameters.component';

// Torneos
import { TournamentListComponent } from './pages/tournaments/tournament-list/tournament-list.component';
import { TournamentCreateComponent } from './pages/tournaments/tournament-create/tournament-create.component';
import { TournamentDetailComponent } from './pages/tournaments/tournament-detail/tournament-detail.component';

// Equipos
import { TeamListComponent } from './pages/teams/team-list/team-list.component';
import { TeamCreateComponent } from './pages/teams/team-create/team-create.component';
import { TeamDetailComponent } from './pages/teams/team-detail/team-detail.component';

// Jugadores
import { PlayerListComponent } from './pages/players/player-list/player-list.component';
import { PlayerCreateComponent } from './pages/players/player-create/player-create.component';
//import { PlayerDetailComponent } from './pages/players/player-detail/player-detail.component';

// Partidos
import { MatchListComponent } from './pages/matches/match-list/match-list.component';
import { MatchCalendarComponent } from './pages/matches/match-calendar/match-calendar.component';
import { MatchCreateComponent } from './pages/matches/match-create/match-create.component';
import { MatchDetailComponent } from './pages/matches/match-detail/match-detail.component';
import { MatchUpdateResultComponent } from './pages/matches/match-update-result/match-update-result.component';

// Standings
//import { StandingsComponent } from './pages/standings/standings.component';
//import { GroupStandingsComponent } from './pages/standings/group-standings.component';
//import { KnockoutStandingsComponent } from './pages/standings/knockout-standings.component';

// Estadísticas (comentado - crear después)
//import { TopScorersComponent } from './pages/statistics/top-scorers.component';
//import { LeastConcededComponent } from './pages/statistics/least-conceded.component';
//import { PlayerStatsComponent } from './pages/statistics/player-stats.component';
//import { TeamStatsComponent } from './pages/statistics/team-stats.component';

// Disciplina (comentado - crear después)
//import { CardsListComponent } from './pages/discipline/cards-list.component';
//import { FineManagementComponent } from './pages/discipline/fine-management.component';
//import { PlayerSuspensionsComponent } from './pages/discipline/player-suspensions.component';

// Pagos
//import { InscriptionPaymentsComponent } from './pages/payments/inscription-payments.component';
//import { CardPaymentsComponent } from './pages/payments/card-payments.component';
//import { FinePaymentsComponent } from './pages/payments/fine-payments.component';
//import { PaymentReportsComponent } from './pages/payments/payment-reports.component';

// Documentos
//import { DocumentGalleryComponent } from './pages/documents/document-gallery.component';
//import { MatchDocumentsComponent } from './pages/documents/match-documents.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

  // Dashboard - Página Principal
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },

  // Campeonatos 🏆
  { path: 'tournaments', component: TournamentListComponent, canActivate: [authGuard] },
  { path: 'tournaments/create', component: TournamentCreateComponent, canActivate: [parameterAdminGuard] },
  { path: 'tournaments/:id', component: TournamentDetailComponent, canActivate: [authGuard] },
  { path: 'tournaments/:id/parameters', component: TournamentParametersComponent, canActivate: [parameterAdminGuard] },

  // Equipos 👥
  { path: 'tournaments/:tournamentId/teams', component: TeamListComponent, canActivate: [authGuard] },
  { path: 'tournaments/:tournamentId/teams/create', component: TeamCreateComponent, canActivate: [authGuard] },
  { path: 'tournaments/:tournamentId/teams/:teamId', component: TeamDetailComponent, canActivate: [authGuard] },

  // Jugadores ⚽
  { path: 'tournaments/:tournamentId/teams/:teamId/players', component: PlayerListComponent, canActivate: [authGuard] },
  { path: 'tournaments/:tournamentId/teams/:teamId/players/create', component: PlayerCreateComponent, canActivate: [authGuard] },
  //{ path: 'tournaments/:tournamentId/teams/:teamId/players/:playerId', component: PlayerDetailComponent, canActivate: [authGuard] },

  // Partidos 📅
  { path: 'tournaments/:tournamentId/matches', component: MatchListComponent, canActivate: [authGuard] },
  { path: 'tournaments/:tournamentId/matches/calendar', component: MatchCalendarComponent, canActivate: [authGuard] },
  { path: 'tournaments/:tournamentId/matches/create', component: MatchCreateComponent, canActivate: [parameterAdminGuard] },
  { path: 'tournaments/:tournamentId/matches/:matchId', component: MatchDetailComponent, canActivate: [authGuard] },
  { path: 'tournaments/:tournamentId/matches/:matchId/result', component: MatchUpdateResultComponent, canActivate: [parameterAdminGuard] },

  // Tablas de posiciones 📊
  //{ path: 'tournaments/:tournamentId/standings', component: StandingsComponent, canActivate: [authGuard] },
  //{ path: 'tournaments/:tournamentId/standings/groups', component: GroupStandingsComponent, canActivate: [authGuard] },
  //{ path: 'tournaments/:tournamentId/standings/knockout', component: KnockoutStandingsComponent, canActivate: [authGuard] },

  // Estadísticas 📈 (comentado - crear después)
  //{ path: 'tournaments/:tournamentId/statistics/scorers', component: TopScorersComponent, canActivate: [authGuard] },
  //{ path: 'tournaments/:tournamentId/statistics/keepers', component: LeastConcededComponent, canActivate: [authGuard] },
  //{ path: 'tournaments/:tournamentId/statistics/players/:playerId', component: PlayerStatsComponent, canActivate: [authGuard] },
  //{ path: 'tournaments/:tournamentId/statistics/teams/:teamId', component: TeamStatsComponent, canActivate: [authGuard] },

  // Disciplina 🚫 (comentado - crear después)
  //{ path: 'tournaments/:tournamentId/discipline/cards', component: CardsListComponent, canActivate: [authGuard] },
  //{ path: 'tournaments/:tournamentId/discipline/fines', component: FineManagementComponent, canActivate: [parameterAdminGuard] },
  //{ path: 'tournaments/:tournamentId/discipline/suspensions', component: PlayerSuspensionsComponent, canActivate: [authGuard] },

  // Pagos 💰
  //{ path: 'tournaments/:tournamentId/payments/inscriptions', component: InscriptionPaymentsComponent, canActivate: [authGuard] },
  //{ path: 'tournaments/:tournamentId/payments/cards', component: CardPaymentsComponent, canActivate: [authGuard] },
  //{ path: 'tournaments/:tournamentId/payments/fines', component: FinePaymentsComponent, canActivate: [authGuard] },
  //{ path: 'tournaments/:tournamentId/payments/reports', component: PaymentReportsComponent, canActivate: [parameterAdminGuard] },

  // Documentos 📄
  //{ path: 'tournaments/:tournamentId/documents', component: DocumentGalleryComponent, canActivate: [authGuard] },
  //{ path: 'tournaments/:tournamentId/matches/:matchId/documents', component: MatchDocumentsComponent, canActivate: [authGuard] },

  // Admin
  { path: 'admin/users', component: UsersManagementComponent, canActivate: [parameterAdminGuard] },
  { path: 'admin/roles', component: RolesComponent, canActivate: [parameterAdminGuard] },

  //{ path: 'my-contracts/:id', component: ContractDetailComponent, canActivate: [authGuard] },
  //{ path: '**', redirectTo: '' }
];

import { Routes } from '@angular/router';
import { LoginComponent } from './auth/components/login/login.component';
import { RegisterComponent } from './auth/components/register/register.component';
import { ForgotPasswordComponent } from './auth/components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './auth/components/reset-password/reset-password.component';
import { StoreComponent } from './pages/store/store.component';
import { LoanApplicationComponent } from './pages/loan-application/loan-application.component';
import { RolesComponent } from './pages/roles/roles.component';
import { UsersManagementComponent } from './pages/users-management/users-management.component';
import { LoanRequestsComponent } from './pages/loan-requests/loan-requests.component';
import { LoanRequestDetailComponent } from './pages/loan-request-detail/loan-request-detail.component';
import { InstallmentAcceptanceComponent } from './pages/installment-acceptance/installment-acceptance.component';
import { authGuard } from './auth/guards/auth.guard';
import { parameterAdminGuard } from './auth/guards/parameter-admin.guard';
import { BusinessParametersComponent } from './pages/business-parameters/business-parameters.component';
import { LoanHistoryComponent } from './pages/loan-history/loan-history.component';
import { LoanHistoryDetailComponent } from './pages/loan-history-detail/loan-history-detail.component';
import { MyContractsComponent } from './pages/my-contracts/my-contracts.component'
import { AccountStatementComponent } from './pages/account-statement/account-statement.component'
import { ReportPaymentComponent } from './pages/report-payment/report-payment.component'
import { ReviewPaymentsComponent } from './pages/review-payments/review-payments.component'
import { AccountStatementPrintComponent } from './pages/account-statement-print/account-statement-print.component'
import { MyLoansComponent } from './pages/my-loans/my-loans.component';

export const routes: Routes = [
  { path: '', redirectTo: 'store', pathMatch: 'full' },
  { path: 'store', component: StoreComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'loan-application', component: LoanApplicationComponent },
  { path: 'roles', component: RolesComponent },
  { path: 'admin-users', component: UsersManagementComponent },
  { path: 'admin/solicitudes', component: LoanRequestsComponent },
  { path: 'admin/solicitudes/all', component: LoanRequestsComponent },
  { path: 'admin/solicitudes/:id', component: LoanRequestDetailComponent },
  { path: 'loan-application/:id/accept', component: InstallmentAcceptanceComponent },
  { path: 'business-parameters', component: BusinessParametersComponent, canActivate: [parameterAdminGuard] },
  { path: 'loan-history', component: LoanHistoryComponent, canActivate: [authGuard] },
  { path: 'loan-history/:id', component: LoanHistoryDetailComponent, canActivate: [authGuard] },
  { path: 'my-contracts', component: MyContractsComponent, canActivate: [authGuard] },
  { path: 'account-statement/:loanId', component: AccountStatementComponent },
  { path: 'report-payment', component: ReportPaymentComponent },
  { path: 'review-payments', component: ReviewPaymentsComponent },
  { path: 'account-statement-print/:loanId', component: AccountStatementPrintComponent },
  //{ path: 'my-contracts/:id', component: ContractDetailComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'store' }
];

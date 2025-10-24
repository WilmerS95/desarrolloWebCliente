import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LoanService, LoanDTO } from '../../services/loan.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-my-loans',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-loans.component.html',
  styleUrl: './my-loans.component.css'
})
export class MyLoansComponent implements OnInit {

  activeLoans: LoanDTO[] = [];
  loading = false;

  constructor(
    private loanService: LoanService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadActiveLoans();
  }

  loadActiveLoans() {
    this.loading = true;
    this.loanService.getMyActiveLoans().subscribe({
      next: (loans) => {
        this.activeLoans = loans;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando préstamos:', error);
        this.loading = false;
        Swal.fire('Error', 'No se pudieron cargar tus préstamos activos', 'error');
      }
    });
  }

  viewAccountStatement(loanId: number) {
    this.router.navigate(['/account-statement', loanId]);
  }

  reportPayment() {
    this.router.navigate(['/report-payment']);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'bg-success';
      case 'PENDING_PAYMENT': return 'bg-warning';
      case 'OVERDUE': return 'bg-danger';
      case 'PAID': return 'bg-primary';
      default: return 'bg-secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'Activo';
      case 'PENDING_PAYMENT': return 'Pago Pendiente';
      case 'OVERDUE': return 'Vencido';
      case 'PAID': return 'Pagado';
      default: return status;
    }
  }

  getProgressPercentage(loan: LoanDTO): number {
    if (loan.totalAmount === 0) return 0;
    const paid = loan.totalAmount - loan.balance;
    return Math.round((paid / loan.totalAmount) * 100);
  }
}

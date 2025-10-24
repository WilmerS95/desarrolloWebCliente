import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService, AccountStatementDTO } from '../../services/payment.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-account-statement',
  imports: [CommonModule],
  templateUrl: './account-statement.component.html',
  styleUrl: './account-statement.component.css'
})
export class AccountStatementComponent implements OnInit {
  statement: AccountStatementDTO | null = null;
  loading = false;
  loanId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.loanId = +params['loanId'];
      if (this.loanId) {
        this.loadStatement();
      } else {
        Swal.fire('Error', 'ID de préstamo inválido', 'error');
        this.router.navigate(['/my-loans']);
      }
    });
  }

  loadStatement() {
    this.loading = true;
    this.paymentService.getAccountStatement(this.loanId).subscribe({
      next: (statement) => {
        this.statement = statement;
        this.loading = false;
      },
      error: (error) => {
        console.error(error);
        this.loading = false;
        Swal.fire('Error', 'No se pudo cargar el estado de cuenta', 'error');
        this.router.navigate(['/my-loans']);
      }
    });
  }

  getProgressPercentage(): number {
    if (!this.statement) return 0;
    if (this.statement.totalAmount === 0) return 0;
    return Math.round((this.statement.paidAmount / this.statement.totalAmount) * 100);
  }

  getStatusBadgeClass(): string {
    if (!this.statement) return 'bg-secondary';

    switch (this.statement.status) {
      case 'ACTIVE': return 'bg-success';
      case 'PAID': return 'bg-primary';
      case 'OVERDUE': return 'bg-danger';
      case 'DEFAULTED': return 'bg-dark';
      default: return 'bg-secondary';
    }
  }

  getStatusLabel(): string {
    if (!this.statement) return '';

    switch (this.statement.status) {
      case 'ACTIVE': return 'Activo';
      case 'PAID': return 'Pagado';
      case 'OVERDUE': return 'Vencido';
      case 'DEFAULTED': return 'En Mora';
      default: return this.statement.status;
    }
  }

  printStatement() {
    window.print();
  }

  goBack() {
    this.router.navigate(['/my-loans']);
  }

  reportPayment() {
    this.router.navigate(['/report-payment']);
  }
}

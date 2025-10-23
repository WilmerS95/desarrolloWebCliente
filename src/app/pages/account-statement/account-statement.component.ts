import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PaymentService, AccountStatementDTO } from '../../services/payment.service';
import { AuthService } from '../../auth/services/auth.service';
import { finalize } from 'rxjs/operators';

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
    private paymentService: PaymentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const loanId = Number(params['loanId']);

      if (!isNaN(loanId) && loanId > 0) {
        this.loanId = loanId;
        this.loadStatement(loanId);
      } else {
        console.error('ID de préstamo inválido en la ruta:', params['loanId']);
      }
    });
    const userId = this.authService.getUserId();
    if (userId && !isNaN(Number(userId))) {
      // this.loadUserLoans(userId);
    } else {
      console.error('ID de usuario no válido:', userId);
    }
  }

  private loadStatement(loanId: number): void {
    if (!loanId || isNaN(Number(loanId))) {
      console.error('No se puede cargar el estado de cuenta: ID inválido');
      return;
    }

    this.loading = true;
    this.paymentService.getAccountStatement(loanId)
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (statement: AccountStatementDTO) => {
          this.statement = statement;
        },
        error: (error: any) => {
          console.error('Error al cargar estado de cuenta:', error);
          this.statement = null;
        }
      });
  }

  getProgressPercentage(): number {
    if (!this.statement) return 0;
    return Math.round((this.statement.paidAmount / this.statement.totalAmount) * 100);
  }

  printStatement(): void {
    window.print();
  }
}

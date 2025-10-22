import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PaymentService, AccountStatementDTO } from '../../services/payment.service';


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
    private paymentService: PaymentService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.loanId = +params['loanId'];
      this.loadStatement();
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
        alert('Error al cargar el estado de cuenta');
      }
    });
  }

  getProgressPercentage(): number {
    if (!this.statement) return 0;
    return Math.round((this.statement.paidAmount / this.statement.totalAmount) * 100);
  }

  printStatement() {
    window.print();
  }
}

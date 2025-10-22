import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ValuationService, PaymentPlanResponse, LoanResponse } from '../../services/valuation.service';

@Component({
  selector: 'app-payment-plan',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-plan.component.html',
  styleUrl: './payment-plan.component.css'
})
export class PaymentPlanComponent implements OnInit {
  loanId!: number;
  loanApplicationId!: number;
  loan: LoanResponse | null = null;
  paymentPlan: PaymentPlanResponse | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private valuationService: ValuationService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['loanId']) {
        this.loanId = +params['loanId'];
        this.loadPaymentPlan();
      } else if (params['loanApplicationId']) {
        this.loanApplicationId = +params['loanApplicationId'];
        this.loadLoanAndPlan();
      }
    });
  }

  loadLoanAndPlan(): void {
    this.loading = true;
    this.valuationService.getLoanByApplicationId(this.loanApplicationId).subscribe({
      next: (loan) => {
        this.loan = loan;
        this.loanId = loan.loanId;
        this.loadPaymentPlan();
      },
      error: (err) => {
        console.error('Error cargando préstamo', err);
        this.loading = false;
      }
    });
  }

  loadPaymentPlan(): void {
    this.loading = true;
    this.valuationService.getPaymentPlan(this.loanId).subscribe({
      next: (plan) => {
        this.paymentPlan = plan;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando plan de pagos', err);
        this.loading = false;
      }
    });
  }

  printPlan(): void {
    window.print();
  }

  downloadPDF(): void {
    alert('Funcionalidad de descarga PDF próximamente');
  }
}

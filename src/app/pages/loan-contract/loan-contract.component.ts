import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ValuationService, LoanResponse, PaymentPlanResponse } from '../../services/valuation.service';

@Component({
  selector: 'app-loan-contract',
  templateUrl: './loan-contract.component.html',
  styleUrls: ['./loan-contract.component.css']
})
export class LoanContractComponent implements OnInit {
  loan: LoanResponse | null = null;
  paymentPlan: PaymentPlanResponse | null = null;
  loading = true;
  contractDate = new Date();

  constructor(
    private route: ActivatedRoute,
    private valuationService: ValuationService
  ) {}

  ngOnInit(): void {
    const loanId = this.route.snapshot.params['loanId'];
    if (loanId) {
      this.loadLoanData(loanId);
    }
  }

  loadLoanData(loanId: number): void {
    this.loading = true;

    this.valuationService.getPaymentPlan(loanId).subscribe({
      next: (plan) => {
        this.paymentPlan = plan;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando datos del préstamo', err);
        this.loading = false;
      }
    });
  }

  printContract(): void {
    window.print();
  }

  downloadPDF(): void {
    alert('Función de descarga PDF en desarrollo');
  }

  signContract(): void {
    alert('Función de firma electrónica en desarrollo');
  }
}

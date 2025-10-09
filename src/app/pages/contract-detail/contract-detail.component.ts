import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LoanContractService, LoanContract } from '../../services/loan-contract.service';

@Component({
  selector: 'app-contract-detail',
  imports: [CommonModule, RouterModule],
  templateUrl: './contract-detail.component.html',
  styleUrl: './contract-detail.component.css'
})
export class ContractDetailComponent implements OnInit {
  contract?: LoanContract;
    loading = true;

    constructor(
      private route: ActivatedRoute,
      private router: Router,
      private contractService: LoanContractService
    ) {}

    ngOnInit(): void {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.loadContract(+id);
      }
    }

    loadContract(loanApplicationId: number): void {
      this.contractService.getContractDetails(loanApplicationId).subscribe({
        next: (data) => {
          this.contract = data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error cargando contrato:', error);
          this.loading = false;
          this.router.navigate(['/my-contracts']);
        }
      });
    }

    viewContract(): void {
      if (this.contract) {
        this.contractService.openContractInNewWindow(this.contract.loanApplicationId);
      }
    }

    goBack(): void {
      this.router.navigate(['/my-contracts']);
    }

    getStatusClass(status: string): string {
      const statusMap: { [key: string]: string } = {
        'ACTIVO': 'badge bg-success',
        'VENCIDO': 'badge bg-danger',
        'PAGADO': 'badge bg-primary',
        'CANCELADO': 'badge bg-secondary'
      };
      return statusMap[status] || 'badge bg-secondary';
    }

    getInstallmentStatusClass(status: string): string {
      const statusMap: { [key: string]: string } = {
        'PENDIENTE': 'text-warning',
        'PAGADO': 'text-success',
        'VENCIDO': 'text-danger'
      };
      return statusMap[status] || 'text-secondary';
    }

    calculatePaidAmount(): number {
      if (!this.contract) return 0;
      return this.contract.loanAmount - this.contract.balance;
    }

    calculateProgressPercentage(): number {
      if (!this.contract) return 0;
      const paid = this.calculatePaidAmount();
      return (paid / this.contract.loanAmount) * 100;
    }
}

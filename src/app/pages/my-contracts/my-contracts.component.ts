import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { LoanContractService, LoanContract } from '../../services/loan-contract.service';


@Component({
  selector: 'app-my-contracts',
  imports: [CommonModule, RouterModule],
  templateUrl: './my-contracts.component.html',
  styleUrl: './my-contracts.component.css'
})
export class MyContractsComponent implements OnInit {

  contracts: LoanContract[] = [];
  loading = true;

  constructor(private contractService: LoanContractService, private router: Router) {}

  ngOnInit(): void {
    this.loadContracts();
  }

  loadContracts(): void {
    this.contractService.getMyContracts().subscribe({
      next: (data) => {
        this.contracts = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando contratos:', error);
        this.loading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'ACTIVO': 'bg-success',
      'VENCIDO': 'bg-danger',
      'PAGADO': 'bg-primary',
      'CANCELADO': 'bg-secondary'
    };
    return statusMap[status] || 'bg-secondary';
  }

  calculateProgress(balance: number, total: number): number {
    const paid = total - balance;
    return (paid / total) * 100;
  }

  /* viewContract(loanApplicationId: number): void {
    this.contractService.openContractInNewWindow(loanApplicationId);
  } */

  goToContractDetail(loanApplicationId: number): void {
      this.router.navigate(['/my-contracts', loanApplicationId]);
    }

  viewContract(loanApplicationId: number): void {
    this.contractService.openContractInNewWindow(loanApplicationId);
  }
}

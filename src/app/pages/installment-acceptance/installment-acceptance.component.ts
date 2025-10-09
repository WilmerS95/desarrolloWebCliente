import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { LoanAdminService } from '../../services/loan-admin.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-installment-acceptance',
  imports: [CommonModule, CurrencyPipe, DatePipe],
  templateUrl: './installment-acceptance.component.html',
  styleUrl: './installment-acceptance.component.css'
})
export class InstallmentAcceptanceComponent implements OnInit {
  loanApplicationId!: number;
    installments: any[] = [];
    totalAmount: number = 0;

    constructor(
      private route: ActivatedRoute,
      private router: Router,
      private loanService: LoanAdminService
    ) {}

    ngOnInit() {
      this.loanApplicationId = +this.route.snapshot.paramMap.get('id')!;
      this.loadInstallments();
    }

    loadInstallments() {
      this.loanService.getInstallmentProposal(this.loanApplicationId).subscribe({
        next: (data) => {
          this.installments = data.installments;
          this.totalAmount = data.totalAmount;
        },
        error: () => {
          Swal.fire('Error', 'No se pudo cargar el plan de cuotas', 'error');
        }
      });
    }

    acceptPlan() {
      Swal.fire({
        title: '¿Confirmas que aceptas este plan?',
        text: 'Se creará el contrato de empeño',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, acepto',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.loanService.acceptInstallments(this.loanApplicationId).subscribe({
            next: () => {
              Swal.fire({
                icon: 'success',
                title: '¡Contrato creado!',
                text: 'Tu préstamo ha sido activado correctamente',
                confirmButtonText: 'Ir a mis préstamos'
              }).then(() => {
                this.router.navigate(['/my-loans']);
              });
            },
            error: () => {
              Swal.fire('Error', 'No se pudo confirmar el contrato', 'error');
            }
          });
        }
      });
    }

    goBack() {
      this.router.navigate(['/history']);
    }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StoreService, ItemTransfer } from '../../services/store.service';
import Swal from 'sweetalert2';

interface Loan {
  loanId: number;
  loanAmount: number;
  balance: number;
  status: string;
  item: {
    itemID: number;
    nameItem: string;
    brand: string;
  };
  client: {
    name: string;
  };
}

@Component({
  selector: 'app-transfer-items-admin',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './transfer-items-admin.component.html',
  styleUrl: './transfer-items-admin.component.css'
})
export class TransferItemsAdminComponent implements OnInit {

  transferForm: FormGroup;
  activeLoans: Loan[] = [];
  selectedLoan: Loan | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private storeService: StoreService
  ) {
    this.transferForm = this.fb.group({
      loanId: ['', Validators.required],
      salePrice: ['', [Validators.required, Validators.min(1)]],
      reason: ['', Validators.required],
      adminComment: ['']
    });
  }

  ngOnInit(): void {
    this.loadActiveLoans();
  }

  loadActiveLoans(): void {
    this.activeLoans = [];
  }

  onLoanSelected(): void {
    const loanId = this.transferForm.get('loanId')?.value;
    if (loanId) {
      this.selectedLoan = this.activeLoans.find(l => l.loanId === Number(loanId)) || null;

      // Sugerir precio de venta basado en el saldo
      if (this.selectedLoan) {
        const suggestedPrice = this.selectedLoan.balance * 1.1; // 10% sobre el saldo
        this.transferForm.patchValue({
          salePrice: suggestedPrice.toFixed(2)
        });
      }
    }
  }

  onSubmit(): void {
    if (this.transferForm.valid) {
      Swal.fire({
        title: '¿Confirmar transferencia?',
        html: `
          <p>¿Estás seguro de transferir este item a la tienda?</p>
          <p><strong>Item:</strong> ${this.selectedLoan?.item.nameItem}</p>
          <p><strong>Precio:</strong> Q${this.transferForm.value.salePrice}</p>
          <p class="text-danger mt-2">Esta acción no se puede deshacer.</p>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, transferir',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.executeTransfer();
        }
      });
    }
  }

  executeTransfer(): void {
    this.loading = true;

    const transfer: ItemTransfer = {
      itemId: this.selectedLoan?.item.itemID!,
      loanId: Number(this.transferForm.value.loanId),
      salePrice: Number(this.transferForm.value.salePrice),
      reason: this.transferForm.value.reason,
      adminComment: this.transferForm.value.adminComment
    };

    this.storeService.transferItemToStore(transfer).subscribe({
      next: (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Transferencia Exitosa',
          text: 'El item ha sido transferido a la tienda correctamente',
          timer: 3000
        });
        this.resetForm();
        this.loadActiveLoans();
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.error?.error || 'No se pudo transferir el item'
        });
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  executeAutomaticTransfer(): void {
    Swal.fire({
      title: '¿Ejecutar proceso automático?',
      text: 'Se revisarán todos los préstamos vencidos y se transferirán automáticamente los items correspondientes.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, ejecutar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;

        this.storeService.transferOverdueLoans().subscribe({
          next: (response) => {
            Swal.fire({
              icon: 'success',
              title: 'Proceso Completado',
              text: 'El proceso automático se ejecutó correctamente',
              timer: 3000
            });
            this.loadActiveLoans();
          },
          error: (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Ocurrió un error al ejecutar el proceso automático'
            });
          },
          complete: () => {
            this.loading = false;
          }
        });
      }
    });
  }

  resetForm(): void {
    this.transferForm.reset();
    this.selectedLoan = null;
  }
}

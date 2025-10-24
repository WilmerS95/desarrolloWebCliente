import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService, PaymentRequestDTO } from '../../services/payment.service';
import { LoanService, LoanDTO } from '../../services/loan.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-report-payment',
  imports: [CommonModule, FormsModule],
  templateUrl: './report-payment.component.html',
  styleUrl: './report-payment.component.css'
})
export class ReportPaymentComponent implements OnInit {

  payment: PaymentRequestDTO = {
    loanId: 0,
    paymentNumber: 1,
    amountPaid: 0,
    paymentMethod: 'TRANSFERENCIA',
    referenceBase64: ''
  };

  userLoans: LoanDTO[] = [];
  imagePreview: string | null = null;
  loading = false;

  paymentMethods = [
    { value: 'TRANSFERENCIA', label: 'Transferencia Bancaria' },
    { value: 'DEPOSITO', label: 'Depósito en Efectivo' },
    { value: 'EFECTIVO', label: 'Efectivo en Oficina' },
    { value: 'OTRO', label: 'Otro' }
  ];

  constructor(
    private paymentService: PaymentService,
    private loanService: LoanService
  ) {}

  ngOnInit() {
    this.loadUserLoans();
  }

  loadUserLoans() {
    this.loanService.getMyActiveLoans().subscribe({
      next: (loans) => {
        this.userLoans = loans;
      },
      error: (error) => {
        console.error('Error cargando préstamos:', error);
        Swal.fire('Error', 'No se pudieron cargar tus préstamos activos', 'error');
      }
    });
  }

  onLoanChange() {
    this.payment.paymentNumber = 1;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        Swal.fire('Error', 'Solo se permiten archivos de imagen', 'error');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        Swal.fire('Error', 'La imagen no debe superar 5MB', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        this.payment.referenceBase64 = base64.split(',')[1];
        this.imagePreview = base64;
      };
      reader.readAsDataURL(file);
    }
  }

  isFormValid(): boolean {
    return this.payment.loanId > 0 &&
           this.payment.paymentNumber > 0 &&
           this.payment.amountPaid > 0 &&
           this.payment.paymentMethod !== '' &&
           this.payment.referenceBase64 !== '';
  }

  onSubmit() {
    if (!this.isFormValid()) {
      Swal.fire('Error', 'Por favor complete todos los campos y adjunte el comprobante', 'error');
      return;
    }

    this.loading = true;

    this.paymentService.reportPayment(this.payment).subscribe({
      next: (response) => {
        this.loading = false;
        Swal.fire({
          title: '¡Pago Reportado!',
          html: `
            <p>Tu pago ha sido recibido y está en revisión.</p>
            <p>Te notificaremos cuando sea aprobado.</p>
            <p><strong>Número de pago:</strong> ${response.paymentNumber}</p>
          `,
          icon: 'success',
          confirmButtonText: 'Entendido'
        });
        this.resetForm();
      },
      error: (error) => {
        this.loading = false;
        console.error(error);
        Swal.fire(
          'Error',
          error.error?.error || 'No se pudo reportar el pago. Intenta nuevamente.',
          'error'
        );
      }
    });
  }

  resetForm() {
    this.payment = {
      loanId: 0,
      paymentNumber: 1,
      amountPaid: 0,
      paymentMethod: 'TRANSFERENCIA',
      referenceBase64: ''
    };
    this.imagePreview = null;

    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
}

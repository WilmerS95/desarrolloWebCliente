import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService, PaymentRequestDTO } from '../../services/payment.service';
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
    paymentMethod: '',
    referenceBase64: ''
  };

  userLoans: any[] = [];
  imagePreview: string | null = null;
  loading = false;

  constructor(private paymentService: PaymentService) {}

  ngOnInit() {
    this.loadUserLoans();
  }

  loadUserLoans() {
    // TODO: Implementar servicio para obtener préstamos del usuario
    // Por ahora usamos datos de ejemplo
    this.userLoans = [];
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire('Error', 'La imagen no debe superar 5MB', 'error');
        return;
      }

      // Convertir a base64
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        this.payment.referenceBase64 = base64.split(',')[1]; // Remover el prefijo data:image/...
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
      Swal.fire('Error', 'Por favor complete todos los campos', 'error');
      return;
    }

    this.loading = true;

    this.paymentService.reportPayment(this.payment).subscribe({
      next: (response) => {
        this.loading = false;
        Swal.fire({
          title: '¡Pago Reportado!',
          text: 'Tu pago ha sido recibido y está en revisión. Te notificaremos cuando sea aprobado.',
          icon: 'success'
        });
        this.resetForm();
      },
      error: (error) => {
        this.loading = false;
        console.error(error);
        Swal.fire('Error', error.error?.error || 'No se pudo reportar el pago', 'error');
      }
    });
  }

  resetForm() {
    this.payment = {
      loanId: 0,
      paymentNumber: 1,
      amountPaid: 0,
      paymentMethod: '',
      referenceBase64: ''
    };
    this.imagePreview = null;
  }
}

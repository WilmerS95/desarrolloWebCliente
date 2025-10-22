import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService, PaymentDTO, PaymentReviewDTO } from '../../services/payment.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-review-payments',
  imports: [CommonModule, FormsModule],
  templateUrl: './review-payments.component.html',
  styleUrl: './review-payments.component.css'
})
export class ReviewPaymentsComponent implements OnInit {
  payments: any[] = [];
  loading = false;
  selectedImage: string | null = null;

  constructor(private paymentService: PaymentService) {}

  ngOnInit() {
    this.loadPendingPayments();
  }

  loadPendingPayments() {
    this.loading = true;
    this.paymentService.getPendingPayments().subscribe({
      next: (payments) => {
        this.payments = payments.map(p => ({...p, comment: ''}));
        this.loading = false;
      },
      error: (error) => {
        console.error(error);
        this.loading = false;
        Swal.fire('Error', 'No se pudieron cargar los pagos pendientes', 'error');
      }
    });
  }

  async reviewPayment(payment: any, status: string) {
    const action = status === 'APROBADO' ? 'aprobar' : 'rechazar';

    const result = await Swal.fire({
      title: `¿${action === 'aprobar' ? 'Aprobar' : 'Rechazar'} este pago?`,
      text: status === 'APROBADO' ?
            'El pago se aplicará al estado de cuenta del cliente' :
            'El cliente deberá reportar el pago nuevamente',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Sí, ${action}`,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: status === 'APROBADO' ? '#28a745' : '#dc3545'
    });

    if (!result.isConfirmed) return;

    const reviewDTO: PaymentReviewDTO = {
      paymentId: payment.paymentId,
      status: status,
      comment: payment.comment || ''
    };

    this.paymentService.reviewPayment(reviewDTO).subscribe({
      next: (response) => {
        Swal.fire({
          title: '¡Revisión Completada!',
          text: `El pago ha sido ${status === 'APROBADO' ? 'aprobado' : 'rechazado'}`,
          icon: 'success'
        });
        this.loadPendingPayments();
      },
      error: (error) => {
        console.error(error);
        Swal.fire('Error', error.error?.error || 'No se pudo revisar el pago', 'error');
      }
    });
  }

  getImageSrc(imageData: any): string {
    if (typeof imageData === 'string') {
      return `data:image/jpeg;base64,${imageData}`;
    }
    return '';
  }

  openImageModal(imageData: any) {
    this.selectedImage = this.getImageSrc(imageData);
    // Abrir modal con Bootstrap
    const modalElement = document.getElementById('imageModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }
}

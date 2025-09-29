import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoanAdminService } from '../../services/loan-admin.service';
import { LoanApplication } from '../../shared/models/LoanApplication';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-loan-request-detail',
  standalone: true,
  templateUrl: './loan-request-detail.component.html',
  styleUrls: ['./loan-request-detail.component.css'],
  imports: [CommonModule, FormsModule, DatePipe]
})
export class LoanRequestDetailComponent {
  request!: LoanApplication;
  loading = true;
  counterOfferValue = 0;
  comment = '';
  selectedImage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private loanAdminService: LoanAdminService,
    private router: Router
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loanAdminService.getOne(+id).subscribe({
        next: req => { this.request = req; this.loading = false; },
        error: () => { this.loading = false; Swal.fire('Error','No se pudo cargar la solicitud','error'); }
      });
    }
  }

  openImage(url: string) {
    this.selectedImage = url;
  }

  async accept(req: LoanApplication) {
    const res = await Swal.fire({
      title: '¿Aceptar solicitud?',
      text: 'Esta acción aprobará la solicitud.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, aceptar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#198754'
    });
    if (res.isConfirmed) {
      this.loanAdminService.accept(req.loanApplicationId).subscribe({
        next: () => {
          req.status = 'ACCEPTED';
          Swal.fire('Aceptada', 'La solicitud ha sido aceptada.', 'success');
        },
        error: () => Swal.fire('Error', 'No se pudo aceptar la solicitud', 'error')
      });
    }
  }

  async reject(req: LoanApplication) {
    if (!this.comment.trim()) {
      Swal.fire('Atención', 'Ingrese un comentario antes de rechazar', 'warning');
      return;
    }
    const res = await Swal.fire({
      title: '¿Rechazar solicitud?',
      text: 'Se notificará al cliente con el comentario.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, rechazar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545'
    });
    if (res.isConfirmed) {
      this.loanAdminService.reject(req.loanApplicationId).subscribe({
        next: () => {
          req.status = 'REJECTED';
          Swal.fire('Rechazada', `Comentario: ${this.comment}`, 'info');
        },
        error: () => Swal.fire('Error', 'No se pudo rechazar', 'error')
      });
    }
  }

  async sendCounterOffer(req: LoanApplication) {
    if (!this.counterOfferValue || this.counterOfferValue <= 0) {
      Swal.fire('Atención', 'Ingrese un monto válido', 'warning');
      return;
    }
    if (!this.comment.trim()) {
      Swal.fire('Atención', 'Ingrese un comentario para la contraoferta', 'warning');
      return;
    }
    const res = await Swal.fire({
      title: '¿Enviar contraoferta?',
      text: `Monto: GTQ ${this.counterOfferValue}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Enviar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ffc107'
    });
    if (res.isConfirmed) {
      this.loanAdminService.counterOffer(req.loanApplicationId, this.counterOfferValue).subscribe({
        next: () => {
          req.status = 'COUNTER_OFFERED';
          req.estimatedValue = this.counterOfferValue;
          Swal.fire('Enviada', `Nuevo monto: GTQ ${this.counterOfferValue}\nComentario: ${this.comment}`, 'success');
        },
        error: () => Swal.fire('Error', 'No se pudo enviar la contraoferta', 'error')
      });
    }
  }

  goToAll() {
    this.router.navigate(['/admin/solicitudes/all']);
  }
}

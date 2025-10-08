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
          req.status = 'ACEPTADO';
          Swal.fire('Aceptada', 'La solicitud ha sido aceptada.', 'success');
        },
        error: (err) => {
          console.error(err);
          Swal.fire('Error', 'No se pudo aceptar la solicitud', 'error');
        }
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
      text: 'Se notificará al cliente con el comentario ingresado.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, rechazar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545'
    });

    if (res.isConfirmed) {
      this.loanAdminService.reject(req.loanApplicationId, this.comment).subscribe({
        next: () => {
          req.status = 'RECHAZADO';
          Swal.fire('Rechazada', `Comentario enviado al cliente:\n${this.comment}`, 'info');
          this.comment = '';
        },
        error: (err) => {
          console.error(err);
          Swal.fire('Error', 'No se pudo rechazar la solicitud', 'error');
        }
      });
    }
  }

  async sendCounterOffer(req: LoanApplication) {
    if (!this.counterOfferValue || this.counterOfferValue <= 0) {
      Swal.fire('Atención', 'Ingrese un monto válido para la contraoferta', 'warning');
      return;
    }

    if (!this.comment.trim()) {
      Swal.fire('Atención', 'Ingrese un comentario para la contraoferta', 'warning');
      return;
    }

    const res = await Swal.fire({
      title: '¿Enviar contraoferta?',
      text: `Monto propuesto: GTQ ${this.counterOfferValue}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Enviar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ffc107'
    });

    if (res.isConfirmed) {
      this.loanAdminService
        .counterOffer(req.loanApplicationId, this.counterOfferValue, this.comment)
        .subscribe({
          next: () => {
            req.status = 'CONTRA_OFERTADO';
            req.estimatedValue = this.counterOfferValue;
            Swal.fire(
              'Contraoferta enviada',
              `Monto: GTQ ${this.counterOfferValue}\nComentario: ${this.comment}`,
              'success'
            );
            this.comment = '';
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error', 'No se pudo enviar la contraoferta', 'error');
          }
        }
      );
    }
  }

  goToAll() {
    this.router.navigate(['/admin/solicitudes/all']);
  }
}

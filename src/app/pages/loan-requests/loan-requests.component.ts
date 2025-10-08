import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoanAdminService } from '../../services/loan-admin.service';
import { LoanApplication } from '../../shared/models/LoanApplication';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-loan-requests',
  imports: [CommonModule, FormsModule],
  templateUrl: './loan-requests.component.html',
  styleUrl: './loan-requests.component.css'
})
export class LoanRequestsComponent implements OnInit {
  applications: LoanApplication[] = [];
  loading = false;
  counterOfferValues: { [id: number]: number } = {};

  constructor(
    private loanAdminService: LoanAdminService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const all = this.route.snapshot.url.some(seg => seg.path === 'all');

    if (id && !all) {
      this.router.navigate(['/admin/solicitudes', id]);
    } else {
      this.loadAll();
    }
  }

  loadAll() {
    this.loading = true;
    this.loanAdminService.getAll().subscribe({
      next: data => { this.applications = data; this.loading = false; },
      error: () => this.loading = false
    });
  }

  openDetail(app: LoanApplication) {
    this.router.navigate(['/admin/solicitudes', app.loanApplicationId]);
  }

  accept(app: LoanApplication) {
    Swal.fire({
      title: '¿Aceptar solicitud?',
      text: 'El cliente será notificado de la aceptación.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, aceptar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#198754'
    }).then(result => {
      if (result.isConfirmed) {
        this.loanAdminService.accept(app.loanApplicationId).subscribe({
          next: () => {
            Swal.fire('Aceptada', 'La solicitud fue aceptada exitosamente', 'success');
            app.status = 'ACCEPTED';
          },
          error: () => Swal.fire('Error', 'No se pudo aceptar la solicitud', 'error')
        });
      }
    });
  }

  reject(app: LoanApplication) {
    Swal.fire({
      title: 'Motivo de rechazo',
      input: 'textarea',
      inputPlaceholder: 'Escriba el motivo del rechazo...',
      inputValidator: (value) => {
        if (!value) {
          return 'Debe ingresar un motivo';
        }
        return null;
      },
      showCancelButton: true,
      confirmButtonText: 'Rechazar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545'
    }).then(result => {
      if (result.isConfirmed && result.value) {
        const motivo = result.value;
        this.loanAdminService.reject(app.loanApplicationId, motivo).subscribe({
          next: () => {
            Swal.fire('Rechazada', 'Solicitud rechazada y comentario enviado al cliente', 'info');
            app.status = 'REJECTED';
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error', err.error?.error || 'No se pudo rechazar la solicitud', 'error');
          }
        });
      }
    });
  }

  sendCounterOffer(app: LoanApplication) {
    Swal.fire({
      title: 'Nueva contraoferta',
      html: `
        <input id="counterAmount" type="number" class="swal2-input" placeholder="Monto (GTQ)">
        <textarea id="counterComment" class="swal2-textarea" placeholder="Motivo o comentario..."></textarea>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Enviar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const amount = (document.getElementById('counterAmount') as HTMLInputElement).value;
        const comment = (document.getElementById('counterComment') as HTMLTextAreaElement).value;
        if (!amount || parseFloat(amount) <= 0) {
          Swal.showValidationMessage('Ingrese un monto válido');
          return false;
        }
        if (!comment) {
          Swal.showValidationMessage('Debe ingresar un comentario');
          return false;
        }
        return { amount: parseFloat(amount), comment };
      }
    }).then(result => {
      if (result.isConfirmed && result.value) {
        const { amount, comment } = result.value;

        this.loanAdminService.counterOffer(app.loanApplicationId, amount, comment).subscribe({
          next: () => {
            Swal.fire('Contraoferta enviada', `Nuevo monto: GTQ ${amount}`, 'success');
            app.status = 'COUNTER_OFFERED';
            app.estimatedValue = amount;
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error', err.error?.error || 'No se pudo enviar la contraoferta', 'error');
          }
        });
      }
    });
  }
}

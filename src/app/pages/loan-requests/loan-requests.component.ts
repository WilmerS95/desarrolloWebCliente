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

  loadApplications(): void {
    this.loading = true;
    this.loanAdminService.getAll().subscribe({
      next: data => {
        this.applications = data.map(app => ({
          ...app,
          estimatedValue: app.estimatedValue ?? 0
        }));
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.loading = false;
        Swal.fire('Error', 'No se pudieron cargar las solicitudes', 'error');
      }
    });
  }

  accept(app: LoanApplication) {
    this.loanAdminService.accept(app.loanApplicationId).subscribe({
      next: () => {
        Swal.fire('Aceptada', 'Solicitud aceptada', 'success');
        app.status = 'ACCEPTED';
      },
      error: () => Swal.fire('Error', 'No se pudo aceptar', 'error')
    });
  }

  reject(app: LoanApplication) {
    this.loanAdminService.reject(app.loanApplicationId).subscribe({
      next: () => {
        Swal.fire('Rechazada', 'Solicitud rechazada', 'info');
        app.status = 'REJECTED';
      },
      error: () => Swal.fire('Error', 'No se pudo rechazar', 'error')
    });
  }

  sendCounterOffer(app: LoanApplication) {
    const amount = this.counterOfferValues[app.loanApplicationId];
    if (!amount || amount <= 0) {
      Swal.fire('Atención', 'Ingrese un monto válido', 'warning');
      return;
    }

    this.loanAdminService.counterOffer(app.loanApplicationId, amount).subscribe({
      next: () => {
        app.status = 'COUNTER_OFFERED';
        app.estimatedValue = amount;
        Swal.fire('Contraoferta enviada', `Nuevo monto: GTQ ${amount}`, 'success');
      },
      error: () => Swal.fire('Error', 'No se pudo enviar la contraoferta', 'error')
    });
  }
}

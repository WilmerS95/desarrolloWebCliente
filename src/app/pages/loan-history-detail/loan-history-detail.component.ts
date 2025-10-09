import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LoanHistoryService, LoanHistory } from '../../services/loan-history.service';

@Component({
  selector: 'app-loan-history-detail',
  imports: [CommonModule, RouterModule],
  templateUrl: './loan-history-detail.component.html',
  styleUrl: './loan-history-detail.component.css'
})
export class LoanHistoryDetailComponent implements OnInit {
  application?: LoanHistory;
  loading = true;
  selectedImage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private loanHistoryService: LoanHistoryService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadApplication(+id);
    }
  }

  loadApplication(id: number): void {
    this.loanHistoryService.getMyApplication(id).subscribe({
      next: (data) => {
        this.application = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando solicitud:', error);
        this.loading = false;
        this.router.navigate(['/loan-history']);
      }
    });
  }

  openImage(url: string): void {
    this.selectedImage = url;
  }

  closeImage(): void {
    this.selectedImage = null;
  }

  goBack(): void {
    this.router.navigate(['/loan-history']);
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDIENTE': 'bg-warning text-dark',
      'APROBADO': 'bg-success',
      'APROBADO_PENDIENTE_CLIENTE': 'bg-info',
      'CLIENTE_ACEPTO': 'bg-primary',
      'RECHAZADO': 'bg-danger',
      'CONTRAOFERTADO': 'bg-secondary'
    };
    return statusMap[status] || 'bg-secondary';
  }

  getStatusText(status: string): string {
    const textMap: { [key: string]: string } = {
      'PENDIENTE': 'Pendiente de revisión',
      'APROBADO': 'Aprobado',
      'APROBADO_PENDIENTE_CLIENTE': 'Aprobado - Pendiente de tu aceptación',
      'CLIENTE_ACEPTO': 'Aceptado - Contrato firmado',
      'RECHAZADO': 'Rechazado',
      'CONTRAOFERTADO': 'Contraoferta recibida'
    };
    return textMap[status] || status;
  }
}

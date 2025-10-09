import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LoanHistoryService, LoanHistory } from '../../services/loan-history.service';

@Component({
  selector: 'app-loan-history',
  imports: [CommonModule, RouterModule],
  templateUrl: './loan-history.component.html',
  styleUrl: './loan-history.component.css'
})
export class LoanHistoryComponent implements OnInit {
  history: LoanHistory[] = [];
  loading = true;

  constructor(private loanHistoryService: LoanHistoryService) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.loading = true;
    this.loanHistoryService.getMyHistory().subscribe({
      next: (data) => {
        this.history = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando historial:', error);
        this.loading = false;
      }
    });
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
      'PENDIENTE': 'Pendiente',
      'APROBADO': 'Aprobado',
      'APROBADO_PENDIENTE_CLIENTE': 'Aprobado - Pendiente de aceptación',
      'CLIENTE_ACEPTO': 'Aceptado',
      'RECHAZADO': 'Rechazado',
      'CONTRAOFERTADO': 'Contraoferta recibida'
    };
    return textMap[status] || status;
  }
}

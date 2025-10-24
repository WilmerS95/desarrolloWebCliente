import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../services/payment.service';
import Swal from 'sweetalert2';

interface AccountStatement {
  loanId: number;
  loanAmount: number;
  totalInterest: number;
  totalAmount: number;
  balance: number;
  paidAmount: number;
  status: string;
  itemName: string;
  totalPayments: number;
  paidPayments: number;
  paymentSchedule: PaymentSchedule[];
  payments: Payment[];
}

interface PaymentSchedule {
  scheduleId: number;
  paymentNumber: number;
  dueDate: string;
  amountDue: number;
  principalAmount: number;
  interestAmount: number;
  status: string;
  paidAmount?: number;
  paidDate?: string;
}

interface Payment {
  paymentId: number;
  loanId: number;
  paymentNumber: number;
  paymentDate: string;
  amountPaid: number;
  paymentMethod: string;
  status: string;
  reviewComment?: string;
  reviewDate?: string;
}

@Component({
  selector: 'app-account-statement-print',
  imports: [CommonModule],
  templateUrl: './account-statement-print.component.html',
  styleUrl: './account-statement-print.component.css'
})
export class AccountStatementPrintComponent implements OnInit {
  statement: AccountStatement | null = null;
  loanId: number = 0;
  customerName: string = '';
  currentDate: Date = new Date();
  loading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.loanId = +params['loanId'];
      if (this.loanId) {
        this.loadStatement();
      }
    });

    this.customerName = this.getUserName();
  }

  loadStatement(): void {
    this.loading = true;
    this.paymentService.getAccountStatement(this.loanId).subscribe({
      next: (data) => {
        this.statement = data;
        this.loading = false;
        console.log(' Estado de cuenta cargado:', data);
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al cargar el estado de cuenta',
        }).then(() => {
          return;
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/my-contracts']);
  }

  getProgressPercentage(): number {
    if (!this.statement || this.statement.totalPayments === 0) {
      return 0;
    }
    return (this.statement.paidPayments / this.statement.totalPayments) * 100;
  }

  hasPayments(): boolean {
    return !!(this.statement?.payments && this.statement.payments.length > 0);
  }

  getStatusClass(): string {
    if (!this.statement) return '';

    const status = this.statement.status.toUpperCase();

    switch (status) {
      case 'ACTIVO':
      case 'ACTIVE':
        return 'status-active';
      case 'PAGADO':
      case 'PAID':
        return 'status-paid';
      case 'VENCIDO':
      case 'OVERDUE':
        return 'status-overdue';
      default:
        return 'status-pending';
    }
  }

  getInstallmentRowClass(installment: PaymentSchedule): string {
    const status = installment.status.toUpperCase();

    if (status === 'PAID' || status === 'PAGADO') {
      return 'row-paid';
    }

    if (status === 'OVERDUE' || status === 'VENCIDO') {
      return 'row-overdue';
    }

    if (status === 'PENDING' || status === 'PENDIENTE') {
      const dueDate = new Date(installment.dueDate);
      const today = new Date();

      if (dueDate < today) {
        return 'row-overdue';
      }
    }

    return 'row-pending';
  }

  getStatusBadgeClass(status: string): string {
    const statusUpper = status.toUpperCase();

    switch (statusUpper) {
      case 'PAID':
      case 'PAGADO':
        return 'status-paid';
      case 'PENDING':
      case 'PENDIENTE':
        return 'status-pending';
      case 'OVERDUE':
      case 'VENCIDO':
        return 'status-overdue';
      default:
        return 'status-pending';
    }
  }

  getStatusText(status: string): string {
    const statusUpper = status.toUpperCase();

    switch (statusUpper) {
      case 'PAID':
        return 'PAGADO';
      case 'PAGADO':
        return 'PAGADO';
      case 'PENDING':
        return 'PENDIENTE';
      case 'PENDIENTE':
        return 'PENDIENTE';
      case 'OVERDUE':
        return 'VENCIDO';
      case 'VENCIDO':
        return 'VENCIDO';
      default:
        return status;
    }
  }

  getPaymentStatusClass(status: string): string {
    const statusUpper = status.toUpperCase();

    switch (statusUpper) {
      case 'APPROVED':
      case 'APROBADO':
        return 'status-approved';
      case 'PENDING':
      case 'PENDIENTE':
        return 'status-pending';
      case 'REJECTED':
      case 'RECHAZADO':
        return 'status-rejected';
      default:
        return 'status-pending';
    }
  }

  printStatement(): void {
    const printSection = document.getElementById('contracts-section');
    if (!printSection) {
      console.error('No se encontró el elemento con id "contracts-section"');
      return;
    }

    const printContents = printSection.innerHTML;
    const printWindow = window.open('', '_blank', 'width=900,height=650');

    if (!printWindow) {
      alert('No se pudo abrir la ventana de impresión. Revisa si tu navegador bloqueó pop-ups.');
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Estado de Cuenta</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="stylesheet"
                href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" />
          <link rel="stylesheet"
                href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" />
          <style>
            body {
              font-family: 'Segoe UI', sans-serif;
              margin: 20px;
              color: #333;
            }
            h2, h3 {
              color: #2c3e50;
            }
            .header, .footer {
              text-align: center;
            }
            .header h1 {
              font-size: 28px;
              margin-bottom: 0;
            }
            .header .subtitle {
              font-size: 14px;
              margin-top: 0;
              color: #666;
            }
            .document-info h2 {
              font-size: 22px;
              margin: 10px 0;
            }
            .info-section, .summary-section, .installments-section, .payments-section {
              margin: 20px 0;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
            }
            .info-col {
              width: 48%;
            }
            .summary-grid {
              display: flex;
              flex-wrap: wrap;
              gap: 10px;
            }
            .summary-item {
              flex: 1 1 30%;
              padding: 8px;
              border: 1px solid #ddd;
              border-radius: 4px;
            }
            .summary-item.highlight {
              background-color: #f1f1f1;
            }
            .summary-item.success {
              background-color: #e0f7e9;
            }
            .summary-item.warning {
              background-color: #fff4e5;
            }
            .summary-item.info {
              background-color: #e7f0fd;
            }
            .progress-container {
              margin-top: 10px;
            }
            .progress-bar {
              width: 100%;
              background-color: #eee;
              border-radius: 6px;
              overflow: hidden;
              height: 20px;
            }
            .progress-fill {
              height: 100%;
              background-color: #4caf50;
              width: 0;
              transition: width 0.5s ease-in-out;
            }
            .progress-text {
              text-align: right;
              font-size: 12px;
              margin-top: 2px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            table th, table td {
              border: 1px solid #ddd;
              padding: 8px;
              font-size: 12px;
            }
            table th {
              background-color: #f5f5f5;
            }
            .row-paid {
              background-color: #e0f7e9;
            }
            .row-overdue {
              background-color: #fde0e0;
            }
            .row-pending {
              background-color: #fff4e5;
            }
            .status-badge {
              padding: 3px 6px;
              border-radius: 4px;
              font-size: 11px;
              color: #fff;
            }
            .status-paid { background-color: #4caf50; }
            .status-pending { background-color: #ff9800; }
            .status-overdue { background-color: #f44336; }
            .status-approved { background-color: #4caf50; }
            .status-rejected { background-color: #f44336; }
            .footer-note {
              font-size: 11px;
              color: #666;
              margin-bottom: 5px;
            }
            .footer-contact p {
              font-size: 11px;
              margin: 0;
            }
            @page { margin: 20mm; }
            @media print {
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          <h2 class="mb-4 text-center">
            <i class="bi bi-file-earmark-text me-2"></i> Estado de Cuenta
          </h2>
          ${printContents}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  }

  private getUserName(): string {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }

    return user.username || 'Cliente';
  }
}

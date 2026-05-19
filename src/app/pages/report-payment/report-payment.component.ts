import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PaymentService, PaymentRequestDTO, LoanDTO } from '../../services/payment.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-report-payment',
  imports: [CommonModule, FormsModule],
  templateUrl: './report-payment.component.html',
  styleUrls: ['./report-payment.component.css']
})
export class ReportPaymentComponent implements OnInit {

  loans: LoanDTO[] = [];
  loading = false;
  submitting = false;

  selectedLoanId: number | null = null;
  paymentNumber: number = 1;
  amountPaid: number = 0;
  paymentMethod: string = 'TRANSFERENCIA';
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  selectedLoan: LoanDTO | null = null;

  constructor(
    private paymentService: PaymentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadLoans();
  }

  loadLoans(): void {
    this.loading = true;

    console.log(' Cargando préstamos con balance pendiente...');

    this.paymentService.getMyLoansWithBalance().subscribe({
      next: (loans: LoanDTO[]) => {
        this.loans = loans;
        console.log(' Préstamos con balance cargados:', loans);

        if (loans.length > 0) {
          console.log(` Total de préstamos con saldo: ${loans.length}`);
          loans.forEach((loan: LoanDTO) => {
            console.log(`  - Préstamo #${loan.loanId}: ${loan.itemName} - Balance: Q${loan.balance}`);
          });
        } else {
          console.log(' No se encontraron préstamos con balance pendiente');
        }

        this.loading = false;
      },
      error: (error: any) => {
        console.error(' Error cargando préstamos:', error);

        console.log(' Endpoint /with-balance no disponible, intentando con /my-loans');
        this.loadLoansAlternative();
      }
    });
  }

  loadLoansAlternative(): void {
    this.paymentService.getMyActiveLoans().subscribe({
      next: (loans: LoanDTO[]) => {
        console.log(' Todos los préstamos cargados:', loans.length);

        this.loans = loans.filter((loan: LoanDTO) => {
          const hasBalance = loan.balance > 0;
          console.log(`  - Préstamo #${loan.loanId}: Balance=${loan.balance}, HasBalance=${hasBalance}`);
          return hasBalance;
        });

        console.log(' Préstamos con balance filtrados:', this.loans.length);

        this.loading = false;
      },
      error: (error: any) => {
        console.error(' Error cargando préstamos (alternativo):', error);
        this.loading = false;
        Swal.fire('Error', 'No se pudieron cargar tus préstamos', 'error');
      }
    });
  }

  onLoanSelected(): void {
    if (this.selectedLoanId) {
      this.selectedLoan = this.loans.find(l => l.loanId === this.selectedLoanId) || null;
      console.log(' Préstamo seleccionado:', this.selectedLoan);

      if (this.selectedLoan) {
        const suggestedAmount = this.selectedLoan.totalAmount / this.selectedLoan.term;
        this.amountPaid = Math.round(suggestedAmount * 100) / 100;
        console.log(` Monto sugerido por cuota: Q${this.amountPaid.toFixed(2)}`);
      }
    } else {
      this.selectedLoan = null;
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        Swal.fire('Error', 'Por favor selecciona un archivo de imagen válido', 'error');
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire('Error', 'La imagen es muy grande. Máximo 5MB', 'error');
        return;
      }

      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);

      console.log('📎 Archivo seleccionado:', file.name, file.type, `${(file.size / 1024).toFixed(2)} KB`);
    }
  }

  async submitPayment(): Promise<void> {
    console.log('🔍 Validando datos del formulario...');

    if (!this.selectedLoanId) {
      Swal.fire('Error', 'Por favor selecciona un préstamo', 'error');
      return;
    }

    if (!this.paymentNumber || this.paymentNumber < 1) {
      Swal.fire('Error', 'Por favor ingresa un número de cuota válido', 'error');
      return;
    }

    if (this.selectedLoan && this.paymentNumber > this.selectedLoan.term) {
      Swal.fire('Error', `El número de cuota no puede ser mayor a ${this.selectedLoan.term}`, 'error');
      return;
    }

    if (!this.amountPaid || this.amountPaid <= 0) {
      Swal.fire('Error', 'Por favor ingresa un monto válido', 'error');
      return;
    }

    if (!this.paymentMethod) {
      Swal.fire('Error', 'Por favor selecciona un método de pago', 'error');
      return;
    }

    if (!this.selectedFile) {
      Swal.fire('Error', 'Por favor adjunta un comprobante de pago', 'error');
      return;
    }

    this.submitting = true;

    try {
      console.log('📄 Convirtiendo imagen a Base64...');

      const base64Image = await this.fileToBase64(this.selectedFile);

      const paymentRequest: PaymentRequestDTO = {
        loanId: this.selectedLoanId,
        paymentNumber: this.paymentNumber,
        amountPaid: this.amountPaid,
        paymentMethod: this.paymentMethod,
        referenceBase64: base64Image.split(',')[1] // Remover el prefijo "data:image/..."
      };

      console.log('📤 Enviando reporte de pago:', {
        loanId: paymentRequest.loanId,
        paymentNumber: paymentRequest.paymentNumber,
        amountPaid: paymentRequest.amountPaid,
        paymentMethod: paymentRequest.paymentMethod,
        hasImage: !!paymentRequest.referenceBase64,
        imageSize: paymentRequest.referenceBase64?.length
      });

      this.paymentService.reportPayment(paymentRequest).subscribe({
        next: (response: any) => {
          console.log(' Pago reportado exitosamente:', response);
          this.submitting = false;

          Swal.fire({
            icon: 'success',
            title: '¡Pago Reportado!',
            html: `
              <p>Tu pago ha sido reportado exitosamente.</p>
              <p class="mb-0"><strong>Estado:</strong> En revisión</p>
            `,
            confirmButtonText: 'Ver Mis Préstamos',
            confirmButtonColor: '#0d6efd'
          }).then(() => {
            this.router.navigate(['/my-contracts']);
          });
        },
        error: (error: any) => {
          console.error(' Error reportando pago:', error);
          this.submitting = false;

          const errorMessage = error.error?.error || error.message || 'No se pudo reportar el pago. Por favor intenta de nuevo.';

          Swal.fire({
            icon: 'error',
            title: 'Error al Reportar Pago',
            text: errorMessage,
            confirmButtonColor: '#dc3545'
          });
        }
      });
    } catch (error) {
      console.error(' Error procesando archivo:', error);
      this.submitting = false;
      Swal.fire('Error', 'Error al procesar la imagen del comprobante', 'error');
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        console.log(' Archivo convertido a Base64');
        resolve(reader.result as string);
      };
      reader.onerror = (error) => {
        console.error(' Error convirtiendo archivo a Base64:', error);
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  }

  goToContracts() {
    this.router.navigate(['/my-contracts'])
  }

  cancel(): void {
    this.router.navigate(['/my-loans']);
  }
}

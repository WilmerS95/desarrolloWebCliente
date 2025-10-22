import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValuationService, ValuationRequest } from '../../services/valuation.service';
import { BusinessParameterService } from '../../services/business-parameter.service';

@Component({
  selector: 'app-valuation-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './valuation-modal.component.html',
  styleUrl: './valuation-modal.component.css'
})
export class ValuationModalComponent implements OnInit {
  valuationForm!: FormGroup;
  loanApplication: any;
  isVisible = false;
  loading = false;
  defaultInterestRate = 5.0;
  suggestedAmount = 0;

  constructor(
    private fb: FormBuilder,
    private valuationService: ValuationService,
    private parameterService: BusinessParameterService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadInterestRate();
  }

  initForm(): void {
    this.valuationForm = this.fb.group({
      estimatedValue: [0, [Validators.required, Validators.min(1)]],
      comments: [''],
      term: [6, [Validators.required, Validators.min(1), Validators.max(6)]],
      interestRate: [this.defaultInterestRate, [Validators.required, Validators.min(0)]]
    });
  }

  loadInterestRate(): void {
    this.parameterService.getParameterByName('INTEREST_RATE').subscribe({
      next: (param) => {
        if (param && param.value) {
          this.defaultInterestRate = parseFloat(param.value);
          this.valuationForm.patchValue({ interestRate: this.defaultInterestRate });
        }
      },
      error: (err) => console.error('Error cargando tasa de interés', err)
    });
  }

  open(loanApplication: any): void {
    this.loanApplication = loanApplication;
    this.isVisible = true;

    // Calcular monto sugerido basado en el valor estimado por el usuario
    if (loanApplication.requestedAmount) {
      this.suggestedAmount = loanApplication.requestedAmount;
      this.valuationForm.patchValue({
        estimatedValue: this.suggestedAmount
      });
    }
  }

  close(): void {
    this.isVisible = false;
    this.valuationForm.reset();
  }

  onSubmit(): void {
    if (this.valuationForm.valid) {
      this.loading = true;

      const request: ValuationRequest = {
        loanApplicationId: this.loanApplication.loanApplicationId,
        estimatedValue: this.valuationForm.value.estimatedValue,
        comments: this.valuationForm.value.comments,
        term: this.valuationForm.value.term,
        interestRate: this.valuationForm.value.interestRate
      };

      this.valuationService.createValuation(request).subscribe({
        next: (response) => {
          alert('Avalúo creado exitosamente');
          this.loading = false;
          this.close();
          window.location.reload();
        },
        error: (err) => {
          console.error('Error creando avalúo', err);
          alert('Error al crear el avalúo: ' + (err.error.message || err.message));
          this.loading = false;
        }
      });
    }
  }
}

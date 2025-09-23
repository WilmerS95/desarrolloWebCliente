import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LoanService } from '../../services/loan.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-loan-application',
  imports: [ CommonModule, RouterModule, ReactiveFormsModule, FormsModule ],
  templateUrl: './loan-application.component.html',
  styleUrl: './loan-application.component.css'
})
export class LoanApplicationComponent implements OnInit {
  loanForm!: FormGroup;
  selectedFiles: File[] = [];
  categories: any[] = [];

  constructor(private fb: FormBuilder, private loanService: LoanService) {}

  ngOnInit(): void {
    this.loanForm = this.fb.group({
      nameItem: ['', Validators.required],
      brand: ['', Validators.required],
      description: [''],
      specification: [''],
      categoryId: ['', Validators.required],
      quantityPayments: [1, [Validators.required, Validators.min(1)]],
      estimatedValue: [0, [Validators.min(0)]]
    });

    this.loanService.getCategories().subscribe({
      next: data => this.categories = data,
      error: err => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar las categorías'
        });
        console.error(err);
      }
    });
  }

  onFileSelected(event: any): void {
    this.selectedFiles = Array.from(event.target.files);
  }

  onSubmit(): void {
    if (this.loanForm.valid) {
      const formData = new FormData();

      // JSON como Blob
      formData.append(
        'data',
        new Blob([JSON.stringify(this.loanForm.value)], { type: 'application/json' })
      );

      // Archivos
      this.selectedFiles.forEach(file => formData.append('files', file));

      this.loanService.createLoanApplication(formData).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Solicitud enviada',
            text: 'Tu solicitud fue registrada correctamente'
          });
          this.loanForm.reset();
          this.selectedFiles = [];
        },
        error: err => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un problema al enviar la solicitud'
          });
          console.error(err);
        }
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor llena los campos obligatorios'
      });
    }
  }
}

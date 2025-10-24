import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
  validImagesLoaded = false;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(private fb: FormBuilder, private loanService: LoanService) {}

  ngOnInit(): void {
    this.loanForm = this.fb.group({
      nameItem: ['', Validators.required],
      brand: ['', Validators.required],
      description: [''],
      specification: [''],
      categoryId: ['', Validators.required],
      quantityPayments: [1, [Validators.required, Validators.min(1)]],
      requestedAmount: [0, [Validators.required, Validators.min(1)]]
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
    const files = Array.from(event.target.files) as File[];
      const validExtensions = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

      const invalidFiles = files.filter(file => !validExtensions.includes(file.type));

      if (invalidFiles.length > 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Archivo no permitido',
          text: 'Solo se permiten imágenes en formato JPG, PNG, GIF o WEBP'
        });

        this.selectedFiles = [];
        this.fileInput.nativeElement.value = '';
        this.validImagesLoaded = false;
        return;
      }

      if (files.length === 0) {
          this.validImagesLoaded = false;
          return;
        }

        this.selectedFiles = files;
        this.validImagesLoaded = this.selectedFiles.length > 0;
  }

  onSubmit(): void {
    if (this.loanForm.valid) {
      const formData = new FormData();

      formData.append(
        'data',
        new Blob([JSON.stringify(this.loanForm.value)], { type: 'application/json' })
      );

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
          if (this.fileInput) {
            this.fileInput.nativeElement.value = '';
          }
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

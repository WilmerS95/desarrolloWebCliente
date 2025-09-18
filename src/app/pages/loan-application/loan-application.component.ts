import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule  } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LoanService } from '../../services/loan.service';

@Component({
  selector: 'app-loan-application',
  imports: [ CommonModule, RouterModule, ReactiveFormsModule, FormsModule ],
  templateUrl: './loan-application.component.html',
  styleUrl: './loan-application.component.css'
})
export class LoanApplicationComponent implements OnInit {
  loanForm!: FormGroup;
  items: any[] = [];

  constructor(private fb: FormBuilder, private loanService: LoanService) {}

  ngOnInit(): void {
      this.loanForm = this.fb.group({
        itemID: ['', Validators.required],
        quantityPayments: [1, [Validators.required, Validators.min(1)]]
      });

      this.loanService.getItems().subscribe(data => {
        this.items = data;
      });
    }

    onSubmit(): void {
      if (this.loanForm.valid) {
        this.loanService.createLoanApplication(this.loanForm.value).subscribe({
          next: (res) => alert('Solicitud enviada correctamente'),
          error: (err) => console.error(err)
        });
      }
    }

}

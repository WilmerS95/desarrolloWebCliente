// src/app/pages/business-parameters/business-parameters.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BusinessParameterService } from '../../services/business-parameter.service';
import { BusinessParameter, ParameterHistory, PARAMETER_CATEGORIES, DATA_TYPES } from '../../shared/models/BusinessParameter';
import { AuthService } from '../../auth/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-business-parameters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './business-parameters.component.html',
  styleUrls: ['./business-parameters.component.css']
})
export class BusinessParametersComponent implements OnInit {
  parameters: BusinessParameter[] = [];
  filteredParameters: BusinessParameter[] = [];
  categories: string[] = [];
  selectedCategory: string = 'ALL';
  searchTerm: string = '';
  loading = false;

  editingParam: BusinessParameter | null = null;
  tempValue: string = '';
  editReason: string = '';

  showCreateForm = false;
  newParameter: Partial<BusinessParameter> = {
    category: 'GENERAL',
    dataType: 'STRING',
    isActive: true
  };

  selectedParameterHistory: ParameterHistory[] = [];
  showHistoryModal = false;

  readonly CATEGORIES = PARAMETER_CATEGORIES;
  readonly DATA_TYPES = DATA_TYPES;

  constructor(
    private paramService: BusinessParameterService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadParameters();
    this.loadCategories();
  }

  loadParameters() {
    this.loading = true;
    this.paramService.getAll().subscribe({
      next: (data) => {
        this.parameters = data;
        this.filterParameters();
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
        Swal.fire('Error', 'No se pudieron cargar los parámetros', 'error');
      }
    });
  }

  loadCategories() {
    this.paramService.getCategories().subscribe({
      next: (cats) => {
        this.categories = ['ALL', ...cats];
      },
      error: () => {
        this.categories = ['ALL', ...Object.keys(PARAMETER_CATEGORIES)];
      }
    });
  }

  filterParameters() {
    let filtered = this.parameters;

    if (this.selectedCategory !== 'ALL') {
      filtered = filtered.filter(p => p.category === this.selectedCategory);
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term) ||
        p.value.toLowerCase().includes(term)
      );
    }

    this.filteredParameters = filtered;
  }

  onCategoryChange() {
    this.filterParameters();
  }

  onSearchChange() {
    this.filterParameters();
  }

  startEdit(param: BusinessParameter) {
    this.editingParam = { ...param };
    this.tempValue = param.value;
    this.editReason = '';
  }

  cancelEdit() {
    this.editingParam = null;
    this.tempValue = '';
    this.editReason = '';
  }

  async saveEdit() {
    if (!this.editingParam) return;

    if (!this.tempValue.trim()) {
      Swal.fire('Atención', 'El valor no puede estar vacío', 'warning');
      return;
    }

    if (!this.validateValue(this.tempValue, this.editingParam.dataType)) {
      Swal.fire('Error', `El valor no es válido para el tipo ${this.editingParam.dataType}`, 'error');
      return;
    }

    const result = await Swal.fire({
      title: '¿Actualizar parámetro?',
      html: `
        <div class="text-start">
          <p><strong>Parámetro:</strong> ${this.editingParam.name}</p>
          <p><strong>Valor actual:</strong> ${this.editingParam.value}</p>
          <p><strong>Nuevo valor:</strong> ${this.tempValue}</p>
          ${this.editReason ? `<p><strong>Motivo:</strong> ${this.editReason}</p>` : ''}
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#198754'
    });

    if (result.isConfirmed) {
      this.loading = true;
      this.paramService.update(this.editingParam.parameterId, this.tempValue, this.editReason).subscribe({
        next: (updated) => {
          const index = this.parameters.findIndex(p => p.parameterId === updated.parameterId);
          if (index !== -1) {
            this.parameters[index] = updated;
            this.filterParameters();
          }

          Swal.fire({
            icon: 'success',
            title: '¡Actualizado!',
            text: 'Parámetro actualizado correctamente',
            timer: 2000,
            showConfirmButton: false
          });

          this.cancelEdit();
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          console.error(err);
          Swal.fire('Error', err.error?.error || 'No se pudo actualizar el parámetro', 'error');
        }
      });
    }
  }

  openCreateForm() {
    this.showCreateForm = true;
    this.newParameter = {
      name: '',
      value: '',
      description: '',
      category: 'GENERAL',
      dataType: 'STRING',
      isActive: true
    };
  }

  closeCreateForm() {
    this.showCreateForm = false;
    this.newParameter = {};
  }

  async createParameter() {
    if (!this.newParameter.name || !this.newParameter.value) {
      Swal.fire('Atención', 'Nombre y valor son obligatorios', 'warning');
      return;
    }

    if (!this.validateValue(this.newParameter.value, this.newParameter.dataType || 'STRING')) {
      Swal.fire('Error', `El valor no es válido para el tipo ${this.newParameter.dataType}`, 'error');
      return;
    }

    const result = await Swal.fire({
      title: '¿Crear nuevo parámetro?',
      html: `
        <div class="text-start">
          <p><strong>Nombre:</strong> ${this.newParameter.name}</p>
          <p><strong>Valor:</strong> ${this.newParameter.value}</p>
          <p><strong>Categoría:</strong> ${this.newParameter.category}</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Crear',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      this.loading = true;
      this.paramService.create(this.newParameter as BusinessParameter).subscribe({
        next: (created) => {
          this.parameters.push(created);
          this.filterParameters();

          Swal.fire({
            icon: 'success',
            title: '¡Creado!',
            text: 'Parámetro creado correctamente',
            timer: 2000,
            showConfirmButton: false
          });

          this.closeCreateForm();
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          console.error(err);
          Swal.fire('Error', err.error?.error || 'No se pudo crear el parámetro', 'error');
        }
      });
    }
  }

  async deleteParameter(param: BusinessParameter) {
    const result = await Swal.fire({
      title: '¿Desactivar parámetro?',
      html: `
        <p>Se desactivará el parámetro:</p>
        <p><strong>${param.name}</strong></p>
        <p class="text-muted">Esto no eliminará el parámetro, solo lo marcará como inactivo.</p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Desactivar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545'
    });

    if (result.isConfirmed) {
      this.loading = true;
      this.paramService.delete(param.parameterId).subscribe({
        next: () => {
          this.parameters = this.parameters.filter(p => p.parameterId !== param.parameterId);
          this.filterParameters();

          Swal.fire({
            icon: 'info',
            title: 'Desactivado',
            text: 'Parámetro desactivado correctamente',
            timer: 2000,
            showConfirmButton: false
          });

          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          console.error(err);
          Swal.fire('Error', err.error?.error || 'No se pudo desactivar el parámetro', 'error');
        }
      });
    }
  }

  viewHistory(param: BusinessParameter) {
    this.loading = true;
    this.paramService.getHistory(param.parameterId).subscribe({
      next: (history) => {
        this.selectedParameterHistory = history;
        this.showHistoryModal = true;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
        Swal.fire('Error', 'No se pudo cargar el historial', 'error');
      }
    });
  }

  closeHistoryModal() {
    this.showHistoryModal = false;
    this.selectedParameterHistory = [];
  }

  validateValue(value: string, dataType: string): boolean {
    switch (dataType) {
      case 'INTEGER':
        return /^-?\d+$/.test(value);
      case 'DECIMAL':
        return /^-?\d+\.?\d*$/.test(value);
      case 'BOOLEAN':
        return value.toLowerCase() === 'true' || value.toLowerCase() === 'false';
      case 'DATE':
        return !isNaN(Date.parse(value));
      case 'STRING':
      default:
        return true;
    }
  }

  getCategoryBadgeClass(category: string): string {
    const classes: { [key: string]: string } = {
      'LOAN': 'bg-primary',
      'PAYMENT': 'bg-success',
      'NOTIFICATION': 'bg-info',
      'GENERAL': 'bg-secondary'
    };
    return classes[category] || 'bg-dark';
  }

  getCategoryName(category: string): string {
    return PARAMETER_CATEGORIES[category as keyof typeof PARAMETER_CATEGORIES] || category;
  }

  getDataTypeName(dataType: string): string {
    return DATA_TYPES[dataType as keyof typeof DATA_TYPES] || dataType;
  }

  getActionBadgeClass(action: string): string {
    const classes: { [key: string]: string } = {
      'CREATE': 'bg-success',
      'UPDATE': 'bg-warning',
      'DELETE': 'bg-danger'
    };
    return classes[action] || 'bg-secondary';
  }

  canDelete(): boolean {
    return this.authService.isSuperAdmin();
  }

  canEdit(): boolean {
    return this.authService.isAdmin();
  }
}

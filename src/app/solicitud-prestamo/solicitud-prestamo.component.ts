import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-solicitud-prestamo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitud-prestamo.component.html',
  styleUrls: ['./solicitud-prestamo.component.css']
})
export class SolicitudPrestamoComponent {
  // Datos del solicitante
  nombreCompleto: string = '';
  dpi: string = '';
  telefono: string = '';
  correo: string = '';
  direccion: string = '';

  // Datos del préstamo
  applicationDate: Date = new Date();
  itemID: string = '';
  descripcionArticulo: string = '';
  marca: string = '';
  quantityPayments: number = 0;
  valorEstimado: number = 0;
  status: string = 'Pendiente';

  // Datos del artículo
  nameItem: string = '';
  categoryId: string = '';
  fotos: File[] = [];

  // Datos adicionales
  comentarios: string = '';
  documentos: File[] = [];

  enviado: boolean = false;

  onFileChange(event: any, tipo: string) {
    if (event.target.files && event.target.files.length > 0) {
      if (tipo === 'fotos') {
        this.fotos = Array.from(event.target.files);
      } else if (tipo === 'documentos') {
        this.documentos = Array.from(event.target.files);
      }
    }
  }

  onSubmit() {
    this.enviado = true;
    console.log('Solicitud enviada:', {
      solicitante: {
        nombreCompleto: this.nombreCompleto,
        dpi: this.dpi,
        telefono: this.telefono,
        correo: this.correo,
        direccion: this.direccion
      },
      prestamo: {
        applicationDate: this.applicationDate,
        itemID: this.itemID,
        descripcionArticulo: this.descripcionArticulo,
        marca: this.marca,
        quantityPayments: this.quantityPayments,
        valorEstimado: this.valorEstimado,
        status: this.status
      },
      articulo: {
        nameItem: this.nameItem,
        categoryId: this.categoryId,
        fotos: this.fotos
      },
      adicionales: {
        comentarios: this.comentarios,
        documentos: this.documentos
      }
    });
  }
}





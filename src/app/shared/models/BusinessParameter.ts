export interface BusinessParameter {
  parameterId: number;
  name: string;
  value: string;
  description: string;
  category: string;
  dataType: string;
  effectiveDate: string;
  changedBy: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ParameterHistory {
  historyId: number;
  parameterId: number;
  parameterName: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  changedAt: string;
  action: string;
}

export interface ParameterUpdateRequest {
  value: string;
  reason?: string;
}

export const PARAMETER_CATEGORIES = {
  LOAN: 'Préstamos',
  PAYMENT: 'Pagos',
  NOTIFICATION: 'Notificaciones',
  GENERAL: 'General'
};

export const DATA_TYPES = {
  STRING: 'Texto',
  INTEGER: 'Número entero',
  DECIMAL: 'Decimal',
  BOOLEAN: 'Booleano',
  DATE: 'Fecha'
};

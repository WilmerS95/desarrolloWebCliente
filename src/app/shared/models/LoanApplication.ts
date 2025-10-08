export interface LoanApplication {
  loanApplicationId: number;
  itemId: number;
  itemName: string;
  brand: string;
  quantityPayments: number;
  requestedAmount: number;
  applicationDate: string;
  status: string;
  photoUrls: string[];
  estimatedValue?: number;
}

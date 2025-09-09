export interface Promotion {
  promotionID: number;
  itemId: number;
  discountPercentage: number;
  startDate: Date;
  endDate: Date;
  status: string;
}

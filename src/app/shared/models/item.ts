export interface Item {
  itemID: number;
  categoryId: number;
  nameItem: string;
  brand?: string;
  description?: string;
  specification?: string;
  photos?: string; // puede ser URL o base64
  price?: number;
}

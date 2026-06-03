interface InscriptionPayment {
  id: number;
  teamId: number;
  tournamentId: number;
  amount: number;
  dueDate: Date;
  paymentDate?: Date;
  status: string;                // PENDING, PAID, OVERDUE
  paymentMethod: string;         // CASH, TRANSFER, CARD
  receipt?: string;              // URL o documento
}

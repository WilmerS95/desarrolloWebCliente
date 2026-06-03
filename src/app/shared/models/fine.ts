interface Fine {
  id: number;
  teamId: number;
  tournamentId: number;
  reason: string;                // UNSPORTING, VIOLENCE, EQUIPMENT, OTHER
  amount: number;
  status: string;                // PENDING, PAID, APPEALED
  paymentDueDate: Date;
  createdBy: User;
  created_at: Date;
}

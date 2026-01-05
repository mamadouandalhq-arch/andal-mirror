export class SendWithdrawalNotificationDto {
  adminEmail: string;
  userName: string;
  userEmail: string;
  pointsAmount: number;
  dollarAmount: string;
  paymentMethod: string;
  paymentEmail: string | null;
  paymentPhone: string | null;
  redemptionId: string;
}


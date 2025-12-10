export class FeedbackUnavailableResponse {
  status!: 'unavailable';
  reason!: 'noPendingReceipt' | 'feedbackProvided';
}

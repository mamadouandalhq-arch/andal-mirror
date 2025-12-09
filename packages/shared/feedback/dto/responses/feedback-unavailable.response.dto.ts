export class FeedbackUnavailableResponse {
  status!: 'unavailable';
  reason!: 'no_pending_receipt' | 'feedback_provided';
}

export interface PaymentResult {
  success: boolean;
  paymentReference: string;
  provider: string;
  errorMessage?: string;
}

export class PaymentService {
  /**
   * Simulated Demo Payment Gateway
   * Clearly marked as demo simulation. Never collects real cards or bills real money.
   */
  static async processPayment(params: {
    amountInCents: number;
    customerEmail: string;
    paymentMethod: string;
    idempotencyKey?: string;
  }): Promise<PaymentResult> {
    const { amountInCents, customerEmail, idempotencyKey } = params;

    // Simulate gateway processing delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Simulated payment reference code
    const randomSuffix = Math.floor(100000000 + Math.random() * 900000000);
    const paymentReference = `sim_pay_${randomSuffix}`;

    return {
      success: true,
      paymentReference,
      provider: "simulated_demo",
    };
  }
}

import { checkPendingPaymentStatus } from '../services/olpp';

export default async function job_payment_status_update() {
  // update olpp status
  await checkPendingPaymentStatus();
};
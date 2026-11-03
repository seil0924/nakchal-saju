import { describe, expect, it } from 'vitest';
import { paymentReturnState } from '../payment-status';

describe('payment return guidance', () => {
  it('does not show payment guidance on an ordinary visit', () => {
    expect(paymentReturnState(null, null)).toBeNull();
    expect(paymentReturnState(undefined, undefined)).toBeNull();
  });

  it('shows cancellation only for the explicit cancellation callback', () => {
    expect(paymentReturnState('0', 'auth:3001')).toBe('cancelled');
  });

  it.each(['auth:9999', 'approve:9999:declined'])('distinguishes a reported failure: %s', why => {
    expect(paymentReturnState('0', why)).toBe('failed');
  });

  it.each([null, '', 'approve_unknown:timeout', 'amount:1000', 'fatal:network', 'confirm:save_failed', 'missing_enc', 'order_not_found', 'unrecognized_reason'])('requires checking instead of suggesting repayment: %s', why => {
    expect(paymentReturnState('0', why)).toBe('pending');
  });

  it.each([null, 'confirm:save_failed', 'auth:3001'])('requires server verification even with a success parameter: %s', why => {
    expect(paymentReturnState('1', why)).toBe('pending');
  });

  it('keeps incomplete or malformed callback information uncertain', () => {
    expect(paymentReturnState(null, 'fatal:network')).toBe('pending');
    expect(paymentReturnState('unexpected', 'auth:3001')).toBe('pending');
  });
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { paystackReferenceFromSearch, isPaystackCheckoutUrl } from '../src/lib/paystackUrl.ts';

test('the payment reference is read from the address Paystack sends the parent back to', () => {
  assert.equal(paystackReferenceFromSearch('?trxref=AKABC123DEF&reference=AKABC123DEF'), 'AKABC123DEF');
  assert.equal(paystackReferenceFromSearch('?reference=AKABC123DEF'), 'AKABC123DEF');
  assert.equal(paystackReferenceFromSearch('?trxref=AKABC123DEF'), 'AKABC123DEF');
  assert.equal(paystackReferenceFromSearch(''), null);
  assert.equal(paystackReferenceFromSearch('?foo=bar'), null);
});

test('a strange reference in the address is ignored (it is sent to our server, so it must look like one of ours)', () => {
  assert.equal(paystackReferenceFromSearch('?reference=ab'), null); // too short
  assert.equal(paystackReferenceFromSearch('?reference=' + 'A'.repeat(101)), null); // too long
  assert.equal(paystackReferenceFromSearch('?reference=../../admin/users'), null);
  assert.equal(paystackReferenceFromSearch('?reference=<script>alert(1)</script>'), null);
  assert.equal(paystackReferenceFromSearch('?reference=AB CD EF GH'), null);
});

test('the browser only ever goes to a secure Paystack page', () => {
  assert.equal(isPaystackCheckoutUrl('https://checkout.paystack.com/abc123'), true);
  assert.equal(isPaystackCheckoutUrl('https://paystack.com/pay/x'), true);
  assert.equal(isPaystackCheckoutUrl('http://checkout.paystack.com/abc'), false); // not secure
  assert.equal(isPaystackCheckoutUrl('https://evil.example.com/paystack.com'), false);
  assert.equal(isPaystackCheckoutUrl('https://paystack.com.evil.example.com/x'), false);
  assert.equal(isPaystackCheckoutUrl('https://notpaystack.com/x'), false);
  assert.equal(isPaystackCheckoutUrl('javascript:alert(1)'), false);
  assert.equal(isPaystackCheckoutUrl(undefined), false);
  assert.equal(isPaystackCheckoutUrl(42), false);
});

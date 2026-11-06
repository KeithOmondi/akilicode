import test from 'node:test';
import assert from 'node:assert/strict';
import { getGateToken, setGateToken, clearGateToken, registerGateHandler, askForGate } from '../src/api/parentGate.ts';

test('gate token is returned until it expires (30 s safety margin) and can be cleared', async () => {
  clearGateToken();
  assert.equal(getGateToken(), null);
  setGateToken('abc', 600);
  assert.equal(getGateToken(), 'abc');
  setGateToken('short', 20); // expires inside the safety margin => treated as already expired
  assert.equal(getGateToken(), null);
  setGateToken('abc', 600);
  clearGateToken();
  assert.equal(getGateToken(), null);
});

test('several requests that need the gate at once open ONE dialog', async () => {
  let opened = 0;
  const off = registerGateHandler(() => { opened++; return new Promise((r) => setTimeout(r, 20)); });
  await Promise.all([askForGate(), askForGate(), askForGate()]);
  assert.equal(opened, 1);
  await askForGate(); // after it finished, a new request opens a new dialog
  assert.equal(opened, 2);
  off();
});

test('without a dialog mounted the request fails instead of hanging', async () => {
  await assert.rejects(askForGate(), /not available/);
});

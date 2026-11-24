import assert from 'node:assert/strict';
import test from 'node:test';
import { createPolicy, INPUTS, ORIGIN, QUESTION } from './record-demo.mjs';

test('offline local policy cannot send requests to production', () => {
  const policy = createPolicy('http://127.0.0.1:4317');
  assert.equal(policy.allow('GET', 'https://udaan-ai-builder.replit.app/api/udaan/state'), null);
  assert.equal(policy.allow('GET', 'http://127.0.0.1:4317/api/udaan/state'), 'read');
});

test('OFFLINE POLICY FIXTURE: paid, reset, profile and unknown routes never pass', () => {
  const policy = createPolicy();
  for (const route of ['providers/test', 'demo/reset', 'profile', 'live-access/activate', 'voice/synthesize']) {
    assert.equal(policy.allow('POST', `${ORIGIN}/api/udaan/${route}`, { confirmed: true }), null);
  }
  assert.equal(policy.allow('PATCH', `${ORIGIN}/api/udaan/preferences`, { provider: 'openai' }), null);
  assert.equal(policy.allow('GET', 'https://api.openai.com/v1/models'), null);
  assert.equal(policy.allow('POST', `${ORIGIN}/api/udaan/chat`, { message: QUESTION }), null);
});

test('OFFLINE POLICY FIXTURE: only reviewed inputs and one write of each type', () => {
  const policy = createPolicy();
  policy.state.demoVerified = true;
  assert.equal(policy.allow('PATCH', `${ORIGIN}/api/udaan/preferences`, { language: 'en', onboarded: true }), 'preferences');
  assert.equal(policy.allow('PATCH', `${ORIGIN}/api/udaan/preferences`, { language: 'en', onboarded: true }), null);
  assert.equal(policy.allow('POST', `${ORIGIN}/api/udaan/chat`, { message: QUESTION, voice: true }), null);
  assert.equal(policy.allow('POST', `${ORIGIN}/api/udaan/chat`, { message: QUESTION }), 'chat');
  assert.equal(policy.allow('POST', `${ORIGIN}/api/udaan/chat`, { message: QUESTION }), null);
  assert.equal(policy.allow('POST', `${ORIGIN}/api/udaan/evaluate`, { ...INPUTS, sellingPrice: 100 }), null);
  assert.equal(policy.allow('POST', `${ORIGIN}/api/udaan/evaluate`, INPUTS), 'evaluate');
  assert.equal(policy.allow('POST', `${ORIGIN}/api/udaan/experiments`, {
    ...INPUTS, opportunityId: 'combo', durationDays: 7, parentExperimentId: 'OFFLINE-TEST-FIXTURE',
  }), null);
  assert.equal(policy.allow('POST', `${ORIGIN}/api/udaan/experiments`, {
    ...INPUTS, opportunityId: 'combo', durationDays: 7,
  }), 'draft');
});

test('OFFLINE POLICY FIXTURE: transitions and synthetic results stay on recorded plan', () => {
  const policy = createPolicy();
  policy.state.planId = 'OFFLINE-TEST-FIXTURE';
  const route = `${ORIGIN}/api/udaan/experiments/OFFLINE-TEST-FIXTURE`;
  assert.equal(policy.allow('POST', `${route}/transition`, { status: 'Running', confirmed: true }), null);
  assert.equal(policy.allow('POST', `${route}/transition`, { status: 'Approved', confirmed: true }), 'approve');
  assert.equal(policy.allow('POST', `${route}/transition`, { status: 'Running', confirmed: true }), 'start');
  const results = { actualUnits: 70, actualPromotionSpend: 1500, synthetic: true, confirmed: true,
    feedback: 'Regulars liked it, but few new office customers noticed the offer.' };
  assert.equal(policy.allow('POST', `${route}/results`, { ...results, synthetic: false }), null);
  assert.equal(policy.allow('POST', `${route}/results`, results), 'results');
  assert.equal(policy.allow('POST', `${route}/results`, results), null);
});

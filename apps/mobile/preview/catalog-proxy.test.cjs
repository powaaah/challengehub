const { test, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const proxyCatalog = require('./catalog-proxy.cjs');
const originalFetch = global.fetch;
afterEach(() => { global.fetch = originalFetch; });
function response() {
  return { status: null, headers: {}, body: '', writeHead(status, headers = {}) { this.status = status; this.headers = headers; return this; }, end(body = '') { this.body = body; } };
}
test('forwards only GET catalog requests to the fixed upstream without credentials', async () => {
  let call;
  global.fetch = async (url, options) => { call = { url, options }; return { status: 200, json: async () => ({ apiVersion: 'v1', data: [] }) }; };
  const res = response();
  assert.equal(await proxyCatalog({ url: '/api/v1/challenges?limit=10&cursor=abc', method: 'GET', headers: { cookie: 'private', authorization: 'private' } }, res), true);
  assert.equal(call.url.origin, 'https://theovina.de');
  assert.equal(call.url.searchParams.get('cursor'), 'abc');
  assert.deepEqual(call.options.headers, { Accept: 'application/json' });
  assert.equal(call.options.credentials, 'omit');
  assert.equal(call.options.redirect, 'error');
  assert.equal(res.status, 200);
});
test('does not forward writes or unrelated routes', async () => {
  global.fetch = async () => { throw Error('must not call'); };
  const res = response();
  assert.equal(await proxyCatalog({ url: '/api/v1/challenges', method: 'POST' }, res), true);
  assert.equal(res.status, 405);
  assert.equal(await proxyCatalog({ url: '/api/v1/me', method: 'GET' }, response()), false);
});
test('returns a bounded public error when upstream is unavailable', async () => {
  global.fetch = async () => { throw Error('private diagnostic'); };
  const res = response();
  await proxyCatalog({ url: '/api/v1/challenges', method: 'GET' }, res);
  assert.equal(res.status, 502);
  assert.equal(JSON.parse(res.body).error.code, 'catalog_unavailable');
  assert.equal(res.body.includes('private diagnostic'), false);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import handler from '../api/index.js';

test('published edits, signed evidence, and claims use the existing project and revision', async () => {
  const account = 'account-id';
  const projectId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const seed = JSON.parse(readFileSync(new URL('../shared/seeds.json', import.meta.url)))[1];
  let standard = {id: seed.id, revision: 1, document: seed};
  let project = {id: projectId, owner_id: account, standard_id: seed.id, revision: 1, data: {answers: {}, files: {}}};
  const originalFetch = globalThis.fetch;
  const environment = {...process.env};
  Object.assign(process.env, {SUPABASE_URL: 'https://test.supabase.invalid', SUPABASE_SERVICE_ROLE_KEY: 'test', SUPABASE_ANON_KEY: 'test'});
  globalThis.fetch = async (url, init = {}) => {
    const target = new URL(url);
    const {pathname, searchParams} = target;
    const data = init.body ? JSON.parse(init.body) : undefined;
    if (pathname === '/auth/v1/user') return Response.json({id: account});
    if (pathname === '/rest/v1/rating_admins') return Response.json([{user_id: account}]);
    if (pathname === '/rest/v1/rating_standards') {
      if (init.method === 'PATCH') standard = {...standard, ...data};
      return Response.json([standard]);
    }
    if (pathname === '/rest/v1/rating_projects') {
      if (searchParams.get('owner_id') !== 'eq.' + account) return Response.json([]);
      if (init.method === 'PATCH') {
        assert.equal(searchParams.get('revision'), 'eq.' + project.revision);
        project = {...project, ...data};
      }
      return Response.json([project]);
    }
    if (pathname.startsWith('/storage/v1/object/upload/sign/')) return Response.json({token: 'short-lived-token'});
    if (pathname.startsWith('/storage/v1/object/authenticated/')) {
      assert.equal(init.headers.Range, 'bytes=0-4');
      return new Response('%PDF-', {status: 206, headers: {'Content-Range': 'bytes 0-4/26214400'}});
    }
    if (pathname === '/storage/v1/object/evidence' && init.method === 'DELETE') return Response.json([]);
    throw Error('Unexpected remote call ' + pathname);
  };

  async function call(path, body, method = body ? 'POST' : 'GET') {
    const result = {};
    await handler({url: '/api' + path, method, body, headers: {cookie: 'gb_access=test', authorization: 'Bearer test'}}, {
      setHeader() {},
      set statusCode(value) {result.status = value;},
      end(value) {result.body = value && JSON.parse(value);},
    });
    return result;
  }

  try {
    const adminRoute = '/admin/standards/' + seed.id;
    const edited = structuredClone(seed);
    edited.categories[0].prerequisites[0].intent = 'Editable live objective';
    const saved = await call(adminRoute, {standard: edited, revision: 1});
    assert.equal(saved.status, 200, saved.body?.error);
    assert.equal(saved.body.status, 'published');
    assert.equal((await call(adminRoute, {standard: edited, revision: 1})).status, 409);

    const root = '/projects/' + projectId;
    const extra = root + '/document-entries/MN-P1/extra-bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    const prepared = await call(extra, {action: 'prepare', description: 'Supplement'});
    assert.equal(prepared.status, 200, prepared.body?.error);
    const uploadId = prepared.body.id;
    assert.equal((await call(root + '/evidence/' + uploadId)).status, 404);
    const record = await call(extra, {description: 'Supplement', availability: 'yes', uploadId, fileName: 'proof.pdf'});
    assert.equal(record.status, 200, record.body?.error);
    assert.equal(record.body.result.categories[0].prerequisites[0].intent, 'Editable live objective');
    assert.equal(record.body.result.categories[0].prerequisites[0].achieved, false);
    assert.equal(Object.values(record.body.answers['MN-P1'].documents)[0].additional, true);
    assert.equal((await call(extra, undefined, 'DELETE')).status, 200);

    const claim = root + '/document-entries/MN-C1/claim';
    assert.equal((await call(claim, {action: 'claim', points: 1})).status, 400);
    const category = record.body.result.categories[0];
    for (const item of category.prerequisites) {
      project.data.answers[item.id] = {
        documents: Object.fromEntries(item.documentOptions.map(option => [option.id, {availability: 'yes', evidenceId: 'example'}])),
      };
    }
    assert.equal((await call(claim, {action: 'claim', points: 9})).status, 400);
    const claimed = await call(claim, {action: 'claim', points: 1});
    assert.equal(claimed.status, 200, claimed.body?.error);
    assert.equal(claimed.body.answers['MN-C1'].values.claimedPoints, 1);
    assert.equal(claimed.body.result.categories[0].credits[0].points, 0);
  } finally {
    globalThis.fetch = originalFetch;
    for (const key of ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_ANON_KEY']) {
      if (environment[key] === undefined) delete process.env[key];
      else process.env[key] = environment[key];
    }
  }
});

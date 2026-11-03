import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import {
  evaluate,
  validateStandard,
  hasStandardShape,
} from '../shared/engine.mjs';

const seeds = JSON.parse(
  readFileSync(
    new URL('../shared/seeds.json', import.meta.url)
  )
);

function fail(message, status = 400) {
  throw Object.assign(new Error(message), { status });
}

function config() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anon = process.env.SUPABASE_ANON_KEY;

  if (!url || !key || !anon) {
    fail('Add all three Supabase variables in Vercel.', 503);
  }

  return { url, key, anon };
}

async function remote(
  path,
  {
    method = 'GET',
    body,
    key,
    token,
    headers = {},
  } = {}
) {
  const c = config();

  const response = await fetch(c.url + path, {
    method,
    headers: {
      apikey: key || c.key,
      Authorization: 'Bearer ' + (token || key || c.key),
      ...(body !== undefined
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...headers,
    },
    ...(body !== undefined
      ? { body: JSON.stringify(body) }
      : {}),
  });

  const text = await response.text();
  let data;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    const authRequest = path.startsWith('/auth/');

    fail(
      authRequest
        ? data?.msg ||
          data?.error_description ||
          'Sign-in failed.'
        : 'Database or storage request failed. Check the Supabase setup.',
      authRequest ? 401 : 502
    );
  }

  return data;
}

function table(name, filters = {}, options = {}) {
  return remote(
    '/rest/v1/' + name + '?' + new URLSearchParams(filters),
    options
  );
}

function json(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(JSON.stringify(data));
}

function cookies(req) {
  return Object.fromEntries(
    (req.headers.cookie || '')
      .split(';')
      .map(s => s.trim().split(/=(.*)/s))
      .filter(a => a[0])
  );
}

function setSession(req, res, session) {
  const secure =
    process.env.VERCEL ||
    req.headers['x-forwarded-proto'] === 'https';

  const options =
    '; Path=/; HttpOnly; SameSite=Lax' +
    (secure ? '; Secure' : '');

  res.setHeader('Set-Cookie', [
    `gb_access=${session?.access_token || ''}; Max-Age=${
      session ? 3600 : 0
    }${options}`,
    `gb_refresh=${session?.refresh_token || ''}; Max-Age=${
      session ? 604800 : 0
    }${options}`,
  ]);
}

async function login(email, password) {
  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    email.length > 320 ||
    password.length > 1000
  ) {
    fail('Enter your email and password.');
  }

  return remote('/auth/v1/token?grant_type=password', {
    method: 'POST',
    body: { email, password },
    key: config().anon,
  });
}

async function user(req, res) {
  const saved = cookies(req);

  if (!saved.gb_access && !saved.gb_refresh) {
    fail('Sign in to continue.', 401);
  }

  try {
    return await remote('/auth/v1/user', {
      key: config().anon,
      token: saved.gb_access || 'invalid',
    });
  } catch (error) {
    if (error.status !== 401 || !saved.gb_refresh) {
      throw error;
    }

    const session = await remote(
      '/auth/v1/token?grant_type=refresh_token',
      {
        method: 'POST',
        body: { refresh_token: saved.gb_refresh },
        key: config().anon,
      }
    );

    setSession(req, res, session);
    return session.user;
  }
}

async function body(req) {
  let data = req.body;

  if (data === undefined) {
    let text = '';

    for await (const chunk of req) {
      text += chunk;

      if (Buffer.byteLength(text) > 4000000) {
        fail('Save fewer documents at once.', 413);
      }
    }

    data = text ? JSON.parse(text) : {};
  }

  if (typeof data === 'string') {
    data = JSON.parse(data || '{}');
  }

  if (
    !data ||
    typeof data !== 'object' ||
    Array.isArray(data) ||
    Buffer.byteLength(JSON.stringify(data)) > 4000000
  ) {
    fail('Invalid or oversized request.');
  }

  return data;
}

async function admin(account) {
  const rows = await table('rating_admins', {
    user_id: 'eq.' + account.id,
    select: 'user_id',
  });

  if (!rows.length) {
    fail('This account is not an administrator.', 403);
  }
}

async function standards() {
  // Register missing seeds without overwriting existing versions.
  await table(
    'rating_standards',
    {},
    {
      method: 'POST',
      body: seeds.map(s => ({
        id: s.id,
        document: s,
        revision: s.revision || 1,
      })),
      headers: {
        Prefer: 'resolution=ignore-duplicates',
      },
    }
  );

  return table('rating_standards', {
    select: '*',
    order: 'created_at.asc,id.asc',
  });
}
function isCompleteStandard(s) {
  return (
    Array.isArray(s.categories) &&
    s.categories.length === 8 &&
    s.categories.every(
      c =>
        c.implemented !== false &&
        Array.isArray(c.credits) &&
        c.credits.length > 0
    ) &&
    validateStandard(s).length === 0
  );
}
const documentFor = row => ({
  ...row.document,
  id: row.id,
  revision: row.revision,
  categories: row.document.categories.map(category => ({
    ...category,
    credits: category.credits.map(item => ({
      ...item,
      selectablePoints: Number(item.maxPoints) > 1,
    })),
  })),
});

async function standard(id) {
  const rows = await table('rating_standards', {
    id: 'eq.' + id,
    select: '*',
  });

  if (!rows.length) fail('Standard not found.', 404);

  return documentFor(rows[0]);
}

function validUuid(value) {
  return (
    typeof value === 'string' &&
    /^[a-f0-9-]{36}$/.test(value)
  );
}

async function project(id, account) {
  if (!validUuid(id)) fail('Invalid project ID.');

  const rows = await table('rating_projects', {
    id: 'eq.' + id,
    owner_id: 'eq.' + account.id,
    select: '*',
  });

  if (!rows.length) fail('Project not found.', 404);

  return rows[0];
}

async function view(row) {
  const s = await standard(row.standard_id);

  return {
    ...row.data,
    id: row.id,
    standardId: row.standard_id,
    standard: s,
    result: evaluate(s, row.data.answers || {}),
  };
}

async function updateProject(row, data) {
  const rows = await table(
    'rating_projects',
    {
      id: 'eq.' + row.id,
      owner_id: 'eq.' + row.owner_id,
      revision: 'eq.' + row.revision,
    },
    {
      method: 'PATCH',
      body: {
        data,
        revision: row.revision + 1,
        updated_at: new Date().toISOString(),
      },
      headers: { Prefer: 'return=representation' },
    }
  );

  if (!rows.length) {
    fail(
      'Another save finished first. Refresh the project and try again.',
      409
    );
  }

  return rows[0];
}

function validateValues(item, values) {
  if (
    !values ||
    typeof values !== 'object' ||
    Array.isArray(values)
  ) {
    fail('Invalid answers.');
  }

  for (const [key, value] of Object.entries(values)) {
    if (value === '' || value == null) continue;

    if (
      !['string', 'number'].includes(typeof value) ||
      String(value).length > 10000
    ) {
      fail('Invalid answer.');
    }

    if (key === 'claimedPoints' && item.selectablePoints) {
      const points = Number(value);

      if (
        !Number.isInteger(points) ||
        points < 0 ||
        points > item.maxPoints
      ) {
        fail('Selected points exceed the allowed range.');
      }

      continue;
    }

    const field = item.fields.find(f => f.id === key);

    if (!field) fail('Unknown field: ' + key);

    if (
      field.type === 'yesno' &&
      !['yes', 'no'].includes(value)
    ) {
      fail('Choose Yes or No.');
    }

    if (
      field.type === 'number' &&
      !Number.isFinite(Number(value))
    ) {
      fail('Enter a valid number.');
    }

    if (
      field.type === 'select' &&
      !field.options.includes(value)
    ) {
      fail('Choose an available option.');
    }
  }
}

async function upload(path, bytes) {
  const { url, key } = config();

  const response = await fetch(
    url + '/storage/v1/object/evidence/' + path,
    {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: 'Bearer ' + key,
        'Content-Type': 'application/octet-stream',
        'x-upsert': 'false',
      },
      body: bytes,
    }
  );

  if (!response.ok) {
    fail(
      'Document upload failed. Check the private evidence bucket.',
      502
    );
  }
}

async function cleanup(paths) {
  if (!paths.length) return;

  await remote('/storage/v1/object/evidence', {
    method: 'DELETE',
    body: { prefixes: paths },
  }).catch(() => {});
}

async function saveAnswers(
  row,
  s,
  category,
  entries,
  markCategorySaved
) {
  if (!Array.isArray(entries) || entries.length > 200) {
    fail('Invalid answer list.');
  }

  const p = structuredClone(row.data);
  p.answers ||= {};
  p.files ||= {};

  const uploads = [];
  const seen = new Set();
  let bytesTotal = 0;

  const ordered = [...entries].sort(
    (a, b) =>
      Number(category.credits.some(i => i.id === a.itemId)) -
      Number(category.credits.some(i => i.id === b.itemId))
  );

  for (const entry of ordered) {
    const item = [
      ...category.prerequisites,
      ...category.credits,
    ].find(i => i.id === entry.itemId);

    if (!item || seen.has(item.id)) {
      fail('Unknown or duplicate item.');
    }

    seen.add(item.id);

    const values = entry.values || { answer: entry.answer };
    validateValues(item, values);

    const previous = p.answers[item.id];
    const isCredit = category.credits.some(
      i => i.id === item.id
    );

    const unlocked = evaluate(s, p.answers)
      .categories.find(c => c.id === category.id)
      .unlocked;

    if (
      isCredit &&
      !unlocked &&
      (
        JSON.stringify(values) !==
          JSON.stringify(previous?.values) ||
        entry.file
      )
    ) {
      fail(
        'Complete and save prerequisites before editing credits.'
      );
    }

    let evidenceId = previous?.evidenceId || null;

    if (entry.file) {
      const file = entry.file;

      if (
        typeof file.name !== 'string' ||
        !file.name.trim() ||
        typeof file.base64 !== 'string' ||
        !/^[A-Za-z0-9+/]+={0,2}$/.test(file.base64)
      ) {
        fail('Invalid document.');
      }

      const bytes = Buffer.from(file.base64, 'base64');
      bytesTotal += bytes.length;

      if (!bytes.length || bytesTotal > 2 * 1024 * 1024) {
        fail(
          'Online uploads are limited to 2 MB per save. Save documents separately.'
        );
      }

      evidenceId = randomUUID();

      const path =
        row.owner_id + '/' + row.id + '/' + evidenceId;

      uploads.push({ path, bytes });

      p.files[evidenceId] = {
        path,
        name: file.name.slice(0, 180),
      };
    }

    p.answers[item.id] = {
      values,
      answer: values.answer,
      evidenceId,
      evidenceName: evidenceId
        ? p.files[evidenceId]?.name
        : null,
      savedAt: new Date().toISOString(),
    };
  }

  if (markCategorySaved) {
    p.categorySavedAt ||= {};
    p.categorySavedAt[category.id] =
      new Date().toISOString();
  }

  const uploaded = [];

  try {
    for (const file of uploads) {
      await upload(file.path, file.bytes);
      uploaded.push(file.path);
    }

    return await view(await updateProject(row, p));
  } catch (error) {
    await cleanup(uploaded);
    throw error;
  }
}

export default async function handler(req, res) {
  try {
    const url = new URL(req.url, 'http://localhost');

    const path =
      '/' +
      (
        url.searchParams.get('route') ||
        url.pathname.replace(/^\/api\/?/, '')
      ).replace(/^\/+|\/+$/g, '');

    const method = req.method;

    if (req.headers.origin) {
      const origin = new URL(req.headers.origin);
      const host =
        req.headers['x-forwarded-host'] ||
        req.headers.host;

      if (origin.host !== host) {
        fail(
          'Request origin does not match this website.',
          403
        );
      }
    }

    if (method === 'GET' && path === '/health') {
      config();

      await table('rating_standards', {
        select: 'id',
        limit: '1',
      });

      return json(res, 200, {
        status: 'ok',
        database: 'connected',
      });
    }

    if (method === 'POST' && path === '/auth/login') {
      const b = await body(req);
      const session = await login(b.email, b.password);

      setSession(req, res, session);

      return json(res, 200, {
        user: {
          id: session.user.id,
          email: session.user.email,
        },
      });
    }

    if (method === 'POST' && path === '/auth/logout') {
      const saved = cookies(req);

      if (saved.gb_access) {
        await remote('/auth/v1/logout', {
          method: 'POST',
          key: config().anon,
          token: saved.gb_access,
        }).catch(() => {});
      }

      setSession(req, res, null);
      return json(res, 200, { ok: true });
    }

    if (method === 'GET' && path === '/auth/me') {
      try {
        const account = await user(req, res);

        return json(res, 200, {
          user: {
            id: account.id,
            email: account.email,
          },
        });
      } catch (error) {
        if (error.status !== 401) throw error;
        return json(res, 200, { user: null });
      }
    }

    const account = await user(req, res);

    if (method === 'POST' && path === '/admin/login') {
      const b = await body(req);
      const session = await login(account.email, b.password);

      if (session.user.id !== account.id) {
        fail('Sign in with the same account.', 403);
      }

      await admin(account);
      setSession(req, res, session);

      return json(res, 200, { token: 'cookie-session' });
    }

    if (path.startsWith('/admin/')) {
      await admin(account);

      if (
        method === 'GET' &&
        path === '/admin/standards'
      ) {
        return json(
          res,
          200,
          (await standards()).map(documentFor)
        );
      }

      if (
        method === 'POST' &&
        path === '/admin/drafts'
      ) {
        const b = await body(req);
        const source = await standard(b.sourceId);

        if (
          typeof b.label !== 'string' ||
          !b.label.trim() ||
          typeof b.buildingType !== 'string' ||
          !b.buildingType.trim()
        ) {
          fail('Enter a version name and building type.');
        }

        const s = {
          ...source,
          id: randomUUID(),
          label: b.label,
          buildingType: b.buildingType,
          status: 'draft',
          revision: 1,
        };

        await table('rating_standards', {}, {
          method: 'POST',
          body: {
            id: s.id,
            document: s,
            revision: 1,
          },
        });

        return json(res, 201, s);
      }

      const match = path.match(
        /^\/admin\/standards\/([A-Za-z0-9_-]+)(\/publish)?$/
      );

      if (match) {
        const old = await standard(match[1]);

        if (old.status !== 'draft') {
          fail('Clone a published version before editing.');
        }

        if (method === 'DELETE') {
          await table('rating_standards', {
            id: 'eq.' + old.id,
            revision: 'eq.' + old.revision,
          }, { method: 'DELETE' });

          return json(res, 200, { ok: true });
        }

        if (method === 'POST') {
          const b = await body(req);

          if (b.revision !== old.revision) {
            fail('Draft changed. Reload the admin area.', 409);
          }

          let s;

          if (match[2]) {
            const errors = validateStandard(old);

            if (errors.length) fail(errors.join('\n'));

            s = {
              ...old,
              status: 'published',
              publishedAt: new Date().toISOString(),
            };
          } else {
            if (!hasStandardShape(b.standard)) {
              fail('Invalid standard structure.');
            }

            s = {
              ...b.standard,
              id: old.id,
              status: 'draft',
              demo: true,
            };
          }

          s.revision = old.revision + 1;

          const rows = await table('rating_standards', {
            id: 'eq.' + old.id,
            revision: 'eq.' + old.revision,
          }, {
            method: 'PATCH',
            body: {
              document: s,
              revision: s.revision,
            },
            headers: { Prefer: 'return=representation' },
          });

          if (!rows.length) {
            fail('Draft changed. Reload the admin area.', 409);
          }

          return json(res, 200, s);
        }
      }
    }

    if (method === 'GET' && path === '/standards') {
      const available = (await standards())
        .map(documentFor)
        .filter(s => s.status === 'published' && isCompleteStandard(s))
        .map(({ categories, ...s }) => s);

      return json(res, 200, available);
    }

    if (method === 'GET' && path === '/projects') {
      const rows = await table('rating_projects', {
        owner_id: 'eq.' + account.id,
        select: '*',
        order: 'created_at.desc',
      });

      return json(res, 200, await Promise.all(rows.map(view)));
    }

    if (method === 'POST' && path === '/projects') {
      const b = await body(req);
      const s = await standard(b.standardId);

      if (s.status !== 'published') {
        fail('Choose a published version.');
      }
      if (
        s.status !== 'published' ||
        !isCompleteStandard(s)
      ) {
        fail(
          'Choose a complete eight-category version. Refresh the page and create the assessment again.'
      );
}
      
      if (
        typeof b.name !== 'string' ||
        !b.name.trim() ||
        b.name.length > 160
      ) {
        fail('Enter a project name.');
      }

      const id = randomUUID();

      const data = {
        id,
        name: b.name.trim(),
        buildingType: s.buildingType,
        standardId: s.id,
        answers: {},
        files: {},
        categorySavedAt: {},
        createdAt: new Date().toISOString(),
      };

      const rows = await table('rating_projects', {}, {
        method: 'POST',
        body: {
          id,
          owner_id: account.id,
          standard_id: s.id,
          data,
        },
        headers: { Prefer: 'return=representation' },
      });

      return json(res, 201, await view(rows[0]));
    }

    const match = path.match(
      /^\/projects\/([a-f0-9-]+)\/(answers|categories\/([A-Z]{2})|report-details|evidence\/([a-f0-9-]+))$/
    );

    if (match) {
      const row = await project(match[1], account);

      if (method === 'GET' && match[4]) {
        const file = row.data.files?.[match[4]];

        if (!file) fail('Document not found.', 404);

        const signed = await remote(
          '/storage/v1/object/sign/evidence/' + file.path,
          {
            method: 'POST',
            body: { expiresIn: 60 },
          }
        );

        res.statusCode = 302;
        res.setHeader('Cache-Control', 'no-store');
        res.setHeader(
          'Location',
          config().url +
            '/storage/v1' +
            signed.signedURL +
            '&download=' +
            encodeURIComponent(file.name)
        );

        return res.end();
      }

      if (method === 'POST') {
        const b = await body(req);

        if (match[2] === 'report-details') {
          const allowed = [
            'budget',
            'architect',
            'structuralEngineer',
            'mepEngineer',
            'greenConsultants',
            'teamLeader',
            'reportDate',
          ];

          if (
            !b.details ||
            typeof b.details !== 'object' ||
            Array.isArray(b.details) ||
            Object.entries(b.details).some(
              ([key, value]) =>
                !allowed.includes(key) ||
                typeof value !== 'string' ||
                value.length > 500
            )
          ) {
            fail('Invalid report details.');
          }

          return json(
            res,
            200,
            await view(await updateProject(row, {
              ...row.data,
              reportDetails: b.details,
            }))
          );
        }

        const s = await standard(row.standard_id);

        const category = s.categories.find(c =>
          match[3]
            ? c.id === match[3]
            : [...c.prerequisites, ...c.credits].some(
                item => item.id === b.itemId
              )
        );

        if (!category) fail('Category not found.');

        return json(
          res,
          200,
          await saveAnswers(
            row,
            s,
            category,
            match[3] ? b.answers : [b],
            Boolean(match[3])
          )
        );
      }
    }

    return json(res, 404, { error: 'Endpoint not found.' });
  } catch (error) {
    if (error.status) {
      return json(res, error.status, { error: error.message });
    }

    console.error('Backend request failed:', error.name);

    return json(res, 500, {
      error: 'Backend request failed. Check Vercel function logs.',
    });
  }
}

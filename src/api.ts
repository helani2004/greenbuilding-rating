export async function api(
  path: string,
  body?: unknown,
  token?: string,
  method?: string
) {
  let response: Response;

  try {
    response = await fetch('/api' + path, {
      method: method || (body ? 'POST' : 'GET'),
      credentials: 'same-origin',
      headers: {
        ...(body
          ? { 'Content-Type': 'application/json' }
          : {}),
        ...(token
          ? { Authorization: 'Bearer ' + token }
          : {}),
      },
      ...(body
        ? { body: JSON.stringify(body) }
        : {}),
    });
  } catch {
    throw Error(
      'Cannot connect. Check your internet connection and try again.'
    );
  }

  const text = await response.text();
  let data;

  try {
    data = JSON.parse(text);
  } catch {
    throw Error(
      'The API did not return JSON. Check the Vercel deployment and /api/health.'
    );
  }

  if (!response.ok) {
    throw Error(data.error || 'Request failed.');
  }

  return data;
}

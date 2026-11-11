import {api} from './api';

export async function uploadPdf(route: string, file: File, description?: string) {
  if (file.size > 25 * 1024 * 1024 || !/\.pdf$/i.test(file.name) ||
      await file.slice(0, 5).text() !== '%PDF-') {
    throw Error('Choose a valid PDF up to 25 MB.');
  }
  const {id, url} = await api(route, {action: 'prepare', description});
  const form = new FormData();
  form.append('cacheControl', '3600');
  form.append('', file);
  const response = await fetch(url, {method: 'PUT', body: form, headers: {'x-upsert': 'false'}});
  if (!response.ok) throw Error('Upload failed. Check the evidence bucket’s file-size limit and retry.');
  return {uploadId: id, fileName: file.name};
}

import {useRef, useState} from 'react';
import {api} from './api';
import {uploadPdf} from './uploadPdf';

export function AdditionalEvidence({route, disabled, onSave}: {
  route: string; disabled: boolean; onSave: (p: any) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  return <>
    <button type="button" className="secondary" disabled={disabled}
      onClick={() => {setError(''); dialog.current?.showModal();}}>+ Add files</button>
    <dialog ref={dialog} className="evidence-dialog" onCancel={event => {if (busy) event.preventDefault();}}>
      <form onSubmit={async event => {
        event.preventDefault();
        const form = event.currentTarget;
        const fields = new FormData(form);
        const description = String(fields.get('description')).trim();
        const availability = String(fields.get('availability'));
        const file = fields.get('pdf') as File;
        setBusy(true);
        setError('');
        try {
          if (!description) throw Error('Enter a description.');
          if (availability === 'yes' && !file.size) throw Error('Upload a PDF before saving Yes.');
          const path = route + '/extra-' + crypto.randomUUID();
          const upload = file.size ? await uploadPdf(path, file, description) : {};
          onSave(await api(path, {description, availability, ...upload}));
          form.reset();
          dialog.current?.close();
        } catch (error) {
          setError((error as Error).message);
        } finally {
          setBusy(false);
        }
      }}>
        <h3>Additional supporting file</h3>
        <fieldset disabled={busy}>
          <label>Description<textarea name="description" required maxLength={500}/></label>
          <label>Available<select name="availability" required defaultValue="">
            <option value="">Choose Yes or No</option><option value="yes">Yes</option><option value="no">No</option>
          </select></label>
          <label>PDF (up to 25 MB)<input type="file" name="pdf" accept="application/pdf,.pdf"/></label>
        </fieldset>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="actions">
          <button type="button" disabled={busy} className="secondary" onClick={() => dialog.current?.close()}>Cancel</button>
          <button disabled={busy} className="primary">{busy ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </dialog>
  </>;
}

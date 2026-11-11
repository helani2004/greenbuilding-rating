import {AdditionalEvidence} from './AdditionalEvidence';
import {uploadPdf} from './uploadPdf';
import {useEffect, useState} from 'react';
import {api} from './api';
import {RefreshIcon, TrashIcon} from './Icons';

type D = any;

type Props = {
  item: D;
  project: D;
  locked: boolean;
  onSave: (project: D) => void;
  onDirty: (dirty: boolean) => void;
  register: (
    id: string,
    save: (() => Promise<void>) | null
  ) => void;
};

export default function DocumentItem({
  item,
  project,
  locked,
  onSave,
  onDirty,
  register,
}: Props) {
  const answer = project.answers?.[item.id] || {};
  const entries = answer.documents || {};
  const options = item.documentOptions || [];

  const [selected, setSelected] = useState('');
  const [availability, setAvailability] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [values, setValues] = useState<D>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [inputKey, setInputKey] = useState(0);
  const [claim, setClaim] = useState<string | null>(null);
  const claimValue = answer.values?.claimedPoints ?? item.points ?? 0;

  async function saveClaim() {
    if (claim === null) return;
    if (!claim.trim()) throw Error('Enter the points you want to claim.');
    const updated = await api(route('claim'), {action: 'claim', points: Number(claim)});
    onSave(updated);
    setClaim(null);
  }

  const evidenceDirty =
    Boolean(selected) ||
    Boolean(availability) ||
    Boolean(file) ||
    Object.keys(values).length > 0;

  const dirty = evidenceDirty || claim !== null;

  const rows: D[] = Object.entries(entries).map(
    ([id, entry]) => ({
      ...(entry as D),
      id,
    })
  );

  // Preserve access to PDFs saved before this workflow.
  if (answer.evidenceId) {
    rows.unshift({
      id: 'legacy',
      label: 'Previously saved supporting document',
      availability:
        answer.values?.answer || answer.answer || '—',
      evidenceId: answer.evidenceId,
      evidenceName: answer.evidenceName,
    });
  }

  useEffect(() => {
    onDirty(dirty);

    return () => onDirty(false);
  }, [dirty]);

  // Allows "Save category" to save pending document panels too.
  useEffect(() => {
    register(item.id, dirty ? async () => {
      if (evidenceDirty) await save();
      if (claim !== null) await saveClaim();
    } : null);

    return () => register(item.id, null);
  });

  function route(documentId: string) {
    return (
      '/projects/' +
      project.id +
      '/document-entries/' +
      item.id +
      '/' +
      documentId
    );
  }

  function reset() {
    setSelected('');
    setAvailability('');
    setFile(null);
    setValues({});
    setInputKey(key => key + 1);
  }

  async function save() {
    setError('');
    setMessage('');
    setBusy(true);

    try {
      if (!selected || !availability) {
        throw Error(
          'Select a document and choose Yes or No.'
        );
      }

      if (entries[selected]) {
        throw Error(
          'Delete the saved row before using this option again.'
        );
      }

      if (availability === 'yes' && !file) {
        throw Error(
          'Upload the PDF before saving Yes.'
        );
      }

      const upload = file ? await uploadPdf(route(selected), file) : {};
      const updated = await api(route(selected), {
        availability,
        values: {...(answer.values || {}), ...values},
        ...upload,
      });

      onSave(updated);
      reset();
      setExpanded(true);

      setMessage(
        'Saved. Delete this table row before using the same document option again.'
      );
    } catch (error) {
      setError((error as Error).message);
      throw error;
    } finally {
      setBusy(false);
    }
  }

  async function refresh() {
    if (
      dirty &&
      !window.confirm(
        'Discard this panel’s unsaved changes and refresh its saved documents?'
      )
    ) {
      return;
    }

    setBusy(true);
    setError('');
    setMessage('');

    try {
      const updated = await api(
        '/projects/' + project.id
      );

      onSave(updated);
      reset();
      setClaim(null);
      setMessage('Saved documents refreshed.');
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(row: D) {
    const confirmed = window.confirm(
      'Delete “‘' +
        row.label +
        '’” and its uploaded PDF? ' +
        'This unlocks the document option and may reduce points or lock dependent credits.'
    );

    if (!confirmed) return;

    setBusy(true);
    setError('');
    setMessage('');

    try {
      const updated = await api(
        route(row.id),
        undefined,
        undefined,
        'DELETE'
      );

      onSave(updated);
      setExpanded(true);

      setMessage(
        updated.warning ||
          'Deleted. You can select this document option again.'
      );
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const selectedOption = options.find(
    (option: D) => option.id === selected
  );

  const latestFile = [...rows]
    .reverse()
    .find(row => row.evidenceId);

  // Keep genuine assessment inputs, but remove manual points.
  const technicalFields = (item.fields || []).filter(
    (field: D) =>
      !['answer', 'claimedPoints'].includes(field.id)
  );

  return (
    <div className="item card document-panel">
      <div className="item-head">
        <div>
          <small>{item.id}</small>
          <h3>{item.title}</h3>

          {item.intent && (
            <p className="intent">{item.intent}</p>
          )}

          <details className="help">
            <summary
              aria-label={
                'Document guidance for ' + item.title
              }
            >
              ?
            </summary>

            <div className="help-panel">
              <strong>Document guidance</strong>
              <p>{item.help}</p>
            </div>
          </details>
        </div>

        <div className="document-tools">
          <span className="status">
            {item.maxPoints !== undefined
              ? `Points contested: ${item.points} / ${item.maxPoints}`
              : item.achieved
                ? 'Prerequisite achieved'
                : 'Prerequisite not achieved'}
          </span>

          <button
            type="button"
            className="secondary icon-button"
            disabled={busy}
            title="Refresh saved documents"
            aria-label={'Refresh ' + item.title}
            onClick={() => void refresh()}
          >
            <RefreshIcon />
          </button>
        </div>
      </div>

      {item.intent && <p className="item-intent">{item.intent}</p>}
      <div className="actions">
        {item.maxPoints !== undefined && <label>Points to claim
          <input type="number" min={0} max={item.maxPoints} step={1}
            disabled={locked || busy || project.deleting}
            value={claim ?? claimValue} onChange={event => setClaim(event.target.value)}/>
        </label>}
        {claim !== null && <button type="button" className="secondary"
          disabled={locked || busy || project.deleting}
          onClick={async () => {
            setBusy(true); setError('');
            try {await saveClaim();}
            catch (error) {setError((error as Error).message);}
            finally {setBusy(false);}
          }}>Save points</button>}
        <AdditionalEvidence route={route('').slice(0, -1)} disabled={locked || busy || project.deleting}
          onSave={updated => {onSave(updated); setExpanded(true);}}/>
      </div>
      <fieldset
        className="assessment-fields"
        disabled={locked || busy || project.deleting}
      >
        <div className="document-entry-grid">
          <label>
            Document

            <select
              value={selected}
              onChange={event => {
                setSelected(event.target.value);
                setError('');
                setMessage('');
              }}
            >
              <option value="">
                Select a required document
              </option>

              {options.map((option: D) => (
                <option
                  key={option.id}
                  value={option.id}
                  disabled={Boolean(entries[option.id])}
                >
                  {option.pathway
                    ? '[' + option.pathway + '] '
                    : ''}
                  {option.label}
                  {option.required !== false ? ' *' : ''}
                  {entries[option.id] ? ' — saved' : ''}
                </option>
              ))}
            </select>

            {selectedOption?.guidance && (
              <small>{selectedOption.guidance}</small>
            )}
          </label>

          <label>
            Available?

            <select
              value={availability}
              onChange={event =>
                setAvailability(event.target.value)
              }
            >
              <option value="">Choose</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>

          <label>
            Upload PDF
            {availability === 'yes'
              ? ' (required)'
              : ' (optional for No)'}

            <input
              key={inputKey}
              type="file"
              accept="application/pdf,.pdf"
              onChange={event =>
                setFile(event.target.files?.[0] || null)
              }
            />

            {file && <small>{file.name}</small>}
          </label>

          <button
            type="button"
            className="primary"
            disabled={
              !selected ||
              !availability ||
              Boolean(entries[selected])
            }
            onClick={() => void save().catch(() => {})}
          >
            {busy ? 'Saving…' : 'Save'}
          </button>
        </div>

        {technicalFields.length > 0 && (
          <div className="input-fields">
            {technicalFields.map((field: D) => (
              <label key={field.id}>
                {field.label}
                {field.unit ? ' (' + field.unit + ')' : ''}

                {['yesno', 'select'].includes(field.type) ? (
                  <select
                    value={
                      values[field.id] ??
                      answer.values?.[field.id] ??
                      ''
                    }
                    onChange={event =>
                      setValues((previous: D) => ({
                        ...previous,
                        [field.id]: event.target.value,
                      }))
                    }
                  >
                    <option value="">Choose</option>

                    {(field.type === 'yesno'
                      ? ['yes', 'no']
                      : field.options || []
                    ).map((option: string) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={
                      field.type === 'number'
                        ? 'number'
                        : 'text'
                    }
                    step="any"
                    value={
                      values[field.id] ??
                      answer.values?.[field.id] ??
                      ''
                    }
                    onChange={event =>
                      setValues((previous: D) => ({
                        ...previous,
                        [field.id]: event.target.value,
                      }))
                    }
                  />
                )}
              </label>
            ))}
          </div>
        )}
      </fieldset>

      {latestFile && (
        <p>
          <small>Uploaded: </small>
          <a
            href={`/api/projects/${project.id}/evidence/${latestFile.evidenceId}`}
            target="_blank"
            rel="noreferrer"
          >
            {latestFile.evidenceName || 'Open saved PDF'}
          </a>
        </p>
      )}

      {locked && (
        <p>
          Complete and save this category’s prerequisites
          before adding credit documents.
        </p>
      )}

      <small>
        * Required evidence. Where alternative pathways
        are listed, complete the common evidence and one
        applicable pathway. Points follow the configured
        scoring rules.
      </small>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {message && <p role="status">{message}</p>}

      {dirty && (
        <p className="pending">Unsaved document entry</p>
      )}

      <button
        type="button"
        className="secondary saved-toggle"
        aria-expanded={expanded}
        onClick={() => setExpanded(open => !open)}
      >
        {expanded ? '▴' : '▾'} Saved documents ({rows.length})
      </button>

      {expanded && (
        <div className="evidence-table-wrap">
          <table className="evidence-table">
            <thead>
              <tr>
                <th>Document</th>
                <th>Availability</th>
                <th>Uploaded document</th>
                <th>Make changes</th>
              </tr>
            </thead>

            <tbody>
              {rows.length ? (
                rows.map(row => (
                  <tr key={row.id}>
                    <td>{row.label}</td>

                    <td>
                      {row.availability === 'yes'
                        ? 'Yes'
                        : row.availability === 'no'
                          ? 'No'
                          : row.availability}
                    </td>

                    <td>
                      {row.evidenceId ? (
                        <a
                          href={`/api/projects/${project.id}/evidence/${row.evidenceId}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {row.evidenceName || 'Open PDF'}
                        </a>
                      ) : (
                        'No PDF uploaded'
                      )}
                    </td>

                    <td>
                      <button
                        type="button"
                        className="danger icon-button"
                        disabled={busy || project.deleting}
                        title="Delete saved entry"
                        aria-label={'Delete ' + row.label}
                        onClick={() => void remove(row)}
                      >
                        <TrashIcon />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4}>
                    No saved document entries.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

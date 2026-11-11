import {useState} from 'react';
import {api} from './api';
import {makeReport, reportFields} from './report';

export default function ReportPanel({project, onSave}: {project: any; onSave: (project: any) => void}) {
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const canDownload = project.result.finalReportAvailable;
  return <section className="card report">
    <h2>Final PDF report</h2>
    <p>{project.result.total} / {project.result.maxPoints} points contested</p>
    <form onSubmit={async event => {
      event.preventDefault();
      const saveOnly = (event.nativeEvent as SubmitEvent).submitter?.getAttribute('value') === 'save';
      if (!saveOnly && !canDownload) {
        setError('Save at least one assessment response before downloading the report.');
        return;
      }
      const details: Record<string, string> = {};
      new FormData(event.currentTarget).forEach((value, key) => {details[key] = String(value);});
      setProgress('Saving report details…');
      setError(''); setMessage('');
      try {
        const updated = await api('/projects/' + project.id + '/report-details', {details});
        onSave(updated);
        if (saveOnly) {
          setMessage('Report details saved.');
          return;
        }
        const pdf = await makeReport(updated, setProgress);
        const url = URL.createObjectURL(pdf);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${updated.name.replace(/[^a-z0-9 -]/gi, '_')}-GreenSL-report.pdf`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setProgress('');
      }
    }}>
      <fieldset disabled={Boolean(progress)}>
        <div className="admin-grid">
          {Object.entries(reportFields).map(([key, label]) => <label key={key}>{label}
            {key === 'introduction'
              ? <textarea name={key} maxLength={500} defaultValue={project.reportDetails?.[key]}/>
              : <input name={key} maxLength={500} defaultValue={project.reportDetails?.[key]}/>}
          </label>)}
        </div>
        <div className="actions">
          <button className="secondary" value="save">Save report details</button>
          <button className="primary" value="download" disabled={!canDownload}>Download report with annexures</button>
        </div>
      </fieldset>
    </form>
    {!canDownload && <p>Save at least one assessment response or document entry before downloading.</p>}
    {progress && <p role="status">{progress}</p>}
    {message && <p role="status">{message}</p>}
    {error && <p role="alert" className="error">{error}</p>}
  </section>;
}

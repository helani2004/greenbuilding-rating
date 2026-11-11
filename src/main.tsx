import {greenSlLogo} from './branding';
import ReportPanel from './ReportPanel';
import {uploadPdf} from './uploadPdf';
import {AdditionalEvidence} from './AdditionalEvidence';
import DocumentItem from './DocumentItem';
import OnlineSession from './OnlineSession';
import {useEffect,useState,useRef} from 'react';import {createRoot} from 'react-dom/client';import Admin from './Admin';import {api} from './api';import './styles.css';
type D=any;
function App(){const [projects,setProjects]=useState<D[]>([]),[standards,setStandards]=useState<D[]>([]),[project,setProject]=useState<D>(null),[category,setCategory]=useState('MN'),[name,setName]=useState(''),[type,setType]=useState('new'),[version,setVersion]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false),[page,setPage]=useState(location.hash==='#admin'?'admin':'user');const dirtyRef=useRef(false);
async function load() {
  setError('');

  try {
    const [p, s] = await Promise.all([
      api('/projects'),
      api('/standards'),
    ]);

    setProjects(p);
    setStandards(s);

    setVersion(current => {
      const candidates = s.filter(
        (v: D) => v.buildingType === type
      );

      const selectionExists = candidates.some(
        (v: D) => v.id === current
      );

      return selectionExists
        ? current
        : candidates[0]?.id || '';
    });
  } catch (error) {
    setError((error as Error).message);
  }
}useEffect(()=>{void load();},[]);
function navigate(fn:()=>void){if(dirtyRef.current&&!window.confirm('There are unsaved changes. Discard them and continue?'))return;dirtyRef.current=false;fn();}
function update(p:D){setProject(p);setProjects(old=>[p,...old.filter(x=>x.id!==p.id)]);}
async function deleteProject(p: D) {
  if (
    dirtyRef.current &&
    !window.confirm(
      'You have unsaved changes. Continue to project deletion?'
    )
  ) {
    return;
  }

  const confirmation = window.prompt(
    `Permanently delete "${p.name}"?\n\n` +
    'All saved answers and uploaded documents will be deleted. ' +
    'This cannot be undone.\n\n' +
    'Type the exact project name to confirm:'
  );

  if (confirmation === null) return;

  if (confirmation !== p.name) {
    window.alert('The project name did not match. Nothing was deleted.');
    return;
  }

  setBusy(true);

  try {
    await api(
      '/projects/' + p.id,
      { confirmName: confirmation },
      undefined,
      'DELETE'
    );

    setProjects(current =>
      current.filter(saved => saved.id !== p.id)
    );

    if (project?.id === p.id) {
      dirtyRef.current = false;
      setProject(null);
    }

    setPage('user');
    location.hash = '';
  } catch (error) {
    window.alert((error as Error).message);
  } finally {
    setBusy(false);
  }
}
async function create(e:React.FormEvent){e.preventDefault();setBusy(true);setError('');try{update(await api('/projects',{name,standardId:version}));setCategory('MN');}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
const types=[...new Set(standards.map(s=>s.buildingType))];const available=standards.filter(s=>s.buildingType===type);
return <div className="shell"><aside><div className="view-navigation" aria-label="Workspace views">
  <button className={page==='user'?'nav active':'nav'} onClick={()=>navigate(()=>{
    setPage('user');location.hash='';
    if(project) void api('/projects/'+project.id).then(update).catch(e=>setError(e.message));
  })}>User view</button>
  <button className={page==='admin'?'nav active':'nav'} onClick={()=>navigate(()=>{
    setPage('admin');location.hash='admin';
  })}>Admin view</button>
</div><button className={page==='user'&&!project?'nav active':'nav'} onClick={()=>navigate(()=>{setProject(null);setPage('user');location.hash='';void load();})}>＋ Create a project</button>{projects.map(p => (
  <div className="project-list-row" key={p.id}>
    <button
      disabled={busy}
      className={
        p.id === project?.id && page === 'user'
          ? 'nav active'
          : 'nav'
      }
      onClick={() =>
        navigate(() => {
          void api('/projects/' + p.id).then(update).catch(e=>setError(e.message));
          setCategory('MN');
          setPage('user');
          location.hash = '';
        })
      }
    >
      {p.name}
      <small>
        {p.buildingType}
        {p.deleting ? ' · deletion pending' : ''}
      </small>
    </button>

    <button
      type="button"
      className="project-trash"
      disabled={busy}
      title="Delete project"
      aria-label={'Delete project ' + p.name}
      onClick={() => void deleteProject(p)}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7" />
      </svg>
    </button>
  </div>
))}<div className="aside-foot">Version 0.2<br/>Forms · evidence · admin versions</div></aside><main><header className="workspace-header">
  <img src={greenSlLogo} alt="GreenSL® Rating" width="221" height="47"/>
  {project && page === 'user' && <nav className="criteria-nav" aria-label="Assessment sections">
    {project.result.categories.map((c:D) => <button key={c.id} type="button"
      aria-current={category === c.id ? 'page' : undefined}
      title={c.title} onClick={() => navigate(() => setCategory(c.id))}>{c.id} · {c.title}</button>)}
    <button type="button" aria-current={category === 'report' ? 'page' : undefined}
      onClick={() => navigate(() => setCategory('report'))}>Report</button>
  </nav>}
</header>{page==='admin'?<Admin onDirty={v=>{dirtyRef.current=v;}}/>:<><div className="notice"><strong>Demonstration scoring</strong> · Document guidance and forms are editable. These checks do not inspect uploaded documents or represent verified compliance with the full rating standard.</div>{error&&<div role="alert" className="error">{error}<button className="secondary" onClick={()=>void load()}>Retry connection</button></div>}
{!project?<section className="welcome"><p className="eyebrow">BUILD BETTER, MEASURE CLEARLY</p><h1>Start your building<br/>assessment.</h1><p>Select a standard version, save supporting evidence, and work through eight categories.</p><form onSubmit={create} className="card"><h2>Create a project</h2><label>Building type<select value={type} onChange={e=>{setType(e.target.value);setVersion([...standards].reverse().find(s=>s.buildingType===e.target.value)?.id||'');}}>{types.map(t=><option key={t} value={t}>{t==='new'?'New Buildings':t==='existing'?'Existing Buildings':t}</option>)}</select></label><label>Rating standard version<select required value={version} onChange={e=>setVersion(e.target.value)}><option value="">Choose a version</option>{available.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select></label><label>Project name<input maxLength={160} required value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Piliyandala office building"/></label><button className="primary" disabled={busy||!version}>{busy?'Creating…':'Create assessment →'}</button></form></section>:<><div className="title-row"><div><p className="eyebrow">{project.standard.label}</p><h1>{project.name}</h1><p>Version locked to this project. Complete each category’s prerequisites before its credits.</p></div><div className="score"><strong>{project.result.total}<span> / {project.result.maxPoints}</span></strong><small>Points contested</small></div></div> {category === 'report'
  ? <ReportPanel key={project.id} project={project} onSave={update}/>
  : <Category key={project.id+category} project={project} categoryId={category} onSave={update}
      onNext={id=>{dirtyRef.current=false;setCategory(id);}}
      onDirty={v=>{dirtyRef.current=v;}}/>}</>}
</>}</main></div>;
}
function Category({project,categoryId,onSave,onDirty,onNext}:{project:D;categoryId:string;onSave:(p:D)=>void;onDirty:(v:boolean)=>void;onNext:(id:string)=>void}){const category=project.result.categories.find((c:D)=>c.id===categoryId);const [drafts,setDrafts]=useState<Record<string,D>>({}),[files,setFiles]=useState<Record<string,File>>({}),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('');const [documentDirty, setDocumentDirty] =
  useState<Record<string, boolean>>({});

const documentSavers =
  useRef<Record<string, () => Promise<void>>>({});

const dirty =
  Object.keys(drafts).length > 0 ||
  Object.keys(files).length > 0 ||
  Object.values(documentDirty).some(Boolean);
useEffect(()=>{onDirty(dirty);const listener=(e:BeforeUnloadEvent)=>{if(dirty){e.preventDefault();e.returnValue='';}};window.addEventListener('beforeunload',listener);return()=>window.removeEventListener('beforeunload',listener);},[dirty]);
function edit(id:string,field:string,value:string){setDrafts(old=>({...old,[id]:{...(old[id]||project.answers[id]?.values||{answer:project.answers[id]?.answer||''}),[field]:value}}));setMessage('');}
async function save(itemId?:string){setBusy(true);setError('');setMessage('');try {
  if (!itemId) {
  for (
    const saveDocument of Object.values(
      documentSavers.current
    )
  ) {
    await saveDocument();
  }
}
const ids = itemId ? [itemId] : [...new Set([...Object.keys(drafts), ...Object.keys(files)])];
const answers = [];
for (const id of ids) {
  const file = files[id];
  const upload = file
    ? await uploadPdf(`/projects/${project.id}/document-entries/${id}/legacy`, file)
    : {};
  answers.push({itemId: id, values: drafts[id] || project.answers[id]?.values || {answer: ''}, ...upload});
}
const p = await api('/projects/' + project.id + (itemId ? '/answers' : '/categories/' + categoryId),
  itemId ? answers[0] : {answers});
onSave(p);
setDrafts(old=>Object.fromEntries(Object.entries(old).filter(([id])=>!ids.includes(id))));
setFiles(old=>Object.fromEntries(Object.entries(old).filter(([id])=>!ids.includes(id))));
setMessage(itemId ? 'Item saved.' : 'Category saved.');
if (!itemId) {
  const index = p.result.categories.findIndex((c:D) => c.id === categoryId);
  const savedCategory = p.result.categories[index];
  const pending = savedCategory.prerequisites.filter((i:D) => !i.achieved).length;
  const unclaimed = savedCategory.credits.filter((i:D) => !i.points).length;
  const next = p.result.categories[index + 1];
  const destination = next?.title || 'the report';
  if (!(pending || unclaimed) || window.confirm(
    `Progress saved. ${pending} incomplete prerequisites and ${unclaimed} credits with no points contested. Continue to ${destination}?`
  )) onNext(next?.id || 'report');
}
}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
function itemForm(item:D,credit:boolean){if (item.documentOptions?.length) {
  return (
    <DocumentItem
      key={item.id}
      item={item}
      project={project}
      locked={
        busy || (credit && !category.unlocked)
      }
      onSave={onSave}
      onDirty={value =>
        setDocumentDirty(previous =>
          previous[item.id] === value
            ? previous
            : {
                ...previous,
                [item.id]: value,
              }
        )
      }
      register={(id, saveDocument) => {
        if (saveDocument) {
          documentSavers.current[id] = saveDocument;
        } else {
          delete documentSavers.current[id];
        }
      }}
    />
  );
}const saved=project.answers[item.id],values=drafts[item.id]||saved?.values||{answer:saved?.answer||''};const disabled=busy||(credit&&!category.unlocked);return <div className={'item card '+(disabled?'locked':'')} key={item.id}><div className="item-head"><div><small>{item.id}</small><h3>
  {item.title}
  {' '}
  <Help title={item.title} text={item.help}/>
</h3>

{item.intent && (
  <p
    style={{
      margin: '8px 0 0',
      fontSize: '0.95rem',
      fontWeight: 400,
      color: '#53665d',
      whiteSpace: 'pre-line',
    }}
  >
    {item.intent}
  </p>
)}</div><span className={item.achieved?'status achieved':'status'}>{credit?`Points contested: ${item.points} / ${item.maxPoints}`:item.achieved?'Prerequisite achieved':saved?'Prerequisite not achieved':'Not completed'}</span></div><fieldset disabled={disabled} className="assessment-fields"><div className="input-fields">{(item.fields||[{id:'answer',label:'Requirement met?',type:'yesno',required:true}]).map((f:D)=><label key={f.id}>{f.label}{f.unit?` (${f.unit})`:''}{f.required?' *':''}{f.type==='yesno'||f.type==='select'?<select value={values[f.id]??''} onChange={e=>edit(item.id,f.id,e.target.value)}><option value="">Choose an answer</option>{(f.type==='yesno'?['yes','no']:f.options||[]).map((o:string)=><option key={o} value={o}>{o==='yes'?'Yes':o==='no'?'No':o}</option>)}</select>:<input type={f.type==='number'?'number':'text'} step="any" value={values[f.id]??''} onChange={e=>edit(item.id,f.id,e.target.value)}/>}</label>)}</div>{credit && <label>Points to claim<input type="number" min={0} max={item.maxPoints} step={1}
  value={values.claimedPoints ?? item.points ?? 0}
  onChange={e=>edit(item.id,'claimedPoints',e.target.value)}/></label>}
<label>Supporting document {item.evidenceRequired===false?'(optional)':'(required for achievement)'}<input key={saved?.savedAt||'initial'} type="file" accept="application/pdf,.pdf" onChange={e=>{const file=e.target.files?.[0];if(file){setFiles(old=>({...old,[item.id]:file}));setMessage('');}}}/>{files[item.id]&&<small>Pending: {files[item.id].name}</small>}{saved?.evidenceName&&<a className="evidence" href={`/api/projects/${project.id}/evidence/${saved.evidenceId}`}>Download saved: {saved.evidenceName}</a>}</label><button type="button" className="secondary" onClick={()=>void save(item.id)}>Save</button></fieldset>
<AdditionalEvidence route={`/projects/${project.id}/document-entries/${item.id}`} disabled={disabled || project.deleting} onSave={onSave}/>
{Object.entries(saved?.documents || {}).map(([id, entry]) => {
  const row = entry as D;
  return <div className="actions" key={id}><span>{row.label} · {row.availability === 'yes' ? 'Yes' : 'No'}</span>
    {row.evidenceId && <a href={`/api/projects/${project.id}/evidence/${row.evidenceId}`}>{row.evidenceName}</a>}
    <button type="button" className="danger" disabled={busy} onClick={async () => {
      if (!window.confirm('Delete this supporting file record?')) return;
      setBusy(true);
      try {onSave(await api(`/projects/${project.id}/document-entries/${item.id}/${id}`, undefined, undefined, 'DELETE'));}
      catch (error) {setError((error as Error).message);}
      finally {setBusy(false);}
    }}>Delete</button></div>;
})}
{(drafts[item.id]||files[item.id])&&<small className="pending">Unsaved changes — displayed result uses your last saved answers.</small>}</div>;}
return <section><div className="section-title"><h2>{category.title}</h2><span className="pill">{category.points} / {category.maxPoints} points</span></div>{category.implemented===false?<div className="card"><p>This older project retains its original Management-only standard. Create a project with the new eight-category version to assess other categories. Your existing evidence is preserved.</p></div>:<><h3>01 · Prerequisites</h3>{category.prerequisites.map((i:D)=>itemForm(i,false))}<div className="section-title"><h3>02 · Credits</h3><span className="pill">{category.unlocked?'Unlocked':'Locked — prerequisites required'}</span></div>{category.credits.map((i:D)=>itemForm(i,true))}</>}
{error&&<div role="alert" className="error">{error}</div>}{message&&<p role="status" className="success">{message}</p>}<div className="card category-save"><div><h3>Save {category.title}</h3><p>{dirty?'You have unsaved changes.':project.categorySavedAt?.[categoryId]?'Last saved: '+new Date(project.categorySavedAt[categoryId]).toLocaleString():'Save your category progress whenever you need to stop.'}</p><small>Saving stores progress. Achievement and points depend on the configured rules.</small></div><button type="button" className="primary" disabled={busy} onClick={()=>void save()}>{busy?'Saving…':'Save category'}</button></div></section>;
}
function Help({title,text}:{title:string;text:string}){return <details className="help"><summary aria-label={'Document guidance for '+title}>?</summary><div className="help-panel"><strong>What documents should I upload?</strong><p>{text||'No guidance has been configured. Ask the administrator to add document requirements for this item.'}</p><small>Click (?) again to close.</small></div></details>;}
createRoot(document.getElementById('root')!).render(
  <OnlineSession>
    <App />
  </OnlineSession>
);

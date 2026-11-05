import DocumentOptionsEditor from './DocumentOptionsEditor';
import {useEffect,useState} from 'react';import {api} from './api';
import {validateStandard,hasStandardShape} from '../shared/engine.mjs';
type D=any;
const copy=(v:D)=>JSON.parse(JSON.stringify(v));
export default function Admin({onDirty}:{onDirty:(dirty:boolean)=>void}){const [token,setToken]=useState(sessionStorage.getItem('green-admin')||''),[password,setPassword]=useState(''),[standards,setStandards]=useState<D[]>([]),[draft,setDraft]=useState<D>(null),[category,setCategory]=useState('MN'),[error,setError]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[dirty,setDirty]=useState(false),[source,setSource]=useState(''),[label,setLabel]=useState(''),[buildingType,setBuildingType]=useState('new');
async function load(){try{const s=await api('/admin/standards',undefined,token);setStandards(s);setSource(old=>old||s.find((v:D)=>v.id==='new-demo-2')?.id||s[0]?.id);}catch(e){setError((e as Error).message);}}
useEffect(()=>{if(token)void load();},[token]);
useEffect(()=>{onDirty(dirty);const listener=(e:BeforeUnloadEvent)=>{if(dirty){e.preventDefault();e.returnValue='';}};window.addEventListener('beforeunload',listener);return()=>window.removeEventListener('beforeunload',listener);},[dirty]);
async function work(action:()=>Promise<void>){setBusy(true);setError('');setMessage('');try{await action();}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
function change(fn:(d:D)=>void){setDraft((old:D)=>{const d=copy(old);fn(d);return d;});setDirty(true);}
const cat=draft?.categories.find((c:D)=>c.id===category);
const errors=draft?validateStandard(draft):[];
const categoryTotal = draft
  ? draft.categories.reduce(
      (sum: number, c: D) => sum + Number(c.maxPoints || 0),
      0
    )
  : 0;

const creditTotal = draft
  ? draft.categories.reduce(
      (sum: number, c: D) =>
        sum + c.credits.reduce(
          (subtotal: number, item: D) =>
            subtotal + Number(item.maxPoints || 0),
          0
        ),
      0
    )
  : 0;

const pointsBalanced =
  creditTotal === 100 && categoryTotal === 100;

const pointCounterStyle = {
  padding: '10px 16px',
  borderRadius: '8px',
  fontWeight: 700,
  background: pointsBalanced
    ? '#dcfce7'
    : creditTotal > 100 || categoryTotal > 100
      ? '#fee2e2'
      : '#fff0da',
  color: pointsBalanced
    ? '#166534'
    : creditTotal > 100 || categoryTotal > 100
      ? '#991b1b'
      : '#9a4700',
};
function open(s:D){if(dirty&&!window.confirm('Discard your unsaved admin edits?'))return;setDraft(copy(s));setDirty(false);setMessage('');}
if(!token)return <section className="welcome"><p className="eyebrow">STANDARD MANAGEMENT</p><h1>Admin sign-in</h1><p>
  Enter the same password you used to sign into this website.
  Your account must have administrator access.
</p>{error&&<p role="alert" className="error">{error}</p>}<form className="card" onSubmit={e=>{e.preventDefault();void work(async()=>{const r=await api('/admin/login',{password});setToken(r.token);sessionStorage.setItem('green-admin',r.token);setPassword('');});}}><label>Admin password<input type="password" required autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="primary" disabled={busy}>Sign in</button></form></section>;
return <section><div className="title-row"><div><p className="eyebrow">ADMIN WORKSPACE</p><h1>Standards & versions</h1><p>Edit a draft, balance the points, then publish. Existing projects keep their version.</p></div><button className="secondary" onClick={()=>{if(dirty&&!window.confirm('Discard unsaved edits and sign out?'))return;sessionStorage.removeItem('green-admin');setToken('');setDraft(null);setDirty(false);}}>Sign out</button></div>{error&&<div className="error" role="alert">{error}</div>}{message&&<p role="status" className="success">{message}</p>}
<div className="card"><h2>Create a new version</h2><div className="admin-grid"><label>Copy from<select value={source} onChange={e=>setSource(e.target.value)}>{standards.map(s=><option key={s.id} value={s.id}>{s.label} ({s.status})</option>)}</select></label><label>New version name<input placeholder="e.g. New Buildings v4 draft" value={label} onChange={e=>setLabel(e.target.value)}/></label><label>Building type<input value={buildingType} onChange={e=>setBuildingType(e.target.value)} placeholder="new, existing, or a new type"/></label></div><button disabled={busy||!label.trim()||!buildingType.trim()} className="primary" onClick={()=>{if(dirty&&!window.confirm('Discard unsaved edits and create another draft?'))return;void work(async()=>{const d=await api('/admin/drafts',{sourceId:source,label,buildingType},token);setDraft(d);setDirty(false);await load();});}}>Create draft</button></div>
<div className="version-list">{standards.map(s=><button className={draft?.id===s.id?'version selected':'version'} key={s.id} onClick={()=>open(s)}><strong>{s.label}</strong><small>{s.buildingType} · {s.status} · revision {s.revision}</small></button>)}</div>
{draft&&<><div className="card"><div className="section-title"><h2>{draft.status==='draft'?'Edit draft':'Published version — read only'}</h2><div style={pointCounterStyle} role="status">
  <div>Credit points: {creditTotal} / 100</div>
  <div>Category allocations: {categoryTotal} / 100</div>

  {!pointsBalanced && (
    <small>
      Warning: both totals must equal exactly 100.
    </small>
  )}
</div></div><p>All supplied rules remain demonstrations. Publishing makes this version available for new projects; it does not certify its compliance logic.</p><fieldset className="admin-fields" disabled={draft.status!=='draft'||busy}><label>Version name<input value={draft.label} onChange={e=>change(d=>{d.label=e.target.value;})}/></label><label>Building type<input value={draft.buildingType} onChange={e=>change(d=>{d.buildingType=e.target.value;})}/></label><label>Source / notes<textarea value={draft.source||''} onChange={e=>change(d=>{d.source=e.target.value;})}/></label></fieldset><div className="tabs">{draft.categories.map((c:D)=><button className={category===c.id?'secondary selected':'secondary'} onClick={()=>setCategory(c.id)} key={c.id}>{c.id}</button>)}</div></div>
{cat&&<fieldset className="admin-fields" disabled={draft.status!=='draft'||busy}><div className="card"><div className="admin-grid"><label>Category title<input value={cat.title} onChange={e=>change(d=>{d.categories.find((c:D)=>c.id===category).title=e.target.value;})}/></label><label>Maximum category points<input type="number" min="0" step="any" value={cat.maxPoints} onChange={e=>change(d=>{d.categories.find((c:D)=>c.id===category).maxPoints=Number(e.target.value);})}/></label></div></div>{(['prerequisites','credits'] as const).map(group=><div key={group}><div className="section-title"><h2>{group==='prerequisites'?'Prerequisites':'Credits'}</h2><button type="button" className="secondary" onClick={()=>change(d=>{d.categories.find((c:D)=>c.id===category)[group].push({id:category+'-'+crypto.randomUUID().slice(0,8),title:'New '+(group==='credits'?'credit':'prerequisite'),help:'Describe the required supporting documents here.',evidenceRequired:true,fields:[{id:'answer',label:'Requirement met?',type:'yesno',required:true}],rule:{type:'all',conditions:[{field:'answer',operator:'eq',value:'yes'}]},...(group==='credits'?{maxPoints:1}:{})});})}>＋ Add {group==='credits'?'credit':'prerequisite'}</button></div>{cat[group].map((item:D,index:number)=><ItemEditor key={item.id} item={item} credit={group==='credits'} edit={fn=>change(d=>{fn(d.categories.find((c:D)=>c.id===category)[group][index]);})} remove={()=>{if(window.confirm('Remove this item from the draft? Published versions and existing projects are preserved.'))change(d=>{d.categories.find((c:D)=>c.id===category)[group].splice(index,1);});}}/>)}</div>)}</fieldset>}
<div className="card"><h3>Publishing checks</h3>{errors.length?<ul>{errors.map((s:string,i:number)=><li key={i}>{s}</li>)}</ul>:<p className="success">Point allocations and rule definitions pass validation.</p>}<div className="actions"><button className="primary" disabled={busy||draft.status!=='draft'} onClick={()=>void work(async()=>{const r=await api('/admin/standards/'+draft.id,{revision:draft.revision,standard:draft},token);setDraft(r);setDirty(false);await load();setMessage(
  validateStandard(r).length > 0
    ? 'Draft saved with warnings. Review the publishing checks below. Credit points and category allocations must each total exactly 100.'
    : 'Draft saved. All publishing checks passed.'
);})}>Save draft{dirty?' *':''}</button><button className="secondary" disabled={busy||dirty||errors.length>0||draft.status!=='draft'} onClick={()=>void work(async()=>{const r=await api('/admin/standards/'+draft.id+'/publish',{revision:draft.revision},token);setDraft(r);await load();setMessage('Version published for new projects. Existing projects were not changed.');})}>Publish version</button><button className="secondary" onClick={()=>{const blob=new Blob([JSON.stringify(draft,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='standard-'+draft.id+'.json';a.click();URL.revokeObjectURL(url);}}>Export JSON</button><label className="import-label">Import configuration<input type="file" accept=".json" disabled={draft.status!=='draft'} onChange={async e=>{try{const file=e.target.files?.[0];if(!file)return;if(file.size>2*1024*1024)throw Error('Configuration must be under 2 MB.');const parsed=JSON.parse(await file.text());if(!hasStandardShape(parsed))throw Error('Invalid configuration structure. Export an existing standard as a reference.');change(d=>{Object.assign(d,parsed,{id:d.id,revision:d.revision,status:'draft',demo:true});});}catch(e){setError((e as Error).message);}}}/></label><button className="danger" disabled={busy||draft.status!=='draft'} onClick={()=>{if(!window.confirm('Delete this draft?'))return;void work(async()=>{await api('/admin/standards/'+draft.id,undefined,token,'DELETE');setDraft(null);setDirty(false);await load();});}}>Delete draft</button></div>{dirty&&<p>Save the draft before publishing. Changes are not yet stored.</p>}</div></>}
</section>;
}
function ItemEditor({item,credit,edit,remove}:{item:D;credit:boolean;edit:(fn:(i:D)=>void)=>void;remove:()=>void}){
return <details className="card editor-item"><summary>{item.title} {credit?`· ${item.maxPoints} points`:''}</summary><div className="admin-grid"><label>Title<input value={item.title} onChange={e=>edit(i=>{i.title=e.target.value;})}/></label>{credit&&<label>Maximum credit points<input type="number" min="0" step="any" value={item.maxPoints} onChange={e=>edit(i=>{i.maxPoints = Number(e.target.value);
i.selectablePoints = false;})}/></label>}</div><DocumentOptionsEditor item={item} edit={edit}/><label>
  Intent / objective
  <textarea
    value={item.intent || ''}
    placeholder="Explain the purpose of this prerequisite or credit."
    onChange={e =>
      edit(i => {
        i.intent = e.target.value;
      })
    }
  />
</label><label>Document help — shown when the user clicks (?)<textarea value={item.help||''} onChange={e=>edit(i=>{i.help=e.target.value;})}/></label><label className="checkbox"><input type="checkbox" checked={item.evidenceRequired!==false} onChange={e=>edit(i=>{i.evidenceRequired=e.target.checked;})}/> Evidence required for achievement / points</label><h3>Input fields</h3>{item.fields.map((f:D,index:number)=><div className="field-editor" key={index}><label>Field ID<input value={f.id} onChange={e=>edit(i=>{i.fields[index].id=e.target.value;})}/></label><label>Label<input value={f.label} onChange={e=>edit(i=>{i.fields[index].label=e.target.value;})}/></label><label>Type<select value={f.type} onChange={e=>edit(i=>{i.fields[index].type=e.target.value;if(e.target.value==='select')i.fields[index].options=['Option 1','Option 2'];})}><option value="yesno">Yes / No</option><option value="number">Number</option><option value="text">Text</option><option value="select">Selection</option></select></label><label>Unit<input value={f.unit||''} placeholder="e.g. %" onChange={e=>edit(i=>{i.fields[index].unit=e.target.value;})}/></label>{f.type==='select'&&<label>Options (one per line)<textarea value={(f.options||[]).join('\n')} onChange={e=>edit(i=>{i.fields[index].options=e.target.value.split('\n');})}/></label>}<label className="checkbox"><input type="checkbox" checked={f.required!==false} onChange={e=>edit(i=>{i.fields[index].required=e.target.checked;})}/>Required</label><button type="button" className="danger" onClick={()=>edit(i=>{i.fields.splice(index,1);})}>Remove field</button></div>)}<button type="button" className="secondary" onClick={()=>edit(i=>{i.fields.push({id:'field_'+Math.random().toString(36).slice(2,8),label:'New field',type:'number',required:true});})}>＋ Add field</button><h3>Achievement / scoring rule</h3><label>Rule type<select value={item.rule.type} onChange={e=>edit(i=>{i.rule=e.target.value==='thresholds'?{type:'thresholds',field:i.fields.find((f:D)=>f.type==='number')?.id||'',bands:[{min:0,points:0}]}:{type:e.target.value,conditions:[{field:i.fields[0]?.id||'',operator:'eq',value:'yes',...(e.target.value==='sum'?{points:1}:{})}]};})}><option value="all">All conditions must pass — full points</option><option value="any">Any condition must pass — full points</option><option value="thresholds">Number thresholds — highest eligible points</option><option value="sum">Add points for matching conditions — capped at maximum</option></select></label>{item.rule.type==='thresholds'?<><label>Number field<select value={item.rule.field} onChange={e=>edit(i=>{i.rule.field=e.target.value;})}><option value="">Select field</option>{item.fields.filter((f:D)=>f.type==='number').map((f:D)=><option key={f.id} value={f.id}>{f.label} ({f.id})</option>)}</select></label>{item.rule.bands.map((b:D,index:number)=><div className="admin-grid" key={index}><label>At least<input type="number" step="any" value={b.min} onChange={e=>edit(i=>{i.rule.bands[index].min=Number(e.target.value);})}/></label><label>Points<input type="number" step="any" min="0" value={b.points} onChange={e=>edit(i=>{i.rule.bands[index].points=Number(e.target.value);})}/></label><button className="danger" type="button" onClick={()=>edit(i=>{i.rule.bands.splice(index,1);})}>Remove band</button></div>)}<button type="button" className="secondary" onClick={()=>edit(i=>{i.rule.bands.push({min:0,points:0});})}>Add threshold</button></>:<>{item.rule.conditions.map((c:D,index:number)=><div className="field-editor" key={index}><label>Field<select value={c.field} onChange={e=>edit(i=>{i.rule.conditions[index].field=e.target.value;})}>{item.fields.map((f:D)=><option key={f.id} value={f.id}>{f.label} ({f.id})</option>)}</select></label><label>Condition<select value={c.operator} onChange={e=>edit(i=>{i.rule.conditions[index].operator=e.target.value;})}>{[['eq','Equals'],['neq','Does not equal'],['gte','At least ≥'],['lte','At most ≤'],['gt','Greater than >'],['lt','Less than <'],['notEmpty','Has a value']].map(([v,t])=><option key={v} value={v}>{t}</option>)}</select></label>{c.operator!=='notEmpty'&&<label>Value<input value={c.value??''} onChange={e=>edit(i=>{i.rule.conditions[index].value=e.target.value;})}/></label>}{item.rule.type==='sum'&&<label>Points<input type="number" min="0" step="any" value={c.points||0} onChange={e=>edit(i=>{i.rule.conditions[index].points=Number(e.target.value);})}/></label>}<button type="button" className="danger" onClick={()=>edit(i=>{i.rule.conditions.splice(index,1);})}>Remove condition</button></div>)}<button type="button" className="secondary" onClick={()=>edit(i=>{i.rule.conditions.push({field:i.fields[0]?.id||'',operator:'eq',value:'yes',...(i.rule.type==='sum'?{points:1}:{})});})}>Add condition</button></>}<div className="actions"><small>Stable item ID: {item.id}</small><button type="button" className="danger" onClick={remove}>Delete item</button></div></details>;
}

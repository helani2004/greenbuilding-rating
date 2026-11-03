import http from 'node:http';
import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import {randomUUID,randomBytes,timingSafeEqual} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {evaluate,validateStandard,hasStandardShape} from '../shared/engine.mjs';
const seeds=JSON.parse(await readFile(new URL('../shared/seeds.json',import.meta.url),'utf8'));
const data=resolve(process.env.DATA_DIR||fileURLToPath(new URL('../data/',import.meta.url)))+'/';await mkdir(data,{recursive:true});
const dbPath=data+'store.json';let db;try{db=JSON.parse(await readFile(dbPath,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;db={projects:{},files:{}};}
db.standards||={};for(const s of seeds)if(!db.standards[s.id])db.standards[s.id]=s;
const persist=async next=>{await writeFile(dbPath+'.tmp',JSON.stringify(next,null,2));await rename(dbPath+'.tmp',dbPath);db=next;};await persist(db);
const password=process.env.ADMIN_PASSWORD||randomBytes(9).toString('base64url');const sessions=new Map();
const standardFor=p=>{const s=db.standards[p.standardId];if(!s)throw Error('Project standard version was not found.');return s;};
const view=p=>({...p,standard:standardFor(p),result:evaluate(standardFor(p),p.answers)});
const publicStandards=()=>Object.values(db.standards).filter(s=>s.status==='published').map(({categories,...s})=>s);
function send(res,status,value){res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(value));}
async function body(req){let chunks=[],size=0;for await(const c of req){size+=c.length;if(size>45*1024*1024)throw Error('Category upload too large. Save smaller files or save items separately (30 MB combined file limit).');chunks.push(c);}try{return JSON.parse(Buffer.concat(chunks).toString()||'{}');}catch{throw Error('Invalid JSON request.');}}
function admin(req){const t=req.headers.authorization?.replace(/^Bearer /,'');if(!t||!sessions.has(t)||sessions.get(t)<Date.now()){const e=Error('Admin sign-in required.');e.status=401;throw e;}}
const safeText=(v,max)=>typeof v==='string'&&v.trim()&&v.length<=max;
function validateValues(item,values){if(!values||typeof values!=='object'||Array.isArray(values))throw Error('Invalid field values.');for(const [key,val]of Object.entries(values)){const f=item.fields.find(f=>f.id===key);if(!f)throw Error('Unknown field: '+key);if(val===''||val==null)continue;if(!['string','number'].includes(typeof val)||String(val).length>10000)throw Error('Invalid field value.');if(f.type==='yesno'&&!['yes','no'].includes(val))throw Error('Choose Yes or No.');if(f.type==='number'&&!Number.isFinite(Number(val)))throw Error('Enter a valid number.');if(f.type==='select'&&!f.options.includes(val))throw Error('Choose an available option.');}}
async function saveAnswers(project,category,entries,markSaved){
 if(!Array.isArray(entries)||entries.length>200)throw Error('Invalid answers.');const next=structuredClone(db);const p=next.projects[project.id];const standard=standardFor(project);const seen=new Set();let totalBytes=0;const uploads=[];
 const ordered=[...entries].sort((a,b)=>Number(category.credits.some(i=>i.id===a.itemId))-Number(category.credits.some(i=>i.id===b.itemId)));
 for(const entry of ordered){const item=[...category.prerequisites,...category.credits].find(i=>i.id===entry.itemId);if(!item||seen.has(item.id))throw Error('Unknown or duplicate category item.');seen.add(item.id);const values=entry.values||{answer:entry.answer};validateValues(item,values);
  const prior=p.answers[item.id];const isCredit=category.credits.some(i=>i.id===item.id);const changed=JSON.stringify(values)!==JSON.stringify(prior?.values||{answer:prior?.answer})||entry.file;
  if(isCredit&&!evaluate(standard,p.answers).categories.find(c=>c.id===category.id).unlocked&&changed)throw Error('Save achieved prerequisites before editing credits.');
  let evidenceId=prior?.evidenceId||null;if(entry.file){const f=entry.file;if(typeof f.name!=='string'||typeof f.base64!=='string'||!f.base64.length||!/^[A-Za-z0-9+/]*={0,2}$/.test(f.base64))throw Error('Invalid file.');const bytes=Buffer.from(f.base64,'base64');if(!bytes.length||bytes.length>5*1024*1024)throw Error('Each file must be between 1 byte and 5 MB.');totalBytes+=bytes.length;if(totalBytes>30*1024*1024)throw Error('Combined files exceed 30 MB. Save some items separately.');evidenceId=randomUUID();uploads.push([evidenceId,bytes]);next.files[evidenceId]={id:evidenceId,projectId:p.id,name:f.name.slice(0,180),size:bytes.length};}
  p.answers[item.id]={values,answer:values.answer,evidenceId,evidenceName:evidenceId?next.files[evidenceId]?.name:null,savedAt:new Date().toISOString()};
 }
 if(markSaved){p.categorySavedAt||={};p.categorySavedAt[category.id]=new Date().toISOString();}for(const [id,bytes]of uploads)await writeFile(data+id,bytes);await persist(next);return view(db.projects[p.id]);
}
async function handle(req,res){try{
 const path=new URL(req.url,'http://localhost').pathname;
 if(req.headers.origin&&req.headers.origin!=='http://terminal.local:4173'&&!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(req.headers.origin))return send(res,403,{error:'Local access only.'});
 if(req.method==='GET'&&path==='/api/health')return send(res,200,{status:'ok'});
 if(req.method==='POST'&&path==='/api/admin/login'){const b=await body(req);const a=Buffer.from(String(b.password||'')),v=Buffer.from(password);if(a.length!==v.length||!timingSafeEqual(a,v))return send(res,401,{error:'Incorrect admin password. Use the password shown in the server terminal.'});const token=randomBytes(32).toString('hex');sessions.set(token,Date.now()+8*3600000);return send(res,200,{token});}
 if(path.startsWith('/api/admin/')){
  admin(req);
  if(req.method==='GET'&&path==='/api/admin/standards')return send(res,200,Object.values(db.standards));
  if(req.method==='POST'&&path==='/api/admin/drafts'){
   const b=await body(req);const source=db.standards[b.sourceId];if(!source)throw Error('Choose a source version.');const draft=structuredClone(source);Object.assign(draft,{id:randomUUID(),label:b.label||source.label+' — draft',buildingType:b.buildingType||source.buildingType,status:'draft',revision:1});const next=structuredClone(db);next.standards[draft.id]=draft;await persist(next);return send(res,201,draft);
  }
  const m=path.match(/^\/api\/admin\/standards\/([A-Za-z0-9_-]+)(\/publish)?$/);if(m&&req.method==='POST'){
   const b=await body(req),old=db.standards[m[1]];if(!old||old.status!=='draft')throw Error('Only draft versions can be edited. Clone a published version first.');if(b.revision!==old.revision)return send(res,409,{error:'Draft changed. Reload the admin area before editing.'});
   const next=structuredClone(db);let updated;if(m[2]){const errors=validateStandard(old);if(errors.length)return send(res,400,{error:errors.join('\n')});updated={...old,status:'published',revision:old.revision+1,publishedAt:new Date().toISOString()};}
   else{const s=b.standard;if(!hasStandardShape(s))throw Error('Invalid standard structure. Keep eight categories, valid field lists and rule definitions.');updated={...s,id:old.id,status:'draft',revision:old.revision+1,demo:true};}
   next.standards[old.id]=updated;await persist(next);return send(res,200,updated);
  }
  if(m&&req.method==='DELETE'){const old=db.standards[m[1]];if(!old||old.status!=='draft')throw Error('Only drafts can be deleted.');const next=structuredClone(db);delete next.standards[old.id];await persist(next);return send(res,200,{ok:true});}
 }
 if(req.method==='GET'&&path==='/api/standards')return send(res,200,publicStandards());
 if(req.method==='GET'&&path==='/api/projects')return send(res,200,Object.values(db.projects).map(view));
 if(req.method==='POST'&&path==='/api/projects'){const b=await body(req),s=db.standards[b.standardId];if(!safeText(b.name,160))throw Error('Enter a project name (up to 160 characters).');if(!s||s.status!=='published')throw Error('Choose a published version.');const p={id:randomUUID(),name:b.name.trim(),buildingType:s.buildingType,standardId:s.id,answers:{},categorySavedAt:{},createdAt:new Date().toISOString()};const next=structuredClone(db);next.projects[p.id]=p;await persist(next);return send(res,201,view(p));}
 const m=path.match(/^\/api\/projects\/([a-f0-9-]+)\/(categories\/([A-Z]{2})|answers)$/);
 if(req.method==='POST'&&m){const p=db.projects[m[1]];if(!p)return send(res,404,{error:'Project not found.'});const b=await body(req);const s=standardFor(p);const c=s.categories.find(c=>m[3]?c.id===m[3]:[...c.prerequisites,...c.credits].some(i=>i.id===b.itemId));if(!c)throw Error('Category not found.');return send(res,200,await saveAnswers(p,c,m[3]?b.answers:[b],Boolean(m[3])));}
 const f=path.match(/^\/api\/projects\/([a-f0-9-]+)\/evidence\/([a-f0-9-]+)$/);
 if(req.method==='GET'&&f){const file=db.files[f[2]];if(!file||file.projectId!==f[1])return send(res,404,{error:'File not found.'});const bytes=await readFile(data+file.id);res.writeHead(200,{'Content-Type':'application/octet-stream','X-Content-Type-Options':'nosniff','Content-Disposition':`attachment; filename="evidence"; filename*=UTF-8''${encodeURIComponent(file.name).replace(/'/g,'%27')}`});return res.end(bytes);}
 return send(res,404,{error:'Endpoint not found.'});
}catch(e){send(res,e.status||400,{error:e.message});}}
let queue=Promise.resolve();http.createServer((req,res)=>{queue=queue.then(()=>handle(req,res)).catch(e=>{console.error(e);if(!res.headersSent)send(res,500,{error:'Server error.'});});}).listen(Number(process.env.PORT||3001),'127.0.0.1',()=>{console.log('Assessment API: http://127.0.0.1:'+(process.env.PORT||3001));console.log('Local admin password: '+password);console.log('Keep this terminal open. Admin password changes on restart unless ADMIN_PASSWORD is set.');});

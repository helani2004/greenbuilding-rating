import test from 'node:test';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';
test('API preserves legacy records, saves categories atomically and isolates published versions',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'green-test-'));const legacyId='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';await writeFile(join(directory,'store.json'),JSON.stringify({projects:{[legacyId]:{id:legacyId,name:'Legacy project',standardId:'new-v3-beta-demo-1',buildingType:'new',answers:{'MN-P1':{answer:'yes',evidenceId:'old-file',evidenceName:'old.txt'}}}},files:{'old-file':{id:'old-file',projectId:legacyId,name:'old.txt'}}}));
 let child;const start=async()=>{child=spawn(process.execPath,['server/index.mjs'],{env:{...process.env,DATA_DIR:directory,PORT:'3017',ADMIN_PASSWORD:'integration-test'}});await new Promise((resolve,reject)=>{child.stdout.once('data',resolve);child.once('error',reject);child.once('exit',()=>reject(Error('Server exited')));});};
 const call=async(path,body,token,method)=>{const r=await fetch('http://127.0.0.1:3017/api'+path,{method:method||(body?'POST':'GET'),headers:{...(body?{'Content-Type':'application/json'}:{}),...(token?{Authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{})});return {status:r.status,data:await r.json()};};
 try{await start();const old=(await call('/projects')).data[0];assert.equal(old.answers['MN-P1'].evidenceName,'old.txt');assert.equal(old.standard.id,'new-v3-beta-demo-1');
 assert.equal((await call('/admin/standards')).status,401);const token=(await call('/admin/login',{password:'integration-test'})).data.token;
 let p=(await call('/projects',{name:'Eight categories',standardId:'new-demo-2'})).data;const category='/projects/'+p.id+'/categories/MN';
 assert.equal((await call(category,{answers:[{itemId:'MN-C1',values:{answer:'yes'}}]})).status,400);
 const file={name:'proof.txt',base64:Buffer.from('evidence').toString('base64')};p=(await call(category,{answers:[1,2,3,4].map(n=>({itemId:'MN-P'+n,values:{answer:'yes'},file}))})).data;assert.equal(p.result.categories[0].unlocked,true);assert.ok(p.categorySavedAt.MN);
 p=(await call(category,{answers:[{itemId:'MN-C1',values:{answer:'yes'},file}]})).data;assert.equal(p.result.total,1);
 const evidenceResponse=await fetch('http://127.0.0.1:3017/api/projects/'+p.id+'/evidence/'+p.answers['MN-C1'].evidenceId);assert.equal(await evidenceResponse.text(),'evidence');
 const bad=await call(category,{answers:[{itemId:'MN-P1',values:{answer:'no'}},{itemId:'bad',values:{answer:'yes'}}]});assert.equal(bad.status,400);assert.equal((await call('/projects')).data.find(v=>v.id===p.id).result.total,1);
 p=(await call(category,{answers:[{itemId:'MN-P1',values:{answer:'no'}}]})).data;assert.equal(p.result.total,0);
 let draft=(await call('/admin/drafts',{sourceId:'new-demo-2',label:'Next version',buildingType:'new'},token)).data;draft.categories[0].prerequisites[0].help='Updated evidence guidance';let saved=await call('/admin/standards/'+draft.id,{revision:draft.revision,standard:draft},token);draft=saved.data;
 assert.equal((await call('/admin/standards/'+draft.id,{revision:1,standard:draft},token)).status,409);
 assert.equal((await call('/admin/standards/'+draft.id+'/publish',{revision:draft.revision},token)).status,200);
 assert.equal((await call('/admin/standards/'+draft.id,{revision:99,standard:draft},token)).status,400);
 const pinned=(await call('/projects')).data.find(v=>v.id===p.id);assert.equal(pinned.standard.id,'new-demo-2');assert.notEqual(pinned.standard.categories[0].prerequisites[0].help,'Updated evidence guidance');
 const existing=(await call('/projects',{name:'Existing building',standardId:'existing-demo-2'})).data;assert.equal(existing.result.categories[1].unlocked,true);
 child.kill();await new Promise(resolve=>child.once('exit',resolve));await start();assert.ok((await call('/projects')).data.find(v=>v.id===p.id).categorySavedAt.MN);assert.ok(JSON.parse(await readFile(join(directory,'store.json'),'utf8')).standards[draft.id]);
 }finally{if(child?.exitCode===null){child.kill();await new Promise(resolve=>child.once('exit',resolve));}await rm(directory,{recursive:true,force:true});}
});

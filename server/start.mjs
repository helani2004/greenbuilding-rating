import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const children=[spawn(process.execPath,[fileURLToPath(new URL('./index.mjs',import.meta.url))],{stdio:'inherit'}),spawn(process.execPath,[fileURLToPath(new URL('../node_modules/vite/bin/vite.js',import.meta.url)),'--host','127.0.0.1',...process.argv.slice(2)],{stdio:'inherit'})];
let stopping=false;function stop(code=0){if(stopping)return;stopping=true;for(const child of children)child.kill();setTimeout(()=>process.exit(code),150);}
for(const c of children){c.on('error',e=>{console.error(e.message);stop(1);});c.on('exit',code=>stop(code||0));}process.on('SIGINT',()=>stop());process.on('SIGTERM',()=>stop());

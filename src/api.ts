export async function api(path:string,body?:unknown,token?:string,method?:string){
 let response:Response;try{response=await fetch('/api'+path,{method:method||(body?'POST':'GET'),headers:{...(body?{'Content-Type':'application/json'}:{}),...(token?{Authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{})});}catch{throw Error('Cannot reach the backend. Keep npm run server running in another terminal.');}
 const text=await response.text();let data;try{data=JSON.parse(text);}catch{throw Error('The backend did not return data. Start npm run server in another terminal, then refresh this page.');}if(!response.ok)throw Error(data.error||'Request failed.');return data;
}

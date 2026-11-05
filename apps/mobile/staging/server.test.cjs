const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const { mkdtemp, rm } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { request } = require('node:http');
const { setTimeout: delay } = require('node:timers/promises');
const { env, execPath } = require('node:process');

// Run after the web export. Fixed port is exclusively for this isolated test.
test('staging preserves HTTPS origin, isolates database, enforces proxy and persists guests', {timeout:20000}, async () => {
  const folder=await mkdtemp(path.join(tmpdir(),'mobile-stage-'));
  let child;
  async function start() {
    child=spawn(execPath,['apps/mobile/staging/server.mjs'],{env:{...env,MOBILE_TEST_ORIGIN:'https://mobile-test.example.com',MOBILE_TEST_DATABASE:path.join(folder,'duels.sqlite'),MOBILE_TEST_PORT:'18097'},stdio:['ignore','pipe','pipe']});
    await Promise.race([once(child.stdout,'data'),once(child,'exit').then(()=>{throw Error('Test server exited');}),delay(5000).then(()=>{throw Error('Server start timeout');})]);
  }
  async function stop() {const closed=once(child,'exit');child.kill('SIGTERM');await closed;}
  const call=(url,body,token,headers={})=>new Promise((resolve,reject)=>{
    const req=request({hostname:'127.0.0.1',port:18097,path:url,method:body===undefined?'GET':'POST',headers:{Host:'mobile-test.example.com','X-Real-IP':'192.0.2.1',...(body===undefined?{}:{'Content-Type':'application/json',Origin:'https://mobile-test.example.com'}),...(token?{Authorization:`Bearer ${token}`} : {}),...headers}},res=>{let data='';res.on('data',chunk=>{data+=chunk;});res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,data}));});req.on('error',reject);req.end(body===undefined?undefined:JSON.stringify(body));
  });
  try {
    await start();
    assert.equal((await call('/healthz')).status,200);
    assert.equal((await call('/missing-file')).status,404);
    assert.equal((await call('/healthz',undefined,null,{'X-Real-IP':'forged'})).status,400);
    assert.equal((await call('/healthz',undefined,null,{Host:'wrong.example.com'})).status,400);
    const home=await call('/');assert.equal(home.status,200);assert.match(home.headers['x-robots-tag'],/noindex/);
    const a=JSON.parse((await call('/api/v1/guest-duels/sessions',{})).data).token;
    const b=JSON.parse((await call('/api/v1/guest-duels/sessions',{})).data).token;
    assert.equal((await call('/api/v1/guest-duels/sessions',{},null,{Origin:'https://wrong.example.com'})).status,403);
    const source={sourceKey:'test',title:'Staging',goal:'Bewegen',rules:['Täglich'],definition:{type:'daily_boolean',unit:'completion',targetValue:1,frequency:'daily',direction:'at_least',completionCriterion:'daily_check_in'}};
    const created=await call('/api/v1/guest-duels',{source,name:'Host',days:1,requestId:randomUUID()},a);assert.equal(created.status,200);const duel=JSON.parse(created.data);
    assert.equal((await call(`/api/v1/guest-duels/${duel.id}`,undefined,b)).status,404);
    const invite=JSON.parse((await call(`/api/v1/guest-duels/${duel.id}/invite`,{},a)).data).token;
    assert.equal((await call('/api/v1/guest-duels/join',{token:invite,name:'Guest'},b)).status,200);
    await call(`/api/v1/guest-duels/${duel.id}/start`,{},a);
    await call(`/api/v1/guest-duels/${duel.id}/entries`,{requestId:randomUUID(),value:null},a);
    await call(`/api/v1/guest-duels/${duel.id}/finish`,{},a);
    const finished=JSON.parse((await call(`/api/v1/guest-duels/${duel.id}/finish`,{},b)).data);assert.equal(finished.status,'completed');assert.equal(finished.result.winnerId,finished.members[0].id);
    await stop();await start();
    assert.equal(JSON.parse((await call('/api/v1/guest-duels',undefined,a)).data)[0].id,duel.id);
  } finally {if(child&&child.exitCode===null)await stop();await rm(folder,{recursive:true,force:true});}
});

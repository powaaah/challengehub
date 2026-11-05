import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { createChallengeDefinition, parseChallengeDefinition, calculateChallengeOutcome } from '../domain/challenges/competition-definition.ts';
import { GuestDuels } from '../lib/guest-duels.ts';

const definition = createChallengeDefinition({type:'one_time_result',unit:'repetitions',direction:'maximize',targetValue:null})!;
test('maximum has no target, best value, completion or percentage; parser rejects invalid combinations',()=>{
  assert.deepEqual(parseChallengeDefinition(JSON.parse(JSON.stringify(definition))),definition);
  for(const patch of [{targetValue:100},{targetValue:undefined},{type:'cumulative_metric'},{unit:'completion'},{frequency:'daily'},{completionCriterion:'single_result'}]) assert.equal(parseChallengeDefinition({...definition,...patch}),null);
  const result=calculateChallengeOutcome({definition,checkIns:[{date:'2026-11-04',value:40},{date:'2026-11-04',value:60},{date:'2026-11-04',value:50}]});
  assert.equal(result.value,60);assert.equal(result.completed,false);assert.equal(result.completionRate,null);
  assert.equal(calculateChallengeOutcome({definition,checkIns:[]}).label,'Noch kein Ergebnis');
});
test('maximum duel persists definition and ranks highest individual attempt',()=>{
  const db=new DatabaseSync(':memory:');
  try {const s=new GuestDuels(db),a=s.authenticate(s.session().token),b=s.authenticate(s.session().token);
    const duel=s.create(a,{source:{sourceKey:'local:max',title:'Max Liegestütze',goal:'Bestleistung',rules:['10 Minuten pro Versuch'],definition},name:'Anna',days:1,requestId:randomUUID()});
    s.join(b,s.invite(a,duel.id).token,'Ben');s.start(a,duel.id);
    for(const value of [40,60,50])s.entry(a,duel.id,{requestId:randomUUID(),value});
    s.entry(b,duel.id,{requestId:randomUUID(),value:70});
    s.finish(a,duel.id);const result=s.finish(b,duel.id);
    assert.equal(result.members[0].value,60);assert.equal(result.members[1].value,70);assert.equal(result.result?.winnerId,result.members[1].id);assert.deepEqual(result.source.definition,definition);
  }finally{db.close();}
});

test('minimum selects lowest positive value, remains open and survives parsing',()=>{
  const minimum=createChallengeDefinition({type:'one_time_result',unit:'seconds',direction:'minimize',targetValue:null})!;
  assert.deepEqual(parseChallengeDefinition(JSON.parse(JSON.stringify(minimum))),minimum);
  assert.equal(parseChallengeDefinition({...minimum,targetValue:300}),null);
  const result=calculateChallengeOutcome({definition:minimum,checkIns:[300,240,270,0,-1].map(value=>({date:'2026-11-05',value}))});
  assert.equal(result.value,240);assert.equal(result.completed,false);assert.equal(result.completionRate,null);
  assert.equal(calculateChallengeOutcome({definition:minimum,checkIns:[]}).value,0);
});
test('minimum duel: fastest valid result wins, missing result never beats a time, equal bests tie',()=>{
  for(const opponent of [null,230,240]){
    const db=new DatabaseSync(':memory:');
    try {const s=new GuestDuels(db),a=s.authenticate(s.session().token),b=s.authenticate(s.session().token);
      const minimum=createChallengeDefinition({type:'one_time_result',unit:'seconds',direction:'minimize',targetValue:null})!;
      const d=s.create(a,{source:{sourceKey:'local:min',title:'Schnellste Zeit',goal:'So schnell wie möglich',rules:['Vollständige Aufgabe in maximal fünf Minuten'],definition:minimum},name:'Anna',days:1,requestId:randomUUID()});
      s.join(b,s.invite(a,d.id).token,'Ben');s.start(a,d.id);
      for(const value of [280,240,260])s.entry(a,d.id,{requestId:randomUUID(),value});
      assert.throws(()=>s.entry(b,d.id,{requestId:randomUUID(),value:0}));
      if(opponent!==null)s.entry(b,d.id,{requestId:randomUUID(),value:opponent});
      s.finish(a,d.id);const result=s.finish(b,d.id);
      assert.equal(result.members[0].value,240);assert.equal(result.result?.tie,opponent===240);
      assert.equal(result.result?.winnerId,opponent===240?null:result.members[opponent===230?1:0].id);
    } finally {db.close();}
  }
});

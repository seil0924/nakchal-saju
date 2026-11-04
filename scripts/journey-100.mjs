// HTTP journey audit. This is not 100 browser sessions or a production load test.
// Run against an isolated, unconfigured Next dev server: node scripts/journey-100.mjs http://127.0.0.1:3010 <output.json>
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
const base = process.argv[2] || 'http://127.0.0.1:3010';
const origin = new URL(base);
assert(['127.0.0.1', 'localhost'].includes(origin.hostname) && origin.protocol === 'http:', 'Local isolated server only');
const withPayments = process.argv.includes('--with-mock-payments');
const output = process.argv[3] || 'journey-100-result.json';
const routes = [
  {name:'홈 → 투찰 택일',pages:['/'],cat:'sajeong'},
  {name:'전체 메뉴 → 대표 사주',pages:['/more','/product/daepyo'],cat:'daepyo'},
  {name:'요금 안내 → 투찰 택일',pages:['/pricing','/product/taekil'],cat:'sajeong'},
  {name:'리포트 예시 → 대표 사주',pages:['/samples?product=daepyo'],cat:'daepyo'},
  {name:'대표 상품 직접 방문',pages:['/product/daepyo'],cat:'daepyo'},
  {name:'택일 상품 직접 방문',pages:['/product/taekil'],cat:'sajeong'},
  {name:'닮은 CEO → 대표 사주',pages:['/ceo'],cat:'daepyo',source:'ceo',q:'ceo',dynamic:true},
  {name:'대표 유형 → 대표 사주',pages:['/sajang'],cat:'daepyo',source:'sajang',dynamic:true},
  {name:'칼럼 → 무료 풀이',pages:['/column/ipchun-gijun'],cat:'daepyo',generic:true},
  {name:'입찰 가이드 → 무료 풀이',pages:['/guide/입찰-사주'],cat:'sajeong',generic:true},
  {name:'지역 페이지 → 무료 풀이',pages:['/region/서울'],cat:'sajeong',generic:true},
  {name:'업종 페이지 → 무료 풀이',pages:['/industry/전기공사'],cat:'sajeong',generic:true},
  {name:'사주 설명 → 무료 풀이',pages:['/saju/갑목-일간'],cat:'daepyo',generic:true},
  {name:'이달 캘린더 상품',pages:['/product/calendar'],cat:'calendar'},
  {name:'연간 캘린더 상품',pages:['/product/calendar-year'],cat:'calendar_year'},
  {name:'회사 대운 상품',pages:['/product/daeun'],cat:'daeun',extra:{legal:'2016-02-05',legalName:'점검법인'}},
  {name:'동업·협정 궁합 상품',pages:['/product/gunghap'],cat:'gunghap'},
  {name:'발주처 상품 → 발주처 선택',pages:['/product/balju','/balju'],cat:'balju',dynamic:true,extra:{client:'1969-02-15',clientName:'점검발주처',clientCore:true}},
  {name:'사무실 자리 → 방위 전달',pages:['/jari'],cat:'ijeon',dynamic:true,extra:{jari:{deg:90,km:10,door:2,desk:4}}},
  {name:'계약 택일 → 후보 날짜 비교',pages:['/taekil/계약일'],cat:'bigyo',dynamic:true,extra:{cands:['2027-01-12','2027-01-15','2027-01-18'],purpose:'계약일'}},
];
const modes=withPayments?['무료 확인·새로 열기','입력 수정·구매·재열람','취소·재시도·구매','구매·모바일 복귀·다른 기기 찾기','잘못된 입력 수정·결제 확인 중']:['시간 모름·무료 재열람','음력 입력·생일 수정','자정 전 출생·무료 재열람','자정 후 출생·무료 재열람','잘못된 날짜 수정·무료 재열람'];
const results=[]; const htmlCache=new Map(); const started=new Date().toISOString();
function hrefs(html) { return [...html.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map(m=>m[1].replaceAll('&amp;','&')); }
async function page(path) {
  if(!htmlCache.has(path)) htmlCache.set(path,(async()=>{
    const r=await fetch(new URL(path,base),{signal:AbortSignal.timeout(90000)});
    assert.equal(r.status,200,`page ${path}: ${r.status}`);
    const html=await r.text(); assert(!html.includes('Internal Server Error'),`page ${path}: server error`);
    return {html,url:r.url,links:hrefs(html)};
  })());
  return htmlCache.get(path);
}
async function scenario(route,mode,index) {
  const result={id:index+1,entry:route.name,mode:modes[mode],cat:route.cat,checks:[],requests:[],status:'pass'};
  let cookie='';
  const check=(name,fn)=>{fn();result.checks.push(name);};
  async function request(path,body,expected=200,form=false) {
    const begin=performance.now();
    const r=await fetch(new URL(path,base),{method:body===undefined?'GET':'POST',redirect:'manual',signal:AbortSignal.timeout(90000),
      headers:{...(body===undefined?{}:{'content-type':form?'application/x-www-form-urlencoded':'application/json'}),...(cookie?{cookie}:{}),origin:base},
      body:body===undefined?undefined:form?new URLSearchParams(body):JSON.stringify(body)});
    result.requests.push({path:path.split('?')[0],status:r.status,ms:Math.round(performance.now()-begin)});
    const raw=await r.text(); let data;try{data=JSON.parse(raw);}catch{data=raw;}
    assert.equal(r.status,expected,`${path.split('?')[0]} expected ${expected}, got ${r.status}: ${raw.slice(0,180)}`);
    if(r.headers.get('set-cookie')) cookie=r.headers.get('set-cookie').split(';')[0];
    return {data,location:r.headers.get('location')};
  }
  try {
    const pages=[];for(const p of route.pages) pages.push(await page(p));
    for(let i=0;i<pages.length-1;i++) check('진입 페이지의 실제 다음 링크',()=>assert(pages[i].links.some(h=>h.split('#')[0]===route.pages[i+1]),`${route.pages[i]} lacks ${route.pages[i+1]}`));
    if(route.generic) { const link=pages.at(-1).links.find(h=>h.startsWith('/reading')); assert(link,'No reading link'); const selected=new URL(link,base).searchParams.get('cat'); if(selected) {route={...route,cat:selected,generic:false};result.cat=selected;} }
    const reading='/reading'+(route.generic?'':`?cat=${route.cat}`);
    if(!route.dynamic) check('입력으로 가는 실제 링크',()=>assert(pages.at(-1).links.some(h=>h.split('#')[0]===reading),`${route.pages.at(-1)} lacks ${reading}`));
    await page(reading);
    const source=route.source||'direct';
    const j=['daepyo','sajeong'].includes(route.cat)?{id:randomUUID().replaceAll('-',''),source,cat:route.cat}:null;
    const input={name:`경로점검${index+1}`,birth:`${1960+index%45}-${String(1+index%12).padStart(2,'0')}-${String(1+index%27).padStart(2,'0')}`,
      cal:mode===1?'lunar':'solar',time:[null,'09:20','23:30','00:15','12:00'][mode],cat:route.cat,
      focusId:route.q||(source==='sajang'?['bi','sik','jae','gwan','in'][mode]:undefined),journey:j,...route.extra};
    if(route.cat==='gunghap') Object.assign(input,mode%2?{ally:'2010-03-12',allyName:'점검협정사'}:{partner:'1980-03-12',partnerName:'점검동업자'});
    if(route.cat==='balju' && mode%2) Object.assign(input,{client:'1896-08-04',clientName:'충청북도',clientCore:false});
    if(mode===4) {
      const bad=await request('/api/report',{...input,birth:'1981-02-29'},400);
      check('없는 날짜 거절',()=>assert.equal(bad.data.error,'birth_invalid'));
    }
    if(route.generic) {
      const generic=await request('/api/report',{...input,cat:undefined,journey:null});
      check('통합 무료 결과에서 상품 선택 가능',()=>assert(generic.data.sections.length>0));
    }
    let free=(await request('/api/report',input)).data;
    check('테스트 메모리 저장소 격리',()=>assert(/^r[0-9a-f-]+$/.test(free.reportId),'Not a memory report; refusing payment test'));
    check('무료 결과 생성·유료 잠금',()=>{assert.equal(free.level,0);assert(free.sections.length>0);if(route.cat!=='balju')assert(free.sections.some(s=>!s.html),'No paid section to buy');});
    check('유입 질문·여정 보존',()=>{assert.deepEqual(free.journey,j);if(input.focusId)assert.equal(free.focus.id,input.focusId);});
    if(mode===1) {
      const firstId=free.reportId; input.birth='1988-02-29';input.cal='solar';
      free=(await request('/api/report',input)).data;
      check('입력 수정 후 새 결과',()=>assert.notEqual(free.reportId,firstId));
    }
    result.reportId=free.reportId;result.question=free.focus?.question||null;
    const suffix=`?id=${free.reportId}&t=${free.token}`;
    await request('/api/report/paid'+suffix,undefined,402);
    const reopen=(await request('/api/report/get'+suffix)).data;
    check('무료 재열람 시 질문·잠금 유지',()=>{assert.equal(reopen.level,0);assert.deepEqual(reopen.focus,free.focus);});
    if(!withPayments||mode===0) {await page(`/report/${free.reportId}`);return;}
    const buyer={buyerName:`가상구매자${index+1}`,buyerPhone:`0100000${String(index+1).padStart(4,'0')}`,agree:true};
    const prepare=()=>request('/api/payment/prepare',{reportId:free.reportId,sku:'full',amount:1,...buyer});
    if(mode===4) await request('/api/payment/prepare',{reportId:free.reportId,sku:'full',...buyer,agree:false},400);
    let order=(await prepare()).data;
    check('금액은 서버 상품가로 확정',()=>assert.equal(order.amount,990));
    if(mode===2||mode===4) {
      const callback=await request('/api/payment/kcp/mobile-return',{ordr_idxx:order.paymentId,...(mode===2?{res_cd:'3001'}:{})},303,true);
      const dest=new URL(callback.location);
      check('취소·불확실 결과는 원래 리포트로 복귀',()=>{assert.equal(dest.pathname,`/report/${free.reportId}`);assert.equal(dest.searchParams.get('paid'),'0');assert.equal(dest.searchParams.get('why'),mode===2?'auth:3001':'missing_enc');});
      await page(dest.pathname+dest.search);
      const stillFree=(await request('/api/report/get'+suffix)).data;
      check('취소·확인 중에는 임의 잠금 해제 없음',()=>assert.equal(stillFree.level,0));
      if(mode===4) return;
      order=(await prepare()).data;
    }
    await request('/api/payment/mock-confirm',{paymentId:order.paymentId});
    // Repeat confirmation must not create a second purchase or lose the first one.
    await request('/api/payment/mock-confirm',{paymentId:order.paymentId});
    const paid=(await request('/api/report/paid'+suffix)).data;
    check('결제 완료 후 본문 확장',()=>{assert.equal(paid.level,2);assert(paid.sections.filter(s=>s.html).length>free.sections.filter(s=>s.html).length);});
    check('결제 후 최초 질문·관련 본문 연결',()=>{assert.equal(paid.focus?.question,free.focus?.question);if(paid.focus){assert.equal(paid.focus.open,true);assert(paid.sections.some(s=>s.mk===paid.focus.mk&&s.html));}});
    await request('/api/payment/prepare',{reportId:free.reportId,sku:'full',...buyer},409);
    result.checks.push('이미 구매한 리포트 중복 결제 차단');
    if(mode===3) {
      const callback=await request('/api/payment/kcp/mobile-return',{ordr_idxx:order.paymentId,enc_data:'test-already-paid',enc_info:'test',tran_cd:'test'},303,true);
      const dest=new URL(callback.location);
      check('구매 후 모바일 복귀에 접근 토큰 유지',()=>{assert.equal(dest.pathname,`/report/${free.reportId}`);assert.equal(dest.searchParams.get('paid'),'1');assert.equal(dest.searchParams.get('t'),free.token);});
      cookie='';
      const wrong=(await request('/api/report/find',{name:'일치하지않는구매자',phone:buyer.buyerPhone})).data;
      check('다른 구매자에게 목록 노출 안 함',()=>assert.equal(wrong.reports.length,0));
      const found=(await request('/api/report/find',{name:buyer.buyerName,phone:buyer.buyerPhone})).data;
      check('다른 기기에서 정확히 구매 건 1개 복구',()=>{assert.equal(found.reports.length,1);assert.equal(found.reports[0].id,free.reportId);assert.equal(found.reports[0].token,free.token);});
    }
    const restored=(await request('/api/report/get'+suffix)).data;
    check('재열람 시 구매 권한·질문 유지',()=>{assert.equal(restored.level,2);assert.deepEqual(restored.focus,paid.focus);});
    await page(`/report/${free.reportId}`);
  } catch(e) {result.status='fail';result.error=e.message;}
  finally {results.push(result);console.log(`${result.status.toUpperCase()} ${String(index+1).padStart(3)} ${route.name} / ${modes[mode]}${result.error?' / '+result.error:''}`);}
}
// Warm routes sequentially to distinguish cold compilation from actual response problems.
for(const route of routes) for(const p of route.pages) { try {await page(p);}catch{} }
const tasks=routes.flatMap((route,r)=>modes.map((_,mode)=>()=>scenario(route,mode,r*5+mode)));
let cursor=0;await Promise.all(Array.from({length:5},async()=>{while(cursor<tasks.length){const i=cursor++;await tasks[i]();}}));
results.sort((a,b)=>a.id-b.id);
const summary={started,finished:new Date().toISOString(),base,scope:'100 isolated HTTP journeys, five concurrent; browser UI coverage documented separately; local memory store; payments disabled by default',total:results.length,passed:results.filter(r=>r.status==='pass').length,failed:results.filter(r=>r.status==='fail').length,checks:results.reduce((n,r)=>n+r.checks.length,0),requests:results.reduce((n,r)=>n+r.requests.length,0),results};
await writeFile(output,JSON.stringify(summary,null,2));
console.log(JSON.stringify({...summary,results:undefined}));process.exitCode=summary.failed?1:0;

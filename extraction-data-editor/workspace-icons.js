/* Presentation metadata only: no changes to labels, events, data, permissions or values. */
(()=>{
  const viewIcons={all:['grid','cream'],document:['document','sand'],修改记录:['history','sage'],instruction:['chat','rust'],images:['images','blue']};
  const rules=[
    [/플레이어기본규칙|플레이어설정기본값/,'settings','blue'],
    [/치료|체력|회복|부상|피해|통증|의료|감염/,'health','rust'],[/탄약|탄창|장전|Ammo|Magazine|Reload/i,'ammo','sand'],
    [/무기|사격|총기|Weapon|Projectile/i,'weapon','blue'],[/이동|동선|순찰|경로/,'route','sage'],[/출격|탈출|임무|라운드/,'flag','rust'],
    [/보호|방어|쉴드|실드|헬멧|장갑/,'shield','blue'],
    [/게임.*개요|세계관/, 'globe','blue'],[/캐릭터|플레이어|동료|히로인/,'person','rust'],
    [/맵|레벨.*디자인|지도|구역|스폰|배치/,'map','sage'],[/전투|적.*AI|적.*인식|적행동|보스|진영/,'combat','rust'],
    [/생존.*파밍|배낭|인벤토리|수납|아이템|물품|전리품|Loot/i,'bag','sand'],[/경제|상점|거래|판매|가격|화폐/,'coins','sand'],
    [/성장|퀘스트|레벨|경험치|스킬/,'growth','sage'],[/UI|UX|인터페이스|조작.*표시/,'interface','blue'],
    [/그래픽|연출|조명|재질|셰이더|이펙트/,'graphics','sand'],[/제작|검증|도구|작업.*기록/,'tools','sage'],
    [/인간형|기계형|적기본|적스탯/,'combat','rust']
  ];
  function paint(){
    for(const button of document.querySelectorAll('#views button,#categories button,.sidebar .dataset-button')){
      let pair;
      if(button.closest('#views'))pair=viewIcons[button.dataset.view];
      else if(button.id==='all-data'||button.hasAttribute('data-clearcat'))pair=['grid','cream'];
      if(!pair){
        const label=button.querySelector('.nav-label')?.textContent||button.querySelector(':scope>span:nth-child(2)')?.textContent||button.textContent;
        const compact=label.replace(/[\s·]/g,'');
        const group=button.closest('.dataset-group')?.querySelector('.dataset-group-name')?.textContent?.replace(/[\s·]/g,'')||'';
        const rule=rules.find(([test])=>test.test(compact))||rules.find(([test])=>test.test(group));
        const groupIcon={적:['combat','rust'],의료생존:['health','rust'],전리품:['bag','sand'],스테이지:['flag','rust']}[group];
        pair=rule?rule.slice(1):groupIcon||['settings','blue'];
      }
      if(button.dataset.arcIcon!==pair[0])button.dataset.arcIcon=pair[0];
      if(button.dataset.arcTone!==pair[1])button.dataset.arcTone=pair[1];
    }
  }
  function start(){paint();const observer=new MutationObserver(paint);for(const selector of ['#views','#categories','#dataset-nav']){const root=document.querySelector(selector);if(root)observer.observe(root,{childList:true,subtree:true});}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();

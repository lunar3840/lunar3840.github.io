/* Shared appearance preference. Existing application data and authentication are untouched. */
(()=>{
  const key='extraction.workspace.theme.v1',valid=t=>t==='white'||t==='black';
  let theme='black';
  try{const supplied=new URL(location.href).searchParams.get('theme'),saved=localStorage.getItem(key);theme=valid(supplied)?supplied:valid(saved)?saved:'black';}catch{}
  document.documentElement.dataset.theme=theme;
  function apply(next,persist=true){
    if(!valid(next))return;theme=next;document.documentElement.dataset.theme=theme;
    try{if(persist)localStorage.setItem(key,theme);}catch{}
    for(const button of document.querySelectorAll('.shared-theme-switch button'))button.setAttribute('aria-pressed',String(button.dataset.themeChoice===theme));
    for(const link of document.querySelectorAll('.shared-tabs a')){
      try{const url=new URL(link.href,location.href);if(url.origin===location.origin||['https://extraction-design-library-ehoji.ehojin0415.chatgpt.site','https://extraction-balance-editor.ehojin0415.chatgpt.site'].includes(url.origin)){url.searchParams.set('theme',theme);link.href=url.href;}}catch{}
    }
    const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=theme==='white'?'#e8edf0':'#182333';
    try{const url=new URL(location.href);url.searchParams.set('theme',theme);history.replaceState(history.state,'',url);}catch{}
  }
  function start(){
    const nav=document.querySelector('.shared-header .shared-tabs');
    if(nav&&!document.querySelector('.shared-theme-switch')){
      const tools=document.createElement('div');tools.className='shared-tools';nav.parentNode.insertBefore(tools,nav);tools.appendChild(nav);
      const group=document.createElement('div');group.className='shared-theme-switch';group.setAttribute('role','group');group.setAttribute('aria-label','화면 테마');
      for(const name of ['white','black']){const button=document.createElement('button');button.type='button';button.dataset.themeChoice=name;button.textContent=name==='white'?'White':'Black';button.addEventListener('click',()=>apply(name));group.appendChild(button);}
      tools.appendChild(group);
    }
    apply(theme);
  }
  addEventListener('storage',event=>{if(event.key===key&&valid(event.newValue))apply(event.newValue,false);});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();

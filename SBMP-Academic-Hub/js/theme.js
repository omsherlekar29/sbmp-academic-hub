export function initTheme(){
 const stored=localStorage.getItem('sbmp-theme');
 const prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;
 apply(stored||(prefersDark?'dark':'light'));
 const btn=document.getElementById('theme-toggle');
 if(btn)btn.addEventListener('click',()=>{
  const c=document.documentElement.getAttribute('data-theme')||'light';
  const n=c==='dark'?'light':'dark';apply(n);localStorage.setItem('sbmp-theme',n);
 });
}
function apply(t){document.documentElement.setAttribute('data-theme',t);}
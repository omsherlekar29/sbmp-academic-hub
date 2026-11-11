export function initFeedback(){
 const f=document.getElementById('feedback-form');if(!f)return;
 const s=document.getElementById('feedback-success');
 f.addEventListener('submit',e=>{
  e.preventDefault();
  if(!validate(f))return;
  const field=(n)=>{const el=f.querySelector(`[name="${n}"]`);return el?String(el.value).trim():'';};
  const d={name:field('name'),roll:field('roll'),category:field('category'),type:field('type'),rating:f.querySelector('input[name="rating"]:checked')?.value,message:field('message'),submittedAt:new Date().toISOString()};
  const l=JSON.parse(localStorage.getItem('sbmp-feedback')||'[]');
  l.push(d);localStorage.setItem('sbmp-feedback',JSON.stringify(l));
  f.reset();s.style.display='block';s.scrollIntoView({behavior:'smooth',block:'center'});
  setTimeout(()=>{s.style.display='none';},6000);
 });
 f.addEventListener('reset',()=>{f.querySelectorAll('.field').forEach(x=>x.classList.remove('error'));});
}
function validate(f){
 let ok=true;
 f.querySelectorAll('.field').forEach(x=>x.classList.remove('error'));
 ['name','roll','category','type','message'].forEach(n=>{
  const el=f.querySelector(`[name="${n}"]`);if(!el||!el.value.trim()){el?.closest('.field')?.classList.add('error');ok=false;}
 });
 if(!f.querySelector('input[name="rating"]:checked')){document.getElementById('rating-field')?.classList.add('error');ok=false;}
 return ok;
}
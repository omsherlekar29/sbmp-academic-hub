export function initClock(){
 const t=document.getElementById('clock-time'),d=document.getElementById('clock-date'),p=document.getElementById('clock-period');
 if(!t&&!d)return;
 function upd(){
  const n=new Date();
  if(t){const h24=n.getHours();const m=String(n.getMinutes()).padStart(2,'0');const s=String(n.getSeconds()).padStart(2,'0');const ap=h24>=12?'PM':'AM';const h12=h24%12||12;t.innerHTML=`${String(h12).padStart(2,'0')}:${m}:${s}<span class="ampm">${ap}</span>`;}
  if(d)d.textContent=n.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  if(p)p.textContent=getPeriod(n);
 }
 upd();setInterval(upd,1000);
}
function getPeriod(now){
 const day=now.toLocaleDateString('en-US',{weekday:'long'});
 const t=now.getHours()*60+now.getMinutes();
 const slots=[['08:00 - 09:00',480,540],['09:00 - 10:00',540,600],['10:00 - 11:00',600,660],['11:00 - 12:00',660,720],['12:00 - 01:00',720,780],['01:00 - 02:00',780,840],['02:00 - 03:00',840,900],['03:00 - 04:00',900,960],['04:00 - 05:00',960,1020]];
 for(const [l,s,e] of slots)if(t>=s&&t<e)return `${day} · ${l}`;
 return `${day} · Outside scheduled hours`;
}
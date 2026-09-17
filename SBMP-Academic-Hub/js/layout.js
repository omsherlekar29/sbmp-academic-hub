const SVKM_LOGO='assets/logos/svkm-logo.jpg';
const SBMP_LOGO='assets/logos/sbmp-logo.jpg';
const OFFICIAL_URL='https://sbmp.ac.in/';
export function renderLayout(){injectHeader();injectFooter();setupMobileMenu();setActiveNav();}
function rp(){const p=window.location.pathname;if(p.includes('/pages/')||p.includes('/subjects/'))return '../';return '';}
function injectHeader(){
 const host=document.getElementById('site-header');if(!host)return;
 host.innerHTML=`
 <header class="site-header">
  <div class="header-inner">
   <a class="brand-block" href="${rp()}index.html">
    <img class="brand-logo" src="${rp()}${SVKM_LOGO}" alt="SVKM" onerror="this.style.display='none'">
    <div class="logo-sep"></div>
    <img class="brand-logo" src="${rp()}${SBMP_LOGO}" alt="SBMP" onerror="this.style.display='none'">
    <div class="brand-text">
     <span class="inst">Shri Bhagubhai Mafatlal Polytechnic</span>
     <span class="portal">SBMP Academic Hub</span>
    </div>
   </a>
   <button class="icon-btn menu-toggle" id="menu-toggle" aria-label="Menu">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
   </button>
   <nav class="header-nav" id="header-nav">
    <a class="nav-link" href="${rp()}index.html" data-nav="home">Home</a>
    <a class="nav-link" href="${rp()}pages/academics.html" data-nav="academics">Academics</a>
    <a class="nav-link" href="${rp()}pages/timetable.html" data-nav="timetable">Timetable</a>
    <a class="nav-link" href="${rp()}pages/subjects.html" data-nav="subjects">Subjects</a>
    <a class="nav-link" href="${rp()}pages/portion.html" data-nav="portion">Portion</a>
    <a class="nav-link" href="${rp()}pages/faculty.html" data-nav="faculty">Faculty</a>
    <a class="nav-link" href="${rp()}pages/students.html" data-nav="students">Students</a>
    <a class="nav-link" href="${rp()}pages/notices.html" data-nav="notices">Notices</a>
    <a class="nav-link" href="${rp()}pages/planner.html" data-nav="planner">Planner</a>
    <a class="nav-link" href="${rp()}pages/feedback.html" data-nav="feedback">Feedback</a>
   </nav>
   <div class="header-utility">
    <button class="icon-btn" id="theme-toggle" aria-label="Toggle theme">
     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
    </button>
    <a class="icon-btn" href="${OFFICIAL_URL}" target="_blank" rel="noopener" title="Official SBMP Website" aria-label="Official SBMP Website">
     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/></svg>
    </a>
   </div>
  </div>
 </header>`;
}
function injectFooter(){
 const host=document.getElementById('site-footer');if(!host)return;
 host.innerHTML=`
 <footer class="site-footer">
  <div class="container">
   <div class="footer-grid">
    <div>
     <div class="footer-brand">
      <img src="${rp()}${SBMP_LOGO}" alt="SBMP" onerror="this.style.display='none'">
      <div class="fb-text">
       <strong>Shri Bhagubhai Mafatlal Polytechnic &amp; College of Engineering</strong>
       <span>Under Shri Vile Parle Kelavani Mandal (SVKM)</span>
      </div>
     </div>
     <p style="font-size:.82rem;margin:0;">Computer Engineering Department<br>Semester I &mdash; Division B &mdash; AY 2026&ndash;2027</p>
    </div>
    <div><h4>Academic</h4><div class="footer-links">
     <a href="${rp()}pages/timetable.html">Timetable</a>
     <a href="${rp()}pages/subjects.html">Subjects</a>
     <a href="${rp()}pages/portion.html">Portion</a>
     <a href="${rp()}pages/faculty.html">Faculty</a>
    </div></div>
    <div><h4>Students</h4><div class="footer-links">
     <a href="${rp()}pages/students.html">Directory</a>
     <a href="${rp()}pages/planner.html">Task Planner</a>
     <a href="${rp()}pages/notices.html">Notices</a>
     <a href="${rp()}pages/feedback.html">Feedback</a>
    </div></div>
    <div><h4>Institution</h4><div class="footer-links">
     <a href="${rp()}pages/department.html">Department</a>
     <a href="${rp()}pages/academics.html">Academics</a>
     <a href="${OFFICIAL_URL}" target="_blank" rel="noopener">sbmp.ac.in &nearr;</a>
    </div></div>
   </div>
   <div class="footer-bottom">
    <span>&copy; 2026&ndash;2027 SBMP Academic Hub &mdash; Computer Engineering</span>
    <span>Semester I &middot; Division B &middot; Batches S1 &amp; S2</span>
   </div>
  </div>
 </footer>`;
}
function setupMobileMenu(){const b=document.getElementById('menu-toggle'),n=document.getElementById('header-nav');if(!b||!n)return;b.addEventListener('click',()=>n.classList.toggle('open'));}
function setActiveNav(){
 const p=window.location.pathname;let f=p.split('/').pop()||'index.html';
 let k=f.replace('.html','');if(f==='index.html'||f==='')k='home';
 if(p.includes('/subjects/'))k='subjects';
 document.querySelectorAll('.nav-link').forEach(l=>{if(l.dataset.nav===k)l.classList.add('active');});
}
const menuBtn=document.querySelector('.menu-toggle');const overlay=document.querySelector('.menu-overlay');const menuLinks=overlay.querySelectorAll('a');
function setMenu(open){menuBtn.setAttribute('aria-expanded',String(open));menuBtn.setAttribute('aria-label',open?'Close navigation menu':'Open navigation menu');overlay.classList.toggle('open',open);overlay.setAttribute('aria-hidden',String(!open));document.body.classList.toggle('menu-open',open)}
menuBtn.addEventListener('click',()=>setMenu(menuBtn.getAttribute('aria-expanded')!=='true'));
menuLinks.forEach(link=>link.addEventListener('click',()=>setMenu(false)));
document.addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false)});
window.addEventListener('load',()=>{setTimeout(()=>document.querySelector('.preloader').classList.add('hide'),650)});
const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target)}}),{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));
const sections=document.querySelectorAll('main section[id]');const navLinks=document.querySelectorAll('.desktop-nav a');const activeObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){navLinks.forEach(a=>a.classList.toggle('active',a.hash==='#'+entry.target.id))}}),{rootMargin:'-35% 0px -55% 0px'});sections.forEach(s=>activeObserver.observe(s));
const yearEl=document.querySelector('#year');if(yearEl)yearEl.textContent=new Date().getFullYear();



document.querySelector(".back-top")?.addEventListener("click",e=>{e.preventDefault();window.scrollTo({top:0,behavior:"smooth"});});

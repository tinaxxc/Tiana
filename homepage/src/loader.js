/* Startseite 3.0: Balken der Produktbilder setzen; die Skulptur laden (bei reduzierter Bewegung als ruhiges Standbild) */
(function(){var d=document.documentElement;
  document.querySelectorAll('.fr .bar s,.fr .bar u').forEach(function(b){if(b.dataset.l)b.style.left=b.dataset.l+'%';if(b.dataset.w)b.style.width=b.dataset.w+'%'});
  if(d.classList.contains('zapp'))return;
  var still=matchMedia('(prefers-reduced-motion: reduce)').matches;
  d.classList.add('z3wait');var s=document.createElement('script');s.src='home3d.js?v=3.0.0';s.async=true;
  s.onload=function(){try{if(!window.Z3D||!Z3D.start({still:still}))d.classList.add('z3off')}catch(e){d.classList.add('z3off')}d.classList.remove('z3wait')};
  s.onerror=function(){d.classList.add('z3off');d.classList.remove('z3wait')};document.head.appendChild(s)})();

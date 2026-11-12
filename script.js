(function(){
  var root=document.documentElement;
  var loader=document.getElementById('loader');
  var started=false,t0=Date.now();

  root.classList.add('js');
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var saved=null;try{saved=localStorage.getItem('ycp-calm')}catch(e){}
  if(saved==='1'||(reduce&&saved!=='0'))root.classList.add('calm');

  /* 3) Aparición suave al desplazarse.
     prepare() deja los elementos ocultos desde el inicio (tapados por la pantalla de carga)
     y reveal() los muestra cuando la pantalla de carga ya se está yendo. */
  var els=[];
  function prepare(){
    var hero=document.querySelectorAll('.hero>div>*');
    var rest=document.querySelectorAll('section h2,.sub,.tile,.pcard,.info,form');
    Array.prototype.forEach.call(hero,function(e,j){e.style.setProperty('--d',(0.1+j*0.14)+'s');els.push(e)});
    Array.prototype.forEach.call(rest,function(e){
      if(e.matches('.tile,.pcard')){var k=Array.prototype.indexOf.call(e.parentNode.children,e);e.style.setProperty('--d',(k%3)*0.08+'s');}
      els.push(e);
    });
    els.forEach(function(e){e.classList.add('rv')});
  }
  function show(e){
    e.classList.add('in');
    /* al terminar, se quita la clase para que el hover recupere sus propias transiciones sin retraso */
    var d=parseFloat(e.style.getPropertyValue('--d'))||0;
    setTimeout(function(){e.classList.remove('rv','in');e.style.removeProperty('--d')},900+d*1000);
  }
  function reveal(){
    if(!('IntersectionObserver' in window)){els.forEach(show);return;}
    var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){show(x.target);io.unobserve(x.target);}})},{threshold:.12});
    els.forEach(function(e){io.observe(e)});
  }
  try{prepare()}catch(e){els.forEach(function(x){x.classList.remove('rv')});els=[]}

  /* 1) Pantalla de carga */
  function hide(){
    if(started)return;started=true;
    var calm=root.classList.contains('calm');
    var wait=calm?0:Math.max(0,1100-(Date.now()-t0));
    setTimeout(function(){
      if(loader){loader.classList.add('done');setTimeout(function(){if(loader.parentNode)loader.parentNode.removeChild(loader)},700);}
      /* el contenido empieza a aparecer mientras la pantalla de carga se desvanece */
      setTimeout(function(){try{reveal()}catch(e){els.forEach(function(x){x.classList.remove('rv')})}},calm?0:180);
    },wait);
  }
  if(document.readyState==='complete'){hide()}else{window.addEventListener('load',hide)}
  setTimeout(hide,3000);

  /* 2) Botón para pausar animaciones */
  var btn=document.getElementById('mt');
  function sync(){if(!btn)return;var c=root.classList.contains('calm');btn.setAttribute('aria-pressed',c);btn.textContent=c?'Activar animaciones':'Pausar animaciones';}
  sync();
  if(btn)btn.addEventListener('click',function(){
    root.classList.toggle('calm');
    try{localStorage.setItem('ycp-calm',root.classList.contains('calm')?'1':'0')}catch(e){}
    sync();
  });

  /* 3b) Servicios y equipo: en pantallas táctiles, tocar abre la información */
  var items=document.querySelectorAll('.tile,.pcard');
  var canHover=window.matchMedia&&matchMedia('(hover: hover)').matches;
  Array.prototype.forEach.call(items,function(it){
    it.addEventListener('click',function(){
      if(canHover)return;
      var wasOpen=it.classList.contains('open');
      Array.prototype.forEach.call(it.parentNode.children,function(o){o.classList.remove('open')});
      if(!wasOpen)it.classList.add('open');
    });
  });

  /* 3c) Perfiles: ver la foto original y la información, una por una */
  var dlg=document.getElementById('perfil');
  var team=Array.prototype.filter.call(document.querySelectorAll('.pcard'),function(x){return x.querySelector('button.ph img')});
  var idx=0,tok=0;
  Array.prototype.forEach.call(team,function(card){
    var ph=card.querySelector('button.ph'),im=ph.querySelector('img');
    function done(){ph.classList.add('ld')}
    if(im.complete)done();else{im.addEventListener('load',done);im.addEventListener('error',done);}
  });
  function render(){
    var card=team[idx],im=card.querySelector('button.ph img');
    var wrap=document.getElementById('pf-wrap'),big=document.getElementById('pf-img'),my=++tok;
    document.getElementById('pf-name').textContent=card.querySelector('.pwho b').textContent;
    document.getElementById('pf-role').textContent=card.querySelector('.pwho span').textContent;
    document.getElementById('pf-desc').textContent=card.querySelector('.drop p').textContent;
    document.getElementById('pf-count').textContent='Perfil '+(idx+1)+' de '+team.length;
    wrap.classList.add('loading');big.classList.remove('in');
    var pre=new Image();
    pre.onload=pre.onerror=function(){
      if(my!==tok)return;
      big.src=im.src;big.alt=card.querySelector('.pwho b').textContent;
      wrap.classList.remove('loading');
      requestAnimationFrame(function(){big.classList.add('in')});
    };
    pre.src=im.src;
  }
  function openAt(i){
    idx=(i+team.length)%team.length;render();
    if(dlg&&!dlg.open){dlg.showModal();root.classList.add('pf-lock');}
  }
  if(dlg&&team.length){
    Array.prototype.forEach.call(team,function(card,i){
      var trg=card.querySelectorAll('button.ph,.pf-open');
      Array.prototype.forEach.call(trg,function(b){b.addEventListener('click',function(e){e.stopPropagation();openAt(i);});});
    });
    document.getElementById('pf-prev').addEventListener('click',function(){openAt(idx-1)});
    document.getElementById('pf-next').addEventListener('click',function(){openAt(idx+1)});
    dlg.querySelector('.pf-x').addEventListener('click',function(){dlg.close()});
    dlg.addEventListener('click',function(e){if(e.target===dlg)dlg.close()});
    dlg.addEventListener('close',function(){root.classList.remove('pf-lock')});
    dlg.addEventListener('keydown',function(e){
      if(e.key==='ArrowLeft'){e.preventDefault();openAt(idx-1)}
      if(e.key==='ArrowRight'){e.preventDefault();openAt(idx+1)}
    });
  }

  /* 4) Formulario de contacto: envía los datos por correo (servicio FormSubmit)
     ------------------------------------------------------------------
     >>> Escriba aquí el correo que recibirá las consultas <<<              */
  var CORREO_DESTINO='';
  /* ------------------------------------------------------------------ */
  var f=document.getElementById('f'),ok=document.getElementById('ok'),bad=document.getElementById('bad');
  var mailShow=document.getElementById('mail-show');
  if(mailShow&&CORREO_DESTINO){mailShow.textContent=CORREO_DESTINO;mailShow.href='mailto:'+CORREO_DESTINO;}
  var EMAIL_RE=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function setErr(name,msg){
    var inp=f.elements[name],out=f.querySelector('.fe[data-for="'+name+'"]');
    if(out)out.textContent=msg||'';
    if(inp){if(msg)inp.setAttribute('aria-invalid','true');else inp.removeAttribute('aria-invalid');}
  }
  if(f){
    f.elements.nombre.addEventListener('input',function(){setErr('nombre','')});
    f.elements.email.addEventListener('input',function(){setErr('email','')});
    f.addEventListener('submit',function(e){
      e.preventDefault();
      bad.style.display='none';
      var nombre=f.elements.nombre.value.trim(),email=f.elements.email.value.trim(),first=null;
      setErr('nombre','');setErr('email','');
      if(!nombre){setErr('nombre','Escriba su nombre.');first=f.elements.nombre;}
      if(!email){setErr('email','Escriba su correo electrónico.');first=first||f.elements.email;}
      else if(email.indexOf('@')<0){setErr('email','El correo debe incluir el símbolo @.');first=first||f.elements.email;}
      else if(!EMAIL_RE.test(email)){setErr('email','Escriba un correo válido, por ejemplo nombre@ejemplo.com.');first=first||f.elements.email;}
      if(first){first.focus();return;}
      if(f.elements._honey.value)return; /* trampa para robots */
      if(!CORREO_DESTINO){
        bad.textContent='El formulario aún no tiene un correo de destino configurado. Por favor llámenos al +1 (809) 895-2259.';
        bad.style.display='block';return;
      }
      var submit=f.querySelector('button[type=submit]'),label=submit.textContent;
      submit.disabled=true;submit.textContent='Enviando…';
      fetch('https://formsubmit.co/ajax/'+encodeURIComponent(CORREO_DESTINO),{
        method:'POST',
        headers:{'Content-Type':'application/json','Accept':'application/json'},
        body:JSON.stringify({
          'Nombre':nombre,
          'Correo electrónico':email,
          'Servicio de interés':f.elements.servicio.value,
          'Mensaje':f.elements.mensaje.value.trim()||'(sin mensaje)',
          _subject:'Nueva consulta desde la página web: '+nombre,
          _template:'table',
          _captcha:'false',
          _replyto:email
        })
      }).then(function(r){return r.json().catch(function(){return{}}).then(function(d){return{ok:r.ok,d:d}})})
      .then(function(x){
        if(!x.ok||x.d.success==='false'||x.d.success===false)throw new Error(x.d.message||'error');
        f.style.display='none';ok.style.display='block';
      })
      .catch(function(){
        bad.textContent='No pudimos enviar su consulta. Intente de nuevo en unos minutos o llámenos al +1 (809) 895-2259.';
        bad.style.display='block';
      })
      .then(function(){submit.disabled=false;submit.textContent=label;});
    });
  }
})();

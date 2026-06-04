/**
 * Vanilla lead capture for static published HTML (no React hydration).
 * Inlined once at the end of index.html by render-html.tsx.
 */
export const LEAD_CAPTURE_SCRIPT = `(function(){
var EMAIL_RE=/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
function showError(form,message){
  var err=form.querySelector(".lead-capture-error");
  if(!err){
    err=document.createElement("p");
    err.className="lead-capture-error w-full text-sm text-red-600";
    err.setAttribute("role","alert");
    err.setAttribute("aria-live","polite");
    form.appendChild(err);
  }
  err.textContent=message;
  err.removeAttribute("hidden");
}
function clearError(form){
  var err=form.querySelector(".lead-capture-error");
  if(err){
    err.textContent="";
    err.setAttribute("hidden","");
  }
}
function showThanks(form){
  var msg=form.getAttribute("data-thanks-message")||"Thank you! We'll be in touch soon.";
  while(form.firstChild){form.removeChild(form.firstChild);}
  var p=document.createElement("p");
  p.className="lead-capture-thanks";
  p.setAttribute("role","status");
  p.textContent=msg;
  form.appendChild(p);
  form.setAttribute("data-lead-success","true");
  form.removeAttribute("data-submitting");
}
function bindForm(form){
  if(form.getAttribute("data-lead-bound")==="true"){return;}
  form.setAttribute("data-lead-bound","true");
  form.addEventListener("submit",function(e){
    e.preventDefault();
    if(form.getAttribute("data-lead-success")==="true"){return;}
    if(form.getAttribute("data-submitting")==="true"){return;}
    var input=form.querySelector('input[type="email"]');
    var btn=form.querySelector('button[type="submit"]');
    if(!input){return;}
    clearError(form);
    var email=(input.value||"").trim();
    if(!email){
      showError(form,"Please enter your email.");
      input.focus();
      return;
    }
    if(typeof input.checkValidity==="function"&&!input.checkValidity()){
      showError(form,"Please enter a valid email address.");
      input.focus();
      return;
    }
    if(!EMAIL_RE.test(email)){
      showError(form,"Please enter a valid email address.");
      input.focus();
      return;
    }
    var apiUrl=form.getAttribute("data-api-url");
    var siteId=form.getAttribute("data-site-id");
    if(!apiUrl||!siteId){
      showError(form,"This form is not configured yet.");
      return;
    }
    var buttonText=form.getAttribute("data-button-text")||"Submit";
    form.setAttribute("data-submitting","true");
    if(btn){
      btn.disabled=true;
      if(btn.textContent!=null){btn.textContent="Submitting...";}
    }
    fetch(apiUrl,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({email:email.toLowerCase(),siteId:siteId})
    }).then(function(res){
      return res.json().catch(function(){return{};}).then(function(data){
        if(!res.ok){throw new Error((data&&data.error)||"request failed");}
        showThanks(form);
      });
    }).catch(function(){
      form.removeAttribute("data-submitting");
      if(btn){
        btn.disabled=false;
        if(btn.textContent!=null){btn.textContent=buttonText;}
      }
      showError(form,"Something went wrong. Please try again.");
    });
  });
}
function init(){
  var forms=document.querySelectorAll("form.lead-capture-form");
  for(var i=0;i<forms.length;i++){bindForm(forms[i]);}
}
if(document.readyState==="loading"){
  document.addEventListener("DOMContentLoaded",init);
}else{
  init();
}
})();`;

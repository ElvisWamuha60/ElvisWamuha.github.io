/* ==========================================================
   script.js  -  how the portfolio BEHAVES
   Elvis Wamuha Gitau - German Tutor & Software Developer

   JavaScript runs in the visitor's browser. This file:
     1. loads the reviews everyone can see (from Firebase)
     2. sends a new review when the form is submitted
     3. lets a visitor delete their own review
     4. lets visitors email a review to the tutor
   ========================================================== */

// Everything is wrapped in (function(){ ... })(); so our variables
// stay private and cannot clash with anything else on the page.
(function(){
  // ----------------------------------------------------------
  // SETTINGS - the only values you may need to change
  // ----------------------------------------------------------
  var PROJECT_ID = "elvis-german-tutor-ff3c4";
  var API_KEY = "AIzaSyDXHJ3dbWq6oRR5xjbxRljk8NWqWOguhzU";   // Firebase Web API key (needed so visitors can delete their own review)

  // EMAIL    - where the "Send review by email" button sends messages.
  // KEY      - name used to save reviews on the visitor's device (offline mode).
  // AKEY     - name used to remember the visitor's anonymous sign-in.
  var EMAIL="gitauelvis60@gmail.com", KEY="german-tutor-reviews", AKEY="german-tutor-auth";
  // BASE - the web address of your Firebase database (Firestore).
  //        Every request below starts from this address.
  var BASE="https://firestore.googleapis.com/v1/projects/"+PROJECT_ID+"/databases/(default)/documents";
  // Q - adds the API key to the end of a request address ("?key=...").
  var Q=API_KEY?("?key="+encodeURIComponent(API_KEY)):"";
  // live   - true when a PROJECT_ID is set (reviews are shared online).
  // shared - reviews downloaded from Firebase.
  // mine   - reviews saved on this device only (used if Firebase is not set up).
  // auth   - this visitor's anonymous sign-in details.
  var live=!!PROJECT_ID, shared=[], mine=[], auth=null;
  // Load saved data from the browser. try/catch stops the page
  // from breaking if the browser blocks storage.
  try{mine=JSON.parse(localStorage.getItem(KEY)||"[]")}catch(e){mine=[]}
  try{auth=JSON.parse(localStorage.getItem(AKEY)||"null")}catch(e){auth=null}
  // Find the two places on the page we will write into:
  // the list of reviews and the small status message under the form.
  var list=document.getElementById("rlist"), status=document.getElementById("rstatus");

  // say() shows a short message to the visitor under the form.
  function say(m){status.textContent=m}


  // ----------------------------------------------------------
  // ANONYMOUS SIGN-IN
  // Visitors do not create accounts. Firebase quietly gives each browser
  // a random ID. We store it with the review so the writer (and nobody
  // else) can delete it later.
  // ----------------------------------------------------------
  // saveAuth() - remember the sign-in details in the browser.
  function saveAuth(){try{localStorage.setItem(AKEY,JSON.stringify(auth))}catch(e){}}
  // signUp() - ask Firebase for a brand-new anonymous ID.
  function signUp(){
    return fetch("https://identitytoolkit.googleapis.com/v1/accounts:signUp?key="+encodeURIComponent(API_KEY),
      {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({returnSecureToken:true})})
    .then(function(r){return r.json()}).then(function(j){
      if(!j.idToken)return null;
      auth={idToken:j.idToken,refreshToken:j.refreshToken,uid:j.localId,exp:Date.now()+parseInt(j.expiresIn,10)*1000};
      saveAuth();return auth;
    }).catch(function(){return null});
  }
  // getAuth() - give back a valid sign-in: reuse the saved one,
  //             refresh it if it expired, or create a new one.
  function getAuth(){
    if(!API_KEY)return Promise.resolve(null);
    if(auth&&auth.idToken&&auth.exp>Date.now()+60000)return Promise.resolve(auth);
    if(auth&&auth.refreshToken){
      return fetch("https://securetoken.googleapis.com/v1/token?key="+encodeURIComponent(API_KEY),
        {method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},
         body:"grant_type=refresh_token&refresh_token="+encodeURIComponent(auth.refreshToken)})
      .then(function(r){return r.json()}).then(function(j){
        if(!j.id_token)throw new Error("refresh");
        auth={idToken:j.id_token,refreshToken:j.refresh_token,uid:j.user_id,exp:Date.now()+parseInt(j.expires_in,10)*1000};
        saveAuth();return auth;
      }).catch(function(){auth=null;return signUp()});
    }
    return signUp();
  }


  // ----------------------------------------------------------
  // DELETING A REVIEW
  // del() asks "Are you sure?", then tells Firebase to delete the review.
  // Firebase's security rules only allow it if the review has this
  // visitor's ID on it.
  // ----------------------------------------------------------
  function del(id){
    if(!confirm("Delete your review?"))return;
    say("Deleting...");
    getAuth().then(function(a){
      if(!a)throw new Error("not signed in");
      return fetch(BASE+"/reviews/"+encodeURIComponent(id)+Q,{method:"DELETE",headers:{Authorization:"Bearer "+a.idToken}});
    }).then(function(res){
      if(!res.ok)throw new Error("HTTP "+res.status);
      say("Your review was deleted.");load();
    }).catch(function(){say("Sorry, that review could not be deleted. You can only delete reviews you wrote on this device.")});
  }


  // ----------------------------------------------------------
  // SHOWING REVIEWS
  // render() clears the list and builds one card per review:
  // stars, text, name and level. A "Delete my review" button is added
  // only on reviews written by the current visitor.
  // textContent is used (not innerHTML) so nobody can inject code
  // through a review.
  // ----------------------------------------------------------
  function render(){
    list.textContent="";
    var all=live?shared:mine;
    if(!all.length){
      var d=document.createElement("div");d.className="empty";
      d.textContent="No reviews yet. Be the first to share your experience.";
      list.appendChild(d);return;
    }
    all.forEach(function(r){
      var d=document.createElement("div");d.className="review";d.style.color="var(--ink)";
      var s=document.createElement("div");s.className="stars";s.textContent="\u2605".repeat(r.stars)+"\u2606".repeat(5-r.stars);
      var p=document.createElement("p");p.textContent=r.text;
      var m=document.createElement("small");m.textContent=r.name+" \u00b7 Level "+r.level;
      d.append(s,p,m);
      if(live&&r.id&&r.uid&&auth&&auth.uid===r.uid){
        var b=document.createElement("button");b.type="button";b.textContent="Delete my review";
        b.style.cssText="display:block;margin-top:10px;background:none;border:1px solid var(--line);color:var(--accent);border-radius:999px;padding:5px 12px;font:inherit;font-size:.85rem;cursor:pointer";
        b.addEventListener("click",function(){del(r.id)});
        d.appendChild(b);
      }
      list.appendChild(d);
    });
  }

  // load() - download all reviews from Firebase (newest first),
  //          then call render() to show them.
  function load(){
    if(!live)return render();
    fetch(BASE+":runQuery"+Q,{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({structuredQuery:{from:[{collectionId:"reviews"}],
        where:{fieldFilter:{field:{fieldPath:"approved"},op:"EQUAL",value:{booleanValue:true}}}}})})
    .then(function(r){return r.json()})
    .then(function(rows){
      shared=(Array.isArray(rows)?rows:[]).filter(function(x){return x.document}).map(function(x){
        var f=x.document.fields||{};
        return {id:x.document.name.split("/").pop(),
          uid:(f.uid&&f.uid.stringValue)||"",
          name:(f.name&&f.name.stringValue)||"Student",level:(f.level&&f.level.stringValue)||"",
          stars:parseInt((f.stars&&f.stars.integerValue)||5,10),text:(f.text&&f.text.stringValue)||"",
          t:(f.createdAt&&f.createdAt.timestampValue)||""};
      }).sort(function(a,b){return a.t<b.t?1:-1});
      render();
    }).catch(function(){render();say("Reviews could not be loaded right now.")});
  }

  // read() - collect what the visitor typed in the form.
  function read(){
    return {name:document.getElementById("rname").value.trim(),level:document.getElementById("rlevel").value,
      stars:parseInt(document.getElementById("rstars").value,10),text:document.getElementById("rtext").value.trim()};
  }

  // ----------------------------------------------------------
  // SUBMITTING A REVIEW
  // Runs when the visitor clicks "Submit my review".
  //  - Without Firebase: save the review on this device only.
  //  - With Firebase: sign in anonymously, then send the review online.
  // ----------------------------------------------------------
  document.getElementById("rform").addEventListener("submit",function(e){
    e.preventDefault();
    var r=read();if(!r.name||!r.text)return;
    var form=e.target;
    if(!live){
      mine.push(r);
      try{localStorage.setItem(KEY,JSON.stringify(mine))}catch(err){}
      form.reset();render();return;
    }
    var btn=form.querySelector("button[type=submit]");btn.disabled=true;say("Sending...");
    getAuth().then(function(a){
      var f={name:{stringValue:r.name},level:{stringValue:r.level},stars:{integerValue:String(r.stars)},
        text:{stringValue:r.text},approved:{booleanValue:true},createdAt:{timestampValue:new Date().toISOString()}};
      var h={"Content-Type":"application/json"};
      if(a){f.uid={stringValue:a.uid};h.Authorization="Bearer "+a.idToken}
      return fetch(BASE+"/reviews"+Q,{method:"POST",headers:h,body:JSON.stringify({fields:f})});
    }).then(function(res){
      if(!res.ok){return res.json().catch(function(){return {}}).then(function(j){
        var m=(j&&j.error&&(j.error.status+": "+j.error.message))||("HTTP "+res.status);throw new Error(m)})}
      form.reset();say("Thank you! Your review has been added.");load();
    }).catch(function(err){console.error(err);say("Sorry, your review could not be sent ("+(err&&err.message?err.message.slice(0,120):"network error")+"). Please try again or use the email button.")})
    .then(function(){btn.disabled=false});
  });

  // ----------------------------------------------------------
  // EMAIL BUTTON
  // Opens the visitor's email app with the review already written,
  // addressed to the tutor.
  // ----------------------------------------------------------
  document.getElementById("rmail").addEventListener("click",function(){
    var r=read();
    if(!r.name||!r.text){document.getElementById("rname").reportValidity();return}
    var body="Name: "+r.name+"\nLevel: "+r.level+"\nRating: "+r.stars+"/5\n\n"+r.text;
    location.href="mailto:"+EMAIL+"?subject="+encodeURIComponent("Review for my German lessons")+"&body="+encodeURIComponent(body);
  });
  // Start: download and show the reviews when the page opens.
  load();
})();

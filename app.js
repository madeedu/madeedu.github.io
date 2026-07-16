/* MADE LMS 프로토타입 — 로컬 인터랙션(네비게이션은 순수 <a href>) */
(function(){
  "use strict";

  // 1) 데스크 공지: 중요 알림 토글 → 발송 라벨 (data-toggle + data-label-on/off)
  document.querySelectorAll("[data-toggle]").forEach(function(t){
    t.addEventListener("click", function(){
      var on = t.classList.toggle("on");
      t.classList.toggle("off", !on);
      t.setAttribute("aria-checked", on ? "true" : "false");
      var target = t.getAttribute("data-toggle");
      if(target){
        var el = document.getElementById(target);
        if(el){
          var on1 = t.getAttribute("data-label-on"), off1 = t.getAttribute("data-label-off");
          if(on1 || off1) el.textContent = on ? on1 : off1;
        }
      }
    });
  });

  // 2) 칩/세그 로컬 선택(같은 그룹 내 단일 활성) — data-group
  document.querySelectorAll("[data-group]").forEach(function(el){
    el.addEventListener("click", function(e){
      if(el.tagName === "A" && el.getAttribute("href") && el.getAttribute("href") !== "#") return; // 이동 링크는 그대로
      e.preventDefault();
      var g = el.getAttribute("data-group");
      document.querySelectorAll('[data-group="'+g+'"]').forEach(function(x){x.classList.remove("on");});
      el.classList.add("on");
    });
  });

  // 3) 출결 상태칩(로스터): 3상태 순환 or 그룹 선택 — data-status-group
  document.querySelectorAll("[data-status-group]").forEach(function(chip){
    chip.addEventListener("click", function(){
      var g = chip.getAttribute("data-status-group");
      document.querySelectorAll('[data-status-group="'+g+'"]').forEach(function(x){
        x.classList.remove("on","ok","warn","red");
      });
      chip.classList.add("on");
      var kind = chip.getAttribute("data-status-kind");
      if(kind) chip.classList.add(kind);
    });
  });

  // 4) 학부모 홈 상태 전환(목업 1c 이식) — data-parent-status
  var MAP = {
    "출석": {c:"#1e8a53", bg:"#e9f6ef", label:"출석", msg:"오늘 서준이는 잘 도착했어요", sub:"수학 심화반 · 15:58 체크"},
    "지각": {c:"#c9871d", bg:"#fdf3e2", label:"지각", msg:"오늘은 조금 늦게 도착했어요", sub:"수학 심화반 · 16:12 체크 · 사유: 병원 진료"},
    "결석": {c:"#f0333e", bg:"#fdeaeb", label:"결석", msg:"오늘 수업에 오지 않았어요", sub:"수학 심화반 · 데스크 확인 중"},
    "예정": {c:"#8f8b86", bg:"#f1efec", label:"예정", msg:"아직 수업 전이에요", sub:"수학 심화반 · 16:00 시작"}
  };
  function applyParent(s){
    var m = MAP[s] || MAP["출석"];
    var q = function(sel){return document.querySelector(sel);};
    var ring=q(".js-hero-ring"), lbl=q(".js-hero-label"), msg=q(".js-hero-msg"),
        sub=q(".js-hero-sub"), dot=q(".js-tl-dot"), badge=q(".js-tl-badge");
    if(!ring) return;
    ring.style.borderColor=m.c; ring.style.color=m.c; lbl.textContent=m.label;
    msg.textContent=m.msg; sub.textContent=m.sub;
    if(dot) dot.style.background=m.c;
    if(badge){badge.style.color=m.c; badge.style.background=m.bg; badge.textContent=m.label;}
  }
  document.querySelectorAll("[data-parent-status]").forEach(function(b){
    b.addEventListener("click", function(){
      document.querySelectorAll("[data-parent-status]").forEach(function(x){x.classList.remove("on");});
      b.classList.add("on");
      applyParent(b.getAttribute("data-parent-status"));
    });
  });
})();


/* ================= 디버그 패널 (모든 페이지 공통) ================= */
(function(){
  "use strict";
  var isPanel = document.body.hasAttribute("data-dbg-panel");

  var SCREENS = [
    {p:"auth/login.html",         l:"로그인",           n:"n4"},
    {p:"auth/parent-login.html",  l:"학부모 로그인",     n:"1a"},
    {p:"auth/onboarding.html",    l:"학부모 온보딩",     n:"n6"},
    {p:"teacher/home.html",       l:"강사 홈",           n:"n10"},
    {p:"teacher/today.html",      l:"오늘 세션",         n:"n11"},
    {p:"teacher/roster.html",     l:"출결 로스터",       n:"n12"},
    {p:"teacher/student.html",    l:"학생 상세",         n:"n18"},
    {p:"teacher/timeline.html",   l:"통합 타임라인",     n:"n19"},
    {p:"teacher/consult.html",    l:"상담 작성",         n:"n20"},
    {p:"desk/home.html",          l:"데스크 홈",         n:"n23"},
    {p:"desk/students.html",      l:"학생 목록",         n:"n24"},
    {p:"desk/student-edit.html",  l:"학생 등록/수정",    n:"n25"},
    {p:"desk/enrollment.html",    l:"등록(과목) 관리",   n:"n28"},
    {p:"desk/guardian-hold.html", l:"보호자 연결 보류",  n:"n29"},
    {p:"desk/org.html",           l:"조직 관리",         n:"n31"},
    {p:"desk/notice.html",        l:"공지 작성",         n:"n32"},
    {p:"desk/aca-upload.html",    l:"엑셀 업로드",       n:"n35"},
    {p:"desk/dryrun.html",        l:"드라이런",          n:"n36"},
    {p:"parent/home.html",        l:"학부모 홈",         n:"n38"},
    {p:"parent/notifications.html",l:"알림함",           n:"n40"},
    {p:"parent/notification.html",l:"알림 상세",         n:"n41"},
    {p:"parent/attendance.html",  l:"자녀 출결",         n:"n43"},
    {p:"director/dashboard.html", l:"원장 대시보드",     n:"n44"},
    {p:"director/enrollment-stats.html", l:"재원/출석률", n:"n45"},
    {p:"director/consult-stats.html",    l:"상담 건수",   n:"n46"},
    {p:"director/notification-stats.html",l:"알림 발송",  n:"n47"}
  ];

  function protoBase(){
    // 마운트 위치 무관: 현재 URL 끝에서 알려진 화면경로를 떼어 루트를 구한다.
    // (예: https://host/teacher/home.html → https://host/  ·  .../_proto/teacher/home.html → .../_proto/)
    var h = location.href.split(/[?#]/)[0];
    for(var i=0;i<SCREENS.length;i++){
      var suf = SCREENS[i].p;
      if(h.slice(-suf.length) === suf) return h.slice(0, h.length - suf.length);
    }
    var j = h.indexOf("/_proto/");
    if(j >= 0) return h.slice(0, j + 8);
    return h.replace(/[^\/]*$/, "");   // index.html·debug-panel.html 등: 현재 폴더
  }
  var BASE = protoBase();

  // 상태 저장 (localStorage best-effort + 메모리 폴백)
  var mem = {};
  function get(k, d){ try{ var v = localStorage.getItem(k); return v === null ? (k in mem ? mem[k] : d) : v; }catch(e){ return (k in mem ? mem[k] : d); } }
  function set(k, v){ mem[k] = v; try{ localStorage.setItem(k, v); }catch(e){} }

  function currentIndex(){
    var p = location.pathname;
    for(var i=0;i<SCREENS.length;i++){ if(p.slice(-SCREENS[i].p.length) === SCREENS[i].p) return i; }
    return -1;
  }
  function go(path){ location.href = BASE + path; }

  function applyDevice(mode){
    set("dbg.device", mode);
    document.documentElement.setAttribute("data-device", mode);
  }
  function applyMock(off){
    set("dbg.mock", off ? "off" : "on");
    document.body.classList.toggle("mock-off", off);
    var region = document.querySelector(".shell-content") || document.querySelector(".pbody") || document.querySelector(".pc-body");
    if(!region) return;
    var empty = region.querySelector(".mock-empty");
    if(off){
      Array.prototype.forEach.call(region.children, function(c){ if(!c.classList.contains("mock-empty") && !c.classList.contains("ct-head")) c.classList.add("mock-hidden"); });
      if(!empty){
        empty = document.createElement("div");
        empty.className = "mock-empty";
        empty.innerHTML = '<div class="emoji">📭</div><div class="t">데이터가 없습니다</div><div class="s">목업 데이터 OFF · 실데이터 연동 전</div>';
        region.appendChild(empty);
      }
    } else {
      Array.prototype.forEach.call(region.children, function(c){ c.classList.remove("mock-hidden"); });
      if(empty) empty.remove();
    }
  }

  function panelHTML(child){
    var opts = "";
    for(var i=0;i<SCREENS.length;i++){ opts += '<option value="'+i+'">'+(i+1)+". "+SCREENS[i].l+" ("+SCREENS[i].n+')</option>'; }
    var act  = child ? "" : '<button class="dbtn act">⧉ 분리</button>';
    var strip= child ? "" : '<div class="redock-strip"><span>🔗 패널 분리됨</span><button class="dbtn red rd">재결합</button></div>';
    var foot = child ? '<div class="drow"><button class="dbtn red rd" style="width:100%">🔗 부모창으로 재결합</button></div>' : "";
    return '<div class="dbg-hd"><span class="ttl">🛠 디버그 패널</span>'+act+'</div>'
      + '<div class="dbg-body">'
      +   '<div class="drow"><span class="dlabel">목업 데이터</span><button class="toggle2 mock"><span class="k"></span></button></div>'
      +   '<div class="drow"><span class="dlabel">디바이스</span><div class="dseg dev"><button data-dev="auto">자동</button><button data-dev="mobile">모바일</button><button data-dev="pc">PC</button></div></div>'
      +   '<div class="drow" style="flex-direction:column;align-items:stretch;gap:7px"><span class="dlabel cur">화면 —</span><div class="pager"><button class="nav prev">◀</button><select class="jump">'+opts+'</select><button class="nav next">▶</button></div></div>'
      +   foot
      + '</div>'
      + strip;
  }

  function refreshUI(root, st){
    if(!root || !st) return;
    var m = root.querySelector(".mock"); if(m) m.classList.toggle("on", st.mock !== "off");
    root.querySelectorAll(".dev button").forEach(function(b){ b.classList.toggle("on", b.getAttribute("data-dev") === st.device); });
    var cur = root.querySelector(".cur"); if(cur) cur.textContent = st.label + (st.index >= 0 ? ("  ·  " + (st.index+1) + "/" + st.total) : "");
    var sel = root.querySelector(".jump"); if(sel && st.index >= 0) sel.value = st.index;
  }

  function hostEl(){ return document.getElementById("dbg"); }

  function doDetach(){
    set("dbg.detached", "1");
    var h = hostEl(); if(h) h.classList.add("detached");
    window.__dbgChild = window.open(BASE + "debug-panel.html", "dbgPanel", "width=324,height=392,menubar=no,toolbar=no,location=no,status=no");
  }
  function doRedock(){
    set("dbg.detached", "0");
    var h = hostEl(); if(h) h.classList.remove("detached");
    try{ if(window.__dbgChild && !window.__dbgChild.closed) window.__dbgChild.close(); }catch(e){}
  }

  // 부모 페이지에서 노출하는 제어 API (자식창이 window.opener.DBG 로 호출)
  window.DBG = {
    setMock:   function(off){ applyMock(off); refreshUI(hostEl(), this.current()); },
    setDevice: function(m){ applyDevice(m); refreshUI(hostEl(), this.current()); },
    gotoRel:   function(d){ var i=currentIndex(); if(i<0){ i = d>0?0:SCREENS.length-1; } else { i+=d; if(i<0)i=SCREENS.length-1; if(i>=SCREENS.length)i=0; } go(SCREENS[i].p); },
    gotoIndex: function(i){ i=+i; if(SCREENS[i]) go(SCREENS[i].p); },
    detach:    doDetach,
    redock:    doRedock,
    isDetached:function(){ return get("dbg.detached","0") === "1"; },
    current:   function(){ var i=currentIndex(); return {index:i, total:SCREENS.length, label: i>=0 ? (SCREENS[i].l+" ("+SCREENS[i].n+")") : "화면 목록", mock:get("dbg.mock","on"), device:get("dbg.device","auto"), detached:this.isDetached()}; }
  };

  function bind(root, apiGetter, child){
    function act(fn){ var api=apiGetter(); if(!api) return; try{ fn(api); }catch(e){} try{ var a=apiGetter(); if(a) refreshUI(root, a.current()); }catch(e){} }
    var mock = root.querySelector(".mock");
    if(mock) mock.addEventListener("click", function(){ act(function(api){ api.setMock(mock.classList.contains("on")); }); });
    root.querySelectorAll(".dev button").forEach(function(b){ b.addEventListener("click", function(){ act(function(api){ api.setDevice(b.getAttribute("data-dev")); }); }); });
    var prev=root.querySelector(".prev"), next=root.querySelector(".next"), jump=root.querySelector(".jump");
    if(prev) prev.addEventListener("click", function(){ act(function(api){ api.gotoRel(-1); }); });
    if(next) next.addEventListener("click", function(){ act(function(api){ api.gotoRel(1); }); });
    if(jump) jump.addEventListener("change", function(){ act(function(api){ api.gotoIndex(jump.value); }); });
    var actbtn = root.querySelector(".act");
    if(actbtn) actbtn.addEventListener("click", function(){ var api=apiGetter(); if(api) api.detach(); });
    root.querySelectorAll(".rd").forEach(function(b){ b.addEventListener("click", function(){
      var api=apiGetter(); if(api) api.redock();
      if(child){ try{ window.close(); }catch(e){} }
    }); });
  }

  if(isPanel){
    // ---- 분리된 자식창 모드: 부모(window.opener)를 제어 ----
    var chost = document.createElement("div"); chost.id = "dbg"; chost.innerHTML = panelHTML(true);
    document.body.appendChild(chost);
    bind(chost, function(){ return window.opener && window.opener.DBG; }, true);
    function csync(){
      if(!window.opener || window.opener.closed){ chost.querySelector(".dbg-body").innerHTML = '<div style="color:#bbb;padding:14px">부모창이 닫혔습니다. 이 창을 닫아주세요.</div>'; return; }
      var api = window.opener.DBG;
      if(api){ if(!api.isDetached()){ try{ window.close(); }catch(e){} return; } try{ refreshUI(chost, api.current()); }catch(e){} }
    }
    csync();
    setInterval(csync, 600);
    window.addEventListener("unload", function(){ try{ if(window.opener && window.opener.DBG) window.opener.DBG.redock(); }catch(e){} });
    return;
  }

  // ---- 일반 페이지: 우하단 플로팅 패널 주입 ----
  var host = document.createElement("div"); host.id = "dbg"; host.innerHTML = panelHTML(false);
  document.body.appendChild(host);
  bind(host, function(){ return window.DBG; }, false);
  // 저장된 상태 적용
  applyDevice(get("dbg.device", "auto"));
  applyMock(get("dbg.mock", "on") === "off");
  if(get("dbg.detached", "0") === "1") host.classList.add("detached");
  refreshUI(host, window.DBG.current());
})();

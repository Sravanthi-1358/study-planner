function loadTasks(){ return JSON.parse(localStorage.getItem('ssplanner_tasks')||'[]'); }
function saveTasks(tasks){ localStorage.setItem('ssplanner_tasks',JSON.stringify(tasks)); }

// Navigation
const pages={home:"page-home",goals:"page-goals",schedule:"page-schedule",reminder:"page-reminder",progress:"page-progress"};
Object.keys(pages).forEach(k=>{
  document.getElementById('nav-'+k).addEventListener('click',()=>showPage(k));
});
function showPage(k){ Object.values(pages).forEach(id=>document.getElementById(id).style.display='none'); document.getElementById(pages[k]).style.display='block'; }

// Login
const loginModal=document.getElementById('login-modal');
if(localStorage.getItem('ssplanner_user')) loginModal.style.display='none';
document.getElementById('login-btn').onclick=()=>{
  const email=document.getElementById('login-email').value;
  const phone=document.getElementById('login-phone').value;
  if(!email||!phone) return alert('Enter email and phone');
  localStorage.setItem('ssplanner_user',JSON.stringify({email,phone}));
  loginModal.style.display='none';
};

// Add task
const taskModal=document.getElementById('task-modal');
document.getElementById('add-task-btn').onclick=()=>taskModal.style.display='flex';
document.getElementById('cancel-task').onclick=()=>taskModal.style.display='none';
document.getElementById('save-task').onclick=()=>{
  const title=document.getElementById('task-title').value;
  if(!title) return alert('Title required');
  const desc=document.getElementById('task-desc').value;
  const date=document.getElementById('task-date').value;
  const time=document.getElementById('task-time').value;
  const tasks=loadTasks();
  tasks.push({id:Date.now(),title,desc,date,time,done:false,notified:false});
  saveTasks(tasks); taskModal.style.display='none'; renderAll();
};

// Render tasks
function renderGoals(){
  const list=document.getElementById('goals-list'); list.innerHTML='';
  loadTasks().forEach(t=>{
    const div=document.createElement('div'); div.className='task';
    div.innerHTML=`<div>${t.title}<br><small>${t.date||''} ${t.time||''}</small></div>
    <div><span class="badge ${t.done?'done':'pending'}">${t.done?'Done':'Pending'}</span>
    <button onclick="toggleDone(${t.id})">✓</button><button onclick="deleteTask(${t.id})">🗑</button></div>`;
    list.appendChild(div);
  });
}

function toggleDone(id){ const t=loadTasks(); const x=t.find(a=>a.id===id); if(x){x.done=!x.done; saveTasks(t); renderAll();} }
function deleteTask(id){ let t=loadTasks().filter(a=>a.id!==id); saveTasks(t); renderAll(); }

// Progress chart
function renderProgress(){
  const tasks=loadTasks(); const done=tasks.filter(t=>t.done).length; const pend=tasks.length-done;
  const c=document.getElementById('progress-chart'); const ctx=c.getContext('2d');
  ctx.clearRect(0,0,c.width,c.height);
  ctx.fillStyle='#10b981'; ctx.fillRect(100,200-done*20,50,done*20);
  ctx.fillStyle='#f59e0b'; ctx.fillRect(200,200-pend*20,50,pend*20);
  document.getElementById('progress-text').textContent=`${done} done • ${pend} pending`;
}

// Reminder check
function checkReminders(){
  const now=new Date(); let tasks=loadTasks();
  tasks.forEach(t=>{
    if(!t.done&&t.date){
      const when=new Date(t.date+"T"+(t.time||"00:00"));
      if(when<=now&&!t.notified){
        showNotify(t.title,`${t.date} ${t.time}`);
        t.notified=true; playAlarm();
      }
    }
  });
  saveTasks(tasks);
}

function showNotify(title,body){
  document.getElementById('notify-title').textContent=title;
  document.getElementById('notify-body').textContent=body;
  document.getElementById('notify-banner').style.display='block';
}
document.getElementById('dismiss-notify').onclick=()=>document.getElementById('notify-banner').style.display='none';

function playAlarm(){ const ctx=new(window.AudioContext||window.webkitAudioContext)(); const o=ctx.createOscillator(); const g=ctx.createGain(); o.type='sine'; o.frequency.value=880; o.connect(g); g.connect(ctx.destination); o.start(); setTimeout(()=>{o.stop();ctx.close();},1000); }

// Render all
function renderAll(){ renderGoals(); renderProgress(); }
setInterval(checkReminders,5000);
renderAll();

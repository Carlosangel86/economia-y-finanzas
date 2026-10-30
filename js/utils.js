// =====================================================================
// UTILITIES & HELPER FUNCTIONS MODULE (utils.js)
// CFO Copilot + Punto de Venta
// =====================================================================

// --- 1. MANEJO DE ZONA FISCAL Y HUSO HORARIO MULTI-REGIÓN ---
function onTaxZoneChange(val){
    currentTaxZoneRate = parseFloat(val) / 100;
    localStorage.setItem('pos_tax_rate', currentTaxZoneRate.toString());
    logActivity('Zona Fiscal Actualizada', `Tasa IVA configurada al ${val}%`, 'info');
    upPosSummary();
    renderTicket();
}

function onTimezoneChange(val){
    currentAppTimeZone = val;
    localStorage.setItem('pos_app_tz', val);
    logActivity('Huso Horario Actualizado', `Zona horaria fijada en ${val}`, 'info');
    upPosSummary();
    renderAuditLog();
    if(document.getElementById('pos-date')){
        document.getElementById('pos-date').textContent = formatAppDate(new Date().toISOString(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }
}

function formatAppDate(isoString, options = null){
    if(!isoString) return '—';
    try {
        const d = new Date(isoString);
        const defaultOpts = options || {
            timeZone: currentAppTimeZone,
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };
        return new Intl.DateTimeFormat('es-MX', defaultOpts).format(d);
    } catch(e) {
        return new Date(isoString).toLocaleString('es-MX');
    }
}

// --- 2. NOTIFICACIONES GLOBALES TOAST ---
function showGlobalToast(msg, type = 'info'){
    let toast = document.getElementById('cfo-global-toast');
    if(!toast){
        toast = document.createElement('div');
        toast.id = 'cfo-global-toast';
        document.body.appendChild(toast);
    }
    const colors = {
        success: 'background:rgba(6,78,59,0.95); border:1px solid rgba(16,185,129,0.6); color:#a7f3d0;',
        info: 'background:rgba(12,74,110,0.95); border:1px solid rgba(14,165,233,0.6); color:#bae6fd;',
        warn: 'background:rgba(120,53,15,0.95); border:1px solid rgba(245,158,11,0.6); color:#fde68a;',
        danger: 'background:rgba(136,19,55,0.95); border:1px solid rgba(244,63,94,0.6); color:#fecdd3;'
    };
    toast.style.cssText = `position:fixed; bottom:20px; right:20px; z-index:99999; padding:10px 16px; border-radius:12px; font-size:12px; font-weight:600; box-shadow:0 10px 30px rgba(0,0,0,0.5); display:flex; align-items:center; gap:8px; backdrop-filter:blur(12px); ${colors[type] || colors.info} transform:translateY(0); opacity:1; transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1);`;
    
    const iconName = type === 'success' ? 'check-circle' : type === 'danger' ? 'alert-octagon' : 'info';
    toast.innerHTML = `<i data-lucide="${iconName}" class="w-4 h-4"></i><span>${msg}</span>`;
    if(window.lucide && typeof lucide.createIcons === 'function') lucide.createIcons();
    
    if(window.__toastTimer) clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => { toast.style.display = 'none'; }, 300);
    }, 2600);
}

// --- 3. UTILIDADES COMPARTIDAS, MENSAJES Y FORMATEADORES ---
function addMsg(t,w){const c=document.getElementById('chat'),d=document.createElement('div');d.className='fin';if(w==='u')d.innerHTML=`<div class="flex flex-col items-end w-full"><span class="text-[9px] text-slate-500 mb-1 mr-1">Tú</span><div class="bg-slate-700/80 text-white p-3.5 rounded-2xl rounded-tr-sm max-w-[82%] text-[13px] shadow-lg border border-slate-600/60">${t}</div></div>`;else d.innerHTML=`<div class="flex flex-col items-start w-full"><span class="text-[9px] text-sky-400 font-semibold mb-1 ml-1 flex items-center gap-1"><i data-lucide="bot" class="w-3 h-3"></i>CFO Copilot</span><div class="bot-bubble">${t}</div></div>`;c.appendChild(d);lucide.createIcons();c.scrollTop=c.scrollHeight;}
async function phase(id,t,cl,ms){st(id,t,cl);const p=document.getElementById('p'+id);if(p)p.classList.add('glow');await slp(ms);if(p)p.classList.remove('glow');}
function st(id,t,cl){const el=document.getElementById('st'+id.charAt(0));if(el){el.textContent=t;el.className='text-[9px] uppercase font-bold mono text-white px-2 py-0.5 rounded '+cl;}}
function alog(m){auditE.push({ts:new Date().toISOString(),msg:m});const c=document.getElementById('logs');if(!c)return;const d=document.createElement('div');d.textContent=`[${new Date().toLocaleTimeString()}] ${m}`;c.appendChild(d);c.scrollTop=c.scrollHeight;}
function fmt(v){if(v===null||isNaN(v))return'N/A';return new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(v);}
function fmtS(v){if(Math.abs(v)>=1e6)return'$'+(v/1e6).toFixed(1)+'M';if(Math.abs(v)>=1e3)return'$'+(v/1e3).toFixed(0)+'k';return'$'+v;}
function dl(obj,name){const b=new Blob([JSON.stringify(obj,null,2)],{type:'application/json'});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download=name;a.click();URL.revokeObjectURL(u);}
function toast(id){const el=document.getElementById(id);el.classList.remove('hidden');setTimeout(()=>el.classList.add('hidden'),3000);}
const slp=ms=>new Promise(r=>setTimeout(r,ms));

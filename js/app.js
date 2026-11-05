// ===== NAVEGACIÓN, ORQUESTACIÓN & ARRANQUE DE LA APLICACIÓN =====

// ===== NAVIGATION =====
let posViewMode = 'today';
function goTo(v){
    // 0. Bloqueo estricto si no hay sesión activa
    if (!currentUser) {
        if (typeof showAuthModal === 'function') showAuthModal('login');
        return;
    }
    // 1. Verificación de Seguridad y Permisos por Pantalla
    if(v === 'advisor'){
        const canAccessAdvisor = hasPermission('finance.view_analysis') || hasPermission('ai.qwen_access') || hasPermission('ai.tax_access');
        if(!canAccessAdvisor){
            const rName = currentUser ? currentUser.role.toUpperCase() : 'SIN SESIÓN';
            showAccessDeniedModal(`Acceso Restringido: Tu perfil (${rName}) no tiene permisos para acceder a la Asesoría Financiera, proyecciones ni valuación del negocio.`);
            return;
        }
    }

    if(v === 'pos'){
        const canAccessPos = hasPermission('pos.sell') || hasPermission('catalog.view') || hasPermission('pos.stats_view') || hasPermission('pos.almacen_view') || hasPermission('inventory.view');
        if(!canAccessPos){
            showAccessDeniedModal(`Acceso Restringido: Tu perfil no cuenta con permisos para operar el Punto de Venta.`);
            return;
        }
    }

    ['menu','advisor','pos'].forEach(n => {
        const el = document.getElementById('view-' + n);
        if(el) el.classList.toggle('hidden', n !== v);
    });

    if(v === 'pos'){
        updateShiftUI();
        const dateEl = document.getElementById('pos-date');
        if(dateEl) dateEl.textContent = formatAppDate(new Date().toISOString(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        applyRoleUI();
        if(!hourlyChart) initHourlyChart();
        if(hourlyChart) { hourlyChart.resize(); hourlyChart.update(); }
    }
    if(v === 'advisor'){
        checkPosData();
        updateInitialHints();
    }
    const btnBack = document.getElementById('btn-header-back-menu');
    if(btnBack) btnBack.classList.toggle('hidden', v === 'menu');

    if(v === 'menu'){
        updateMenuIndicators();
    }
    if(window.lucide && typeof lucide.createIcons === 'function') lucide.createIcons();
}

function showPosViewMode(mode){
    if(mode === 'today' && !hasPermission('pos.today_view')){
        showAccessDeniedModal('Tu rol no tiene acceso al corte de caja ni al resumen de hoy.');
        return;
    }
    if(mode === 'stats' && !hasPermission('pos.stats_view')){
        showAccessDeniedModal('Tu rol no tiene autorización para consultar estadísticas ni correlaciones.');
        return;
    }
    if(mode === 'almacen' && !hasPermission('pos.almacen_view')){
        showAccessDeniedModal('Tu rol no tiene acceso al panel de control de almacén.');
        return;
    }

    posViewMode = mode;
    ['today', 'stats', 'almacen'].forEach(m => {
        const el = document.getElementById('pos-panel-' + m);
        const btn = document.getElementById('btn-pos-' + m);
        const isActive = m === mode;
        if(el) el.classList.toggle('hidden', !isActive);
        if(btn){
            if(isActive){
                btn.classList.add('tab-on');
                btn.classList.remove('text-slate-500');
            } else {
                btn.classList.remove('tab-on');
                btn.classList.add('text-slate-500');
            }
        }
    });

    if(mode === 'today') upPosSummary();
    if(mode === 'stats') {
        upPosStats();
        if(hourlyChart) { hourlyChart.resize(); hourlyChart.update(); }
    }
    if(mode === 'almacen') renderAlmacenDashboard();
    lucide.createIcons();
}

function renderAlmacenDashboard(){
    const totalProds = catalog.length;
    const totalUnits = catalog.reduce((acc, p) => acc + (p.stock || 0), 0);
    const lowStockProds = catalog.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= (p.rop || 5));
    const outStockProds = catalog.filter(p => (p.stock || 0) <= 0);

    const elTotP = document.getElementById('alm-total-prods');
    const elTotU = document.getElementById('alm-total-units');
    const elLow = document.getElementById('alm-low-stock');
    const elOut = document.getElementById('alm-out-stock');

    if(elTotP) elTotP.textContent = totalProds;
    if(elTotU) elTotU.textContent = totalUnits;
    if(elLow) elLow.textContent = lowStockProds.length;
    if(elOut) elOut.textContent = outStockProds.length;

    const criticalList = [...outStockProds, ...lowStockProds];
    const critContainer = document.getElementById('alm-critical-list');
    if(!critContainer) return;

    if(criticalList.length === 0){
        critContainer.innerHTML = '<div class="text-emerald-400 text-xs py-6 text-center font-medium">✓ Todos los productos cuentan con inventario saludable (> 5 unidades).</div>';
    } else {
        critContainer.innerHTML = criticalList.map(p => {
            const isZero = (p.stock || 0) <= 0;
            const ropThreshold = p.rop || 5;
            const badge = isZero
                ? `<span class="pill bg-rose-500/20 text-rose-300 border border-rose-500/35 font-bold text-[9px] flex items-center gap-1"><i data-lucide="alert-octagon" class="w-2.5 h-2.5 text-rose-400"></i>AGOTADO (0 u.)</span>`
                : `<span class="pill bg-amber-500/20 text-amber-300 border border-amber-500/35 font-bold text-[9px] flex items-center gap-1"><i data-lucide="alert-triangle" class="w-2.5 h-2.5 text-amber-400"></i>ROP Crítico (${p.stock} <= ${ropThreshold} u.)</span>`;
            return `
            <div class="pos-row flex items-center justify-between p-2.5 bg-slate-900/50 border border-slate-800 rounded-xl">
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span class="text-xs font-semibold text-white truncate">${p.name}</span>
                        ${badge}
                    </div>
                    <div class="text-[10px] text-slate-400 mono">P. Venta: ${fmt(p.price)} · Existencia: <b class="${isZero ? 'text-rose-400' : 'text-amber-400'}">${p.stock || 0} u.</b> · ROP: <span class="text-sky-300">${ropThreshold} u.</span> (Lead Time: ${p.leadTime || 7}d)</div>
                </div>
                <button onclick="quickAddStock('${p.id}', 10)" class="pos-btn bg-teal-600 hover:bg-teal-500 text-white text-[10.5px] py-1 px-2.5 shrink-0 flex items-center gap-1">
                    <i data-lucide="plus" class="w-3 h-3"></i>+10 u.
                </button>
            </div>`;
        }).join('');
    }
    lucide.createIcons();
}

function syncAndGoToAdvisor(){
    goTo('advisor');
    syncFromPos();
}

function updateMenuIndicators(){
    const posData = getPosFinancials();
    const ind = document.getElementById('menu-pos-indicator');
    const cnt = document.getElementById('menu-pos-count');
    if(posData){
        if(ind) ind.classList.remove('hidden');
        if(cnt){
            cnt.classList.remove('hidden');
            cnt.innerHTML = `<i data-lucide="database" class="w-3 h-3"></i>${posData.totalSales} ventas · ${posData.daysWithData} día(s)`;
        }
    } else {
        if(ind) ind.classList.add('hidden');
        if(cnt) cnt.classList.add('hidden');
    }

    // Adaptar Menú Principal según rol activo
    const canAdv = hasPermission('finance.view_analysis') || hasPermission('ai.qwen_access') || hasPermission('ai.tax_access');
    const cardAdv = document.getElementById('menu-card-advisor');
    const badgeAdv = document.getElementById('menu-adv-role-badge');
    const badgePos = document.getElementById('menu-pos-role-badge');
    const descPos = document.getElementById('menu-pos-desc');

    if(cardAdv){
        cardAdv.style.opacity = canAdv ? '1' : '0.45';
        cardAdv.style.cursor = canAdv ? 'pointer' : 'not-allowed';
    }
    if(badgeAdv){
        badgeAdv.innerHTML = canAdv
            ? `<span class="pill bg-sky-500/15 text-sky-300 border border-sky-500/30 text-[9.5px]">✓ Módulo Habilitado</span>`
            : `<span class="pill bg-rose-500/20 text-rose-300 border border-rose-500/35 text-[9.5px] font-bold">🔒 No Disponible para ${currentUser ? currentUser.role.toUpperCase() : ''}</span>`;
    }

    if(badgePos && currentUser){
        const roleNotes = {
            cajero: 'Caja Registradora y Ventas del Turno',
            almacen: 'Catálogo de Refacciones e Inventario',
            analista: 'Estadísticas, Top Ventas y Correlaciones',
            supervisor: 'Operación de Ventas, Caja y Cancelaciones',
            admin: 'Control Total de Operaciones'
        };
        badgePos.innerHTML = `<span class="pill bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[9.5px]">Acceso: ${roleNotes[currentUser.role] || 'Habilitado'}</span>`;
        if(descPos){
            const descNotes = {
                cajero: 'Módulo exclusivo para registro de ventas, selección de método de pago y tickets.',
                almacen: 'Módulo exclusivo para alta de productos y reabastecimiento de existencias (eliminación restringida a Administrador).',
                analista: 'Módulo de análisis: consulta de productos más vendidos y correlación cruzada.',
                supervisor: 'Supervisión operativa, cierres de caja y aprobación de cancelaciones.',
                admin: 'Registro de tickets, corte de caja, catálogo, gastos y administración de usuarios.'
            };
            descPos.textContent = descNotes[currentUser.role] || descPos.textContent;
        }
    }
    lucide.createIcons();
}

function checkPosData(){
    const posData=getPosFinancials();
    const banner=document.getElementById('pos-sync-banner');
    if(!posData){banner.classList.add('hidden');return;}
    // Show sync banner if we have POS data and haven't synced yet (or data changed)
    const alreadySynced=(S.rev===posData.avgRevenue && S.cost===posData.avgCost);
    if(alreadySynced){banner.classList.add('hidden');return;}
    banner.classList.remove('hidden');
    banner.innerHTML=`
    <div class="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/8 backdrop-blur-md">
        <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-600/20"><i data-lucide="link-2" class="text-white w-5 h-5"></i></div>
            <div class="flex-1">
                <div class="text-sm font-bold text-emerald-300 mb-1 flex items-center gap-2">Datos del Punto de Venta disponibles <span class="pill bg-emerald-900/60 text-emerald-400 border border-emerald-700/50">POS</span></div>
                <div class="text-[12px] text-emerald-200/80 leading-relaxed mb-2.5">
                    Se detectaron <b>${posData.totalSales} ventas</b> en <b>${posData.daysWithData} día(s)</b> registrado(s).
                    <br>Promedio mensual estimado: <b class="text-emerald-400">${fmt(posData.avgRevenue)}</b> en ventas · <b class="text-rose-400">${fmt(posData.avgCost)}</b> en costos (COGS + gastos).
                </div>
                <div class="flex gap-2">
                    <button onclick="syncFromPos()" class="pos-btn bg-emerald-600 hover:bg-emerald-500 text-white text-[11px]"><i data-lucide="zap" class="w-3.5 h-3.5"></i>Sincronizar con POS</button>
                    <button onclick="document.getElementById('pos-sync-banner').classList.add('hidden')" class="pos-btn bg-slate-700/60 hover:bg-slate-600 text-slate-300 text-[11px]"><i data-lucide="x" class="w-3.5 h-3.5"></i>Ignorar</button>
                </div>
            </div>
        </div>
    </div>`;
    lucide.createIcons();
}

function getPosFinancials(){
    const allSales=JSON.parse(localStorage.getItem('pos_sales')||'[]');
    const ex=JSON.parse(localStorage.getItem('pos_expenses')||'[]');
    const sl = allSales.filter(s => s.status !== 'cancelled');
    if(sl.length===0)return null;
    // Get unique days that have sales
    const daySet=new Set();
    let totalRev=0,totalCogs=0,totalExp=0;
    sl.forEach(s=>{daySet.add(new Date(s.date).toDateString());totalRev+=s.total;totalCogs+=s.totalCost;});
    ex.forEach(e=>{totalExp+=e.amount;});
    const daysWithData=daySet.size;
    if(daysWithData===0)return null;
    // Estimate monthly: daily average * 30
    const dailyAvgRev=totalRev/daysWithData;
    const dailyAvgCost=(totalCogs+totalExp)/daysWithData;
    return {
        totalSales:sl.length,
        daysWithData,
        totalRevenue:totalRev,
        totalCogs,
        totalExpenses:totalExp,
        dailyAvgRev,
        dailyAvgCost,
        avgRevenue:Math.round(dailyAvgRev*30),
        avgCost:Math.round(dailyAvgCost*30)
    };
}

async function syncFromPos(){
    const posData=getPosFinancials();
    if(!posData)return;
    // Inject into state
    S.rev=posData.avgRevenue;
    S.cost=posData.avgCost;
    // Hide banner
    document.getElementById('pos-sync-banner').classList.add('hidden');
    // Show as user message
    const userMsg = `📊 Sincronizar datos del Punto de Venta: Ventas promedio ${fmt(posData.avgRevenue)}/mes, Costos ${fmt(posData.avgCost)}/mes (calculado de ${posData.totalSales} ventas en ${posData.daysWithData} día(s))`;
    addMsg(userMsg,'u');
    // Process through engine
    if(busy)return;
    busy=true;document.getElementById('iw').classList.add('lock');document.getElementById('hints').innerHTML='';
    document.getElementById('typ').classList.remove('hidden');
    try{
        alog('POS Sync — importing data');await phase('Orch','SYNCING POS','bg-emerald-500',600);
        document.getElementById('oJ').textContent=JSON.stringify(S,null,2);upQ();st('Orch','POS SYNCED','bg-emerald-600');
        await phase('Eng','CALCULATING','bg-amber-500',500);const R=calc();
        document.getElementById('oM').textContent=JSON.stringify(R,null,2);st('Eng','DONE','bg-emerald-600');upDash(R);upRatios(R);
        alog('POS data integrated');await slp(500);document.getElementById('typ').classList.add('hidden');
        let msg=`<div class="flex items-center gap-2 mb-2"><span class="pill bg-emerald-900/60 text-emerald-400 border border-emerald-700/50"><i data-lucide="link-2" class="w-3 h-3 inline"></i> POS Sync</span><span class="text-emerald-400 font-bold text-[11px]">Datos importados correctamente</span></div>`;
        msg+=`<div class="grid grid-cols-2 gap-2 my-2"><div class="bg-slate-800/40 rounded-lg p-2.5 text-center border border-slate-700/30"><div class="text-[8px] text-slate-500 uppercase font-bold">Ventas/Mes</div><div class="text-sm font-bold mono text-emerald-400 mt-1">${fmt(posData.avgRevenue)}</div></div><div class="bg-slate-800/40 rounded-lg p-2.5 text-center border border-slate-700/30"><div class="text-[8px] text-slate-500 uppercase font-bold">Costos/Mes</div><div class="text-sm font-bold mono text-rose-400 mt-1">${fmt(posData.avgCost)}</div></div></div>`;
        msg+=exp("Datos del POS","Se calculó el promedio mensual tomando tus ventas reales de "+posData.daysWithData+" día(s) y proyectándolas a 30 días. Incluye el costo de producción de cada producto vendido más los gastos operativos que registraste.");
        msg+=narrate(R);
        addMsg(msg,'b');advStep();saveAdv(R);
        // Call local LLM for advanced suggestions based on POS data
        askOllama(userMsg, R, S);
    }catch(e){alog('[ERR] '+e.message);document.getElementById('typ').classList.add('hidden');addMsg('Error al sincronizar. Revisa logs.','b');}
    finally{busy=false;document.getElementById('iw').classList.remove('lock');}
}



// ===== INICIALIZACIÓN GLOBAL DEL SISTEMA CON FIREBASE =====
async function startApp() {
    if (window.FirebaseService) {
        await initAuthAndUsers();
        if (typeof initPosData === 'function') await initPosData();
    } else {
        window.addEventListener('firebase-initialized', async () => {
            await initAuthAndUsers();
            if (typeof initPosData === 'function') await initPosData();
            if (window.lucide && typeof lucide.createIcons === 'function') {
                lucide.createIcons();
            }
        }, { once: true });
        // Fallback por si el evento ya se ejecutó
        setTimeout(async () => {
            if (!currentUser) {
                await initAuthAndUsers();
                if (typeof initPosData === 'function') await initPosData();
            }
        }, 1800);
    }
    if (window.lucide && typeof lucide.createIcons === 'function') {
        lucide.createIcons();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp);
} else {
    startApp();
}

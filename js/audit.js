// ===== BITÁCORA DE AUDITORÍA =====

let activityLog = [];

// ===== BITÁCORA DE AUDITORÍA =====
function logActivity(action, details, level = 'info'){
    const entry = {
        id: 'act_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        timestamp: new Date().toISOString(),
        user: currentUser ? currentUser.username : 'sistema',
        role: currentUser ? currentUser.role : 'ninguno',
        action,
        details,
        level
    };
    activityLog.unshift(entry);
    if(activityLog.length > 200) activityLog = activityLog.slice(0, 200);
    if (window.FirebaseService && window.FirebaseService.stats) {
        window.FirebaseService.stats.saveActivityLog(activityLog).catch(console.warn);
    }
    renderAuditLog();
}

function clearAuditLog(){
    if(!hasPermission('audit.view_all')){
        showAccessDeniedModal('Solo el Administrador puede vaciar la bitácora de auditoría.');
        return;
    }
    if(confirm('¿Deseas vaciar la bitácora de auditoría?')){
        activityLog = [];
        if (window.FirebaseService && window.FirebaseService.stats) {
        window.FirebaseService.stats.saveActivityLog(activityLog).catch(console.warn);
    }
        logActivity('Bitácora Vaciada', 'El administrador reinició el historial de auditoría.', 'warn');
    }
}

function renderAuditLog(){
    const container = document.getElementById('audit-log-list');
    if(!container) return;

    if(!hasPermission('audit.view_all') && !hasPermission('audit.view_limited')){
        container.innerHTML = '<div class="text-slate-600 text-xs py-6 text-center">Acceso a bitácora restringido para este rol.</div>';
        return;
    }

    const filtered = hasPermission('audit.view_all')
        ? activityLog
        : activityLog.filter(a => ['Venta Registrada', 'Venta Cancelada Directamente', 'Solicitud Cancelación', 'Solicitud Aprobada', 'Solicitud Rechazada', 'Stock Reabastecido'].includes(a.action));

    if(filtered.length === 0){
        container.innerHTML = '<div class="text-slate-600 text-xs py-6 text-center">Sin eventos registrados aún.</div>';
        return;
    }

    container.innerHTML = filtered.map(a => {
        const timeStr = new Date(a.timestamp).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const levelCls = a.level === 'success' ? 'audit-success' : a.level === 'warn' ? 'audit-warn' : a.level === 'danger' ? 'audit-danger' : 'audit-info';
        return `
        <div class="pos-row flex items-start gap-2.5 p-2 text-xs">
            <span class="audit-pill ${levelCls} shrink-0 mt-0.5">${a.action}</span>
            <div class="flex-1 min-w-0">
                <div class="text-slate-300">${a.details}</div>
                <div class="text-[10px] text-slate-500 mt-0.5 mono">
                    ${timeStr} · <b>@${a.user}</b> (${a.role})
                </div>
            </div>
        </div>`;
    }).join('');
}



// ===== SISTEMA DE CANCELACIONES Y SOLICITUDES DE AUTORIZACIÓN =====

let cancelRequests = [];

function updatePendingBadge(){
    const pendingCount = cancelRequests.filter(r => r.status === 'pending').length;
    const b1 = document.getElementById('tab-pending-badge');
    const b2 = document.getElementById('badge-pending-count');
    if(b1) b1.classList.toggle('hidden', pendingCount === 0 || !hasPermission('sales.approve_cancel'));
    if(b2){
        b2.textContent = pendingCount;
        b2.classList.toggle('hidden', pendingCount === 0 || !hasPermission('sales.approve_cancel'));
    }
}


// ===== SISTEMA DE CANCELACIONES Y SOLICITUDES =====
let activeCancelAction = null; // { mode: 'request'|'direct'|'approve'|'reject', saleId, reqId }

function closeCancelModal(){
    const modal = document.getElementById('cancel-action-modal');
    if(modal) modal.classList.add('hidden');
    activeCancelAction = null;
}

function promptRequestCancel(saleId){
    if(!hasPermission('sales.request_cancel')){
        showAccessDeniedModal('Tu rol no tiene permiso para solicitar cancelaciones.');
        return;
    }
    const sale = salesLog.find(s => s.id === saleId);
    if(!sale){ alert('Venta no encontrada.'); return; }
    if(sale.status === 'cancelled'){ alert('Esta venta ya se encuentra cancelada.'); return; }
    if(cancelRequests.some(r => r.saleId === saleId && r.status === 'pending')){
        alert('Ya existe una solicitud pendiente de autorización para esta venta.');
        return;
    }

    activeCancelAction = { mode: 'request', saleId };
    
    document.getElementById('cancel-modal-title').innerHTML = `<i data-lucide="clock" class="w-4 h-4 text-amber-400"></i>Solicitar Cancelación de Venta`;
    document.getElementById('cancel-modal-desc').textContent = 'Como cajero, esta solicitud será enviada al Supervisor de Turno para su evaluación y posterior reintegro de inventario.';
    document.getElementById('cancel-modal-input-label').textContent = 'Motivo obligatorio de la solicitud';
    
    const itemsDesc = (sale.items || []).map(it => `${it.qty}x ${it.name}`).join(', ');
    document.getElementById('cancel-modal-sale-info').innerHTML = `
        <div class="flex justify-between"><span>Venta:</span> <b class="text-white mono">${sale.id}</b></div>
        <div class="flex justify-between"><span>Importe:</span> <b class="text-emerald-400 mono">${fmt(sale.total)}</b></div>
        <div class="flex justify-between"><span>Productos:</span> <span class="text-slate-300 truncate max-w-[200px]">${itemsDesc}</span></div>
    `;

    document.getElementById('cancel-modal-reason').value = '';
    document.getElementById('cancel-modal-actions').innerHTML = `
        <button onclick="closeCancelModal()" class="pos-btn bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs">Cancelar</button>
        <button onclick="executeCancelModalSubmit()" class="pos-btn bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold"><i data-lucide="send" class="w-3.5 h-3.5"></i>Enviar Solicitud</button>
    `;

    document.getElementById('cancel-action-modal').classList.remove('hidden');
    lucide.createIcons();
}

function promptDirectCancel(saleId){
    if(!hasPermission('sales.cancel_direct')){
        showAccessDeniedModal('Solo un Supervisor o Administrador puede anular ventas directamente.');
        return;
    }
    const sale = salesLog.find(s => s.id === saleId);
    if(!sale){ alert('Venta no encontrada.'); return; }
    if(sale.status === 'cancelled'){ alert('Esta venta ya está cancelada.'); return; }

    activeCancelAction = { mode: 'direct', saleId };

    document.getElementById('cancel-modal-title').innerHTML = `<i data-lucide="alert-triangle" class="w-4 h-4 text-rose-400"></i>Anulación Directa de Venta`;
    document.getElementById('cancel-modal-desc').textContent = 'Como Supervisor o Administrador, esta acción cancelará la venta de inmediato y devolverá el stock de los productos al inventario una sola vez.';
    document.getElementById('cancel-modal-input-label').textContent = 'Justificación obligatoria de la anulación';

    const itemsDesc = (sale.items || []).map(it => `${it.qty}x ${it.name}`).join(', ');
    document.getElementById('cancel-modal-sale-info').innerHTML = `
        <div class="flex justify-between"><span>Venta:</span> <b class="text-white mono">${sale.id}</b></div>
        <div class="flex justify-between"><span>Importe:</span> <b class="text-rose-400 mono">${fmt(sale.total)}</b></div>
        <div class="flex justify-between"><span>Cajero origen:</span> <span class="text-slate-300">@${sale.cashierUsername || 'caja'}</span></div>
        <div class="flex justify-between"><span>Productos:</span> <span class="text-slate-300 truncate max-w-[200px]">${itemsDesc}</span></div>
    `;

    document.getElementById('cancel-modal-reason').value = '';
    document.getElementById('cancel-modal-actions').innerHTML = `
        <button onclick="closeCancelModal()" class="pos-btn bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs">Regresar</button>
        <button onclick="executeCancelModalSubmit()" class="pos-btn bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i>Confirmar Cancelación</button>
    `;

    document.getElementById('cancel-action-modal').classList.remove('hidden');
    lucide.createIcons();
}

function promptRejectRequest(reqId){
    if(!hasPermission('sales.approve_cancel')){
        showAccessDeniedModal('Tu rol no tiene permiso para evaluar solicitudes.');
        return;
    }
    const req = cancelRequests.find(r => r.id === reqId);
    if(!req || req.status !== 'pending') return;

    activeCancelAction = { mode: 'reject', reqId };

    document.getElementById('cancel-modal-title').innerHTML = `<i data-lucide="x-circle" class="w-4 h-4 text-rose-400"></i>Rechazar Solicitud de Cancelación`;
    document.getElementById('cancel-modal-desc').textContent = 'Indica el motivo por el cual rechazas esta cancelación. La venta permanecerá completada y el stock no se modificará.';
    document.getElementById('cancel-modal-input-label').textContent = 'Observación / Motivo de rechazo';

    document.getElementById('cancel-modal-sale-info').innerHTML = `
        <div class="flex justify-between"><span>Solicitud:</span> <b class="text-white mono">${req.id}</b></div>
        <div class="flex justify-between"><span>Venta Asociada:</span> <b class="text-slate-300 mono">${req.saleId}</b></div>
        <div class="flex justify-between"><span>Cajero Solicitante:</span> <span class="text-slate-300">@${req.cashierUsername}</span></div>
        <div class="flex justify-between"><span>Motivo Expuesto:</span> <span class="text-amber-300 italic truncate max-w-[200px]">${req.reason}</span></div>
    `;

    document.getElementById('cancel-modal-reason').value = '';
    document.getElementById('cancel-modal-actions').innerHTML = `
        <button onclick="closeCancelModal()" class="pos-btn bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs">Cerrar</button>
        <button onclick="executeCancelModalSubmit()" class="pos-btn bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"><i data-lucide="x" class="w-3.5 h-3.5"></i>Rechazar Solicitud</button>
    `;

    document.getElementById('cancel-action-modal').classList.remove('hidden');
    lucide.createIcons();
}

function executeCancelModalSubmit(){
    if(!activeCancelAction) return;
    const reason = document.getElementById('cancel-modal-reason').value.trim();
    if(!reason){
        alert('Debes ingresar una justificación o motivo antes de continuar.');
        return;
    }

    if(activeCancelAction.mode === 'request'){
        const sale = salesLog.find(s => s.id === activeCancelAction.saleId);
        if(!sale) return;

        const req = {
            id: 'req_' + Date.now(),
            saleId: sale.id,
            saleTotal: sale.total,
            cashierId: currentUser ? currentUser.id : 'usr_caja',
            cashierUsername: currentUser ? currentUser.username : 'caja_demo',
            cashierName: currentUser ? currentUser.name : 'Cajero',
            reason: reason,
            status: 'pending',
            timestamp: new Date().toISOString(),
            resolvedAt: null,
            resolvedBy: null,
            notes: ''
        };

        cancelRequests.unshift(req);
        if (window.FirebaseService && window.FirebaseService.stats) {
        window.FirebaseService.stats.saveCancelRequests(cancelRequests).catch(console.warn);
    }

        logActivity('Solicitud Cancelación', `Cajero @${req.cashierUsername} solicitó cancelar venta ${sale.id} ($${sale.total}). Motivo: ${reason}`, 'warn');
        closeCancelModal();
        alert('✓ Solicitud enviada exitosamente a la bandeja del Supervisor.');
        updatePendingBadge();
        upPosSummary();
        renderCancelRequests();
    }
    else if(activeCancelAction.mode === 'direct'){
        cancelSaleDirect(activeCancelAction.saleId, reason);
        closeCancelModal();
    }
    else if(activeCancelAction.mode === 'reject'){
        rejectCancelRequest(activeCancelAction.reqId, reason);
        closeCancelModal();
    }
}

function cancelSaleDirect(saleId, reason){
    if(!hasPermission('sales.cancel_direct')){
        showAccessDeniedModal('Solo un Supervisor o Administrador puede anular ventas directamente.');
        return;
    }
    const sale = salesLog.find(s => s.id === saleId);
    if(!sale){ alert('Venta no encontrada.'); return; }
    if(sale.status === 'cancelled'){
        alert('⛔ Esta venta ya fue cancelada anteriormente. No se duplicará el reintegro de inventario.');
        return;
    }

    // 1. Reintegrar stock al inventario UNA SOLA VEZ
    if(sale.items && Array.isArray(sale.items)){
        sale.items.forEach(it => {
            const prod = catalog.find(p => p.id === it.id);
            if(prod){
                prod.stock = (prod.stock || 0) + it.qty;
            }
        });
        if (window.FirebaseService && window.FirebaseService.products) {
        for (const it of sale.items) {
            const pr = catalog.find(p => p.id === it.id);
            if (pr) window.FirebaseService.products.updateStock(it.id, pr.stock).catch(console.warn);
        }
    }
    }

    // 2. Marcar venta como 'cancelled' (NUNCA BORRAR DEL ARRAY)
    sale.status = 'cancelled';
    sale.cancelReason = reason || 'Cancelación directa por supervisor/admin';
    sale.cancelledBy = `${currentUser.name} (@${currentUser.username} - ${currentUser.role})`;
    sale.cancelledAt = new Date().toISOString();
    if (window.FirebaseService && window.FirebaseService.sales) {
        window.FirebaseService.sales.cancel(saleId, reason, currentUser ? currentUser.name : 'Supervisor').catch(console.warn);
    }

    // 3. Si había solicitud pendiente para esta venta, resolverla
    const pendingReq = cancelRequests.find(r => r.saleId === saleId && r.status === 'pending');
    if(pendingReq){
        pendingReq.status = 'approved';
        pendingReq.resolvedBy = `${currentUser.name} (@${currentUser.username})`;
        pendingReq.resolvedAt = new Date().toISOString();
        pendingReq.notes = 'Aprobada vía anulación directa';
        if (window.FirebaseService && window.FirebaseService.stats) {
        window.FirebaseService.stats.saveCancelRequests(cancelRequests).catch(console.warn);
    }
    }

    logActivity('Venta Cancelada Directamente', `Venta ${sale.id} por $${sale.total} fue anulada por ${currentUser.username}. Motivo: ${reason}`, 'danger');
    alert(`✓ Venta ${sale.id} anulada con éxito. El inventario fue reintegrado.`);

    updatePendingBadge();
    renderCatalog();
    updateProductSelect();
    upPosSummary();
    upPosStats();
    renderCancelRequests();
    onSellProductChange();
}

function approveCancelRequest(reqId){
    if(!hasPermission('sales.approve_cancel')){
        showAccessDeniedModal('Solo un Supervisor o Administrador puede autorizar cancelaciones.');
        return;
    }
    const req = cancelRequests.find(r => r.id === reqId);
    if(!req || req.status !== 'pending'){
        alert('Esta solicitud ya fue procesada.');
        return;
    }

    const sale = salesLog.find(s => s.id === req.saleId);
    if(!sale){
        alert('No se encontró la venta vinculada a esta solicitud.');
        req.status = 'rejected';
        req.notes = 'Venta no existente';
        if (window.FirebaseService && window.FirebaseService.stats) {
        window.FirebaseService.stats.saveCancelRequests(cancelRequests).catch(console.warn);
    }
        renderCancelRequests();
        return;
    }

    // Prevenir re-devolución si la venta ya estuviese cancelada
    if(sale.status !== 'cancelled'){
        if(sale.items && Array.isArray(sale.items)){
            sale.items.forEach(it => {
                const prod = catalog.find(p => p.id === it.id);
                if(prod){
                    prod.stock = (prod.stock || 0) + it.qty;
                }
            });
            if (window.FirebaseService && window.FirebaseService.products) {
        for (const it of sale.items) {
            const pr = catalog.find(p => p.id === it.id);
            if (pr) window.FirebaseService.products.updateStock(it.id, pr.stock).catch(console.warn);
        }
    }
        }

        sale.status = 'cancelled';
        sale.cancelReason = req.reason;
        sale.cancelledBy = `${currentUser.name} (@${currentUser.username} - ${currentUser.role})`;
        sale.cancelledAt = new Date().toISOString();
        if (window.FirebaseService && window.FirebaseService.sales) {
        window.FirebaseService.sales.cancel(saleId, reason, currentUser ? currentUser.name : 'Supervisor').catch(console.warn);
    }
    }

    req.status = 'approved';
    req.resolvedBy = `${currentUser.name} (@${currentUser.username})`;
    req.resolvedAt = new Date().toISOString();
    req.notes = 'Aprobada en panel de control';
    if (window.FirebaseService && window.FirebaseService.stats) {
        window.FirebaseService.stats.saveCancelRequests(cancelRequests).catch(console.warn);
    }

    logActivity('Solicitud Aprobada', `Cancelación autorizada para venta ${sale.id} ($${sale.total}) solicitada por @${req.cashierUsername}`, 'success');
    alert(`✓ Solicitud aprobada. Venta ${sale.id} anulada e inventario reintegrado.`);

    updatePendingBadge();
    renderCatalog();
    updateProductSelect();
    upPosSummary();
    upPosStats();
    renderCancelRequests();
    onSellProductChange();
}

function rejectCancelRequest(reqId, notes){
    if(!hasPermission('sales.approve_cancel')){
        showAccessDeniedModal('Solo un Supervisor o Administrador puede rechazar cancelaciones.');
        return;
    }
    const req = cancelRequests.find(r => r.id === reqId);
    if(!req || req.status !== 'pending'){
        alert('Esta solicitud ya fue procesada.');
        return;
    }

    req.status = 'rejected';
    req.resolvedBy = `${currentUser.name} (@${currentUser.username})`;
    req.resolvedAt = new Date().toISOString();
    req.notes = notes || 'Rechazada por el evaluador';
    if (window.FirebaseService && window.FirebaseService.stats) {
        window.FirebaseService.stats.saveCancelRequests(cancelRequests).catch(console.warn);
    }

    logActivity('Solicitud Rechazada', `Solicitud ${req.id} de @${req.cashierUsername} fue rechazada. Motivo: ${notes}`, 'warn');
    alert(`✓ Solicitud de cancelación rechazada. La venta permanece completada.`);

    updatePendingBadge();
    renderCancelRequests();
    upPosSummary();
}

function renderCancelRequests(){
    const container = document.getElementById('requests-table-list');
    if(!container) return;

    if(!hasPermission('sales.approve_cancel') && !hasPermission('sales.request_cancel')){
        container.innerHTML = '<div class="text-slate-600 text-xs py-6 text-center">No tienes permiso para ver solicitudes de cancelación.</div>';
        return;
    }

    const canApprove = hasPermission('sales.approve_cancel');

    // Cajeros solo ven las que ellos generaron; supervisores/admin ven todas
    const visibleRequests = canApprove
        ? cancelRequests
        : cancelRequests.filter(r => r.cashierId === (currentUser ? currentUser.id : '') || r.cashierUsername === (currentUser ? currentUser.username : ''));

    if(visibleRequests.length === 0){
        container.innerHTML = '<div class="text-slate-600 text-xs py-6 text-center">No hay solicitudes registradas en la bandeja.</div>';
        return;
    }

    container.innerHTML = visibleRequests.map(r => {
        const isPending = r.status === 'pending';
        const isApproved = r.status === 'approved';
        const statusBadge = isPending
            ? `<span class="pill bg-amber-500/20 text-amber-300 border border-amber-500/35 text-[9px] font-bold"><i data-lucide="clock" class="w-2.5 h-2.5"></i>PENDIENTE</span>`
            : isApproved
            ? `<span class="pill bg-emerald-500/20 text-emerald-300 border border-emerald-500/35 text-[9px] font-bold"><i data-lucide="check" class="w-2.5 h-2.5"></i>APROBADA</span>`
            : `<span class="pill bg-rose-500/20 text-rose-300 border border-rose-500/35 text-[9px] font-bold"><i data-lucide="x" class="w-2.5 h-2.5"></i>RECHAZADA</span>`;

        let actionBtns = '';
        if(isPending && canApprove){
            actionBtns = `
            <div class="flex gap-1.5 mt-2 pt-2 border-t border-slate-800">
                <button onclick="approveCancelRequest('${r.id}')" class="pos-btn bg-emerald-600/90 hover:bg-emerald-500 text-white text-[10.5px] py-1 px-2.5"><i data-lucide="check" class="w-3 h-3"></i>Aprobar & Reintegrar</button>
                <button onclick="promptRejectRequest('${r.id}')" class="pos-btn bg-rose-600/80 hover:bg-rose-500 text-white text-[10.5px] py-1 px-2.5"><i data-lucide="x" class="w-3 h-3"></i>Rechazar</button>
            </div>`;
        }

        return `
        <div class="p-3 bg-slate-900/50 border border-slate-800 rounded-xl space-y-1 text-xs">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <span class="font-bold text-white mono">${r.saleId}</span>
                    <span class="text-emerald-400 font-semibold mono">${fmt(r.saleTotal)}</span>
                </div>
                ${statusBadge}
            </div>
            <div class="text-slate-300 text-[11px]"><b class="text-slate-400 font-normal">Motivo:</b> "${r.reason}"</div>
            <div class="text-[10px] text-slate-500 flex justify-between items-center pt-1">
                <span>Por: <b>@${r.cashierUsername}</b> (${r.cashierName})</span>
                <span>${new Date(r.timestamp).toLocaleDateString('es-MX')} ${new Date(r.timestamp).toLocaleTimeString('es-MX', {hour:'2-digit',minute:'2-digit'})}</span>
            </div>
            ${r.resolvedBy ? `<div class="text-[9.5px] text-slate-400 border-t border-slate-800/60 pt-1 mt-1">Evaluado por: <b>${r.resolvedBy}</b> ${r.notes ? '— <i>' + r.notes + '</i>' : ''}</div>` : ''}
            ${actionBtns}
        </div>`;
    }).join('');
    lucide.createIcons();
}



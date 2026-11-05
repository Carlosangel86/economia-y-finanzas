// ===== CONTROL DE TURNOS Y ARQUEOS DE CAJA =====

// ===== CONTROL DE TURNOS Y ARQUEOS DE CAJA =====
let currentShift = JSON.parse(localStorage.getItem('pos_current_shift')) || null;
let shiftsHistory = JSON.parse(localStorage.getItem('pos_shifts_history')) || [];



function updateShiftUI(){
    const pill = document.getElementById('shift-status-pill');
    const info = document.getElementById('shift-info-text');
    const btnOpen = document.getElementById('btn-shift-open');
    const btnCutX = document.getElementById('btn-shift-cutx');
    const btnCutZ = document.getElementById('btn-shift-cutz');

    if(!pill) return;

    if(currentShift && currentShift.status === 'open'){
        pill.className = 'pill bg-emerald-500/20 text-emerald-300 border border-emerald-500/35 text-xs font-semibold flex items-center gap-1.5';
        pill.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>Turno Abierto';
        if(info) info.textContent = `Cajero: @${currentShift.cashierUsername} · Fondo: ${fmt(currentShift.initialCashFloat)} · Inicio: ${formatAppDate(currentShift.openedAt, {hour:'2-digit', minute:'2-digit'})}`;
        if(btnOpen) btnOpen.classList.add('hidden');
        if(btnCutX) btnCutX.classList.remove('hidden');
        if(btnCutZ) btnCutZ.classList.remove('hidden');
    } else {
        pill.className = 'pill bg-slate-800 text-slate-400 border border-slate-700 text-xs font-semibold flex items-center gap-1.5';
        pill.innerHTML = '<span class="w-2 h-2 rounded-full bg-slate-500"></span>Sin Turno Activo';
        if(info) info.textContent = 'Abre turno con fondo de caja para registrar ventas';
        if(btnOpen) btnOpen.classList.remove('hidden');
        if(btnCutX) btnCutX.classList.add('hidden');
        if(btnCutZ) btnCutZ.classList.add('hidden');
    }
}

function promptOpenShift(){
    const m = document.getElementById('shift-open-modal');
    if(m) {
        const inp = document.getElementById('shift-initial-cash');
        if(inp) inp.value = '500';
        m.classList.remove('hidden');
    }
}

function closeShiftOpenModal(){
    const m = document.getElementById('shift-open-modal');
    if(m) m.classList.add('hidden');
}

function confirmOpenShift(){
    const input = document.getElementById('shift-initial-cash');
    const amount = parseFloat(input ? input.value : 0) || 0;
    currentShift = {
        id: 'sh_' + Date.now(),
        openedAt: new Date().toISOString(),
        closedAt: null,
        cashierId: currentUser ? currentUser.id : 'usr_caja',
        cashierUsername: currentUser ? currentUser.username : 'caja_demo',
        cashierName: currentUser ? currentUser.name : 'Cajero',
        initialCashFloat: amount,
        status: 'open'
    };
    if (window.FirebaseService && window.FirebaseService.stats) {
        window.FirebaseService.stats.saveCurrentShift(currentShift).catch(console.warn);
    }
    logActivity('Turno Abierto', `Fondo inicial: ${fmt(amount)} por @${currentShift.cashierUsername}`, 'success');
    closeShiftOpenModal();
    updateShiftUI();
    lucide.createIcons();
}

function computeShiftCutX(){
    if(!currentShift) return null;
    const shiftSales = salesLog.filter(s => 
        s.status === 'completed' && 
        new Date(s.date) >= new Date(currentShift.openedAt) &&
        (currentUser.role === 'admin' || currentUser.role === 'supervisor' || s.cashierId === currentShift.cashierId)
    );

    let cashSales = 0, cardSales = 0, transferSales = 0, totalSales = 0;
    shiftSales.forEach(s => {
        totalSales += (s.total || 0);
        if(s.payment){
            cashSales += (s.payment.cash || 0);
            cardSales += (s.payment.card || 0);
            transferSales += (s.payment.transfer || 0);
        } else {
            cashSales += (s.total || 0);
        }
    });

    const expectedCashInDrawer = currentShift.initialCashFloat + cashSales;
    return {
        shift: currentShift,
        salesCount: shiftSales.length,
        totalSales,
        cashSales,
        cardSales,
        transferSales,
        initialCashFloat: currentShift.initialCashFloat,
        expectedCashInDrawer
    };
}

function showCutXModal(){
    const data = computeShiftCutX();
    if(!data) { alert("No hay turno abierto actualmente."); return; }
    
    document.getElementById('cutx-folio').textContent = data.shift.id;
    document.getElementById('cutx-cashier').textContent = data.shift.cashierName;
    document.getElementById('cutx-start').textContent = formatAppDate(data.shift.openedAt);
    document.getElementById('cutx-float').textContent = fmt(data.initialCashFloat);
    document.getElementById('cutx-cash-sales').textContent = fmt(data.cashSales);
    document.getElementById('cutx-card-sales').textContent = fmt(data.cardSales);
    document.getElementById('cutx-transf-sales').textContent = fmt(data.transferSales);
    document.getElementById('cutx-total-sales').textContent = fmt(data.totalSales);
    document.getElementById('cutx-expected-cash').textContent = fmt(data.expectedCashInDrawer);

    document.getElementById('shift-cutx-modal').classList.remove('hidden');
    logActivity('Lectura Corte X', `Consulta de corte parcial por @${currentUser.username}`, 'info');
    lucide.createIcons();
}

function closeCutXModal(){
    document.getElementById('shift-cutx-modal').classList.add('hidden');
}

function showCutZModal(){
    const data = computeShiftCutX();
    if(!data) { alert("No hay turno abierto."); return; }

    document.getElementById('cutz-expected-cash').textContent = fmt(data.expectedCashInDrawer);
    document.getElementById('cutz-total-sales').textContent = fmt(data.totalSales);
    const physInput = document.getElementById('cutz-physical-cash');
    if(physInput) physInput.value = '';
    const discEl = document.getElementById('cutz-discrepancy');
    if(discEl) discEl.textContent = '$0.00';

    document.getElementById('shift-cutz-modal').classList.remove('hidden');
    lucide.createIcons();
}

function closeCutZModal(){
    document.getElementById('shift-cutz-modal').classList.add('hidden');
}

function onCutzPhysicalCashChange(){
    const data = computeShiftCutX();
    if(!data) return;
    const physical = parseFloat(document.getElementById('cutz-physical-cash').value) || 0;
    const diff = physical - data.expectedCashInDrawer;
    const diffEl = document.getElementById('cutz-discrepancy');
    if(diffEl){
        diffEl.textContent = (diff >= 0 ? '+' : '') + fmt(diff);
        diffEl.className = 'font-bold mono text-sm ' + (Math.abs(diff) < 0.5 ? 'text-emerald-400' : diff > 0 ? 'text-sky-400' : 'text-rose-400');
    }
}

function confirmCloseShiftZ(){
    const data = computeShiftCutX();
    if(!data) return;

    const physical = parseFloat(document.getElementById('cutz-physical-cash').value);
    if(isNaN(physical)){
        alert("Por favor ingresa el monto total de efectivo contado físicamente en caja.");
        return;
    }

    const discrepancy = physical - data.expectedCashInDrawer;
    currentShift.closedAt = new Date().toISOString();
    currentShift.actualCashCount = physical;
    currentShift.expectedCash = data.expectedCashInDrawer;
    currentShift.discrepancy = discrepancy;
    currentShift.totalSales = data.totalSales;
    currentShift.status = 'closed';

    shiftsHistory.push(currentShift);
    if (window.FirebaseService && window.FirebaseService.stats) {
        window.FirebaseService.stats.saveShiftsHistory(shiftsHistory).catch(console.warn);
        window.FirebaseService.stats.saveCurrentShift(null).catch(console.warn);
    }

    logActivity('Cierre de Turno (Corte Z)', `Turno cerrado con ${fmt(physical)} en caja. Discrepancia: ${fmt(discrepancy)}`, Math.abs(discrepancy) < 1 ? 'success' : 'warn');

    alert(`✓ Turno cerrado exitosamente (Corte Z).

Efectivo Esperado: ${fmt(data.expectedCashInDrawer)}
Efectivo Físico: ${fmt(physical)}
Diferencia: ${(discrepancy >= 0 ? '+' : '') + fmt(discrepancy)}`);
    
    currentShift = null;
    closeCutZModal();
    updateShiftUI();
    upPosSummary();
}



// ===== IMPRESIÓN DE TICKET TÉRMICO (ESC/POS 58mm/80mm) =====
function printSaleTicket(saleId){
    const sale = salesLog.find(s => s.id === saleId);
    if(!sale) { alert("Ticket no encontrado"); return; }

    const taxRate = sale.taxRate !== undefined ? sale.taxRate : currentTaxZoneRate;
    const subtotal = sale.subtotal !== undefined ? sale.subtotal : (sale.total / (1 + taxRate));
    const taxAmount = sale.taxAmount !== undefined ? sale.taxAmount : (sale.total - subtotal);
    const taxLabel = taxRate === 0.08 ? 'IVA Fronterizo (8%)' : taxRate === 0.16 ? 'IVA General (16%)' : 'IVA Tasa Cero (0%)';

    const p = sale.payment || { method: 'cash', label: 'Efectivo' };
    let payDetail = '';
    if(p.method === 'cash'){
        payDetail = `<div>Método: Efectivo</div>
                     <div class="tkt-flex"><span>Recibido:</span><span>${fmt(p.cashReceived || sale.total)}</span></div>
                     <div class="tkt-flex"><span>Cambio:</span><span>${fmt(p.change || 0)}</span></div>`;
    } else if(p.method === 'split'){
        payDetail = `<div>Método: Pago Dividido</div>
                     <div class="tkt-flex"><span>Efec: ${fmt(p.cash || 0)} | Tarj: ${fmt(p.card || 0)} | Transf: ${fmt(p.transfer || 0)}</span></div>`;
    } else {
        payDetail = `<div class="tkt-flex"><span>Método: ${p.label}</span><span>${p.reference ? 'Ref: ' + p.reference : ''}</span></div>`;
    }

    const itemsHtml = sale.items.map(it => `
        <tr>
            <td style="width:12%">${it.qty}</td>
            <td style="width:58%">${it.name.substring(0, 20)}</td>
            <td style="width:15%" class="tkt-right">${it.price.toFixed(2)}</td>
            <td style="width:15%" class="tkt-right">${(it.qty * it.price).toFixed(2)}</td>
        </tr>
    `).join('');

    const ticketHtml = `
        <div class="tkt-center tkt-bold" style="font-size:13px">REFACCIONARIA Y SERVICIOS</div>
        <div class="tkt-center">RFC: XAXX010101000</div>
        <div class="tkt-center" style="font-size:10px">Sucursal Matriz · Monterrey, N.L.</div>
        <div class="tkt-divider"></div>
        <div class="tkt-flex"><span>Folio:</span><span class="tkt-bold">${sale.id}</span></div>
        <div class="tkt-flex"><span>Fecha:</span><span>${formatAppDate(sale.date)}</span></div>
        <div class="tkt-flex"><span>Cajero:</span><span>@${sale.cashierUsername || 'caja'}</span></div>
        <div class="tkt-double-divider"></div>
        <table class="tkt-table">
            <thead>
                <tr>
                    <th>Cant</th>
                    <th>Descripción</th>
                    <th class="tkt-right">P.U.</th>
                    <th class="tkt-right">Imp</th>
                </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
        </table>
        <div class="tkt-divider"></div>
        <div class="tkt-flex"><span>Subtotal:</span><span>${fmt(subtotal)}</span></div>
        <div class="tkt-flex"><span>${taxLabel}:</span><span>${fmt(taxAmount)}</span></div>
        <div class="tkt-flex tkt-bold" style="font-size:13px;margin-top:2px">
            <span>TOTAL:</span><span>${fmt(sale.total)}</span>
        </div>
        <div class="tkt-divider"></div>
        ${payDetail}
        <div class="tkt-double-divider"></div>
        <div class="tkt-center" style="font-size:9.5px">COMPROBANTE SIMPLIFICADO DE VENTA</div>
        <div class="tkt-center" style="font-size:9px">Para solicitar factura electrónica acuda a sucursal</div>
        <div class="tkt-center tkt-bold" style="margin-top:4px">¡GRACIAS POR SU PREFERENCIA!</div>
    `;

    const printArea = document.getElementById('thermal-print-area');
    if(printArea){
        printArea.innerHTML = ticketHtml;
        window.print();
    }
}



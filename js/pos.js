// =====================================================================
// OPERACIÓN Y PUNTO DE VENTA (POS) & INVENTARIO (pos.js)
// CFO Copilot + Punto de Venta
// =====================================================================

// --- 1. CONTROL DE TURNOS Y ARQUEOS DE CAJA (CORTE X / CORTE Z) ---
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
    if(window.FirebaseService){
        window.FirebaseService.stats.saveCurrentShift(currentShift).catch(e => console.warn(e));
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
    if(window.FirebaseService){
        window.FirebaseService.stats.saveCurrentShift(null).catch(e => console.warn(e));
        window.FirebaseService.stats.saveShiftsHistory(shiftsHistory).catch(e => console.warn(e));
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

// --- 2. IMPRESIÓN DE TICKET TÉRMICO (ESC/POS 58mm/80mm) ---
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

// --- 3. GESTIÓN DEL CATÁLOGO DE REFACCIONES E INVENTARIO ---
function reloadRefaccionesCatalog(){
    if(confirm('¿Recargar el catálogo con las 100 refacciones completas e inventario inicial?')){
        catalog = JSON.parse(JSON.stringify(REFACCIONES_CATALOG));
        // Sincronizado en Cloud Firestore
        renderCatalog();
        updateProductSelect();
        onSellProductChange();
        alert('✓ Se cargaron las 100 refacciones al inventario.');
    }
}

function initPosChart(){if(posChart)posChart.destroy();posChart=new Chart(document.getElementById('cPosBars'),{type:'bar',data:{labels:[],datasets:[{label:'Ventas ($)',data:[],backgroundColor:'rgba(16,185,129,.55)',borderRadius:8,borderSkipped:false},{label:'Costo ($)',data:[],backgroundColor:'rgba(244,63,94,.35)',borderRadius:8,borderSkipped:false}]},options:{responsive:true,maintainAspectRatio:false,indexAxis:'y',plugins:{legend:{position:'bottom',labels:{font:{size:9},boxWidth:10}}},scales:{x:{ticks:{callback:v=>'$'+v},grid:{color:'rgba(51,65,85,.3)'},border:{display:false}},y:{ticks:{font:{size:10}},grid:{display:false},border:{display:false}}}}});}

async function addProduct(){
    if(!hasPermission('catalog.edit')){
        showAccessDeniedModal('Solo el Administrador tiene autorización para dar de alta nuevos productos en el catálogo.');
        return;
    }
    const name=document.getElementById('cat-name').value.trim();
    const price=parseFloat(document.getElementById('cat-price').value);
    const cost=parseFloat(document.getElementById('cat-cost').value);
    const stockInput=parseInt(document.getElementById('cat-stock').value);
    if(!name||isNaN(price)||isNaN(cost)){alert('Completa los campos de nombre, precio y costo.');return;}
    const stock = isNaN(stockInput) || stockInput < 0 ? 0 : stockInput;
    const newProd = {
        id: 'ref_' + Date.now(),
        name,
        price,
        cost,
        stock,
        category: 'General',
        created: new Date().toISOString()
    };
    catalog.push(newProd);

    // Persistencia asíncrona en Cloud Firestore ('products')
    if(window.FirebaseService){
        try {
            await window.FirebaseService.products.save(newProd);
            showGlobalToast(`✓ Producto "${name}" guardado en Cloud Firestore`, 'success');
        } catch(err) {
            console.error('[Firestore addProduct Error]', err);
        }
    }

    logActivity('Producto Creado en Firestore', `Producto "${name}" agregado al catálogo por @${currentUser ? currentUser.username : 'sistema'} ($${price})`, 'success');
    document.getElementById('cat-name').value='';document.getElementById('cat-price').value='';document.getElementById('cat-cost').value='';
    document.getElementById('cat-stock').value='20';
    renderCatalog();
    updateProductSelect();
}

async function removeProduct(id){
    if(!hasPermission('catalog.delete') && (!currentUser || currentUser.role !== 'admin')){
        showAccessDeniedModal('Acceso Restringido: Los usuarios de tipo Almacén no tienen permitido eliminar productos. Solo los Administradores cuentan con autorización para realizar eliminaciones en el catálogo.');
        if(currentUser){
            logActivity('Intento No Autorizado', `El usuario "${currentUser.username}" (${currentUser.role}) intentó eliminar el producto ID "${id}" sin permisos de Administrador.`, 'danger');
        }
        return;
    }
    if(confirm('¿Eliminar este producto del catálogo e inventario en Cloud Firestore? Esta acción solo está autorizada para Administradores.')){
        const prod = catalog.find(p => p.id === id);
        catalog = catalog.filter(p => p.id !== id);

        // Eliminación asíncrona en Cloud Firestore ('products')
        if(window.FirebaseService){
            try {
                await window.FirebaseService.products.delete(id);
                showGlobalToast(`✓ Producto "${prod ? prod.name : id}" eliminado de Cloud Firestore`, 'info');
            } catch(err) {
                console.error('[Firestore removeProduct Error]', err);
            }
        }

        logActivity('Producto Eliminado en Firestore', `Producto "${prod ? prod.name : id}" eliminado del catálogo por Administrador @${currentUser ? currentUser.username : 'sistema'}`, 'danger');
        renderCatalog();
        updateProductSelect();
    }
}

function addStockToProduct(){
    if(!hasPermission('inventory.adjust')){
        showAccessDeniedModal('Solo un Supervisor o Administrador puede reabastecer inventario.');
        return;
    }
    const pid = document.getElementById('restock-product').value;
    const qty = parseInt(document.getElementById('restock-qty').value);
    if(!pid){ alert('Selecciona un producto para reabastecer.'); return; }
    if(isNaN(qty) || qty <= 0){ alert('Ingresa una cantidad válida mayor a 0.'); return; }
    const prod = catalog.find(p => p.id === pid);
    if(!prod) return;
    prod.stock = (prod.stock || 0) + qty;
    // Sincronizado en Cloud Firestore
    logActivity('Stock Reabastecido', `Se sumaron ${qty} u. al producto "${prod.name}" (Stock actual: ${prod.stock} u.)`, 'info');
    document.getElementById('restock-qty').value = '10';
    renderCatalog();
    updateProductSelect();
    onSellProductChange();
    alert(`✓ Se agregaron ${qty} unidades a "${prod.name}". Nuevo stock: ${prod.stock} u.`);
}

function quickAddStock(id, amount){
    if(!hasPermission('inventory.adjust')){
        showAccessDeniedModal('Solo un Supervisor o Administrador puede modificar existencias de inventario.');
        return;
    }
    const prod = catalog.find(p => p.id === id);
    if(!prod) return;
    let addQty = amount;
    if(addQty === undefined){
        const val = prompt(`Reabastecer inventario de "${prod.name}"\nStock actual: ${prod.stock || 0} unidades.\n\n¿Cuántas unidades deseas sumar?`, "10");
        if(val === null) return;
        addQty = parseInt(val);
    }
    if(isNaN(addQty) || addQty <= 0){ alert('Cantidad inválida.'); return; }
    prod.stock = (prod.stock || 0) + addQty;
    if(window.FirebaseService){
        window.FirebaseService.products.updateStock(prod.id, prod.stock).catch(e=>console.warn(e));
    }
    logActivity('Stock Reabastecido en Firestore', `Reabastecimiento de ${addQty} u. en "${prod.name}" en Cloud Firestore (Total: ${prod.stock} u.)`, 'info');
    renderCatalog();
    updateProductSelect();
    onSellProductChange();
}

function renderCatalog(){
    document.getElementById('cat-count').textContent=catalog.length;
    if(catalog.length===0){
        document.getElementById('cat-list').innerHTML='<div class="text-slate-600 text-sm text-center py-8">Aún no hay productos registrados.</div>';
        updateProductSelect();
        return;
    }
    const canViewFinance = hasPermission('finance.view_analysis');
    const canAdjustStock = hasPermission('inventory.adjust');
    const canEditCatalog = hasPermission('catalog.edit');
    const canDeleteCatalog = hasPermission('catalog.delete') || (currentUser && currentUser.role === 'admin');

    document.getElementById('cat-list').innerHTML=catalog.map(p=>{
        const isOutOfStock = (p.stock || 0) <= 0;
        const isLowStock = !isOutOfStock && p.stock <= 5;
        const categoryBadge = p.category ? `<span class="pill bg-slate-800 text-slate-300 border border-slate-700/60 font-medium text-[9px] shrink-0">${p.category}</span>` : '';
        const stockBadge = isOutOfStock
            ? `<span class="pill bg-rose-500/20 text-rose-300 border border-rose-500/35 font-bold text-[9px] flex items-center gap-1 shrink-0"><i data-lucide="alert-octagon" class="w-2.5 h-2.5 text-rose-400"></i>AGOTADO (0 u.)</span>`
            : isLowStock
            ? `<span class="pill bg-amber-500/20 text-amber-300 border border-amber-500/35 font-bold text-[9px] flex items-center gap-1 shrink-0"><i data-lucide="alert-triangle" class="w-2.5 h-2.5 text-amber-400"></i>Stock Bajo (${p.stock} u.)</span>`
            : `<span class="pill bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold text-[9px] flex items-center gap-1 shrink-0"><i data-lucide="boxes" class="w-2.5 h-2.5 text-emerald-400"></i>Stock: ${p.stock} u.</span>`;

        const financeInfo = canViewFinance
            ? `Venta: ${fmt(p.price)} · Costo: ${fmt(p.cost)} · Margen: <span class="${((p.price-p.cost)/p.price*100)>30?'text-emerald-400':'text-amber-400'}">${((p.price-p.cost)/p.price*100).toFixed(0)}%</span>`
            : `Precio de Venta: <span class="text-emerald-400 font-bold">${fmt(p.price)}</span>`;

        const btnStock = canAdjustStock
            ? `<button onclick="quickAddStock('${p.id}')" title="Reabastecer inventario" class="p-1 px-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-[10.5px] border border-indigo-500/30 flex items-center gap-1 transition shrink-0"><i data-lucide="plus" class="w-3 h-3"></i>Stock</button>`
            : '';

        const canSell = hasPermission('pos.sell');
        const btnSell = (canSell && !isOutOfStock)
            ? `<button onclick="quickSellProduct('${p.id}')" title="Vender este producto" class="p-1 px-2.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10.5px] border border-emerald-500/30 flex items-center gap-1 transition shrink-0"><i data-lucide="shopping-cart" class="w-3 h-3"></i>Vender</button>`
            : '';

        const btnDelete = canDeleteCatalog
            ? `<button onclick="removeProduct('${p.id}')" class="text-slate-600 hover:text-rose-400 transition p-1 shrink-0" title="Eliminar producto (Solo Administrador)"><i data-lucide="trash-2" class="w-4 h-4"></i></button>`
            : '';

        return `
        <div class="pos-row flex items-center gap-2">
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span class="text-sm font-semibold text-white truncate">${p.name}</span>
                    ${categoryBadge}
                    ${stockBadge}
                </div>
                <div class="text-[11px] text-slate-400 mono">
                    ${financeInfo}
                </div>
            </div>
            ${btnSell}
            ${btnStock}
            ${btnDelete}
        </div>`;
    }).join('');
    lucide.createIcons();
    updateProductSelect();
}

function updateProductSelect(){
    const sel=document.getElementById('sell-product');
    const restockSel=document.getElementById('restock-product');
    
    // Sell select
    let sellOpts = '<option value="">— Seleccionar producto —</option>';
    catalog.forEach(p => {
        const catPrefix = p.category ? `[${p.category}] ` : '';
        const isOut = (p.stock || 0) <= 0;
        if(isOut){
            sellOpts += `<option value="${p.id}" class="text-rose-400 font-semibold bg-slate-900">⛔ ${catPrefix}${p.name} — (AGOTADO - 0 en stock)</option>`;
        } else {
            sellOpts += `<option value="${p.id}">${catPrefix}${p.name} (${fmt(p.price)}) · Stock: ${p.stock} u.</option>`;
        }
    });
    sel.innerHTML = sellOpts;

    // Restock select
    if(restockSel){
        restockSel.innerHTML = '<option value="">— Seleccionar producto para reabastecer —</option>' + 
            catalog.map(p => {
                const catPrefix = p.category ? `[${p.category}] ` : '';
                return `<option value="${p.id}">${catPrefix}${p.name} (Stock actual: ${p.stock || 0} u.)</option>`;
            }).join('');
    }
}

function onSellProductChange(fromProgrammatic = false){
    const sel = document.getElementById('sell-product');
    const pid = sel ? sel.value : '';
    const alertEl = document.getElementById('sell-stock-alert');
    const badgeEl = document.getElementById('sell-stock-badge');
    const badgeNum = document.getElementById('sell-stock-num');
    const btnAdd = document.getElementById('btn-add-ticket');
    const qtyInput = document.getElementById('sell-qty');
    const qtyLabel = document.getElementById('sell-qty-label');

    if(!pid){
        if(alertEl){ alertEl.classList.add('hidden'); alertEl.innerHTML = ''; }
        if(badgeEl) badgeEl.classList.add('hidden');
        if(btnAdd){
            btnAdd.disabled = false;
            btnAdd.classList.remove('opacity-40', 'cursor-not-allowed');
        }
        if(qtyInput) qtyInput.disabled = false;
        if(qtyLabel) qtyLabel.textContent = '¿Cuántas piezas requieren de este producto?';
        return;
    }

    const prod = catalog.find(p => p.id === pid);
    if(!prod) return;

    const stock = prod.stock || 0;
    const inTicket = (ticket.find(t => t.id === pid)?.qty) || 0;
    const remaining = stock - inTicket;

    if(badgeEl) badgeEl.classList.remove('hidden');
    if(badgeNum){
        badgeNum.textContent = remaining > 0 ? remaining : 0;
        badgeNum.className = remaining <= 0 ? 'text-rose-400 font-bold' : remaining <= 5 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold';
    }

    if(qtyLabel){
        qtyLabel.textContent = `¿Cuántas piezas requieren de ${prod.name}?`;
    }

    if(stock <= 0){
        // Completely out of stock
        if(alertEl){
            alertEl.classList.remove('hidden');
            alertEl.innerHTML = `
            <div class="p-3 rounded-xl bg-rose-500/15 border border-rose-500/35 text-rose-200 text-xs flex items-center gap-2.5 font-medium fin">
                <div class="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
                    <i data-lucide="alert-octagon" class="w-4 h-4"></i>
                </div>
                <div class="flex-1">
                    <b class="text-rose-300 uppercase tracking-wide text-[10px] block">Producto Agotado</b>
                    <span>No hay existencias de <b>"${prod.name}"</b>. Opción de venta bloqueada hasta reabastecer en Catálogo.</span>
                </div>
            </div>`;
        }
        if(btnAdd){
            btnAdd.disabled = true;
            btnAdd.classList.add('opacity-40', 'cursor-not-allowed');
        }
        if(qtyInput) qtyInput.disabled = true;
    } else if(remaining <= 0){
        // Stock exhausted by current ticket
        if(alertEl){
            alertEl.classList.remove('hidden');
            alertEl.innerHTML = `
            <div class="p-3 rounded-xl bg-amber-500/15 border border-amber-500/35 text-amber-200 text-xs flex items-center gap-2.5 font-medium fin">
                <div class="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                    <i data-lucide="alert-triangle" class="w-4 h-4"></i>
                </div>
                <div class="flex-1">
                    <b class="text-amber-300 uppercase tracking-wide text-[10px] block">Stock Máximo Alcanzado en Ticket</b>
                    <span>Ya tienes agregadas las <b>${stock} unidades</b> disponibles de "${prod.name}".</span>
                </div>
            </div>`;
        }
        if(btnAdd){
            btnAdd.disabled = true;
            btnAdd.classList.add('opacity-40', 'cursor-not-allowed');
        }
        if(qtyInput) qtyInput.disabled = true;
    } else {
        // Normal in-stock state
        if(alertEl){ alertEl.classList.add('hidden'); alertEl.innerHTML = ''; }
        if(btnAdd){
            btnAdd.disabled = false;
            btnAdd.classList.remove('opacity-40', 'cursor-not-allowed');
        }
        if(qtyInput){
            qtyInput.disabled = false;
            qtyInput.max = remaining;
            if(parseInt(qtyInput.value) > remaining) qtyInput.value = remaining;
            if(parseInt(qtyInput.value) < 1) qtyInput.value = 1;
        }

        // Directamente abre el modal preguntando cuántas piezas requieren
        if(!fromProgrammatic){
            openSellQtyModal(pid);
        }
    }
    lucide.createIcons();
}

// --- 4. MODAL DE SELECCIÓN DE PIEZAS AL AGREGAR PRODUCTO ---
function openSellQtyModal(pid){
    const prod = catalog.find(p => p.id === pid);
    if(!prod) return;
    const inTicket = (ticket.find(t => t.id === pid)?.qty) || 0;
    const remaining = (prod.stock || 0) - inTicket;
    if(remaining <= 0) return;

    document.getElementById('sqm-product-id').value = pid;
    document.getElementById('sqm-product-name').textContent = prod.name;
    document.getElementById('sqm-product-price').textContent = fmt(prod.price);
    document.getElementById('sqm-product-stock').textContent = `${remaining} u. disponibles`;
    
    const input = document.getElementById('sqm-qty-input');
    input.value = 1;
    input.max = remaining;
    input.min = 1;

    updateSellQtyModalSubtotal();

    const modal = document.getElementById('sell-qty-modal');
    if(modal) modal.classList.remove('hidden');
    setTimeout(() => {
        if(input){
            input.focus();
            input.select();
        }
    }, 50);
    lucide.createIcons();
}

function closeSellQtyModal(){
    const modal = document.getElementById('sell-qty-modal');
    if(modal) modal.classList.add('hidden');
    const qtyInput = document.getElementById('sell-qty');
    if(qtyInput){
        qtyInput.focus();
        qtyInput.select();
    }
}

function updateSellQtyModalSubtotal(){
    const pid = document.getElementById('sqm-product-id').value;
    const input = document.getElementById('sqm-qty-input');
    const subEl = document.getElementById('sqm-subtotal');
    const prod = catalog.find(p => p.id === pid);
    if(!prod || !input || !subEl) return;
    const qty = parseInt(input.value) || 0;
    subEl.textContent = fmt(prod.price * Math.max(0, qty));
}

function stepSellQtyModal(delta){
    const pid = document.getElementById('sqm-product-id').value;
    const input = document.getElementById('sqm-qty-input');
    const prod = catalog.find(p => p.id === pid);
    if(!prod || !input) return;
    const inTicket = (ticket.find(t => t.id === pid)?.qty) || 0;
    const max = (prod.stock || 0) - inTicket;
    let cur = parseInt(input.value) || 1;
    cur += delta;
    if(cur < 1) cur = 1;
    if(cur > max) cur = max;
    input.value = cur;
    updateSellQtyModalSubtotal();
}

function setSellQtyModalValue(val){
    const pid = document.getElementById('sqm-product-id').value;
    const input = document.getElementById('sqm-qty-input');
    const prod = catalog.find(p => p.id === pid);
    if(!prod || !input) return;
    const inTicket = (ticket.find(t => t.id === pid)?.qty) || 0;
    const max = (prod.stock || 0) - inTicket;
    input.value = Math.min(Math.max(1, val), max);
    updateSellQtyModalSubtotal();
}

function setSellQtyModalMax(){
    const pid = document.getElementById('sqm-product-id').value;
    const input = document.getElementById('sqm-qty-input');
    const prod = catalog.find(p => p.id === pid);
    if(!prod || !input) return;
    const inTicket = (ticket.find(t => t.id === pid)?.qty) || 0;
    const max = (prod.stock || 0) - inTicket;
    input.value = Math.max(1, max);
    updateSellQtyModalSubtotal();
}

function confirmSellQtyModal(event){
    if(event) event.preventDefault();
    const pid = document.getElementById('sqm-product-id').value;
    const input = document.getElementById('sqm-qty-input');
    const qty = parseInt(input.value) || 1;
    addSaleItemWithQty(pid, qty);
    closeSellQtyModal();
}

function adjustSellQty(delta){
    const input = document.getElementById('sell-qty');
    const pid = document.getElementById('sell-product').value;
    if(!input) return;
    let cur = parseInt(input.value) || 1;
    cur += delta;
    if(cur < 1) cur = 1;
    if(pid){
        const prod = catalog.find(p => p.id === pid);
        if(prod){
            const inTicket = (ticket.find(t => t.id === pid)?.qty) || 0;
            const max = (prod.stock || 0) - inTicket;
            if(cur > max) cur = max;
        }
    }
    input.value = cur;
}

function addSaleItemWithQty(pid, qty){
    if(!hasPermission('pos.sell')){
        showAccessDeniedModal('Tu rol no tiene autorización para agregar productos al ticket de venta.');

// --- 5. OPERACIONES DEL TICKET DE VENTA ---
        return;
    }
    if(!pid){alert('Selecciona un producto.');return;}
    const prod=catalog.find(p=>p.id===pid);if(!prod)return;

    const currentStock = prod.stock || 0;
    if(currentStock <= 0){
        alert(`⛔ Producto agotado: "${prod.name}" no tiene existencias en inventario. No se puede vender.`);
        onSellProductChange(true);
        return;
    }

    const existing=ticket.find(t=>t.id===pid);
    const alreadyInTicket = existing ? existing.qty : 0;
    if(alreadyInTicket + qty > currentStock){
        const maxCanAdd = currentStock - alreadyInTicket;
        alert(`⚠️ Inventario insuficiente para "${prod.name}".\nStock disponible: ${currentStock} u.\nYa en ticket: ${alreadyInTicket} u.\nSolo puedes agregar hasta ${maxCanAdd} u. más.`);
        onSellProductChange(true);
        return;
    }

    if(existing){
        existing.qty += qty;
    } else {
        ticket.push({id:pid, name:prod.name, price:prod.price, cost:prod.cost, qty});
    }

    const sel = document.getElementById('sell-product');
    if(sel) sel.value = '';
    const qtyInput = document.getElementById('sell-qty');
    if(qtyInput) qtyInput.value = '1';

    renderTicket();
    onSellProductChange(true);
    showGlobalToast(`✓ Se agregaron ${qty} pieza(s) de "${prod.name}" al ticket`, 'success');
}

function addSaleItem(){
    const pid=document.getElementById('sell-product').value;
    const qty=parseInt(document.getElementById('sell-qty').value)||1;
    addSaleItemWithQty(pid, qty);
}

function removeTicketItem(id){
    const item = ticket.find(t => t.id === id);
    ticket=ticket.filter(t=>t.id!==id);
    renderTicket();
    onSellProductChange(true);
    if(item){
        showGlobalToast(`"${item.name}" se quitó del ticket`, 'info');
    }
}

function quickSellProduct(pid){
    if(!hasPermission('pos.sell')){
        showAccessDeniedModal('Tu rol no tiene autorización para realizar ventas.');
        return;
    }
    showPosTab('sell');
    const sel = document.getElementById('sell-product');
    if(sel){
        sel.value = pid;
        onSellProductChange(false);
    }
}

// --- 6. MODAL DE MODIFICACIÓN DE PIEZAS EN TICKET ---
function openModifyTicketQtyModal(id){
    const item = ticket.find(t => t.id === id);
    if(!item){
        alert('Producto no encontrado en el ticket.');
        return;
    }
    const prod = catalog.find(p => p.id === id);
    const maxStock = prod ? (prod.stock || 0) : item.qty;

    document.getElementById('tmq-item-id').value = id;
    document.getElementById('tmq-product-name').textContent = item.name;
    document.getElementById('tmq-product-price').textContent = fmt(item.price);
    document.getElementById('tmq-product-stock').textContent = `${maxStock} u. en almacén`;
    
    const input = document.getElementById('tmq-qty-input');
    input.value = item.qty;
    input.max = maxStock;
    input.min = 0;

    updateTicketModifyModalSubtotal();

    const modal = document.getElementById('ticket-modify-qty-modal');
    if(modal) modal.classList.remove('hidden');
    setTimeout(() => {
        if(input){
            input.focus();
            input.select();
        }
    }, 50);
    lucide.createIcons();
}

function closeTicketModifyModal(){
    const modal = document.getElementById('ticket-modify-qty-modal');
    if(modal) modal.classList.add('hidden');
}

function updateTicketModifyModalSubtotal(){
    const id = document.getElementById('tmq-item-id').value;
    const input = document.getElementById('tmq-qty-input');
    const subEl = document.getElementById('tmq-subtotal');
    const btnSubmit = document.getElementById('tmq-btn-submit');
    const item = ticket.find(t => t.id === id);
    if(!item || !input || !subEl) return;
    const qty = parseInt(input.value) || 0;
    subEl.textContent = fmt(item.price * Math.max(0, qty));

    if(btnSubmit){
        if(qty <= 0){
            btnSubmit.className = 'pos-btn bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-2 px-4 flex items-center gap-1.5 shadow-lg shadow-rose-600/20';
            btnSubmit.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>Quitar Producto (0 pzas)';
        } else {
            btnSubmit.className = 'pos-btn bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs py-2 px-4 flex items-center gap-1.5 shadow-lg shadow-amber-600/20';
            btnSubmit.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i>Actualizar a ' + qty + ' pzas';
        }
        lucide.createIcons();
    }
}

function stepTicketModifyModal(delta){
    const id = document.getElementById('tmq-item-id').value;
    const input = document.getElementById('tmq-qty-input');
    const prod = catalog.find(p => p.id === id);
    const max = prod ? (prod.stock || 0) : 999;
    let cur = parseInt(input.value) || 0;
    cur += delta;
    if(cur < 0) cur = 0;
    if(cur > max) cur = max;
    input.value = cur;
    updateTicketModifyModalSubtotal();
}

function setTicketModifyModalValue(val){
    const id = document.getElementById('tmq-item-id').value;
    const input = document.getElementById('tmq-qty-input');
    const prod = catalog.find(p => p.id === id);
    const max = prod ? (prod.stock || 0) : 999;
    input.value = Math.min(Math.max(0, val), max);
    updateTicketModifyModalSubtotal();
}

function setTicketModifyModalMax(){
    const id = document.getElementById('tmq-item-id').value;
    const input = document.getElementById('tmq-qty-input');
    const prod = catalog.find(p => p.id === id);
    const max = prod ? (prod.stock || 0) : 1;
    input.value = max;
    updateTicketModifyModalSubtotal();
}

function confirmTicketModifyModal(event){
    if(event) event.preventDefault();
    const id = document.getElementById('tmq-item-id').value;
    const input = document.getElementById('tmq-qty-input');
    const newQty = parseInt(input.value) || 0;
    setTicketItemQty(id, newQty);
    closeTicketModifyModal();
}

function setTicketItemQty(id, newQty){
    const item = ticket.find(t => t.id === id);
    if(!item) return;

    if(newQty <= 0){
        // Si ese número se pone en 0, se quita dicho producto
        ticket = ticket.filter(t => t.id !== id);
        renderTicket();
        onSellProductChange(true);
        showGlobalToast(`"${item.name}" se quitó del ticket al quedar en 0 piezas`, 'info');
        return;
    }

    const prod = catalog.find(p => p.id === id);
    const currentStock = prod ? (prod.stock || 0) : 999;
    if(newQty > currentStock){
        alert(`⚠️ Inventario insuficiente para "${item.name}".\nExistencias disponibles en almacén: ${currentStock} piezas.\nNo se pueden llevar ${newQty} piezas.`);
        return;
    }

    item.qty = newQty;
    renderTicket();
    onSellProductChange(true);
    showGlobalToast(`✓ Se actualizaron las piezas de "${item.name}" a ${newQty} u.`, 'success');
}

function stepTicketItemDirect(id, delta){
    const item = ticket.find(t => t.id === id);
    if(!item) return;
    const newQty = item.qty + delta;
    setTicketItemQty(id, newQty);
}

// --- 7. MÉTODOS DE PAGO (EFECTIVO, TARJETA, TRANSFERENCIA, MIXTO) Y COBRO ---
function setPaymentMethod(method){
    currentPaymentMethod = method;
    ['cash','card','transfer','split'].forEach(m => {
        const btn = document.getElementById('pay-btn-' + m);
        const panel = document.getElementById('pay-panel-' + m);
        if(btn){
            btn.className = `pay-method-btn p-2.5 rounded-lg border text-left transition flex items-center gap-2 ${m === method ? 'active-' + m : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800'}`;
        }
        if(panel){
            panel.classList.toggle('hidden', m !== method);
        }
    });

    const badge = document.getElementById('payment-badge-status');
    if(badge){
        if(method === 'cash'){
            badge.className = 'pill bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[9px] font-semibold';
            badge.textContent = 'Efectivo 100%';
        } else if(method === 'card'){
            badge.className = 'pill bg-sky-500/15 text-sky-300 border border-sky-500/30 text-[9px] font-semibold';
            badge.textContent = 'Tarjeta 100%';
        } else if(method === 'transfer'){
            badge.className = 'pill bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[9px] font-semibold';
            badge.textContent = 'Transferencia 100%';
        } else if(method === 'split'){
            badge.className = 'pill bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[9px] font-semibold';
            badge.textContent = 'Dividir Pago';
        }
    }

    updatePaymentTotals();
    lucide.createIcons();
}

function updatePaymentTotals(){
    const total = ticket.reduce((s,t) => s + t.price * t.qty, 0);
    const cashTotalEl = document.getElementById('cash-total-display');
    const cardTotalEl = document.getElementById('card-total-display');
    const transferTotalEl = document.getElementById('transfer-total-display');
    const splitTotalReqEl = document.getElementById('split-total-req');

    if(cashTotalEl) cashTotalEl.textContent = fmt(total);
    if(cardTotalEl) cardTotalEl.textContent = fmt(total);
    if(transferTotalEl) transferTotalEl.textContent = fmt(total);
    if(splitTotalReqEl) splitTotalReqEl.textContent = fmt(total);

    calculateCashChange();
    updateSplitCalculation();
}

function calculateCashChange(){
    const total = ticket.reduce((s,t) => s + t.price * t.qty, 0);
    const recInput = document.getElementById('cash-received');
    const changeBox = document.getElementById('cash-change-box');
    const shortBox = document.getElementById('cash-short-box');
    const changeAmount = document.getElementById('cash-change-amount');
    if(!recInput || !changeBox) return;

    const received = parseFloat(recInput.value);
    if(isNaN(received) || recInput.value.trim() === ''){
        changeBox.classList.add('hidden');
        if(shortBox) { shortBox.classList.add('hidden'); shortBox.innerHTML = ''; }
        return;
    }

    if(received >= total){
        const change = received - total;
        changeAmount.textContent = fmt(change);
        changeBox.classList.remove('hidden');
        if(shortBox) { shortBox.classList.add('hidden'); shortBox.innerHTML = ''; }
    } else {
        changeBox.classList.add('hidden');
        if(shortBox){
            const missing = total - received;
            shortBox.innerHTML = `<span class="flex items-center gap-1"><i data-lucide="alert-circle" class="w-3.5 h-3.5 shrink-0"></i>Monto recibido insuficiente. Faltan ${fmt(missing)} para cubrir el total.</span>`;
            shortBox.classList.remove('hidden');
            lucide.createIcons();
        }
    }
}

function updateSplitCalculation(){
    const total = ticket.reduce((s,t) => s + t.price * t.qty, 0);
    const amtCash = parseFloat(document.getElementById('split-amt-cash')?.value || 0) || 0;
    const amtCard = parseFloat(document.getElementById('split-amt-card')?.value || 0) || 0;
    const amtTransfer = parseFloat(document.getElementById('split-amt-transfer')?.value || 0) || 0;

    const sum = amtCash + amtCard + amtTransfer;
    const diff = total - sum;

    const sumEl = document.getElementById('split-sum-display');
    const diffLabelEl = document.getElementById('split-diff-label');
    const diffAmountEl = document.getElementById('split-diff-amount');
    const statusBox = document.getElementById('split-status-box');

    if(sumEl) sumEl.textContent = fmt(sum);

    if(diffAmountEl && diffLabelEl){
        if(total === 0){
            diffLabelEl.textContent = 'Restante:';
            diffAmountEl.textContent = '$0';
            diffAmountEl.className = 'font-bold mono text-slate-400';
            if(statusBox) statusBox.className = 'p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs';
        } else if(Math.abs(diff) < 0.01){
            diffLabelEl.textContent = 'Estado:';
            diffAmountEl.textContent = '✓ Total Cubierto Exacto';
            diffAmountEl.className = 'font-bold mono text-emerald-400';
            if(statusBox) statusBox.className = 'p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/35 flex items-center justify-between text-xs';
        } else if(diff > 0){
            diffLabelEl.textContent = 'Faltante:';
            diffAmountEl.textContent = fmt(diff);
            diffAmountEl.className = 'font-bold mono text-amber-400';
            if(statusBox) statusBox.className = 'p-2 rounded-lg bg-slate-900 border border-amber-500/30 flex items-center justify-between text-xs';
        } else {
            diffLabelEl.textContent = 'Excedente:';
            diffAmountEl.textContent = '+' + fmt(Math.abs(diff));
            diffAmountEl.className = 'font-bold mono text-rose-400';
            if(statusBox) statusBox.className = 'p-2 rounded-lg bg-slate-900 border border-rose-500/30 flex items-center justify-between text-xs';
        }
    }

    // Progress bar and percentages
    const pctCash = total > 0 ? Math.min(100, Math.max(0, (amtCash / total) * 100)) : 0;
    const pctCard = total > 0 ? Math.min(100, Math.max(0, (amtCard / total) * 100)) : 0;
    const pctTransfer = total > 0 ? Math.min(100, Math.max(0, (amtTransfer / total) * 100)) : 0;

    const barCash = document.getElementById('split-bar-cash');
    const barCard = document.getElementById('split-bar-card');
    const barTransfer = document.getElementById('split-bar-transfer');
    if(barCash) barCash.style.width = pctCash.toFixed(1) + '%';
    if(barCard) barCard.style.width = pctCard.toFixed(1) + '%';
    if(barTransfer) barTransfer.style.width = pctTransfer.toFixed(1) + '%';

    const lblCash = document.getElementById('split-pct-cash');
    const lblCard = document.getElementById('split-pct-card');
    const lblTransfer = document.getElementById('split-pct-transfer');
    if(lblCash) lblCash.textContent = `Efectivo ${pctCash.toFixed(0)}%`;
    if(lblCard) lblCard.textContent = `Tarjeta ${pctCard.toFixed(0)}%`;
    if(lblTransfer) lblTransfer.textContent = `Transf. ${pctTransfer.toFixed(0)}%`;
}

function onSplitAmountChanged(){
    updateSplitCalculation();
}

function fillSplitRemainder(method){
    const total = ticket.reduce((s,t) => s + t.price * t.qty, 0);
    if(total <= 0) return;

    let amtCash = parseFloat(document.getElementById('split-amt-cash')?.value || 0) || 0;
    let amtCard = parseFloat(document.getElementById('split-amt-card')?.value || 0) || 0;
    let amtTransfer = parseFloat(document.getElementById('split-amt-transfer')?.value || 0) || 0;

    if(method === 'cash'){
        const other = amtCard + amtTransfer;
        const rem = Math.max(0, total - other);
        document.getElementById('split-amt-cash').value = rem > 0 ? rem.toFixed(2) : '';
    } else if(method === 'card'){
        const other = amtCash + amtTransfer;
        const rem = Math.max(0, total - other);
        document.getElementById('split-amt-card').value = rem > 0 ? rem.toFixed(2) : '';
    } else if(method === 'transfer'){
        const other = amtCash + amtCard;
        const rem = Math.max(0, total - other);
        document.getElementById('split-amt-transfer').value = rem > 0 ? rem.toFixed(2) : '';
    }
    updateSplitCalculation();
}

function splitEvenly(methods){
    const total = ticket.reduce((s,t) => s + t.price * t.qty, 0);
    if(total <= 0) return;

    document.getElementById('split-amt-cash').value = '';
    document.getElementById('split-amt-card').value = '';
    document.getElementById('split-amt-transfer').value = '';

    const share = Math.floor((total / methods.length) * 100) / 100;
    let assigned = 0;

    methods.forEach((m, idx) => {
        let val;
        if(idx === methods.length - 1){
            val = Number((total - assigned).toFixed(2));
        } else {
            val = share;
            assigned += share;
        }
        const el = document.getElementById('split-amt-' + m);
        if(el) el.value = val.toFixed(2);
    });

    updateSplitCalculation();
}

function renderTicket(){
    const total = ticket.reduce((s,t)=>s+t.price*t.qty,0);
    if(ticket.length===0){
        document.getElementById('ticket-items').innerHTML='<div class="text-slate-600 text-xs text-center py-5 bg-slate-900/40 rounded-xl border border-slate-800/60">No hay productos en el ticket actual. Selecciona un producto para comenzar.</div>';
        document.getElementById('ticket-total').textContent='$0';
        updatePaymentTotals();
        return;
    }
    document.getElementById('ticket-items').innerHTML = ticket.map(t => {
        return `
        <div class="pos-row flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition mb-1.5 shadow-sm">
            <div class="flex-1 min-w-0 w-full sm:w-auto">
                <div class="text-xs text-white font-bold truncate" title="${t.name}">${t.name}</div>
                <div class="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span class="mono text-emerald-400 font-medium">${fmt(t.price)} c/u</span>
                    <span class="text-slate-600">·</span>
                    <span class="text-slate-300 font-semibold">Lleva: <b class="text-sky-300 font-mono">${t.qty} piezas</b></span>
                </div>
            </div>

            <div class="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                <!-- Botón explícito para modificar piezas que se van a llevar -->
                <button onclick="openModifyTicketQtyModal('${t.id}')" type="button" class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 text-[11px] font-bold transition shadow-sm" title="Modificar número de piezas que se van a llevar (0 para quitar)">
                    <i data-lucide="edit-3" class="w-3.5 h-3.5 text-sky-400"></i><span>Modificar piezas (${t.qty})</span>
                </button>

                <!-- Control rápido de decremento / incremento -->
                <div class="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
                    <button onclick="stepTicketItemDirect('${t.id}', -1)" type="button" class="w-6 h-6 rounded-md hover:bg-slate-800 text-slate-300 hover:text-rose-400 font-bold text-xs flex items-center justify-center transition" title="Quitar 1 pieza (si llega a 0 se elimina)">
                        −
                    </button>
                    <span class="text-[11px] font-bold mono text-white px-2">${t.qty}</span>
                    <button onclick="stepTicketItemDirect('${t.id}', 1)" type="button" class="w-6 h-6 rounded-md hover:bg-slate-800 text-slate-300 hover:text-emerald-400 font-bold text-xs flex items-center justify-center transition" title="Agregar 1 pieza">
                        +
                    </button>
                </div>

                <div class="text-xs mono text-emerald-400 font-bold min-w-[70px] text-right">
                    ${fmt(t.price * t.qty)}
                </div>

                <!-- Botón quitar directo -->
                <button onclick="removeTicketItem('${t.id}')" type="button" class="text-slate-500 hover:text-rose-400 transition p-1 rounded-lg hover:bg-rose-500/10" title="Quitar este producto del ticket">
                    <i data-lucide="x" class="w-3.5 h-3.5"></i>
                </button>
            </div>
        </div>`;
    }).join('');
    document.getElementById('ticket-total').textContent=fmt(total);
    updatePaymentTotals();
    lucide.createIcons();
}

function closeSale(){
    if(!hasPermission('pos.sell')){
        showAccessDeniedModal('Tu rol no tiene autorización para realizar cobros o registrar ventas.');
        return;
    }
    if(ticket.length===0){alert('El ticket está vacío. Agrega al menos un producto para cobrar.');return;}

    // Verify stock before closing sale
    for(const it of ticket){
        const prod = catalog.find(p => p.id === it.id);
        if(!prod || (prod.stock || 0) < it.qty){
            alert(`⛔ Error: Stock insuficiente para "${it.name}". Existencias actuales: ${prod ? prod.stock : 0} u.`);
            return;
        }
    }

    const total = ticket.reduce((s,t)=>s+t.price*t.qty,0);
    const totalCost = ticket.reduce((s,t)=>s+t.cost*t.qty,0);

    // Validate payment method
    let paymentData = {
        method: currentPaymentMethod,
        label: 'Efectivo',
        total: total,
        cash: 0,
        card: 0,
        transfer: 0
    };

    if(currentPaymentMethod === 'cash'){
        const recInput = document.getElementById('cash-received');
        const received = recInput ? parseFloat(recInput.value) : NaN;
        const change = (!isNaN(received) && received >= total) ? (received - total) : 0;
        paymentData = {
            method: 'cash',
            label: 'Efectivo',
            total: total,
            cash: total,
            card: 0,
            transfer: 0,
            cashReceived: !isNaN(received) ? received : total,
            change: change
        };
    } else if(currentPaymentMethod === 'card'){
        const ref = document.getElementById('card-ref')?.value.trim() || '';
        paymentData = {
            method: 'card',
            label: 'Tarjeta',
            total: total,
            cash: 0,
            card: total,
            transfer: 0,
            reference: ref
        };
    } else if(currentPaymentMethod === 'transfer'){
        const ref = document.getElementById('transfer-ref')?.value.trim() || '';
        paymentData = {
            method: 'transfer',
            label: 'Transferencia',
            total: total,
            cash: 0,
            card: 0,
            transfer: total,
            reference: ref
        };
    } else if(currentPaymentMethod === 'split'){
        const amtCash = parseFloat(document.getElementById('split-amt-cash')?.value || 0) || 0;
        const amtCard = parseFloat(document.getElementById('split-amt-card')?.value || 0) || 0;
        const amtTransfer = parseFloat(document.getElementById('split-amt-transfer')?.value || 0) || 0;
        const sum = amtCash + amtCard + amtTransfer;

        if(Math.abs(sum - total) > 0.05){
            alert(`⚠️ Error en Dividir Pago:\nLa suma de los métodos de pago ($${sum.toFixed(2)}) no coincide con el total del ticket ($${total.toFixed(2)}).\n\nDiferencia pendiente: $${(total - sum).toFixed(2)}\nPor favor asigna el monto exacto antes de cobrar.`);
            return;
        }

        paymentData = {
            method: 'split',
            label: 'Dividido',
            total: total,
            cash: amtCash,
            card: amtCard,
            transfer: amtTransfer,
            breakdown: `Efec: $${amtCash.toFixed(2)} | Tarj: $${amtCard.toFixed(2)} | Transf: $${amtTransfer.toFixed(2)}`
        };
    }

    // Deduct stock from catalog
    ticket.forEach(it => {
        const prod = catalog.find(p => p.id === it.id);
        if(prod){
            prod.stock = Math.max(0, (prod.stock || 0) - it.qty);
        }
    });
    // Sincronizado en Cloud Firestore

    // Validar turno de caja antes de registrar (o auto-iniciar si no hay)
    if(!currentShift || currentShift.status !== 'open'){
        currentShift = {
            id: 'sh_' + Date.now(),
            openedAt: new Date().toISOString(),
            closedAt: null,
            cashierId: currentUser ? currentUser.id : 'usr_caja',
            cashierUsername: currentUser ? currentUser.username : 'caja_demo',
            cashierName: currentUser ? currentUser.name : 'Cajero',
            initialCashFloat: 500,
            status: 'open'
        };
        if(window.FirebaseService){
        window.FirebaseService.stats.saveCurrentShift(currentShift).catch(e => console.warn(e));
    }
    }

    const subtotalCalc = total / (1 + currentTaxZoneRate);
    const taxAmountCalc = total - subtotalCalc;

    const sale={
        id:'s_'+Date.now(),
        date:new Date().toISOString(),
        items:ticket.map(t=>({...t})),
        total:total,
        subtotal:subtotalCalc,
        taxRate:currentTaxZoneRate,
        taxAmount:taxAmountCalc,
        totalCost:totalCost,
        payment:paymentData,
        shiftId:currentShift.id,
        status: 'completed',
        cashierId: currentUser ? currentUser.id : 'usr_caja',
        cashierUsername: currentUser ? currentUser.username : 'caja_demo',
        cashierName: currentUser ? currentUser.name : 'Cajero'
    };

    logActivity('Venta Registrada en Firestore', `Venta cobrada por ${fmt(total)} (${paymentData.label}) por @${sale.cashierUsername}`, 'success');

    salesLog.push(sale);
    
    // Persistencia asíncrona integral en Cloud Firestore (sales, products, stats)
    if(window.FirebaseService){
        try {
            // 1. Guardar la venta en la colección 'sales'
            window.FirebaseService.sales.create(sale).catch(e => console.error('[Firestore sales.create error]', e));
            
            // 2. Descontar stock de cada refacción en la colección 'products'
            ticket.forEach(it => {
                const p = catalog.find(x => x.id === it.id);
                if(p){
                    window.FirebaseService.products.updateStock(p.id, p.stock).catch(e => console.error('[Firestore updateStock error]', e));
                }
            });

            // 3. Actualizar estado del turno y métricas globales en la colección 'stats'
            if(currentShift){
                window.FirebaseService.stats.saveCurrentShift(currentShift).catch(e => console.error('[Firestore shift error]', e));
            }
            window.FirebaseService.stats.saveOverview({
                lastSaleId: sale.id,
                lastSaleTotal: sale.total,
                salesCount: salesLog.length,
                lastUpdated: new Date().toISOString()
            }).catch(e => console.error('[Firestore stats.saveOverview error]', e));

        } catch(cloudErr) {
            console.error('[Cloud Firestore completeSale Exception]', cloudErr);
        }
    }
    const justCreatedSaleId = sale.id;

    // Reset ticket & inputs
    ticket=[];
    if(document.getElementById('cash-received')) document.getElementById('cash-received').value = '';
    if(document.getElementById('card-ref')) document.getElementById('card-ref').value = '';
    if(document.getElementById('transfer-ref')) document.getElementById('transfer-ref').value = '';
    if(document.getElementById('split-amt-cash')) document.getElementById('split-amt-cash').value = '';
    if(document.getElementById('split-amt-card')) document.getElementById('split-amt-card').value = '';
    if(document.getElementById('split-amt-transfer')) document.getElementById('split-amt-transfer').value = '';
    setPaymentMethod('cash');

    renderTicket();
    renderCatalog();
    updateProductSelect();
    upPosSummary();
    upPosStats();
    onSellProductChange();
    updateShiftUI();
    
    // Auto-ofrecer impresión térmica
    setTimeout(() => {
        if(confirm(`✓ Venta registrada con éxito (#${justCreatedSaleId}) por ${fmt(sale.total)}.\n¿Deseas imprimir el Ticket Térmico ahora?`)){
            printSaleTicket(justCreatedSaleId);
        }
    }, 150);
}

// --- 8. CONTROL DE GASTOS DIARIOS DE CAJA ---
function addExpense(){
    if(!hasPermission('inventory.adjust') && !hasPermission('catalog.edit') && !hasPermission('sales.approve_cancel')){
        showAccessDeniedModal('Solo un Supervisor o Administrador puede registrar gastos operativos.');
        return;
    }
    const desc=document.getElementById('exp-desc').value.trim();
    const amount=parseFloat(document.getElementById('exp-amount').value);
    const cat=document.getElementById('exp-cat').value;
    if(!desc||isNaN(amount)){alert('Completa los campos.');return;}
    expenses.push({id:'e_'+Date.now(),date:new Date().toISOString(),desc,amount,category:cat});
    
    // Guardar en Cloud Firestore 'stats/expenses'
    if(window.FirebaseService){
        const docRef = window.FirebaseService.doc(window.FirebaseService.db, 'stats', 'expenses');
        window.FirebaseService.setDoc(docRef, { list: expenses, updatedAt: new Date().toISOString() }, { merge: true }).catch(e => console.warn(e));
    }

    logActivity('Gasto Registrado en Firestore', `Gasto de ${fmt(amount)} (${desc}) registrado por @${currentUser ? currentUser.username : 'sistema'}`, 'warn');
    document.getElementById('exp-desc').value='';document.getElementById('exp-amount').value='';
    renderExpenses();upPosSummary();
}

function renderExpenses(){
    const today=new Date().toDateString();
    const todayExp=expenses.filter(e=>new Date(e.date).toDateString()===today);
    if(todayExp.length===0){document.getElementById('exp-list').innerHTML='<div class="text-slate-600 text-sm text-center py-6">Sin gastos hoy.</div>';return;}
    document.getElementById('exp-list').innerHTML=todayExp.map(e=>`<div class="pos-row"><div class="flex-1"><div class="text-sm text-white">${e.desc}</div><div class="text-[10px] text-slate-500">${e.category==='fijo'?'Gasto Fijo':e.category==='variable'?'Gasto Variable':'Otro'}</div></div><div class="text-sm mono text-rose-400">${fmt(e.amount)}</div></div>`).join('');
}

// --- 9. RESUMEN Y BALANCE DIARIO DEL POS ---
function upPosSummary(){
    const today = new Date().toDateString();
    const isCajero = currentUser && currentUser.role === 'cajero';
    const canViewAll = hasPermission('sales.view_all');
    const canViewFinance = hasPermission('finance.view_analysis');
    const canDirectCancel = hasPermission('sales.cancel_direct');
    const canRequestCancel = hasPermission('sales.request_cancel');

    // 1. Filtrar ventas activas (excluir canceladas para cómputos financieros)
    const activeSales = salesLog.filter(s => s.status !== 'cancelled');

    // Si es cajero, solo totaliza y lista sus propias ventas del turno
    const relevantActiveSales = (isCajero && !canViewAll)
        ? activeSales.filter(s => new Date(s.date).toDateString() === today && (s.cashierId === currentUser.id || s.cashierUsername === currentUser.username))
        : activeSales.filter(s => new Date(s.date).toDateString() === today);

    // Historial para visualización (incluye canceladas con su distintivo)
    const relevantHistorySales = (isCajero && !canViewAll)
        ? salesLog.filter(s => new Date(s.date).toDateString() === today && (s.cashierId === currentUser.id || s.cashierUsername === currentUser.username))
        : salesLog.filter(s => new Date(s.date).toDateString() === today);

    const todayExp = expenses.filter(e => new Date(e.date).toDateString() === today);
    const totalSales = relevantActiveSales.reduce((s, x) => s + x.total, 0);
    const totalCogs = relevantActiveSales.reduce((s, x) => s + x.totalCost, 0);
    const totalExp = todayExp.reduce((s, x) => s + x.amount, 0);
    const profit = totalSales - totalCogs - totalExp;

    // Actualizar tarjetas resumen
    document.getElementById('pos-sales-total').textContent = fmt(totalSales);

    const cogsEl = document.getElementById('pos-cogs');
    const profitEl = document.getElementById('pos-profit');

    if(canViewFinance){
        if(cogsEl) cogsEl.textContent = fmt(totalCogs);
        if(profitEl){
            profitEl.textContent = fmt(profit);
            profitEl.className = 'text-xl font-bold mono ' + (profit > 0 ? 'text-emerald-400' : profit === 0 ? 'text-slate-400' : 'text-rose-400');
        }
    } else {
        if(cogsEl) cogsEl.textContent = '— (Confidencial)';
        if(profitEl){
            profitEl.textContent = '— (Confidencial)';
            profitEl.className = 'text-sm font-semibold mono text-slate-500';
        }
    }

    const expEl = document.getElementById('pos-exp-total');
    if(expEl) expEl.textContent = canViewFinance ? fmt(totalExp) : '—';

    // Desglose de Métodos de Pago (solo ventas activas)
    let todayCash = 0, todayCard = 0, todayTransfer = 0;
    relevantActiveSales.forEach(s => {
        if(s.payment){
            todayCash += (s.payment.cash || 0);
            todayCard += (s.payment.card || 0);
            todayTransfer += (s.payment.transfer || 0);
        } else {
            todayCash += (s.total || 0);
        }
    });

    const payCashEl = document.getElementById('pos-pay-cash');
    const payCardEl = document.getElementById('pos-pay-card');
    const payTransferEl = document.getElementById('pos-pay-transfer');
    if(payCashEl) payCashEl.textContent = fmt(todayCash);
    if(payCardEl) payCardEl.textContent = fmt(todayCard);
    if(payTransferEl) payTransferEl.textContent = fmt(todayTransfer);

    const cashPctEl = document.getElementById('pos-pay-cash-pct');
    const cardPctEl = document.getElementById('pos-pay-card-pct');
    const transferPctEl = document.getElementById('pos-pay-transfer-pct');
    if(cashPctEl) cashPctEl.textContent = totalSales > 0 ? ((todayCash / totalSales) * 100).toFixed(0) + '%' : '0%';
    if(cardPctEl) cardPctEl.textContent = totalSales > 0 ? ((todayCard / totalSales) * 100).toFixed(0) + '%' : '0%';
    if(transferPctEl) transferPctEl.textContent = totalSales > 0 ? ((todayTransfer / totalSales) * 100).toFixed(0) + '%' : '0%';

    // Historial del Día con badges de pago, cancelación y estado
    if(relevantHistorySales.length === 0){
        document.getElementById('pos-history').innerHTML = `<div class="text-slate-600 text-sm text-center py-6">${isCajero ? 'No tienes ventas registradas en tu turno de hoy.' : 'Sin ventas registradas hoy.'}</div>`;
    } else {
        document.getElementById('pos-history').innerHTML = relevantHistorySales.map((s, i) => {
            const isCancelled = s.status === 'cancelled';
            const hasPendingReq = cancelRequests.some(r => r.saleId === s.id && r.status === 'pending');

            let payBadge = '';
            const p = s.payment || { method: 'cash', label: 'Efectivo' };
            if(p.method === 'cash'){
                payBadge = `<span class="pill bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[9px] shrink-0 flex items-center gap-1"><i data-lucide="banknote" class="w-2.5 h-2.5 text-emerald-400"></i>Efectivo</span>`;
            } else if(p.method === 'card'){
                payBadge = `<span class="pill bg-sky-500/15 text-sky-300 border border-sky-500/30 text-[9px] shrink-0 flex items-center gap-1"><i data-lucide="credit-card" class="w-2.5 h-2.5 text-sky-400"></i>Tarjeta${p.reference ? ' (' + p.reference + ')' : ''}</span>`;
            } else if(p.method === 'transfer'){
                payBadge = `<span class="pill bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[9px] shrink-0 flex items-center gap-1"><i data-lucide="smartphone" class="w-2.5 h-2.5 text-purple-400"></i>Transf.${p.reference ? ' (' + p.reference + ')' : ''}</span>`;
            } else if(p.method === 'split'){
                const det = [];
                if(p.cash > 0) det.push(`Efec: $${p.cash.toFixed(0)}`);
                if(p.card > 0) det.push(`Tarj: $${p.card.toFixed(0)}`);
                if(p.transfer > 0) det.push(`Transf: $${p.transfer.toFixed(0)}`);
                payBadge = `<span class="pill bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[9px] shrink-0 flex items-center gap-1" title="${p.breakdown || det.join(', ')}"><i data-lucide="split" class="w-2.5 h-2.5 text-amber-400"></i>Dividido</span>`;
            }

            const cashierBadge = `<span class="pill bg-slate-800 text-slate-400 border border-slate-700 text-[8.5px] font-mono">@${s.cashierUsername || 'caja'}</span>`;

            let statusBadge = '';
            let actionBtn = '';

            if(isCancelled){
                statusBadge = `<span class="pill bg-rose-500/25 text-rose-300 border border-rose-500/40 text-[9px] font-bold"><i data-lucide="ban" class="w-2.5 h-2.5"></i>CANCELADA</span>`;
            } else if(hasPendingReq){
                statusBadge = `<span class="pill bg-amber-500/20 text-amber-300 border border-amber-500/35 text-[9px] font-bold animate-pulse"><i data-lucide="clock" class="w-2.5 h-2.5"></i>Cancelación Solicitada</span>`;
            }

            const printBtn = `<button onclick="printSaleTicket('${s.id}')" class="text-slate-500 hover:text-sky-300 transition p-1 shrink-0" title="Imprimir Ticket Térmico"><i data-lucide="printer" class="w-4 h-4"></i></button>`;

            if(!isCancelled){
                if(canDirectCancel){
                    actionBtn = `${printBtn}<button onclick="promptDirectCancel('${s.id}')" class="text-slate-600 hover:text-rose-400 transition p-1 shrink-0" title="Cancelar Venta (Directa)"><i data-lucide="trash-2" class="w-4 h-4"></i></button>`;
                } else if(canRequestCancel && !hasPendingReq){
                    actionBtn = `${printBtn}<button onclick="promptRequestCancel('${s.id}')" class="text-slate-500 hover:text-amber-400 transition p-1 shrink-0 text-[10px] flex items-center gap-0.5 border border-slate-700/60 rounded px-1.5 py-0.5 bg-slate-800/60" title="Solicitar Cancelación al Supervisor"><i data-lucide="flag" class="w-3 h-3 text-amber-400"></i>Solicitar</button>`;
                } else {
                    actionBtn = printBtn;
                }
            }

            const amountDisplay = isCancelled
                ? `<span class="text-sm mono line-through text-slate-500 mr-2 shrink-0">${fmt(s.total)}</span>`
                : `<span class="text-sm mono text-emerald-400 mr-2 shrink-0">${fmt(s.total)}</span>`;

            return `
            <div class="pos-row group ${isCancelled ? 'opacity-65 bg-slate-900/30' : ''}">
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span class="text-sm text-white font-medium">Venta #${i+1}</span>
                        ${cashierBadge}
                        ${payBadge}
                        ${statusBadge}
                    </div>
                    <div class="text-[10px] text-slate-400 truncate">${(s.items||[]).map(it=>it.name+' x'+it.qty).join(', ')}</div>
                    ${isCancelled ? `<div class="text-[9.5px] text-rose-400/90 mt-0.5">Motivo anulación: ${s.cancelReason || 'Sin motivo especificado'}</div>` : ''}
                </div>
                ${amountDisplay}
                ${actionBtn}
            </div>`;
        }).join('');
    }

    lucide.createIcons();

    // Gráfica de hoy (solo productos de ventas activas)
    const productSales = {}, productCosts = {};
    relevantActiveSales.forEach(s => (s.items||[]).forEach(it => {
        productSales[it.name] = (productSales[it.name] || 0) + it.price * it.qty;
        productCosts[it.name] = (productCosts[it.name] || 0) + it.cost * it.qty;
    }));
    const labels = Object.keys(productSales);
    if(posChart && posChart.data){
        posChart.data.labels = labels;
        posChart.data.datasets[0].data = labels.map(l => productSales[l]);
        posChart.data.datasets[1].data = labels.map(l => canViewFinance ? productCosts[l] : 0);
        posChart.update();
    }
}

// --- 10. ESTADÍSTICAS AVANZADAS Y HORAS PICO ---
function initHourlyChart(){
    const canvas = document.getElementById('cPosHourly');
    if(!canvas) return;
    if(hourlyChart) hourlyChart.destroy();
    const hours = Array.from({length:24}, (_,i) => (i < 10 ? '0' + i : '' + i) + ':00');
    hourlyChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: hours,
            datasets: [{
                label: 'Ventas ($)',
                data: Array(24).fill(0),
                backgroundColor: Array(24).fill('rgba(14, 165, 233, 0.45)'),
                borderColor: Array(24).fill('rgba(14, 165, 233, 0.8)'),
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => 'Ventas: ' + fmt(ctx.raw)
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        color: '#64748b',
                        font: { size: 9 },
                        maxRotation: 0,
                        callback: function(val, index) {
                            return index % 3 === 0 ? hours[index] : '';
                        }
                    }
                },
                y: {
                    grid: { color: 'rgba(51, 65, 85, 0.3)' },
                    ticks: {
                        color: '#64748b',
                        font: { size: 9 },
                        callback: v => fmtS(v)
                    }
                }
            }
        }
    });
}
initHourlyChart();

function upPosStats(){
    const emptyEl = document.getElementById('stats-empty');
    const contentEl = document.getElementById('stats-content');
    
    // Filtrar estrictamente solo ventas activas (excluir canceladas)
    const activeSales = (salesLog || []).filter(s => s.status !== 'cancelled');

    if(!activeSales || activeSales.length === 0){
        if(emptyEl) emptyEl.classList.remove('hidden');
        if(contentEl) contentEl.classList.add('hidden');
        return;
    }
    if(emptyEl) emptyEl.classList.add('hidden');
    if(contentEl) contentEl.classList.remove('hidden');

    const prodMap = {};
    let totalRevenue = 0;
    const daySet = new Set();
    const hourlyRevenue = Array(24).fill(0);
    const hourlyTickets = Array(24).fill(0);

    activeSales.forEach(s => {
        daySet.add(new Date(s.date).toDateString());
        totalRevenue += (s.total || 0);

        const dateObj = new Date(s.date);
        const hr = isNaN(dateObj.getHours()) ? 12 : dateObj.getHours();
        hourlyRevenue[hr] += (s.total || 0);
        hourlyTickets[hr] += 1;

        if(s.items && Array.isArray(s.items)){
            s.items.forEach(it => {
                if(!prodMap[it.id]){
                    prodMap[it.id] = {
                        id: it.id,
                        name: it.name,
                        qty: 0,
                        revenue: 0,
                        cost: 0,
                        price: it.price || 0,
                        unitCost: it.cost || 0
                    };
                }
                prodMap[it.id].qty += it.qty;
                prodMap[it.id].revenue += (it.price * it.qty);
                prodMap[it.id].cost += (it.cost * it.qty);
            });
        }
    });

    const products = Object.values(prodMap).sort((a,b) => b.qty - a.qty);

    document.getElementById('stat-total-rev').textContent = fmt(totalRevenue);
    document.getElementById('stat-total-tickets').textContent = `${activeSales.length} ticket(s) en ${daySet.size} día(s)`;
    document.getElementById('stat-avg-ticket').textContent = fmt(activeSales.length > 0 ? totalRevenue / activeSales.length : 0);
    document.getElementById('stat-prod-count').textContent = `${products.length} producto(s)`;

    // Top Selling Product
    if(products.length > 0){
        const top = products[0];
        document.getElementById('stat-top-prod-name').textContent = top.name;
        document.getElementById('stat-top-prod-sub').textContent = `${top.qty} unid. vendidas · ${fmt(top.revenue)}`;
        const share = totalRevenue > 0 ? ((top.revenue / totalRevenue) * 100).toFixed(1) : 0;
        document.getElementById('stat-top-prod-share').textContent = `${share}% del total`;
    } else {
        document.getElementById('stat-top-prod-name').textContent = '—';
        document.getElementById('stat-top-prod-sub').textContent = '—';
        document.getElementById('stat-top-prod-share').textContent = '0%';
    }

    // Peak Hour Calculation
    let peakHr = 0, maxHrRev = 0;
    for(let h = 0; h < 24; h++){
        if(hourlyRevenue[h] > maxHrRev){
            maxHrRev = hourlyRevenue[h];
            peakHr = h;
        }
    }
    const peakEnd = (peakHr + 1) % 24;
    const peakHrStr = (peakHr < 10 ? '0' + peakHr : peakHr) + ':00 - ' + (peakEnd < 10 ? '0' + peakEnd : peakEnd) + ':00';
    document.getElementById('stat-peak-hour').textContent = peakHrStr;
    document.getElementById('stat-peak-hour-sub').textContent = `${fmt(maxHrRev)} (${hourlyTickets[peakHr]} ticket(s))`;
    const peakPct = totalRevenue > 0 ? ((maxHrRev / totalRevenue) * 100).toFixed(0) : 0;
    document.getElementById('stat-peak-hour-pct').textContent = `${peakPct}% del total`;

    // Update Hourly Chart
    if(!hourlyChart) initHourlyChart();
    if(hourlyChart){
        hourlyChart.data.datasets[0].data = hourlyRevenue;
        hourlyChart.data.datasets[0].backgroundColor = hourlyRevenue.map((v, i) => i === peakHr && v > 0 ? 'rgba(16, 185, 129, 0.85)' : 'rgba(14, 165, 233, 0.45)');
        hourlyChart.data.datasets[0].borderColor = hourlyRevenue.map((v, i) => i === peakHr && v > 0 ? '#10b981' : '#0ea5e9');
        hourlyChart.update();
    }

    // Top Selling Ranking List
    const maxQty = products.length > 0 ? products[0].qty : 1;
    const rankingHtml = products.map((p, idx) => {
        const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx+1}`;
        const pctBar = Math.min(Math.round((p.qty / maxQty) * 100), 100);
        const marginPct = p.revenue > 0 ? ((p.revenue - p.cost) / p.revenue * 100).toFixed(0) : 0;
        const canViewCosts = hasPermission('finance.view_analysis');
        const marginOrShare = canViewCosts
            ? `<span>Margen: <b class="${marginPct >= 30 ? 'text-emerald-400' : 'text-amber-400'}">${marginPct}%</b> (${fmt(p.revenue - p.cost)})</span>`
            : `<span>Participación: <b class="text-sky-400">${totalRevenue > 0 ? ((p.revenue / totalRevenue) * 100).toFixed(1) : 0}%</b></span>`;

        return `
        <div class="pos-row flex items-center gap-3">
            <span class="w-7 text-center font-bold text-xs ${idx === 0 ? 'text-amber-400' : 'text-slate-400'}">${medal}</span>
            <div class="flex-1 min-w-0">
                <div class="flex justify-between items-center mb-1">
                    <span class="text-xs font-semibold text-white truncate">${p.name}</span>
                    <span class="text-xs font-bold mono text-emerald-400">${fmt(p.revenue)}</span>
                </div>
                <div class="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div class="bg-gradient-to-r from-emerald-500 to-teal-400 h-1.5 rounded-full" style="width: ${pctBar}%"></div>
                </div>
                <div class="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                    <span>${p.qty} unid. vendidas</span>
                    ${marginOrShare}
                </div>
            </div>
        </div>`;
    }).join('');
    document.getElementById('stat-ranking-list').innerHTML = rankingHtml || '<div class="text-slate-500 text-xs py-4 text-center">No hay productos vendidos.</div>';

    renderCorrelationAnalysis(products);
    lucide.createIcons();
}

// --- 11. ANÁLISIS DE CORRELACIÓN DE PEARSON (CROSS-SELLING / CANIBALIZACIÓN) ---
function calcPearsonCorrelation(x, y){
    if(!x || !y || x.length !== y.length || x.length < 2) return 0;
    const n = x.length;
    let sumX = 0, sumY = 0, sumXX = 0, sumYY = 0, sumXY = 0;
    for(let i = 0; i < n; i++){
        sumX += x[i];
        sumY += y[i];
        sumXX += x[i] * x[i];
        sumYY += y[i] * y[i];
        sumXY += x[i] * y[i];
    }
    const numerator = (n * sumXY) - (sumX * sumY);
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    return denominator === 0 ? 0 : numerator / denominator;
}

function renderCorrelationAnalysis(products){
    const container = document.getElementById('correlation-table');
    const insightsContainer = document.getElementById('correlation-insights');
    const activeSales = (salesLog || []).filter(s => s.status !== 'cancelled');
    if(!products || products.length < 2 || activeSales.length < 2){
        insightsContainer.innerHTML = '';
        container.innerHTML = '<div class="text-slate-500 text-xs py-4 text-center">Se requieren al menos 2 productos con ventas registradas activas para calcular correlaciones cruzadas.</div>';
        return;
    }

    const N = activeSales.length;
    const prodVectors = {};
    products.forEach(p => { prodVectors[p.id] = Array(N).fill(0); });

    activeSales.forEach((sale, idx) => {
        if(sale.items && Array.isArray(sale.items)){
            sale.items.forEach(it => {
                if(prodVectors[it.id]){
                    prodVectors[it.id][idx] += it.qty;
                }
            });
        }
    });

    const pairs = [];
    for(let i = 0; i < products.length; i++){
        for(let j = i + 1; j < products.length; j++){
            const pA = products[i];
            const pB = products[j];
            const vecA = prodVectors[pA.id];
            const vecB = prodVectors[pB.id];

            let sumA = 0, sumB = 0, sumAA = 0, sumBB = 0, sumAB = 0;
            for(let k = 0; k < N; k++){
                const a = vecA[k];
                const b = vecB[k];
                sumA += a;
                sumB += b;
                sumAA += a * a;
                sumBB += b * b;
                sumAB += a * b;
            }

            const numerator = (N * sumAB) - (sumA * sumB);
            const denominator = Math.sqrt((N * sumAA - sumA * sumA) * (N * sumBB - sumB * sumB));
            const r = denominator === 0 ? 0 : numerator / denominator;
            pairs.push({ pA, pB, r });
        }
    }

    pairs.sort((a,b) => Math.abs(b.r) - Math.abs(a.r));

    const strongNeg = pairs.find(p => p.r <= -0.25);
    const strongPos = pairs.find(p => p.r >= 0.25);

    let insightHtml = '';
    if(strongNeg){
        insightHtml += `
        <div class="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 flex items-start gap-2.5 text-xs text-rose-200">
            <i data-lucide="arrow-down-right" class="w-4 h-4 text-rose-400 mt-0.5 shrink-0"></i>
            <div>
                <b class="text-rose-300">Efecto Canibalización / Sustitutos detectado (r = ${strongNeg.r.toFixed(2)}):</b> 
                El aumento en la venta de <b>${strongNeg.pA.name}</b> coincide con la disminución o ausencia de <b>${strongNeg.pB.name}</b>. Los clientes eligen uno u otro, compitiendo directamente en demanda.
            </div>
        </div>`;
    }
    if(strongPos){
        insightHtml += `
        <div class="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-start gap-2.5 text-xs text-emerald-200">
            <i data-lucide="arrow-up-right" class="w-4 h-4 text-emerald-400 mt-0.5 shrink-0"></i>
            <div>
                <b class="text-emerald-300">Productos Complementarios (Venta Cruzada, r = +${strongPos.r.toFixed(2)}):</b> 
                <b>${strongPos.pA.name}</b> y <b>${strongPos.pB.name}</b> suelen comprarse juntos en el mismo ticket. ¡Excelente oportunidad para crear un combo o paquete promocional!
            </div>
        </div>`;
    }
    if(!strongNeg && !strongPos){
        insightHtml = `
        <div class="p-2.5 rounded-lg border border-slate-700/60 bg-slate-800/40 text-xs text-slate-300 flex items-center gap-2">
            <i data-lucide="info" class="w-3.5 h-3.5 text-sky-400 shrink-0"></i>
            <span>Las ventas de tus productos muestran demanda independiente (baja correlación). Continúa registrando más tickets para detectar patrones de consumo.</span>
        </div>`;
    }
    insightsContainer.innerHTML = insightHtml;

    const pairsHtml = pairs.map(pair => {
        let badge, label, desc;
        if(pair.r <= -0.25){
            badge = 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
            label = 'Sustitutos / Inversa';
            desc = 'Subir la venta de uno disminuye el otro';
        } else if(pair.r >= 0.25){
            badge = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
            label = 'Complementarios / Combo';
            desc = 'Se venden juntos habitualmente';
        } else {
            badge = 'bg-slate-700/60 text-slate-400 border border-slate-600/40';
            label = 'Independientes';
            desc = 'No afectan mutuamente su venta';
        }
        return `
        <div class="pos-row flex items-center justify-between gap-3 text-xs">
            <div class="flex-1 min-w-0">
                <div class="font-medium text-white flex items-center gap-1.5 truncate">
                    <span>${pair.pA.name}</span>
                    <i data-lucide="repeat" class="w-3 h-3 text-slate-500 shrink-0"></i>
                    <span>${pair.pB.name}</span>
                </div>
                <div class="text-[10px] text-slate-400">${desc}</div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
                <span class="mono font-bold text-xs ${pair.r > 0 ? 'text-emerald-400' : pair.r < 0 ? 'text-rose-400' : 'text-slate-400'}">${pair.r > 0 ? '+' : ''}${pair.r.toFixed(2)}</span>
                <span class="pill ${badge} text-[9px]">${label}</span>
            </div>
        </div>`;
    }).join('');
    container.innerHTML = pairsHtml;
    lucide.createIcons();
}

// --- 12. TABLERO DEL ENCARGADO DE ALMACÉN (ROP / PUNTO DE REORDEN) ---
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


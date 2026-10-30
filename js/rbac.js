// =====================================================================
// ROLE-BASED ACCESS CONTROL (RBAC) & USER MANAGEMENT (rbac.js)
// CFO Copilot + Punto de Venta
// =====================================================================

// --- 1. VERIFICACIÓN CENTRALIZADA DE PERMISOS ---
function hasPermission(permission){
    if(!currentUser || !currentUser.active) return false;
    const perms = ROLE_MATRIX[currentUser.role];
    return perms ? perms.includes(permission) : false;
}

// --- 2. INICIALIZACIÓN DE AUTENTICACIÓN Y SESIÓN ---
function initAuthAndUsers(){
    // 1. Cargar o sembrar usuarios en localStorage['cfo_users']
    try {
        const storedUsers = JSON.parse(localStorage.getItem('cfo_users') || 'null');
        if(!storedUsers || !Array.isArray(storedUsers) || storedUsers.length === 0){
            systemUsers = JSON.parse(JSON.stringify(DEFAULT_SYSTEM_USERS));
            localStorage.setItem('cfo_users', JSON.stringify(systemUsers));
        } else {
            systemUsers = storedUsers;
            // Asegurar presencia de los 4 usuarios demo sin pisar cambios
            DEFAULT_SYSTEM_USERS.forEach(defU => {
                if(!systemUsers.some(u => u.username === defU.username)){
                    systemUsers.push(JSON.parse(JSON.stringify(defU)));
                }
            });
            localStorage.setItem('cfo_users', JSON.stringify(systemUsers));
        }
    } catch(e) {
        systemUsers = JSON.parse(JSON.stringify(DEFAULT_SYSTEM_USERS));
        localStorage.setItem('cfo_users', JSON.stringify(systemUsers));
    }

    // 2. Cargar solicitudes de cancelación
    try {
        cancelRequests = JSON.parse(localStorage.getItem('cfo_cancel_reqs') || '[]');
        if(!Array.isArray(cancelRequests)) cancelRequests = [];
    } catch(e) {
        cancelRequests = [];
    }

    // 3. Cargar bitácora de actividad
    try {
        activityLog = JSON.parse(localStorage.getItem('cfo_activity_log') || '[]');
        if(!Array.isArray(activityLog)) activityLog = [];
    } catch(e) {
        activityLog = [];
    }

    // 4. Normalizar estado de ventas históricas (evitar valores indefinidos)
    if(Array.isArray(salesLog)){
        let modified = false;
        salesLog.forEach(s => {
            if(!s.status){ s.status = 'completed'; modified = true; }
            if(!s.cashierUsername){ s.cashierUsername = 'caja_demo'; modified = true; }
            if(!s.cashierName){ s.cashierName = 'Cajero'; modified = true; }
        });
        if(modified) localStorage.setItem('pos_sales', JSON.stringify(salesLog));
    }

    // 5. Cargar sesión activa de sessionStorage o iniciar con admin_demo en modo presentación
    try {
        const sessionU = JSON.parse(sessionStorage.getItem('cfo_current_user') || 'null');
        if(sessionU && sessionU.username){
            const found = systemUsers.find(u => u.username === sessionU.username);
            currentUser = (found && found.active) ? found : null;
        }
    } catch(e){
        currentUser = null;
    }

    if(!currentUser && DEMO_MODE){
        currentUser = systemUsers.find(u => u.username === 'admin_demo') || systemUsers[0];
        if(currentUser) sessionStorage.setItem('cfo_current_user', JSON.stringify(currentUser));
    }

    applyRoleUI();
    logActivity('Inicio de Sistema', `Sesión iniciada con perfil: ${currentUser ? currentUser.username : 'Ninguno'}`, 'info');
}

// --- 3. GESTIÓN DE SESIÓN, LOGIN, LOGOUT Y CAMBIO DE ROL ---
function openRoleSwitchModal(){
    const modal = document.getElementById('role-switch-modal');
    if(modal){
        modal.classList.remove('hidden');
        if(window.lucide && typeof lucide.createIcons === 'function') lucide.createIcons();
    }
}

function closeRoleSwitchModal(){
    const modal = document.getElementById('role-switch-modal');
    if(modal) modal.classList.add('hidden');
}

function closeLoginModal(){
    const modal = document.getElementById('login-modal');
    if(modal) modal.classList.add('hidden');
    if(!currentUser){
        switchDemoUser('admin_demo');
    }
}

function login(username, password){
    let user = (systemUsers || []).find(u => u.username.toLowerCase() === username.trim().toLowerCase());
    if(!user){
        user = DEFAULT_SYSTEM_USERS.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
        if(user){
            systemUsers.push(JSON.parse(JSON.stringify(user)));
            localStorage.setItem('cfo_users', JSON.stringify(systemUsers));
        }
    }
    const errBox = document.getElementById('login-error');
    const errMsg = document.getElementById('login-error-msg');
    
    if(!user || user.password !== password){
        if(errBox){
            errBox.classList.remove('hidden');
            errMsg.textContent = 'Usuario o contraseña incorrectos.';
        }
        return false;
    }

    if(!user.active){
        if(errBox){
            errBox.classList.remove('hidden');
            errMsg.textContent = 'Esta cuenta se encuentra desactivada por el administrador.';
        }
        return false;
    }

    currentUser = user;
    sessionStorage.setItem('cfo_current_user', JSON.stringify(currentUser));
    if(errBox) errBox.classList.add('hidden');
    
    const modal = document.getElementById('login-modal');
    if(modal) modal.classList.add('hidden');
    
    logActivity('Inicio de Sesión', `Usuario "${user.username}" (${user.role}) autenticado con éxito.`, 'success');
    applyRoleUI();
    updateMenuIndicators();

    // Si el usuario estaba en Asesor Financiero y su rol no tiene acceso, redirigir al menú
    const advEl = document.getElementById('view-advisor');
    if(advEl && !advEl.classList.contains('hidden')){
        const canAdv = hasPermission('finance.view_analysis') || hasPermission('ai.qwen_access') || hasPermission('ai.tax_access');
        if(!canAdv) goTo('menu');
    }

    const roleLabels = { admin: 'Administrador', supervisor: 'Supervisor', cajero: 'Cajero', analista: 'Analista', almacen: 'Almacén' };
    showGlobalToast(`✓ Bienvenido, ${user.name} (${roleLabels[user.role] || user.role})`, 'success');
    if(window.lucide && typeof lucide.createIcons === 'function') lucide.createIcons();
    return true;
}

function handleLoginForm(event){
    event.preventDefault();
    const u = document.getElementById('login-username').value;
    const p = document.getElementById('login-password').value;
    login(u, p);
}

function quickLoginDemo(demoUsername){
    document.getElementById('login-username').value = demoUsername;
    document.getElementById('login-password').value = '1234';
    login(demoUsername, '1234');
}

function logout(){
    if(currentUser){
        logActivity('Cierre de Sesión', `El usuario "${currentUser.username}" cerró sesión.`, 'info');
    }
    currentUser = null;
    sessionStorage.removeItem('cfo_current_user');
    
    // Regresar siempre a la pantalla de menú principal al salir
    goTo('menu');
    applyRoleUI();
    updateMenuIndicators();
    
    const modal = document.getElementById('login-modal');
    if(modal) modal.classList.remove('hidden');
    
    showGlobalToast('Sesión finalizada. Selecciona un usuario para ingresar.', 'info');
    if(window.lucide && typeof lucide.createIcons === 'function') lucide.createIcons();
}

function switchDemoUser(demoUsername){
    if(!demoUsername) return;
    let user = (systemUsers || []).find(u => u.username === demoUsername);
    if(!user){
        user = DEFAULT_SYSTEM_USERS.find(u => u.username === demoUsername);
        if(user){
            systemUsers.push(JSON.parse(JSON.stringify(user)));
            localStorage.setItem('cfo_users', JSON.stringify(systemUsers));
        }
    }
    if(!user){
        alert('Usuario demo no encontrado: ' + demoUsername);
        return;
    }
    if(!user.active){
        alert(`La cuenta demo "${demoUsername}" está desactivada actualmente.`);
        return;
    }

    currentUser = user;
    sessionStorage.setItem('cfo_current_user', JSON.stringify(currentUser));
    logActivity('Cambio Rápido Demo', `Perfil alternado a: ${user.username} (${user.role})`, 'info');

    const demoSelect = document.getElementById('demo-role-select');
    if(demoSelect) demoSelect.value = demoUsername;

    applyRoleUI();
    updateMenuIndicators();

    // Si el usuario estaba en el Asesor Financiero y su nuevo rol no tiene acceso, redirigir a Menú o POS
    const advEl = document.getElementById('view-advisor');
    if(advEl && !advEl.classList.contains('hidden')){
        const canAdv = hasPermission('finance.view_analysis') || hasPermission('ai.qwen_access') || hasPermission('ai.tax_access');
        if(!canAdv){
            goTo('pos');
        }
    }

    // Si el usuario estaba en el POS y su nuevo rol no tiene acceso, redirigir a Menú
    const posEl = document.getElementById('view-pos');
    if(posEl && !posEl.classList.contains('hidden')){
        const canPos = hasPermission('pos.sell') || hasPermission('catalog.view') || hasPermission('pos.stats_view') || hasPermission('pos.almacen_view') || hasPermission('inventory.view');
        if(!canPos){
            goTo('menu');
        }
    }

    closeRoleSwitchModal();
    const roleLabels = { admin: 'Administrador', supervisor: 'Supervisor', cajero: 'Cajero', analista: 'Analista', almacen: 'Almacén' };
    showGlobalToast(`✓ Perfil activo: ${user.name} (${roleLabels[user.role] || user.role})`, 'success');
    if(window.lucide && typeof lucide.createIcons === 'function') lucide.createIcons();
}

// --- 4. APLICACIÓN DE REGLAS DE ACCESO EN LA INTERFAZ (UI) ---
function applyRoleUI(){
    const bar = document.getElementById('global-session-bar');
    const loginModal = document.getElementById('login-modal');
    const uName = document.getElementById('session-user-name');
    const rPill = document.getElementById('session-role-pill');
    const demoSelect = document.getElementById('demo-role-select');

    if(!currentUser){
        if(loginModal) loginModal.classList.remove('hidden');
        if(uName) uName.textContent = 'Sin Sesión';
        if(rPill){
            rPill.textContent = 'NO AUTENTICADO';
            rPill.className = 'pill bg-slate-800 text-slate-500 border border-slate-700';
        }
        return;
    }

    if(loginModal) loginModal.classList.add('hidden');
    if(uName) uName.textContent = currentUser.name;
    
    if(rPill){
        const roleLabels = { admin: 'Administrador', supervisor: 'Supervisor', cajero: 'Cajero', analista: 'Analista', almacen: 'Almacén' };
        rPill.textContent = roleLabels[currentUser.role] || currentUser.role.toUpperCase();
        rPill.className = `pill badge-role-${currentUser.role} font-bold text-[9px] uppercase`;
    }

    if(demoSelect) demoSelect.value = currentUser.username;

    const role = currentUser.role;

    // 1. SEGMENTACIÓN ESTRICTA DE PESTAÑAS IZQUIERDAS (POS TABS)
    const ptCatalog = document.getElementById('pt-catalog');
    const ptSell = document.getElementById('pt-sell');
    const ptExpense = document.getElementById('pt-expense');
    const ptUsers = document.getElementById('pt-users');
    const pvAnalistaInfo = document.getElementById('pv-analista-info');

    if(role === 'cajero'){
        // Cajero: SOLO registrar ventas y ya (sin catálogo, sin gastos, sin auditoría)
        if(ptCatalog) ptCatalog.classList.add('hidden');
        if(ptSell) ptSell.classList.remove('hidden');
        if(ptExpense) ptExpense.classList.add('hidden');
        if(ptUsers) ptUsers.classList.add('hidden');
        if(pvAnalistaInfo) pvAnalistaInfo.classList.add('hidden');
        showPosTab('sell');
    } else if(role === 'analista'){
        // Analista: NO ventas, NO inventario, NO gastos, NO usuarios
        if(ptCatalog) ptCatalog.classList.add('hidden');
        if(ptSell) ptSell.classList.add('hidden');
        if(ptExpense) ptExpense.classList.add('hidden');
        if(ptUsers) ptUsers.classList.add('hidden');
        ['catalog','sell','expense','users'].forEach(n => {
            const el = document.getElementById('pv-' + n);
            if(el) el.classList.add('hidden');
        });
        if(pvAnalistaInfo) pvAnalistaInfo.classList.remove('hidden');
    } else if(role === 'almacen'){
        // Almacén: SOLO catálogo e inventario (sin vender, sin gastos, sin auditoría)
        if(ptCatalog) ptCatalog.classList.remove('hidden');
        if(ptSell) ptSell.classList.add('hidden');
        if(ptExpense) ptExpense.classList.add('hidden');
        if(ptUsers) ptUsers.classList.add('hidden');
        if(pvAnalistaInfo) pvAnalistaInfo.classList.add('hidden');
        showPosTab('catalog');
    } else if(role === 'supervisor'){
        if(ptCatalog) ptCatalog.classList.remove('hidden');
        if(ptSell) ptSell.classList.remove('hidden');
        if(ptExpense) ptExpense.classList.remove('hidden');
        if(ptUsers) ptUsers.classList.remove('hidden');
        if(pvAnalistaInfo) pvAnalistaInfo.classList.add('hidden');
        showPosTab('catalog');
    } else { // admin
        if(ptCatalog) ptCatalog.classList.remove('hidden');
        if(ptSell) ptSell.classList.remove('hidden');
        if(ptExpense) ptExpense.classList.remove('hidden');
        if(ptUsers) ptUsers.classList.remove('hidden');
        if(pvAnalistaInfo) pvAnalistaInfo.classList.add('hidden');
        showPosTab('catalog');
    }

    // Formularios específicos dentro del catálogo
    const secAdd = document.getElementById('sec-add-product');
    if(secAdd) secAdd.classList.toggle('hidden', !hasPermission('catalog.edit'));

    const secRestock = document.getElementById('sec-restock-product');
    if(secRestock) secRestock.classList.toggle('hidden', !hasPermission('inventory.adjust'));

    const cardCreateUser = document.getElementById('card-create-user');
    if(cardCreateUser) cardCreateUser.classList.toggle('hidden', !hasPermission('users.manage'));

    // 2. SEGMENTACIÓN ESTRICTA DEL PANEL DERECHO (SUBTABS & VISTAS)
    const btnPosToday = document.getElementById('btn-pos-today');
    const btnPosStats = document.getElementById('btn-pos-stats');
    const btnPosAlmacen = document.getElementById('btn-pos-almacen');
    const syncWrap = document.getElementById('pos-sync-wrap');

    const canViewStats = hasPermission('pos.stats_view');
    const canViewToday = hasPermission('pos.today_view');
    const canViewAlmacen = hasPermission('pos.almacen_view');
    // Control de botón Asesor Financiero en POS
    const btnGotoAdv = document.getElementById('btn-pos-goto-advisor');
    const canAccessAdv = hasPermission('finance.view_analysis') || hasPermission('ai.qwen_access') || hasPermission('ai.tax_access');
    if(btnGotoAdv) btnGotoAdv.classList.toggle('hidden', !canAccessAdv);

    // Cajero no debe tener acceso a estadísticas
    if(btnPosStats) btnPosStats.classList.toggle('hidden', !canViewStats);
    // Analista no debe poder ver ventas individuales ni corte de caja
    if(btnPosToday) btnPosToday.classList.toggle('hidden', !canViewToday);
    // Almacén ve su panel de inventario
    if(btnPosAlmacen) btnPosAlmacen.classList.toggle('hidden', !canViewAlmacen);

    if(syncWrap) syncWrap.classList.toggle('hidden', role === 'cajero' || role === 'almacen');

    // Selección de vista por defecto según rol
    if(role === 'analista'){
        showPosViewMode('stats');
    } else if(role === 'almacen'){
        showPosViewMode('almacen');
    } else if(role === 'cajero'){
        showPosViewMode('today');
    } else {
        if(posViewMode === 'almacen' && !canViewAlmacen) showPosViewMode('today');
        else if(posViewMode === 'stats' && !canViewStats) showPosViewMode('today');
        else showPosViewMode(posViewMode || 'today');
    }

    updatePendingBadge();
    if(role !== 'analista') renderCatalog();
    if(canViewToday) upPosSummary();
    if(canViewStats) upPosStats();
    if(canViewAlmacen) renderAlmacenDashboard();
    if(hasPermission('users.manage')) renderUsersList();
    if(hasPermission('sales.approve_cancel')) renderCancelRequests();
    renderAuditLog();
    lucide.createIcons();
}

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

// --- 5. MODAL DE ACCESO DENEGADO / PERMISOS INSUFICIENTES ---
function showAccessDeniedModal(customText){
    const modal = document.getElementById('access-denied-modal');
    const txt = document.getElementById('access-denied-text');
    if(txt && customText) txt.textContent = customText;
    if(modal) modal.classList.remove('hidden');
    lucide.createIcons();
}

function closeAccessDeniedModal(){
    const modal = document.getElementById('access-denied-modal');
    if(modal) modal.classList.add('hidden');
}

// --- 6. BITÁCORA DE AUDITORÍA Y TRAZABILIDAD ---
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
    localStorage.setItem('cfo_activity_log', JSON.stringify(activityLog));
    renderAuditLog();
}

function clearAuditLog(){
    if(!hasPermission('audit.view_all')){
        showAccessDeniedModal('Solo el Administrador puede vaciar la bitácora de auditoría.');
        return;
    }
    if(confirm('¿Deseas vaciar la bitácora de auditoría?')){
        activityLog = [];
        localStorage.setItem('cfo_activity_log', JSON.stringify(activityLog));
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

// --- 7. GESTIÓN DE USUARIOS (CRUD ADMINISTRATIVO) ---
function showUsersSubSection(subSec){
    currentUsersSubSection = subSec;
    ['users', 'requests', 'audit'].forEach(s => {
        const el = document.getElementById('sec-' + (s === 'requests' ? 'requests-mgmt' : s === 'users' ? 'users-mgmt' : 'audit-mgmt'));
        const btn = document.getElementById('btn-sub-' + s);
        const isActive = s === subSec;
        if(el) el.classList.toggle('hidden', !isActive);
        if(btn){
            if(isActive){
                btn.className = `px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10.5px] font-bold transition flex items-center gap-1.5`;
            } else {
                btn.className = `px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 border border-slate-700/50 text-[10.5px] font-bold hover:text-white transition flex items-center gap-1.5`;
            }
        }
    });
    if(subSec === 'users') renderUsersList();
    if(subSec === 'requests') renderCancelRequests();
    if(subSec === 'audit') renderAuditLog();
    lucide.createIcons();
}

function handleCreateUserForm(event){
    event.preventDefault();
    if(!hasPermission('users.manage')){
        showAccessDeniedModal('Solo el Administrador puede registrar nuevas cuentas de usuario.');
        return;
    }
    const name = document.getElementById('new-user-name').value.trim();
    const username = document.getElementById('new-user-username').value.trim().toLowerCase();
    const password = document.getElementById('new-user-password').value;
    const role = document.getElementById('new-user-role').value;

    if(!name || !username || !password){
        alert('Por favor completa todos los campos del nuevo usuario.');
        return;
    }

    if(systemUsers.some(u => u.username.toLowerCase() === username)){
        alert(`El nombre de usuario "${username}" ya está registrado en el sistema.`);
        return;
    }

    const newUser = {
        id: 'usr_' + Date.now(),
        username,
        password,
        name,
        role,
        active: true,
        created: new Date().toISOString()
    };

    systemUsers.push(newUser);
    localStorage.setItem('cfo_users', JSON.stringify(systemUsers));

    document.getElementById('new-user-name').value = '';
    document.getElementById('new-user-username').value = '';
    document.getElementById('new-user-password').value = '';

    logActivity('Usuario Creado', `Nueva cuenta registrada: ${username} con rol ${role}`, 'success');
    renderUsersList();
    alert(`✓ Usuario "${name}" (@${username}) registrado exitosamente.`);
}

function updateUserRole(userId, newRole){
    if(!hasPermission('users.manage')){
        showAccessDeniedModal('Solo el Administrador puede modificar roles de usuario.');
        renderUsersList();
        return;
    }
    const user = systemUsers.find(u => u.id === userId);
    if(!user) return;

    // Regla de seguridad: no dejar al sistema sin al menos 1 administrador activo
    if(user.role === 'admin' && newRole !== 'admin'){
        const activeAdmins = systemUsers.filter(u => u.role === 'admin' && u.active);
        if(activeAdmins.length <= 1){
            alert('⛔ Operación bloqueada: No puedes cambiar el rol del único Administrador activo del sistema.');
            renderUsersList();
            return;
        }
    }

    const prevRole = user.role;
    user.role = newRole;
    localStorage.setItem('cfo_users', JSON.stringify(systemUsers));

    logActivity('Rol Actualizado', `El rol de @${user.username} cambió de ${prevRole} a ${newRole}`, 'warn');

    if(currentUser && currentUser.id === userId){
        currentUser.role = newRole;
        sessionStorage.setItem('cfo_current_user', JSON.stringify(currentUser));
        applyRoleUI();
    } else {
        renderUsersList();
    }
}

function toggleUserActive(userId){
    if(!hasPermission('users.manage')){
        showAccessDeniedModal('Solo el Administrador puede activar o desactivar usuarios.');
        renderUsersList();
        return;
    }
    const user = systemUsers.find(u => u.id === userId);
    if(!user) return;

    // Regla de seguridad: no desactivar al último admin activo
    if(user.role === 'admin' && user.active){
        const activeAdmins = systemUsers.filter(u => u.role === 'admin' && u.active);
        if(activeAdmins.length <= 1){
            alert('⛔ Operación bloqueada: No puedes desactivar al único Administrador activo del sistema.');
            renderUsersList();
            return;
        }
    }

    user.active = !user.active;
    localStorage.setItem('cfo_users', JSON.stringify(systemUsers));

    logActivity(user.active ? 'Usuario Activado' : 'Usuario Desactivado', `Cuenta de @${user.username} marcada como ${user.active ? 'ACTIVA' : 'INACTIVA'}`, user.active ? 'success' : 'danger');

    // Si el usuario desactivado es el que tiene la sesión activa, cerrar sesión de inmediato
    if(currentUser && currentUser.id === userId && !user.active){
        alert('Tu cuenta ha sido desactivada. La sesión se cerrará.');
        logout();
        return;
    }

    renderUsersList();
}

function resetUserPassword(userId){
    if(!hasPermission('users.manage')){
        showAccessDeniedModal('Solo el Administrador puede reestablecer contraseñas.');
        return;
    }
    const user = systemUsers.find(u => u.id === userId);
    if(!user) return;

    const newPass = prompt(`Reestablecer contraseña para "${user.name}" (@${user.username}):`, "1234");
    if(newPass === null) return;
    if(!newPass.trim()){
        alert('La contraseña no puede estar vacía.');
        return;
    }

    user.password = newPass.trim();
    localStorage.setItem('cfo_users', JSON.stringify(systemUsers));
    logActivity('Clave Reestablecida', `Contraseña actualizada para @${user.username}`, 'warn');
    alert(`✓ Contraseña actualizada correctamente para @${user.username}.`);
}

function renderUsersList(){
    const container = document.getElementById('users-table-list');
    const badge = document.getElementById('users-count-badge');
    if(!container) return;

    if(badge) badge.textContent = `${systemUsers.length} usuario(s)`;

    const canManage = hasPermission('users.manage');

    container.innerHTML = systemUsers.map(u => {
        const isSelf = currentUser && currentUser.id === u.id;
        const disabledAttr = canManage ? '' : 'disabled';
        return `
        <div class="pos-row flex items-center justify-between gap-3 p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-0.5">
                    <span class="text-sm font-semibold text-white truncate">${u.name}</span>
                    ${isSelf ? '<span class="pill bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[9px]">Tú</span>' : ''}
                    <span class="pill badge-role-${u.role} text-[9px] uppercase font-bold">${u.role}</span>
                </div>
                <div class="text-[11px] text-slate-400 mono">
                    @${u.username} · Creado: ${new Date(u.created).toLocaleDateString('es-MX')}
                </div>
            </div>

            <div class="flex items-center gap-2 shrink-0">
                <!-- Selector de Rol -->
                <select onchange="updateUserRole('${u.id}', this.value)" ${disabledAttr} class="bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-slate-200 px-2 py-1 outline-none focus:border-purple-400 transition cursor-pointer ${!canManage ? 'opacity-50 cursor-not-allowed' : ''}">
                    <option value="cajero" ${u.role === 'cajero' ? 'selected' : ''}>Cajero</option>
                    <option value="supervisor" ${u.role === 'supervisor' ? 'selected' : ''}>Supervisor</option>
                    <option value="analista" ${u.role === 'analista' ? 'selected' : ''}>Analista</option>
                    <option value="almacen" ${u.role === 'almacen' ? 'selected' : ''}>Almacén</option>
                    <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
                </select>

                <!-- Switch Activo / Inactivo -->
                <label class="switch" title="${u.active ? 'Usuario Activo (Clic para desactivar)' : 'Usuario Inactivo (Clic para activar)'}">
                    <input type="checkbox" ${u.active ? 'checked' : ''} ${disabledAttr} onchange="toggleUserActive('${u.id}')">
                    <span class="slider"></span>
                </label>

                <!-- Reset Password -->
                <button onclick="resetUserPassword('${u.id}')" ${disabledAttr} class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition border border-slate-700/60 ${!canManage ? 'opacity-50 cursor-not-allowed' : ''}" title="Reestablecer contraseña">
                    <i data-lucide="key" class="w-3.5 h-3.5"></i>
                </button>
            </div>
        </div>`;
    }).join('');
    lucide.createIcons();
}

// --- 8. SISTEMA DE CANCELACIONES Y SOLICITUDES CON AUTORIZACIÓN ---
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
        localStorage.setItem('cfo_cancel_reqs', JSON.stringify(cancelRequests));

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
        localStorage.setItem('pos_catalog', JSON.stringify(catalog));
    }

    // 2. Marcar venta como 'cancelled' (NUNCA BORRAR DEL ARRAY)
    sale.status = 'cancelled';
    sale.cancelReason = reason || 'Cancelación directa por supervisor/admin';
    sale.cancelledBy = `${currentUser.name} (@${currentUser.username} - ${currentUser.role})`;
    sale.cancelledAt = new Date().toISOString();
    localStorage.setItem('pos_sales', JSON.stringify(salesLog));

    // 3. Si había solicitud pendiente para esta venta, resolverla
    const pendingReq = cancelRequests.find(r => r.saleId === saleId && r.status === 'pending');
    if(pendingReq){
        pendingReq.status = 'approved';
        pendingReq.resolvedBy = `${currentUser.name} (@${currentUser.username})`;
        pendingReq.resolvedAt = new Date().toISOString();
        pendingReq.notes = 'Aprobada vía anulación directa';
        localStorage.setItem('cfo_cancel_reqs', JSON.stringify(cancelRequests));
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
        localStorage.setItem('cfo_cancel_reqs', JSON.stringify(cancelRequests));
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
            localStorage.setItem('pos_catalog', JSON.stringify(catalog));
        }

        sale.status = 'cancelled';
        sale.cancelReason = req.reason;
        sale.cancelledBy = `${currentUser.name} (@${currentUser.username} - ${currentUser.role})`;
        sale.cancelledAt = new Date().toISOString();
        localStorage.setItem('pos_sales', JSON.stringify(salesLog));
    }

    req.status = 'approved';
    req.resolvedBy = `${currentUser.name} (@${currentUser.username})`;
    req.resolvedAt = new Date().toISOString();
    req.notes = 'Aprobada en panel de control';
    localStorage.setItem('cfo_cancel_reqs', JSON.stringify(cancelRequests));

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
    localStorage.setItem('cfo_cancel_reqs', JSON.stringify(cancelRequests));

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

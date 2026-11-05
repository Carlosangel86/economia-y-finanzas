// ===== CONTROL DE ACCESO BASADO EN ROLES (RBAC) & GESTIÓN DE USUARIOS =====

// ===== CONTROL DE ACCESO BASADO EN ROLES (RBAC) =====
const DEMO_MODE = true;

const ROLE_MATRIX = {
    admin: [
        'pos.sell', 'sales.view_own', 'sales.view_all', 'sales.request_cancel',
        'sales.approve_cancel', 'sales.cancel_direct', 'pos.today_view', 'pos.stats_view',
        'pos.almacen_view', 'catalog.view', 'catalog.edit', 'catalog.delete', 'inventory.view',
        'inventory.adjust', 'cash.view', 'finance.view_analysis', 'ai.qwen_access',
        'ai.tax_access', 'users.manage', 'audit.view_all', 'audit.view_limited'
    ],
    supervisor: [
        'pos.sell', 'sales.view_own', 'sales.view_all', 'sales.request_cancel',
        'sales.approve_cancel', 'sales.cancel_direct', 'pos.today_view',
        'pos.almacen_view', 'catalog.view', 'inventory.view',
        'inventory.adjust', 'cash.view', 'ai.qwen_access', 'audit.view_limited'
    ],
    cajero: [
        'pos.sell', 'sales.view_own', 'sales.request_cancel', 'pos.today_view',
        'cash.view'
    ],
    analista: [
        'pos.stats_view', 'ai.qwen_access', 'ai.tax_access'
    ],
    almacen: [
        'catalog.view', 'catalog.edit', 'inventory.view', 'inventory.adjust', 'pos.almacen_view'
    ]
};

const DEFAULT_SYSTEM_USERS = [
    { id: 'usr_admin', username: 'admin_demo', password: '1234', name: 'Administrador General', role: 'admin', active: true, created: '2026-10-01T00:00:00.000Z' },
    { id: 'usr_super', username: 'supervisor_demo', password: '1234', name: 'Supervisor de Turno', role: 'supervisor', active: true, created: '2026-10-01T00:00:00.000Z' },
    { id: 'usr_caja', username: 'caja_demo', password: '1234', name: 'Cajero Punto de Venta', role: 'cajero', active: true, created: '2026-10-01T00:00:00.000Z' },
    { id: 'usr_fin', username: 'finanzas_demo', password: '1234', name: 'Analista Financiero', role: 'analista', active: true, created: '2026-10-01T00:00:00.000Z' },
    { id: 'usr_almacen', username: 'almacen_demo', password: '1234', name: 'Encargado de Almacén', role: 'almacen', active: true, created: '2026-10-01T00:00:00.000Z' }
];



let currentUser = null;
let systemUsers = [];
let currentUsersSubSection = 'users';


function hasPermission(permission){
    if(!currentUser || !currentUser.active) return false;
    const perms = ROLE_MATRIX[currentUser.role];
    return perms ? perms.includes(permission) : false;
}

async function initAuthAndUsers(){
    // Esperar sincronización del servicio modular de Firebase si está inicializando
    if (!window.FirebaseService) {
        await new Promise(resolve => {
            window.addEventListener('firebase-initialized', resolve, { once: true });
            setTimeout(resolve, 1500);
        });
    }

    // 1. Cargar o sembrar usuarios en Firestore colección 'users'
    try {
        if (window.FirebaseService && window.FirebaseService.users) {
            await window.FirebaseService.users.seedIfEmpty(DEFAULT_SYSTEM_USERS);
            const cloudUsers = await window.FirebaseService.users.getAll();
            if (cloudUsers && cloudUsers.length > 0) {
                systemUsers = cloudUsers;
            } else {
                systemUsers = JSON.parse(JSON.stringify(DEFAULT_SYSTEM_USERS));
            }
        } else {
            systemUsers = JSON.parse(JSON.stringify(DEFAULT_SYSTEM_USERS));
        }
    } catch(e) {
        console.warn('[Firestore Users Fallback]', e);
        systemUsers = JSON.parse(JSON.stringify(DEFAULT_SYSTEM_USERS));
    }

    // 2. Cargar solicitudes de cancelación desde Firestore colección 'stats'
    try {
        if (window.FirebaseService && window.FirebaseService.stats) {
            cancelRequests = await window.FirebaseService.stats.getCancelRequests();
        }
    } catch(e) {
        cancelRequests = [];
    }

    // 3. Cargar bitácora de actividad desde Firestore colección 'stats'
    try {
        if (window.FirebaseService && window.FirebaseService.stats) {
            activityLog = await window.FirebaseService.stats.getActivityLog();
        }
    } catch(e) {
        activityLog = [];
    }

    // 4. Suscribir listener de sesión a Firebase Auth
    if (window.FirebaseService && window.FirebaseService.authModule) {
        window.FirebaseService.authModule.onAuthStateChanged(async (firebaseUser) => {
            if (firebaseUser) {
                const email = (firebaseUser.email || '').toLowerCase();
                let found = systemUsers.find(u => (u.email && u.email.toLowerCase() === email) || u.uid === firebaseUser.uid || u.id === firebaseUser.uid);
                if (!found && email) {
                    const demoUsername = Object.keys(DEMO_USER_EMAILS || {}).find(k => DEMO_USER_EMAILS[k].toLowerCase() === email);
                    if (demoUsername) {
                        found = systemUsers.find(u => u.username === demoUsername);
                    }
                }
                if (!found) {
                    found = {
                        id: firebaseUser.uid,
                        uid: firebaseUser.uid,
                        username: email.split('@')[0],
                        name: firebaseUser.displayName || email,
                        email: email,
                        role: 'cajero',
                        active: true,
                        created: new Date().toISOString()
                    };
                    systemUsers.push(found);
                    if (window.FirebaseService.users) await window.FirebaseService.users.saveUser(found);
                }
                currentUser = (found && found.active) ? found : null;
            } else {
                currentUser = null;
                if (DEMO_MODE) {
                    currentUser = systemUsers.find(u => u.username === 'admin_demo') || systemUsers[0];
                }
            }
            applyRoleUI();
            updateMenuIndicators();
        });
    } else {
        if (!currentUser && DEMO_MODE) {
            currentUser = systemUsers.find(u => u.username === 'admin_demo') || systemUsers[0];
        }
    }

    applyRoleUI();
    logActivity('Inicio de Sistema', `Sesión iniciada en Firebase con perfil: ${currentUser ? currentUser.username : 'Ninguno'}`, 'info');
}



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

async function login(username, password){
    const errBox = document.getElementById('login-error');
    const errMsg = document.getElementById('login-error-msg');
    if(errBox) errBox.classList.add('hidden');

    try {
        if (window.FirebaseService && window.FirebaseService.authModule) {
            const authUser = await window.FirebaseService.authModule.login(username, password);
            const email = (authUser.email || '').toLowerCase();
            let user = systemUsers.find(u => (u.email && u.email.toLowerCase() === email) || u.username.toLowerCase() === username.trim().toLowerCase());
            if (!user) {
                user = {
                    id: authUser.uid,
                    uid: authUser.uid,
                    username: username.trim(),
                    name: authUser.displayName || username,
                    email: authUser.email,
                    role: 'cajero',
                    active: true
                };
                systemUsers.push(user);
                if (window.FirebaseService.users) await window.FirebaseService.users.saveUser(user);
            }
            currentUser = user;
        } else {
            let user = (systemUsers || []).find(u => u.username.toLowerCase() === username.trim().toLowerCase());
            if(!user || user.password !== password){
                if(errBox){ errBox.classList.remove('hidden'); errMsg.textContent = 'Usuario o contraseña incorrectos.'; }
                return false;
            }
            currentUser = user;
        }

        const modal = document.getElementById('login-modal');
        if(modal) modal.classList.add('hidden');

        logActivity('Inicio de Sesión', `Usuario "${currentUser.username}" (${currentUser.role}) autenticado con Firebase Auth.`, 'success');
        applyRoleUI();
        updateMenuIndicators();

        const roleLabels = { admin: 'Administrador', supervisor: 'Supervisor', cajero: 'Cajero', analista: 'Analista', almacen: 'Almacén' };
        showGlobalToast(`✓ Bienvenido, ${currentUser.name} (${roleLabels[currentUser.role] || currentUser.role})`, 'success');
        if(window.lucide && typeof lucide.createIcons === 'function') lucide.createIcons();
        return true;
    } catch(error) {
        console.error('[Firebase Login Error]', error);
        if (errBox) {
            errBox.classList.remove('hidden');
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
                errMsg.textContent = 'Credenciales no válidas en Firebase Auth.';
            } else if (error.code === 'auth/user-not-found') {
                errMsg.textContent = 'Usuario no registrado en Firebase Auth.';
            } else {
                errMsg.textContent = 'Error de autenticación: ' + (error.message || error.code);
            }
        }
        return false;
    }
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

async function logout(){
    if(currentUser){
        logActivity('Cierre de Sesión', `El usuario "${currentUser.username}" cerró sesión en Firebase Auth.`, 'info');
    }
    try {
        if (window.FirebaseService && window.FirebaseService.authModule) {
            await window.FirebaseService.authModule.logout();
        }
    } catch(e) {
        console.warn('[Firebase SignOut]', e);
    }
    currentUser = null;
    sessionStorage.removeItem('cfo_current_user');
    
    goTo('menu');
    applyRoleUI();
    updateMenuIndicators();
    
    const modal = document.getElementById('login-modal');
    if(modal) modal.classList.remove('hidden');
    
    showGlobalToast('Sesión finalizada. Selecciona un usuario para ingresar.', 'info');
    if(window.lucide && typeof lucide.createIcons === 'function') lucide.createIcons();
}

async function switchDemoUser(demoUsername){
    if(!demoUsername) return;
    try {
        if (window.FirebaseService && window.FirebaseService.authModule) {
            await window.FirebaseService.authModule.login(demoUsername, '123456');
        }
    } catch(e) {
        console.warn('[Demo Switch Error, using local demo profile]', e);
    }

    let user = (systemUsers || []).find(u => u.username === demoUsername);
    if(!user){
        user = DEFAULT_SYSTEM_USERS.find(u => u.username === demoUsername);
        if(user){
            systemUsers.push(JSON.parse(JSON.stringify(user)));
            if (window.FirebaseService && window.FirebaseService.users) {
                window.FirebaseService.users.saveUser(user).catch(console.warn);
            }
        }
    }
    if(!user) return;

    currentUser = user;
    sessionStorage.setItem('cfo_current_user', JSON.stringify(currentUser));
    logActivity('Cambio Rápido Demo', `Perfil alternado a: ${user.username} (${user.role})`, 'info');

    const demoSelect = document.getElementById('demo-role-select');
    if(demoSelect) demoSelect.value = demoUsername;

    applyRoleUI();
    updateMenuIndicators();

    closeRoleSwitchModal();
    const roleLabels = { admin: 'Administrador', supervisor: 'Supervisor', cajero: 'Cajero', analista: 'Analista', almacen: 'Almacén' };
    showGlobalToast(`✓ Perfil activo: ${user.name} (${roleLabels[user.role] || user.role})`, 'success');
    if(window.lucide && typeof lucide.createIcons === 'function') lucide.createIcons();
}

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



// ===== GESTIÓN DE USUARIOS (CRUD) =====
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

async function handleCreateUserForm(event){
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
        email: username.includes('@') ? username : `${username}@cfocopilot.com`,
        password,
        name,
        role,
        active: true,
        created: new Date().toISOString()
    };

    systemUsers.push(newUser);
    if (window.FirebaseService && window.FirebaseService.users) {
        await window.FirebaseService.users.saveUser(newUser);
    }

    document.getElementById('new-user-name').value = '';
    document.getElementById('new-user-username').value = '';
    document.getElementById('new-user-password').value = '';

    logActivity('Usuario Creado', `Nueva cuenta registrada: ${username} con rol ${role} en Firestore.`, 'success');
    renderUsersList();
    showGlobalToast(`✓ Usuario "${name}" guardado en Cloud Firestore`, 'success');
}

async function updateUserRole(userId, newRole){
    if(!hasPermission('users.manage')){
        showAccessDeniedModal('Solo el Administrador puede modificar roles de usuario.');
        renderUsersList();
        return;
    }
    const user = systemUsers.find(u => u.id === userId);
    if(!user) return;

    if(user.username === 'admin_demo' && newRole !== 'admin'){
        const activeAdmins = systemUsers.filter(u => u.role === 'admin' && u.active);
        if(activeAdmins.length <= 1){
            alert('⛔ Operación bloqueada: No puedes cambiar el rol del único Administrador activo del sistema.');
            renderUsersList();
            return;
        }
    }

    const prevRole = user.role;
    user.role = newRole;
    if (window.FirebaseService && window.FirebaseService.users) {
        await window.FirebaseService.users.updateRole(userId, newRole);
    }

    logActivity('Rol Actualizado', `El rol de @${user.username} cambió de ${prevRole} a ${newRole} en Firestore.`, 'warn');

    if(currentUser && currentUser.id === userId){
        currentUser.role = newRole;
        applyRoleUI();
    } else {
        renderUsersList();
    }
}

async function toggleUserActive(userId){
    if(!hasPermission('users.manage')){
        showAccessDeniedModal('Solo el Administrador puede activar o desactivar usuarios.');
        renderUsersList();
        return;
    }
    const user = systemUsers.find(u => u.id === userId);
    if(!user) return;

    if(user.role === 'admin' && user.active){
        const activeAdmins = systemUsers.filter(u => u.role === 'admin' && u.active);
        if(activeAdmins.length <= 1){
            alert('⛔ Operación bloqueada: No puedes desactivar al único Administrador activo del sistema.');
            renderUsersList();
            return;
        }
    }

    user.active = !user.active;
    if (window.FirebaseService && window.FirebaseService.users) {
        await window.FirebaseService.users.toggleActive(userId, user.active);
    }

    logActivity(user.active ? 'Usuario Activado' : 'Usuario Desactivado', `Cuenta de @${user.username} marcada como ${user.active ? 'ACTIVA' : 'INACTIVA'} en Firestore.`, user.active ? 'success' : 'danger');

    if(currentUser && currentUser.id === userId && !user.active){
        alert('Tu cuenta ha sido desactivada. La sesión se cerrará.');
        logout();
        return;
    }

    renderUsersList();
}

async function resetUserPassword(userId){
    if(!hasPermission('users.manage')){
        showAccessDeniedModal('Solo el Administrador puede reestablecer contraseñas.');
        return;
    }
    const user = systemUsers.find(u => u.id === userId);
    if(!user) return;

    const newPass = prompt(`Reestablecer contraseña para "${user.name}" (@${user.username}):`, "123456");
    if(newPass === null) return;
    if(!newPass.trim()){
        alert('La contraseña no puede estar vacía.');
        return;
    }

    user.password = newPass.trim();
    if (window.FirebaseService && window.FirebaseService.users) {
        await window.FirebaseService.users.resetPassword(userId, newPass.trim());
    }
    logActivity('Clave Reestablecida', `Contraseña actualizada para @${user.username} en Firestore.`, 'warn');
    alert(`✓ Contraseña actualizada correctamente en Cloud Firestore para @${user.username}.`);
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



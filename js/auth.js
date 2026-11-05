// ===== CONTROL DE ACCESO BASADO EN ROLES (RBAC) & GESTIÓN DE USUARIOS =====
// Sistema Empresarial Seguro con Firebase Authentication & Cloud Firestore

// DEMO_MODE desactivado permanentemente para exigir autenticación real
const DEMO_MODE = false;

// ===== MATRIZ DE PERMISOS RBAC =====
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

// ===== CÓDIGOS DE ACCESO CORPORATIVOS POR ÁREA / ROL =====
const ROLE_ACCESS_KEYS = {
    'ADMIN-8367': { role: 'admin', label: 'Administrador General', badge: 'badge-role-admin', desc: 'Control total de la plataforma, finanzas, catálogo y usuarios.' },
    'SUPER-5412': { role: 'supervisor', label: 'Supervisor Operativo', badge: 'badge-role-supervisor', desc: 'Supervisión de caja, arqueo Z y aprobación de cancelaciones.' },
    'CAJA-1098':  { role: 'cajero', label: 'Cajero Punto de Venta', badge: 'badge-role-cajero', desc: 'Terminal exclusiva de cobro POS, tickets y arqueo X.' },
    'ANAL-7734':  { role: 'analista', label: 'Analista Financiero', badge: 'badge-role-analista', desc: 'Estadísticas de ventas, proyecciones y Asesor IA.' },
    'ALMA-3341':  { role: 'almacen', label: 'Encargado de Almacén', badge: 'badge-role-almacen', desc: 'Control de inventario, existencias y catálogo de piezas.' }
};

function resolveAccessCode(inputCode) {
    if (!inputCode) return null;
    const clean = inputCode.trim().toUpperCase().replace(/[\s\-_]+/g, '');
    for (const [key, val] of Object.entries(ROLE_ACCESS_KEYS)) {
        const keyClean = key.replace(/[\s\-_]+/g, '');
        if (clean === keyClean) {
            return { code: key, ...val };
        }
    }
    return null;
}

const DEFAULT_SYSTEM_USERS = [
    { id: 'usr_admin', username: 'admin_demo', email: 'admin@cfocopilot.com', password: '1234', name: 'Administrador General', role: 'admin', active: true, created: '2026-10-01T00:00:00.000Z' },
    { id: 'usr_super', username: 'supervisor_demo', email: 'supervisor@cfocopilot.com', password: '1234', name: 'Supervisor de Turno', role: 'supervisor', active: true, created: '2026-10-01T00:00:00.000Z' },
    { id: 'usr_caja', username: 'caja_demo', email: 'cajero@cfocopilot.com', password: '1234', name: 'Cajero Punto de Venta', role: 'cajero', active: true, created: '2026-10-01T00:00:00.000Z' },
    { id: 'usr_fin', username: 'finanzas_demo', email: 'analista@cfocopilot.com', password: '1234', name: 'Analista Financiero', role: 'analista', active: true, created: '2026-10-01T00:00:00.000Z' },
    { id: 'usr_almacen', username: 'almacen_demo', email: 'almacen@cfocopilot.com', password: '1234', name: 'Encargado de Almacén', role: 'almacen', active: true, created: '2026-10-01T00:00:00.000Z' }
];

let currentUser = null;
let systemUsers = [];
let currentUsersSubSection = 'users';

function hasPermission(permission){
    if(!currentUser || !currentUser.active) return false;
    const perms = ROLE_MATRIX[currentUser.role];
    return perms ? perms.includes(permission) : false;
}

// ===== INICIALIZACIÓN DE AUTENTICACIÓN CON FIREBASE =====
async function initAuthAndUsers(){
    if (!window.FirebaseService) {
        await new Promise(resolve => {
            window.addEventListener('firebase-initialized', resolve, { once: true });
            setTimeout(resolve, 1500);
        });
    }

    // 1. Cargar usuarios desde Cloud Firestore 'users'
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

    // 2. Cargar solicitudes de cancelación desde 'stats'
    try {
        if (window.FirebaseService && window.FirebaseService.stats) {
            cancelRequests = await window.FirebaseService.stats.getCancelRequests();
        }
    } catch(e) {
        cancelRequests = [];
    }

    // 3. Cargar bitácora desde 'stats'
    try {
        if (window.FirebaseService && window.FirebaseService.stats) {
            activityLog = await window.FirebaseService.stats.getActivityLog();
        }
    } catch(e) {
        activityLog = [];
    }

    // 4. Suscribir listener de sesión permanente a Firebase Auth
    if (window.FirebaseService && window.FirebaseService.authModule) {
        window.FirebaseService.authModule.onAuthStateChanged(async (firebaseUser) => {
            if (firebaseUser) {
                const email = (firebaseUser.email || '').toLowerCase();
                let found = (systemUsers || []).find(u => 
                    (u.email && u.email.toLowerCase() === email) || 
                    u.uid === firebaseUser.uid || 
                    u.id === firebaseUser.uid
                );

                if (!found && window.FirebaseService.users) {
                    found = await window.FirebaseService.users.getById(firebaseUser.uid);
                    if (found) systemUsers.push(found);
                }

                if (found && found.active === false) {
                    await window.FirebaseService.authModule.logout();
                    currentUser = null;
                    showAuthError('Esta cuenta ha sido desactivada por el Administrador.');
                    applyRoleUI();
                    return;
                }

                if (!found) {
                    found = {
                        id: firebaseUser.uid,
                        uid: firebaseUser.uid,
                        username: email.split('@')[0],
                        name: firebaseUser.displayName || email.split('@')[0],
                        email: email,
                        role: 'cajero',
                        roleLabel: 'Cajero Punto de Venta',
                        active: true,
                        created: new Date().toISOString()
                    };
                    systemUsers.push(found);
                    if (window.FirebaseService.users) await window.FirebaseService.users.saveUser(found);
                }

                currentUser = found;
                hideAuthModal();
                goTo('menu');
            } else {
                currentUser = null;
                showAuthModal('login');
            }
            applyRoleUI();
            updateMenuIndicators();
        });
    } else {
        currentUser = null;
        showAuthModal('login');
        applyRoleUI();
    }

    applyRoleUI();
}

// ===== MANEJO DE MODALES DE AUTENTICACIÓN =====
function showAuthModal(initialTab = 'login'){
    const modal = document.getElementById('login-modal');
    if(modal){
        modal.classList.remove('hidden');
        switchAuthTab(initialTab);
        if(window.lucide && typeof lucide.createIcons === 'function') lucide.createIcons();
    }
}

function hideAuthModal(){
    const modal = document.getElementById('login-modal');
    if(modal) modal.classList.add('hidden');
}

// Prevenir cierre del modal sin sesión activa (Gatekeeper)
function closeLoginModal(){
    if(!currentUser){
        showGlobalToast('Acceso restringido: debes iniciar sesión o registrarte con un código válido para acceder.', 'warn');
        return;
    }
    hideAuthModal();
}

function switchAuthTab(tab){
    const tabLogin = document.getElementById('tab-btn-login');
    const tabRegister = document.getElementById('tab-btn-register');
    const formLogin = document.getElementById('auth-form-login');
    const formRegister = document.getElementById('auth-form-register');
    const errBox = document.getElementById('login-error');
    if (errBox) errBox.classList.add('hidden');

    if (tab === 'register') {
        if (tabLogin) tabLogin.className = 'flex-1 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg transition flex items-center justify-center gap-1.5';
        if (tabRegister) tabRegister.className = 'flex-1 py-2 text-xs font-bold text-white bg-sky-600 rounded-lg shadow-md shadow-sky-600/30 transition flex items-center justify-center gap-1.5';
        if (formLogin) formLogin.classList.add('hidden');
        if (formRegister) formRegister.classList.remove('hidden');
    } else {
        if (tabLogin) tabLogin.className = 'flex-1 py-2 text-xs font-bold text-white bg-sky-600 rounded-lg shadow-md shadow-sky-600/30 transition flex items-center justify-center gap-1.5';
        if (tabRegister) tabRegister.className = 'flex-1 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg transition flex items-center justify-center gap-1.5';
        if (formLogin) formLogin.classList.remove('hidden');
        if (formRegister) formRegister.classList.add('hidden');
    }
    if (window.lucide && typeof lucide.createIcons === 'function') lucide.createIcons();
}

function onAccessCodeInput(){
    const input = document.getElementById('reg-access-code');
    const preview = document.getElementById('reg-role-preview');
    if (!input || !preview) return;

    const val = input.value;
    const resolved = resolveAccessCode(val);

    if (resolved) {
        preview.classList.remove('hidden');
        preview.className = 'mt-2 p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center justify-between';
        preview.innerHTML = `
            <div class="flex items-center gap-1.5">
                <i data-lucide="shield-check" class="w-4 h-4 text-emerald-400 shrink-0"></i>
                <span>Código válido: <b>${resolved.label}</b></span>
            </div>
            <span class="pill badge-role-${resolved.role} text-[9px] uppercase font-bold">${resolved.role}</span>
        `;
    } else if (val.trim().length >= 4) {
        preview.classList.remove('hidden');
        preview.className = 'mt-2 p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] flex items-center gap-1.5';
        preview.innerHTML = `
            <i data-lucide="shield-alert" class="w-4 h-4 text-rose-400 shrink-0"></i>
            <span>Código no reconocido. Consulta con administración.</span>
        `;
    } else {
        preview.classList.add('hidden');
    }
    if (window.lucide && typeof lucide.createIcons === 'function') lucide.createIcons();
}

function showAuthError(msg){
    const errBox = document.getElementById('login-error');
    const errMsg = document.getElementById('login-error-msg');
    if (errBox && errMsg) {
        errMsg.textContent = msg;
        errBox.classList.remove('hidden');
    } else {
        alert(msg);
    }
    if (window.lucide && typeof lucide.createIcons === 'function') lucide.createIcons();
}

// ===== REGISTRO DE NUEVO USUARIO CON CÓDIGO DE ACCESO =====
async function handleRegisterForm(event){
    event.preventDefault();
    const errBox = document.getElementById('login-error');
    if (errBox) errBox.classList.add('hidden');

    const name = (document.getElementById('reg-name')?.value || '').trim();
    const email = (document.getElementById('reg-email')?.value || '').trim().toLowerCase();
    const pass = document.getElementById('reg-password')?.value || '';
    const passConfirm = document.getElementById('reg-password-confirm')?.value || '';
    const code = (document.getElementById('reg-access-code')?.value || '').trim();
    const btnSubmit = document.getElementById('btn-submit-register');

    if (!name || !email || !pass || !code) {
        showAuthError('Por favor completa todos los campos del formulario.');
        return;
    }

    if (!email.includes('@') || !email.includes('.')) {
        showAuthError('Ingresa un correo electrónico válido (ej: usuario@empresa.com).');
        return;
    }

    if (pass.length < 6) {
        showAuthError('La contraseña debe tener mínimo 6 caracteres (política de seguridad de Firebase Auth).');
        return;
    }

    if (pass !== passConfirm) {
        showAuthError('Las contraseñas no coinciden. Por favor verifícalas.');
        return;
    }

    const keyInfo = resolveAccessCode(code);
    if (!keyInfo) {
        showAuthError('Código de acceso inválido. Debes ingresar uno de los 5 códigos corporativos autorizados.');
        return;
    }

    if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = `<span class="inline-block animate-spin mr-2">⟳</span> Registrando en Firebase...`;
    }

    try {
        if (!window.FirebaseService || !window.FirebaseService.authModule) {
            throw new Error('Servicio de Firebase no disponible. Intenta nuevamente.');
        }

        // 1. Crear usuario en Firebase Auth
        const authUser = await window.FirebaseService.authModule.register(email, pass, name);

        // 2. Guardar perfil completo en Cloud Firestore 'users'
        const newUser = {
            id: authUser.uid,
            uid: authUser.uid,
            name: name,
            email: email,
            username: email.split('@')[0],
            role: keyInfo.role,
            roleLabel: keyInfo.label,
            accessCodeUsed: keyInfo.code,
            active: true,
            created: new Date().toISOString()
        };

        if (window.FirebaseService.users) {
            await window.FirebaseService.users.saveUser(newUser);
        }

        systemUsers.push(newUser);
        currentUser = newUser;

        // 3. Bitácora de Auditoría
        logActivity('Nuevo Usuario Registrado', `Usuario "${name}" (${email}) registrado con rol ${keyInfo.label} mediante código de acceso ${keyInfo.code}.`, 'success');

        hideAuthModal();
        applyRoleUI();
        updateMenuIndicators();
        goTo('menu');

        showGlobalToast(`🎉 ¡Cuenta creada con éxito! Bienvenido(a) ${name} (${keyInfo.label})`, 'success');
    } catch (error) {
        console.error('[Register Error]', error);
        let msg = 'Error al registrar la cuenta.';
        if (error.code === 'auth/email-already-in-use') {
            msg = 'Este correo electrónico ya está registrado. Por favor inicia sesión.';
        } else if (error.code === 'auth/invalid-email') {
            msg = 'El formato del correo electrónico no es válido.';
        } else if (error.code === 'auth/weak-password') {
            msg = 'La contraseña es débil. Ingresa mínimo 6 caracteres.';
        } else if (error.message) {
            msg = error.message;
        }
        showAuthError(msg);
    } finally {
        if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = `<i data-lucide="user-plus" class="w-4 h-4"></i>Crear Cuenta y Acceder`;
            if (window.lucide && typeof lucide.createIcons === 'function') lucide.createIcons();
        }
    }
}

// ===== INICIO DE SESIÓN CON CORREO Y CONTRASEÑA =====
async function handleLoginForm(event){
    event.preventDefault();
    const btnSubmit = document.getElementById('btn-submit-login');
    const u = (document.getElementById('login-email')?.value || '').trim();
    const p = document.getElementById('login-password')?.value || '';

    if (!u || !p) {
        showAuthError('Ingresa tu correo electrónico y contraseña.');
        return;
    }

    if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = `<span class="inline-block animate-spin mr-2">⟳</span> Validando en Firebase...`;
    }

    const success = await login(u, p);
    if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = `<i data-lucide="log-in" class="w-4 h-4"></i>Entrar al Sistema`;
        if (window.lucide && typeof lucide.createIcons === 'function') lucide.createIcons();
    }
}

async function login(username, password){
    const errBox = document.getElementById('login-error');
    if(errBox) errBox.classList.add('hidden');

    try {
        if (window.FirebaseService && window.FirebaseService.authModule) {
            const authUser = await window.FirebaseService.authModule.login(username, password);
            const email = (authUser.email || '').toLowerCase();
            
            let user = (systemUsers || []).find(u => 
                (u.email && u.email.toLowerCase() === email) || 
                u.uid === authUser.uid || 
                u.id === authUser.uid
            );

            if (!user && window.FirebaseService.users) {
                user = await window.FirebaseService.users.getById(authUser.uid);
                if (user) systemUsers.push(user);
            }

            if (!user) {
                user = {
                    id: authUser.uid,
                    uid: authUser.uid,
                    username: email.split('@')[0],
                    name: authUser.displayName || email.split('@')[0],
                    email: authUser.email,
                    role: 'cajero',
                    roleLabel: 'Cajero Punto de Venta',
                    active: true,
                    created: new Date().toISOString()
                };
                systemUsers.push(user);
                if (window.FirebaseService.users) await window.FirebaseService.users.saveUser(user);
            }

            if (!user.active) {
                await window.FirebaseService.authModule.logout();
                currentUser = null;
                showAuthError('Esta cuenta ha sido desactivada por el Administrador.');
                return false;
            }

            currentUser = user;
        } else {
            showAuthError('El servicio de Firebase no está conectado.');
            return false;
        }

        hideAuthModal();
        logActivity('Inicio de Sesión', `Usuario "${currentUser.name}" (${currentUser.role}) inició sesión con Firebase Auth.`, 'success');
        applyRoleUI();
        updateMenuIndicators();
        goTo('menu');

        const roleLabels = { admin: 'Administrador General', supervisor: 'Supervisor Operativo', cajero: 'Cajero Punto de Venta', analista: 'Analista Financiero', almacen: 'Encargado de Almacén' };
        showGlobalToast(`✓ Bienvenido, ${currentUser.name} (${roleLabels[currentUser.role] || currentUser.role})`, 'success');
        if(window.lucide && typeof lucide.createIcons === 'function') lucide.createIcons();
        return true;
    } catch(error) {
        console.error('[Firebase Login Error]', error);
        let msg = 'Credenciales no válidas en Firebase Auth.';
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
            msg = 'Correo electrónico o contraseña incorrectos.';
        } else if (error.code === 'auth/user-not-found') {
            msg = 'Usuario no registrado en Firebase Auth. Regístrate con tu código de acceso.';
        } else if (error.code === 'auth/invalid-email') {
            msg = 'El formato del correo electrónico no es válido.';
        } else if (error.message) {
            msg = error.message;
        }
        showAuthError(msg);
        return false;
    }
}

// ===== CIERRE DE SESIÓN =====
async function logout(){
    if(currentUser){
        logActivity('Cierre de Sesión', `El usuario "${currentUser.name}" (${currentUser.email}) cerró sesión en Firebase Auth.`, 'info');
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
    
    // Ocultar vistas de trabajo para proteger datos confidenciales
    ['menu','advisor','pos'].forEach(n => {
        const el = document.getElementById('view-' + n);
        if(el) el.classList.add('hidden');
    });

    applyRoleUI();
    updateMenuIndicators();
    showAuthModal('login');
    showGlobalToast('Sesión finalizada. Identifícate para ingresar.', 'info');
    if(window.lucide && typeof lucide.createIcons === 'function') lucide.createIcons();
}

// ===== APLICACIÓN DE INTERFAZ POR ROL (RBAC) =====
function applyRoleUI(){
    const loginModal = document.getElementById('login-modal');
    const uName = document.getElementById('session-user-name');
    const rPill = document.getElementById('session-role-pill');
    const btnLogout = document.getElementById('btn-header-logout');

    if(!currentUser){
        showAuthModal('login');
        if(uName) uName.textContent = 'Sin Sesión';
        if(rPill){
            rPill.textContent = 'NO AUTENTICADO';
            rPill.className = 'pill bg-slate-800 text-slate-500 border border-slate-700 font-bold text-[9px] uppercase';
        }
        if(btnLogout) btnLogout.classList.add('hidden');
        ['menu','advisor','pos'].forEach(n => {
            const el = document.getElementById('view-' + n);
            if(el) el.classList.add('hidden');
        });
        return;
    }

    hideAuthModal();
    if(btnLogout) btnLogout.classList.remove('hidden');
    if(uName) uName.textContent = currentUser.name || currentUser.username;
    
    if(rPill){
        const roleLabels = { admin: 'Administrador General', supervisor: 'Supervisor Operativo', cajero: 'Cajero Punto de Venta', analista: 'Analista Financiero', almacen: 'Encargado de Almacén' };
        rPill.textContent = roleLabels[currentUser.role] || (currentUser.role ? currentUser.role.toUpperCase() : 'USUARIO');
        rPill.className = `pill badge-role-${currentUser.role} font-bold text-[9px] uppercase`;
    }

    const role = currentUser.role;

    // 1. SEGMENTACIÓN ESTRICTA DE PESTAÑAS IZQUIERDAS (POS TABS)
    const ptCatalog = document.getElementById('pt-catalog');
    const ptSell = document.getElementById('pt-sell');
    const ptExpense = document.getElementById('pt-expense');
    const ptUsers = document.getElementById('pt-users');
    const pvAnalistaInfo = document.getElementById('pv-analista-info');

    if(role === 'cajero'){
        if(ptCatalog) ptCatalog.classList.add('hidden');
        if(ptSell) ptSell.classList.remove('hidden');
        if(ptExpense) ptExpense.classList.add('hidden');
        if(ptUsers) ptUsers.classList.add('hidden');
        if(pvAnalistaInfo) pvAnalistaInfo.classList.add('hidden');
        showPosTab('sell');
    } else if(role === 'analista'){
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
    const btnGotoAdv = document.getElementById('btn-pos-goto-advisor');
    const canAccessAdv = hasPermission('finance.view_analysis') || hasPermission('ai.qwen_access') || hasPermission('ai.tax_access');
    if(btnGotoAdv) btnGotoAdv.classList.toggle('hidden', !canAccessAdv);

    if(btnPosStats) btnPosStats.classList.toggle('hidden', !canViewStats);
    if(btnPosToday) btnPosToday.classList.toggle('hidden', !canViewToday);
    if(btnPosAlmacen) btnPosAlmacen.classList.toggle('hidden', !canViewAlmacen);
    if(syncWrap) syncWrap.classList.toggle('hidden', role === 'cajero' || role === 'almacen');

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
    if(window.lucide && typeof lucide.createIcons === 'function') lucide.createIcons();
}

function showAccessDeniedModal(customText){
    const modal = document.getElementById('access-denied-modal');
    const txt = document.getElementById('access-denied-text');
    if(txt && customText) txt.textContent = customText;
    if(modal) modal.classList.remove('hidden');
    if(window.lucide && typeof lucide.createIcons === 'function') lucide.createIcons();
}

function closeAccessDeniedModal(){
    const modal = document.getElementById('access-denied-modal');
    if(modal) modal.classList.add('hidden');
}

// ===== GESTIÓN DE USUARIOS POR EL ADMINISTRADOR (CRUD) =====
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
    if(window.lucide && typeof lucide.createIcons === 'function') lucide.createIcons();
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

    if(user.role === 'admin' && newRole !== 'admin'){
        const activeAdmins = systemUsers.filter(u => u.role === 'admin' && u.active);
        if(activeAdmins.length <= 1){
            alert('Operación bloqueada: No puedes cambiar el rol del único Administrador activo del sistema.');
            renderUsersList();
            return;
        }
    }

    const prevRole = user.role;
    user.role = newRole;
    if (window.FirebaseService && window.FirebaseService.users) {
        await window.FirebaseService.users.updateRole(userId, newRole);
    }

    logActivity('Rol Actualizado', `El rol de @${user.username || user.email} cambió de ${prevRole} a ${newRole} en Firestore.`, 'warn');

    if(currentUser && (currentUser.id === userId || currentUser.uid === userId)){
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
            alert('Operación bloqueada: No puedes desactivar al único Administrador activo del sistema.');
            renderUsersList();
            return;
        }
    }

    user.active = !user.active;
    if (window.FirebaseService && window.FirebaseService.users) {
        await window.FirebaseService.users.toggleActive(userId, user.active);
    }

    logActivity(user.active ? 'Usuario Activado' : 'Usuario Desactivado', `Cuenta de @${user.username || user.email} marcada como ${user.active ? 'ACTIVA' : 'INACTIVA'} en Firestore.`, user.active ? 'success' : 'danger');

    if(currentUser && (currentUser.id === userId || currentUser.uid === userId) && !user.active){
        alert('Tu cuenta ha sido desactivada por la administración. La sesión se cerrará.');
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

    const newPass = prompt(`Reestablecer contraseña para "${user.name}" (@${user.username || user.email}):`, "123456");
    if(newPass === null) return;
    if(!newPass.trim()){
        alert('La contraseña no puede estar vacía.');
        return;
    }

    user.password = newPass.trim();
    if (window.FirebaseService && window.FirebaseService.users) {
        await window.FirebaseService.users.resetPassword(userId, newPass.trim());
    }
    logActivity('Clave Reestablecida', `Contraseña actualizada para @${user.username || user.email} en Firestore.`, 'warn');
    alert(`✓ Contraseña actualizada correctamente en Cloud Firestore.`);
}

function renderUsersList(){
    const container = document.getElementById('users-table-list');
    const badge = document.getElementById('users-count-badge');
    if(!container) return;

    if(badge) badge.textContent = `${systemUsers.length} usuario(s)`;

    const canManage = hasPermission('users.manage');

    container.innerHTML = systemUsers.map(u => {
        const isSelf = currentUser && (currentUser.id === u.id || currentUser.uid === u.uid);
        const disabledAttr = canManage ? '' : 'disabled';
        const displayUsername = u.username || (u.email ? u.email.split('@')[0] : 'usuario');
        const createdDate = u.created ? new Date(u.created).toLocaleDateString('es-MX') : 'Reciente';

        return `
        <div class="pos-row flex items-center justify-between gap-3 p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-0.5">
                    <span class="text-sm font-semibold text-white truncate">${u.name}</span>
                    ${isSelf ? '<span class="pill bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[9px]">Tú</span>' : ''}
                    <span class="pill badge-role-${u.role} text-[9px] uppercase font-bold">${u.role}</span>
                </div>
                <div class="text-[11px] text-slate-400 mono">
                    ${u.email || '@' + displayUsername} • Creado: ${createdDate}
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
    if(window.lucide && typeof lucide.createIcons === 'function') lucide.createIcons();
}

// =====================================================================
// DATA & STATE MANAGEMENT MODULE (data.js)
// CFO Copilot + Punto de Venta
// =====================================================================

// --- 1. CONFIGURACIÓN FISCAL Y HUSOS HORARIOS ---
let currentTaxZoneRate = 0.16;
let currentAppTimeZone = 'America/Mexico_City';

// --- 2. CONTROL DE TURNOS Y ARQUEOS ---
let currentShift = null;
let shiftsHistory = [];

// --- 3. ROLES Y USUARIOS POR DEFECTO (RBAC) ---
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
};;

const DEFAULT_SYSTEM_USERS = [
    { id: 'usr_admin', username: 'admin_demo', password: '1234', name: 'Administrador General', role: 'admin', active: true, created: '2026-10-01T00:00:00.000Z' },
    { id: 'usr_super', username: 'supervisor_demo', password: '1234', name: 'Supervisor de Turno', role: 'supervisor', active: true, created: '2026-10-01T00:00:00.000Z' },
    { id: 'usr_caja', username: 'caja_demo', password: '1234', name: 'Cajero Punto de Venta', role: 'cajero', active: true, created: '2026-10-01T00:00:00.000Z' },
    { id: 'usr_fin', username: 'finanzas_demo', password: '1234', name: 'Analista Financiero', role: 'analista', active: true, created: '2026-10-01T00:00:00.000Z' },
    { id: 'usr_almacen', username: 'almacen_demo', password: '1234', name: 'Encargado de Almacén', role: 'almacen', active: true, created: '2026-10-01T00:00:00.000Z' }
];;

let currentUser = null;
let systemUsers = [];
let cancelRequests = [];
let activityLog = [];
let currentUsersSubSection = 'users';
let activeCancelAction = null;

// --- 4. CATÁLOGO MAESTRO DE 100 REFACCIONES ---
const REFACCIONES_CATALOG = [
    {
        "id":  "ref_1",
        "name":  "Pistón",
        "category":  "Motor",
        "cost":  350,
        "price":  480,
        "stock":  20,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_2",
        "name":  "Anillos de pistón",
        "category":  "Motor",
        "cost":  150,
        "price":  220,
        "stock":  20,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_3",
        "name":  "Biela",
        "category":  "Motor",
        "cost":  400,
        "price":  550,
        "stock":  15,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_4",
        "name":  "Cigüeñal",
        "category":  "Motor",
        "cost":  2500,
        "price":  3200,
        "stock":  8,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_5",
        "name":  "Árbol de levas",
        "category":  "Motor",
        "cost":  1200,
        "price":  1600,
        "stock":  8,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_6",
        "name":  "Válvula de admisión",
        "category":  "Motor",
        "cost":  80,
        "price":  120,
        "stock":  35,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_7",
        "name":  "Válvula de escape",
        "category":  "Motor",
        "cost":  90,
        "price":  135,
        "stock":  35,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_8",
        "name":  "Culata (Cabeza del motor)",
        "category":  "Motor",
        "cost":  3500,
        "price":  4800,
        "stock":  4,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_9",
        "name":  "Junta de culata",
        "category":  "Motor",
        "cost":  200,
        "price":  350,
        "stock":  20,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_10",
        "name":  "Bloque del motor",
        "category":  "Motor",
        "cost":  8000,
        "price":  11000,
        "stock":  0,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_11",
        "name":  "Cárter",
        "category":  "Motor",
        "cost":  600,
        "price":  850,
        "stock":  15,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_12",
        "name":  "Bomba de aceite",
        "category":  "Motor",
        "cost":  450,
        "price":  650,
        "stock":  15,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_13",
        "name":  "Filtro de aceite",
        "category":  "Motor",
        "cost":  60,
        "price":  95,
        "stock":  35,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_14",
        "name":  "Bomba de agua",
        "category":  "Motor",
        "cost":  380,
        "price":  550,
        "stock":  15,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_15",
        "name":  "Radiador",
        "category":  "Motor",
        "cost":  1200,
        "price":  1700,
        "stock":  8,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_16",
        "name":  "Termostato",
        "category":  "Motor",
        "cost":  150,
        "price":  250,
        "stock":  20,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_17",
        "name":  "Ventilador del radiador",
        "category":  "Motor",
        "cost":  500,
        "price":  750,
        "stock":  15,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_18",
        "name":  "Banda de distribución",
        "category":  "Motor",
        "cost":  250,
        "price":  400,
        "stock":  20,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_19",
        "name":  "Cadena de distribución",
        "category":  "Motor",
        "cost":  450,
        "price":  680,
        "stock":  15,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_20",
        "name":  "Tensor de distribución",
        "category":  "Motor",
        "cost":  300,
        "price":  450,
        "stock":  20,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_21",
        "name":  "Carburador",
        "category":  "Motor",
        "cost":  800,
        "price":  1150,
        "stock":  15,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_22",
        "name":  "Inyector de combustible",
        "category":  "Motor",
        "cost":  350,
        "price":  500,
        "stock":  15,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_23",
        "name":  "Riel de inyectores",
        "category":  "Motor",
        "cost":  600,
        "price":  850,
        "stock":  15,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_24",
        "name":  "Bomba de combustible",
        "category":  "Motor",
        "cost":  550,
        "price":  800,
        "stock":  15,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_25",
        "name":  "Filtro de combustible",
        "category":  "Motor",
        "cost":  80,
        "price":  130,
        "stock":  35,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_26",
        "name":  "Disco de embrague (Clutch)",
        "category":  "Transmisión",
        "cost":  450,
        "price":  650,
        "stock":  15,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_27",
        "name":  "Plato de presión",
        "category":  "Transmisión",
        "cost":  500,
        "price":  750,
        "stock":  15,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_28",
        "name":  "Collarín de embrague",
        "category":  "Transmisión",
        "cost":  250,
        "price":  380,
        "stock":  20,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_29",
        "name":  "Cable de embrague",
        "category":  "Transmisión",
        "cost":  120,
        "price":  190,
        "stock":  20,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_30",
        "name":  "Cilindro maestro de embrague",
        "category":  "Transmisión",
        "cost":  380,
        "price":  550,
        "stock":  15,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_31",
        "name":  "Caja de cambios",
        "category":  "Transmisión",
        "cost":  6000,
        "price":  8500,
        "stock":  2,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_32",
        "name":  "Engranajes de transmisión",
        "category":  "Transmisión",
        "cost":  800,
        "price":  1200,
        "stock":  15,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_33",
        "name":  "Sincronizador",
        "category":  "Transmisión",
        "cost":  250,
        "price":  400,
        "stock":  20,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_34",
        "name":  "Árbol de transmisión (Cardán)",
        "category":  "Transmisión",
        "cost":  1800,
        "price":  2500,
        "stock":  8,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_35",
        "name":  "Diferencial",
        "category":  "Transmisión",
        "cost":  3500,
        "price":  4800,
        "stock":  4,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_36",
        "name":  "Eje (Palier)",
        "category":  "Transmisión",
        "cost":  900,
        "price":  1300,
        "stock":  15,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_37",
        "name":  "Junta homocinética",
        "category":  "Transmisión",
        "cost":  450,
        "price":  680,
        "stock":  15,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_38",
        "name":  "Cadena de transmisión (Motos)",
        "category":  "Transmisión",
        "cost":  300,
        "price":  480,
        "stock":  20,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_39",
        "name":  "Piñón (Motos)",
        "category":  "Transmisión",
        "cost":  150,
        "price":  250,
        "stock":  20,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_40",
        "name":  "Corona / Sprocket (Motos)",
        "category":  "Transmisión",
        "cost":  280,
        "price":  420,
        "stock":  20,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_41",
        "name":  "Pastillas de freno (Balatas)",
        "category":  "Frenos",
        "cost":  220,
        "price":  350,
        "stock":  20,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_42",
        "name":  "Disco de freno",
        "category":  "Frenos",
        "cost":  400,
        "price":  600,
        "stock":  15,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_43",
        "name":  "Tambor de freno",
        "category":  "Frenos",
        "cost":  350,
        "price":  520,
        "stock":  15,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_44",
        "name":  "Zapatas de freno",
        "category":  "Frenos",
        "cost":  180,
        "price":  280,
        "stock":  20,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_45",
        "name":  "Caliper (Mordaza)",
        "category":  "Frenos",
        "cost":  650,
        "price":  900,
        "stock":  15,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_46",
        "name":  "Cilindro maestro de frenos",
        "category":  "Frenos",
        "cost":  450,
        "price":  650,
        "stock":  15,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_47",
        "name":  "Líneas de freno (Latiguillos)",
        "category":  "Frenos",
        "cost":  150,
        "price":  250,
        "stock":  20,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_48",
        "name":  "Servofreno (Booster)",
        "category":  "Frenos",
        "cost":  1200,
        "price":  1800,
        "stock":  8,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_49",
        "name":  "Módulo ABS",
        "category":  "Frenos",
        "cost":  4500,
        "price":  6200,
        "stock":  0,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_50",
        "name":  "Sensor de velocidad ABS",
        "category":  "Frenos",
        "cost":  350,
        "price":  550,
        "stock":  0,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_51",
        "name":  "Pedal de freno",
        "category":  "Frenos",
        "cost":  250,
        "price":  400,
        "stock":  20,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_52",
        "name":  "Manija de freno (Motos)",
        "category":  "Frenos",
        "cost":  80,
        "price":  150,
        "stock":  20,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_53",
        "name":  "Cable de freno",
        "category":  "Frenos",
        "cost":  90,
        "price":  160,
        "stock":  20,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_54",
        "name":  "Purgador de freno",
        "category":  "Frenos",
        "cost":  20,
        "price":  45,
        "stock":  35,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_55",
        "name":  "Amortiguador delantero",
        "category":  "Suspensión/Dirección",
        "cost":  650,
        "price":  950,
        "stock":  15,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_56",
        "name":  "Amortiguador trasero",
        "category":  "Suspensión/Dirección",
        "cost":  550,
        "price":  850,
        "stock":  15,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_57",
        "name":  "Resorte helicoidal (Muelle)",
        "category":  "Suspensión/Dirección",
        "cost":  350,
        "price":  550,
        "stock":  15,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_58",
        "name":  "Horquilla de suspensión",
        "category":  "Suspensión/Dirección",
        "cost":  480,
        "price":  720,
        "stock":  15,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_59",
        "name":  "Rótula",
        "category":  "Suspensión/Dirección",
        "cost":  180,
        "price":  290,
        "stock":  20,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_60",
        "name":  "Buje de suspensión",
        "category":  "Suspensión/Dirección",
        "cost":  80,
        "price":  140,
        "stock":  35,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_61",
        "name":  "Barra estabilizadora",
        "category":  "Suspensión/Dirección",
        "cost":  450,
        "price":  680,
        "stock":  15,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_62",
        "name":  "Bieleta",
        "category":  "Suspensión/Dirección",
        "cost":  150,
        "price":  260,
        "stock":  20,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_63",
        "name":  "Cremallera de dirección",
        "category":  "Suspensión/Dirección",
        "cost":  2200,
        "price":  3100,
        "stock":  8,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_64",
        "name":  "Bomba de dirección hidráulica",
        "category":  "Suspensión/Dirección",
        "cost":  1100,
        "price":  1600,
        "stock":  8,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_65",
        "name":  "Terminal de dirección",
        "category":  "Suspensión/Dirección",
        "cost":  160,
        "price":  250,
        "stock":  20,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_66",
        "name":  "Columna de dirección",
        "category":  "Suspensión/Dirección",
        "cost":  1500,
        "price":  2200,
        "stock":  8,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_67",
        "name":  "Volante",
        "category":  "Suspensión/Dirección",
        "cost":  800,
        "price":  1300,
        "stock":  15,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_68",
        "name":  "Manillar (Motos)",
        "category":  "Suspensión/Dirección",
        "cost":  350,
        "price":  550,
        "stock":  15,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_69",
        "name":  "Telescopios de suspensión (Motos)",
        "category":  "Suspensión/Dirección",
        "cost":  1200,
        "price":  1800,
        "stock":  8,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_70",
        "name":  "Balero de rueda (Rodamiento)",
        "category":  "Suspensión/Dirección",
        "cost":  220,
        "price":  350,
        "stock":  20,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_71",
        "name":  "Batería",
        "category":  "Sistema Eléctrico",
        "cost":  1100,
        "price":  1650,
        "stock":  8,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_72",
        "name":  "Alternador",
        "category":  "Sistema Eléctrico",
        "cost":  1800,
        "price":  2600,
        "stock":  8,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_73",
        "name":  "Estator (Motos)",
        "category":  "Sistema Eléctrico",
        "cost":  450,
        "price":  700,
        "stock":  15,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_74",
        "name":  "Motor de arranque (Marcha)",
        "category":  "Sistema Eléctrico",
        "cost":  1200,
        "price":  1750,
        "stock":  8,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_75",
        "name":  "Bujía",
        "category":  "Sistema Eléctrico",
        "cost":  40,
        "price":  75,
        "stock":  35,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_76",
        "name":  "Bobina de encendido",
        "category":  "Sistema Eléctrico",
        "cost":  350,
        "price":  550,
        "stock":  15,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_77",
        "name":  "Cables de bujía",
        "category":  "Sistema Eléctrico",
        "cost":  220,
        "price":  380,
        "stock":  20,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_78",
        "name":  "Módulo de control del motor (ECU)",
        "category":  "Sistema Eléctrico",
        "cost":  3500,
        "price":  5200,
        "stock":  4,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_79",
        "name":  "Caja de fusibles",
        "category":  "Sistema Eléctrico",
        "cost":  450,
        "price":  700,
        "stock":  15,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_80",
        "name":  "Relé (Relay)",
        "category":  "Sistema Eléctrico",
        "cost":  60,
        "price":  110,
        "stock":  35,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_81",
        "name":  "Interruptor de encendido (Switch)",
        "category":  "Sistema Eléctrico",
        "cost":  180,
        "price":  290,
        "stock":  20,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_82",
        "name":  "Faro delantero",
        "category":  "Sistema Eléctrico",
        "cost":  850,
        "price":  1300,
        "stock":  15,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_83",
        "name":  "Calavera (Faro trasero)",
        "category":  "Sistema Eléctrico",
        "cost":  450,
        "price":  700,
        "stock":  15,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_84",
        "name":  "Foco direccional",
        "category":  "Sistema Eléctrico",
        "cost":  15,
        "price":  35,
        "stock":  35,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_85",
        "name":  "Sensor de oxígeno (Sonda Lambda)",
        "category":  "Sistema Eléctrico",
        "cost":  550,
        "price":  850,
        "stock":  15,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_86",
        "name":  "Sensor MAF",
        "category":  "Sistema Eléctrico",
        "cost":  650,
        "price":  1000,
        "stock":  15,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_87",
        "name":  "Claxon (Bocina)",
        "category":  "Sistema Eléctrico",
        "cost":  150,
        "price":  250,
        "stock":  20,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_88",
        "name":  "Fascia delantera (Defensa)",
        "category":  "Carrocería y Otros",
        "cost":  1200,
        "price":  1850,
        "stock":  8,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_89",
        "name":  "Fascia trasera",
        "category":  "Carrocería y Otros",
        "cost":  1100,
        "price":  1700,
        "stock":  8,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_90",
        "name":  "Cofre (Capó)",
        "category":  "Carrocería y Otros",
        "cost":  1800,
        "price":  2800,
        "stock":  8,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_91",
        "name":  "Puerta",
        "category":  "Carrocería y Otros",
        "cost":  2500,
        "price":  3800,
        "stock":  8,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_92",
        "name":  "Espejo retrovisor interior",
        "category":  "Carrocería y Otros",
        "cost":  150,
        "price":  280,
        "stock":  20,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_93",
        "name":  "Espejo lateral",
        "category":  "Carrocería y Otros",
        "cost":  450,
        "price":  750,
        "stock":  15,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_94",
        "name":  "Parabrisas",
        "category":  "Carrocería y Otros",
        "cost":  1500,
        "price":  2400,
        "stock":  8,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_95",
        "name":  "Ventanilla lateral",
        "category":  "Carrocería y Otros",
        "cost":  600,
        "price":  950,
        "stock":  15,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_96",
        "name":  "Asiento",
        "category":  "Carrocería y Otros",
        "cost":  1800,
        "price":  2800,
        "stock":  8,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_97",
        "name":  "Cinturón de seguridad",
        "category":  "Carrocería y Otros",
        "cost":  350,
        "price":  550,
        "stock":  15,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_98",
        "name":  "Tanque de combustible",
        "category":  "Carrocería y Otros",
        "cost":  1600,
        "price":  2500,
        "stock":  8,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_99",
        "name":  "Rin (Aro de rueda)",
        "category":  "Carrocería y Otros",
        "cost":  800,
        "price":  1250,
        "stock":  15,
        "created":  "2026-10-14T09:40:00.000Z"
    },
    {
        "id":  "ref_100",
        "name":  "Neumático (Llanta)",
        "category":  "Carrocería y Otros",
        "cost":  1100,
        "price":  1650,
        "stock":  8,
        "created":  "2026-10-14T09:40:00.000Z"
    }
];;

let catalog = JSON.parse(JSON.stringify(REFACCIONES_CATALOG));
catalog.forEach(p => { if(p.stock === undefined || p.stock === null) p.stock = 20; });

// --- 5. ESTADO OPERATIVO DEL PUNTO DE VENTA ---
let salesLog = [];
let expenses = [];
let ticket = [];
let posChart = null;
let hourlyChart = null;
let correlationChart = null;
let posViewMode = 'today';
let currentPaymentMethod = 'cash';
let currentSplitConfig = {
    methods: ['cash', 'card'],
    amounts: { cash: 0, card: 0 }
};
let ticketModifyTargetId = null;

// --- 6. ESTADO DEL ASESOR FINANCIERO Y MODELOS IA ---
let busy = false;
let stepN = 0;
const S = { rev: null, cost: null, tax: null, industry: null, loan: null, loanRate: null, loanYears: null };
const auditE = [];
let donut = null;
let bars = null;
let radarChart = null;

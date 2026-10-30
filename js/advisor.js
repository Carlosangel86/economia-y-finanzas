// =====================================================================
// AYUDANTE FINANCIERO E INTEGRACIÓN CON IA OLLAMA (advisor.js)
// Modelos: qwen2.5 y gemma4:12b
// =====================================================================

// --- 1. CONSTRUCTOR DE CONTEXTO FINANCIERO RESTRINGIDO POR ROL ---
function buildScopedFinancialContext(rawContext){
    const role = currentUser ? currentUser.role : 'cajero';
    
    if(role === 'cajero'){
        const ownActiveSales = salesLog.filter(s => s.status !== 'cancelled' && (s.cashierId === (currentUser ? currentUser.id : '') || s.cashierUsername === (currentUser ? currentUser.username : '')));
        const ownRevenue = ownActiveSales.reduce((sum, s) => sum + s.total, 0);
        return {
            scope: 'cajero_turno_personal',
            cashier: currentUser ? currentUser.name : 'Cajero',
            activeShiftTickets: ownActiveSales.length,
            shiftTotalSales: ownRevenue,
            restrictedMetrics: 'Costos de adquisición, márgenes brutos/netos, EBITDA y proyecciones fiscales SAT confidenciales por política corporativa.'
        };
    }

    if(role === 'supervisor'){
        const activeSales = salesLog.filter(s => s.status !== 'cancelled');
        const totalRev = activeSales.reduce((sum, s) => sum + s.total, 0);
        const daySet = new Set(activeSales.map(s => new Date(s.date).toDateString()));
        return {
            scope: 'supervisor_operativo',
            totalActiveTickets: activeSales.length,
            daysRecorded: daySet.size,
            operationalSalesRevenue: totalRev,
            inventoryItemsCount: catalog.length,
            pendingCancelRequests: cancelRequests.filter(r => r.status === 'pending').length,
            note: 'Contexto limitado a operaciones diarias y arqueos de caja.'
        };
    }

    // Analista y Administrador tienen acceso financiero integral
    return rawContext;
}

lucide.createIcons();

// --- 2. SISTEMA DE SUGERENCIAS Y PREGUNTAS CLAVE ---
function setHints(a){document.getElementById('hints').innerHTML=a.map(h=>`<button onclick="useH(\`${h.t}\`)" class="whitespace-nowrap px-3 py-2 rounded-full bg-slate-800/70 hover:bg-slate-700 border border-slate-700/60 text-[11px] text-slate-300 transition shadow flex items-center gap-1.5 shrink-0"><i data-lucide="zap" class="w-3 h-3 text-sky-500"></i>${h.l}</button>`).join('');lucide.createIcons();}
function updateInitialHints(){
    const hints=[
        {l:'Ej: Ventas 500k, costos 430k',t:'Mis ingresos son de 500 mil pesos al mes y mis costos operativos suman unos 430 mil.'},
        {l:'⚖️ Régimen Fiscal (Gemma 4)',t:'¿Qué régimen fiscal me conviene escoger según las actividades de mi negocio?'}
    ];
    const posData=getPosFinancials();
    if(posData)hints.unshift({l:'⚡ Importar datos del POS',t:'__POS_SYNC__'});
    setHints(hints);
}

function useH(t){if(!busy){if(t==='__POS_SYNC__'){syncFromPos();return;}document.getElementById('msg').value=t;sendAdv();}}


async function sendAdv(){
    if(busy)return;const el=document.getElementById('msg'),txt=el.value.trim();if(!txt)return;
    busy=true;document.getElementById('iw').classList.add('lock');document.getElementById('hints').innerHTML='';
    addMsg(txt,'u');el.value='';document.getElementById('typ').classList.remove('hidden');
    try{
        alog('NLP Extraction');await phase('Orch','EXTRACTING','bg-indigo-500',700);parse(txt);
        document.getElementById('oJ').textContent=JSON.stringify(S,null,2);upQ();st('Orch','EXTRACTED','bg-emerald-600');
        await phase('Eng','CALCULATING','bg-amber-500',500);const R=calc();
        document.getElementById('oM').textContent=JSON.stringify(R,null,2);st('Eng','DONE','bg-emerald-600');upDash(R);upRatios(R);
        alog('Narrating');await slp(500);document.getElementById('typ').classList.add('hidden');
        addMsg(narrate(R),'b');advStep();saveAdv(R);

        // Check if query is about tax regime or fiscal advice
        const lo = txt.toLowerCase();
        const isFiscal = lo.match(/r[eé]gimen|fiscal|sat|impuesto|tributar|persona\s*moral|persona\s*f[ií]sica|resico|qu[eé]\s*me\s*conviene|qu[eé]\s*r[eé]gimen/);
        if(isFiscal){
            askGemmaFiscal(txt, R, S);
        } else {
            // Call local LLM qwen2.5 for general financial suggestions
            askOllama(txt, R, S);
        }
    }catch(e){alog('[ERR] '+e.message);document.getElementById('typ').classList.add('hidden');addMsg('Error. Revisa logs.','b');}
    finally{busy=false;document.getElementById('iw').classList.remove('lock');}
}

// --- 3. CONSULTA AL MODELO LOCAL QWEN 2.5 (ASESOR FINANCIERO GENERAL) ---
async function askOllama(userText, R, S) {
    if(!hasPermission('ai.qwen_access')){
        showAccessDeniedModal('Tu rol no tiene permiso para consultar al asesor financiero inteligente.');
        return;
    }
    document.getElementById('typ').classList.remove('hidden');

    const scopedS = buildScopedFinancialContext(S);
    const scopedR = buildScopedFinancialContext(R);

    let prompt = `Eres CFO Copilot, un asesor financiero experto.
Se te proporciona la información financiera calculada estrictamente por el sistema (NO inventes números, usa SOLO estos, si algún dato es null significa que falta).
DATOS DEL USUARIO (CONTEXTO FILTRADO POR ROL ${currentUser ? currentUser.role : 'cajero'}): ${JSON.stringify(scopedS)}
CÁLCULOS DEL SISTEMA: ${JSON.stringify(scopedR)}
Usuario dice: "${userText}"
Instrucciones:
1. Basado SOLO en los datos calculados disponibles para este rol, da sugerencias prácticas y profesionales.
2. Si un dato está restringido por políticas de seguridad, respétalo y asesora dentro de su alcance operativo.
3. Responde de forma concisa. Formatea tu respuesta en HTML simple (usa <b>, <br>, <ul>, <li>) para que se vea bien en un chat. NO uses formato markdown ni bloques de código.`;

    try {
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                model: 'qwen2.5',
                prompt: prompt,
                stream: false
            })
        });
        const data = await response.json();
        document.getElementById('typ').classList.add('hidden');
        addMsg(`<div class="mt-2 pt-3 border-t border-sky-500/20 text-[13px] text-sky-100/90 leading-relaxed"><div class="flex items-center gap-1.5 mb-2 text-sky-400 font-bold uppercase tracking-wider text-[10px]"><i data-lucide="sparkles" class="w-3.5 h-3.5"></i> Análisis Inteligente de Ollama (Qwen 2.5)</div>${data.response}</div>`, 'b');
        lucide.createIcons();
    } catch (e) {
        document.getElementById('typ').classList.add('hidden');
        addMsg('<div class="mt-2 text-rose-400 text-[11px]"><i data-lucide="wifi-off" class="w-3 h-3 inline"></i> No se pudo conectar a Ollama local (qwen2.5).</div>', 'b');
        lucide.createIcons();
    }
}

// --- 4. CONSULTA AL MODELO LOCAL GEMMA 4 (12B) (ORIENTACIÓN FISCAL) ---
async function askGemmaFiscal(activityText, R, S) {
    if(!hasPermission('ai.tax_access')){
        logActivity('Intento Bloqueado Fiscal', `Usuario @${currentUser ? currentUser.username : 'anónimo'} intentó acceder a Gemma 4 Fiscal sin permiso.`, 'danger');
        document.getElementById('typ').classList.add('hidden');
        addMsg(`<div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs leading-relaxed fin">
            <div class="flex items-center gap-2 mb-1.5 font-bold text-amber-400">
                <i data-lucide="shield-alert" class="w-4 h-4 text-amber-400"></i>Acceso Restringido — Consultas Fiscales Gemma 4:12B
            </div>
            El módulo de asesoría tributaria y determinación de régimen fiscal está reservado exclusivamente para los roles de <b>Administrador</b> y <b>Analista Financiero</b>. Tu rol actual (<b>${currentUser ? currentUser.role : 'Sin sesión'}</b>) no cuenta con privilegios para esta operación.
        </div>`, 'b');
        lucide.createIcons();
        return;
    }
    document.getElementById('typ').classList.remove('hidden');
    alog('Consultando recomendación fiscal a Gemma 4 (12B)');
    
    const salesInfo = S && S.rev ? `$${fmt(S.rev)}/mes ($${fmt(S.rev * 12)}/año)` : 'No especificado aún';
    const costsInfo = S && S.cost ? `$${fmt(S.cost)}/mes` : 'No especificado aún';
    const industryInfo = S && S.industry ? S.industry : 'No especificado';
    const currentActivity = activityText || industryInfo;
    
    const prompt = `Eres un asesor fiscal y tributario experto de alto nivel especializado en México (SAT) y legislación fiscal de negocios.
El usuario necesita saber cuál es el régimen fiscal más conveniente para su negocio según sus actividades económicas.

DATOS DEL NEGOCIO:
- Actividades / Giro: "${currentActivity}"
- Ventas estimadas: ${salesInfo}
- Costos operativos: ${costsInfo}
- Giro detectado: ${industryInfo}

INSTRUCCIONES CLAVE:
1. Recomienda con precisión cuál es el régimen fiscal más conveniente (analiza RESICO - Régimen Simplificado de Confianza para personas físicas hasta $3.5M anuales o personas morales hasta $35M; Régimen de Personas Físicas con Actividades Empresariales y Profesionales; o Persona Moral como S.A.S. o S.A. de C.V.).
2. Explica de forma clara, didáctica y directa:
   - ¿Cuál régimen le conviene más y por qué?
   - Requisitos indispensables para calificar a ese régimen.
   - Ventajas fiscales (tasas de ISR estimadas, retenciones, deducciones).
   - Qué riesgos o desventajas debe cuidar.
3. Formatea tu respuesta usando HTML simple (<b>, <br>, <ul>, <li>, <p>) para que se vea perfectamente estilizado en el chat. NO uses markdown ni comillas triples ni bloques de código. Sé conciso, profesional y directo.`;

    try {
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                model: 'gemma4:12b',
                prompt: prompt,
                stream: false
            })
        });
        const data = await response.json();
        document.getElementById('typ').classList.add('hidden');
        
        let html = `
        <div class="mt-2 pt-3 border-t border-indigo-500/30 text-[13px] text-indigo-100/90 leading-relaxed">
            <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-1.5 text-indigo-400 font-bold uppercase tracking-wider text-[10px]">
                    <span class="w-5 h-5 rounded bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-[9px] border border-indigo-500/40">G4</span>
                    <i data-lucide="scale" class="w-3.5 h-3.5"></i> Asesor Fiscal · Gemma 4 (12B)
                </div>
                <span class="text-[9px] mono px-1.5 py-0.5 rounded bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">Local LLM</span>
            </div>
            <div class="space-y-2 mb-3">
                ${data.response}
            </div>
            <div class="p-2.5 rounded-lg bg-indigo-950/60 border border-indigo-500/20 flex flex-wrap items-center gap-1.5">
                <span class="text-[9.5px] text-slate-400 font-bold uppercase mr-1">Aplicar al perfil:</span>
                <button onclick="applyTaxRegime('RESICO')" class="pos-btn bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] py-1 px-2.5"><i data-lucide="check" class="w-3 h-3"></i>RESICO (2.5%)</button>
                <button onclick="applyTaxRegime('PERSONA_MORAL')" class="pos-btn bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] py-1 px-2.5"><i data-lucide="check" class="w-3 h-3"></i>Persona Moral (30%)</button>
                <button onclick="applyTaxRegime('PERSONA_FISICA')" class="pos-btn bg-slate-700 hover:bg-slate-600 text-slate-200 text-[10px] py-1 px-2.5"><i data-lucide="check" class="w-3 h-3"></i>Persona Física (35%)</button>
            </div>
        </div>`;
        addMsg(html, 'b');
        lucide.createIcons();
    } catch (e) {
        document.getElementById('typ').classList.add('hidden');
        addMsg(`<div class="mt-2 text-rose-400 text-[11px]"><i data-lucide="wifi-off" class="w-3 h-3 inline"></i> No se pudo conectar a Ollama local para <b>gemma4:12b</b>. Verifica que Ollama esté corriendo con <code>$env:OLLAMA_ORIGINS="*"</code> y <code>ollama serve</code>.</div>`, 'b');
        lucide.createIcons();
    }
}

function applyTaxRegime(regime){
    S.tax = regime;
    const label = regime === 'PERSONA_MORAL' ? 'Persona Moral' : regime === 'PERSONA_FISICA' ? 'Persona Física con Actividad Empresarial' : 'RESICO';
    addMsg(`He seleccionado el régimen fiscal: <b>${label}</b>`, 'u');
    const R = calc();
    document.getElementById('oJ').textContent = JSON.stringify(S, null, 2);
    document.getElementById('oM').textContent = JSON.stringify(R, null, 2);
    upQ();
    upDash(R);
    upRatios(R);
    saveAdv(R);
    addMsg(narrate(R), 'b');
}

function triggerGemmaFiscalPrompt(){
    let query = S.industry ? `Mi negocio es del sector ${S.industry}.` : '';
    if(S.rev) query += ` Con ventas de ${fmt(S.rev)} al mes.`;
    if(!query) query = 'Tengo un negocio comercial y de servicios.';
    query += ' ¿Cuál régimen fiscal me recomiendas escoger según mis actividades?';
    addMsg(`⚖️ ¿Qué régimen fiscal me recomienda Gemma 4:12b para mis actividades?`, 'u');
    askGemmaFiscal(query, calc(), S);
}

// --- 5. PARSER Y ACTUALIZACIÓN DE ESTADO ---
function parse(txt){const lo=txt.toLowerCase();const re=/(\d+(?:\.\d+)?)\s*(millones|millon(?:es)?|mill|mil|k|%)?/gi;let m,nums=[];while((m=re.exec(lo))!==null){let v=parseFloat(m[1]);const su=(m[2]||'').toLowerCase();if(su.startsWith('millon')||su==='mill'||su==='millones')v*=1e6;else if(su==='mil'||su==='k')v*=1e3;else if(su==='%'){nums.push({v,p:true});continue;}else if(v<1000)v*=1e3;nums.push({v,p:false});}let ni=0;
if(lo.match(/vent|ingres|vend|factur/))if(ni<nums.length&&!nums[ni].p)S.rev=nums[ni++].v;
if(lo.match(/gast|cost|oper|pag/))if(ni<nums.length&&!nums[ni].p)S.cost=nums[ni++].v;
if(lo.match(/crédit|credit|préstam|prestam|pedir|deuda|financ/)){if(ni<nums.length&&!nums[ni].p)S.loan=nums[ni++].v;const rt=nums.find(n=>n.p);if(rt)S.loanRate=rt.v/100;const ym=lo.match(/(\d+)\s*año/);if(ym)S.loanYears=parseInt(ym[1]);}
if(lo.includes('resico'))S.tax='RESICO';else if(lo.match(/persona\s*moral|moral/))S.tax='PERSONA_MORAL';else if(lo.match(/persona\s*f[ií]sica|f[ií]sica/))S.tax='PERSONA_FISICA';
if(lo.match(/restaurante|comida|tacos|café/))S.industry='Restaurantes';else if(lo.match(/clínica|médic|hospital|salud|doctor/))S.industry='Salud';else if(lo.match(/agencia|marketing|software|tech|servicio|consult/))S.industry='Servicios y Tecnología';else if(lo.match(/ferreter|tienda|ropa|abarrot|comerci/))S.industry='Retail';else if(lo.match(/construc|inmobiliar/))S.industry='Construcción';else if(lo.match(/granja|agr[ií]cola|ganad|lecher/))S.industry='Agropecuario';else if(lo.match(/transport|logíst|flet/))S.industry='Transporte';
if(lo.match(/qué\s*pasa|escenario|simul/)&&S.rev!==null){const dn=lo.match(/(\d+)\s*%?\s*menos/);if(dn)S.rev*=(1-parseInt(dn[1])/100);const up=lo.match(/(\d+)\s*%?\s*más/);if(up)S.rev*=(1+parseInt(up[1])/100);}}

function mSet(id,v){const el=document.getElementById(id);if(v!==null){el.textContent=fmt(v);el.className='text-xl font-bold mono text-emerald-400';}else{el.textContent='—';el.className='text-xl font-bold mono text-slate-600';}}
function upQ(){const fs=[{k:'rev',l:'Ventas'},{k:'cost',l:'Costos'},{k:'tax',l:'Fiscal'},{k:'industry',l:'Giro'}];let f=fs.filter(x=>S[x.k]!==null).length;const p=(f/4)*100;document.getElementById('qBar').style.width=p+'%';document.getElementById('qBar').className='h-full fill '+(p<50?'bg-rose-500':p<100?'bg-amber-400':'bg-emerald-500');document.getElementById('qTxt').textContent=p+'%';document.getElementById('qTxt').className='text-[11px] mono font-bold w-10 text-right '+(p<50?'text-rose-400':p<100?'text-amber-400':'text-emerald-400');document.getElementById('qDots').innerHTML=fs.map(x=>`<span class="w-2.5 h-2.5 rounded-full ${S[x.k]!==null?'bg-emerald-500':'bg-slate-700'}" title="${x.l}"></span>`).join('');}

// --- 6. WRAPPERS DE COMPATIBILIDAD CON ENLACE DIRECTO ---
async function queryOllamaQwen(prompt, financialContext){
    const R = typeof calc === 'function' ? calc() : null;
    return askOllama(prompt, R, financialContext || S);
}

async function queryOllamaGemmaTaxRegime(userActivities){
    const R = typeof calc === 'function' ? calc() : null;
    return askGemmaFiscal(userActivities, R, S);
}

// --- 7. PROGRESIÓN DE PASOS Y PERSISTENCIA DE ASESORÍA ---
function advStep(){stepN++;for(let i=1;i<=4;i++){const el=document.getElementById('s'+i);if(!el)continue;const dot=el.querySelector('span');if(i<=stepN){el.classList.remove('text-slate-600');el.classList.add('text-sky-400');if(dot){dot.classList.remove('bg-slate-700','text-slate-400');dot.classList.add('bg-sky-500','text-white');}}}}
function saveAdv(R){let db=JSON.parse(localStorage.getItem('cfo_adv')||'{"sessions":[]}');db.sessions.push({ts:new Date().toISOString(),inputs:{...S},results:R});localStorage.setItem('cfo_adv',JSON.stringify(db));}
function exportAdvisorDB(){let db=JSON.parse(localStorage.getItem('cfo_adv')||'{"sessions":[]}');dl(db,'cfo_copilot_database.json');toast('db-toast');}

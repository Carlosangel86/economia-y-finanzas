// ===== ASESOR FINANCIERO, PROYECCIONES & IA COPILOT =====

// ===== SCOPED FINANCIAL CONTEXT PARA IA =====
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



// ===== ADVISOR MODULE (same logic as before, compressed) =====
let busy=false,stepN=0;
const S={rev:null,cost:null,tax:null,industry:null,loan:null,loanRate:null,loanYears:null};
// auditE inicializado en utils.js
Chart.defaults.color='#475569';Chart.defaults.font.family='Inter';
let donut,bars;
function initCharts(){
    donut=new Chart(document.getElementById('cDonut'),{type:'doughnut',data:{labels:['Costos','Ganancia'],datasets:[{data:[1,0],backgroundColor:['#1e293b','#0f172a'],borderWidth:0,borderRadius:5}]},options:{cutout:'74%',plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>c.label+': '+fmt(c.raw)}}},responsive:true,maintainAspectRatio:false}});
    bars=new Chart(document.getElementById('cBars'),{type:'bar',data:{labels:['Año 1','Año 2','Año 3'],datasets:[{label:'Flujo Libre',data:[0,0,0],backgroundColor:'rgba(14,165,233,.55)',borderRadius:8,borderSkipped:false},{label:'Deuda',data:[0,0,0],backgroundColor:'rgba(244,63,94,.4)',borderRadius:8,borderSkipped:false}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{font:{size:9},boxWidth:10}}},scales:{x:{grid:{display:false},border:{display:false}},y:{ticks:{callback:v=>fmtS(v)},grid:{color:'rgba(51,65,85,.4)'},border:{display:false}}}}});
}
initCharts();

function showAdvTab(t){['dash','ratios','back','amor'].forEach(n=>{document.getElementById('v-'+n).classList.toggle('hidden',n!==t);const b=document.getElementById('t-'+n);n===t?(b.classList.add('tab-on'),b.classList.remove('text-slate-500')):(b.classList.remove('tab-on'),b.classList.add('text-slate-500'));});}

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
updateInitialHints();
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

function parse(txt){const lo=txt.toLowerCase();const re=/(\d+(?:\.\d+)?)\s*(millones|millon(?:es)?|mill|mil|k|%)?/gi;let m,nums=[];while((m=re.exec(lo))!==null){let v=parseFloat(m[1]);const su=(m[2]||'').toLowerCase();if(su.startsWith('millon')||su==='mill'||su==='millones')v*=1e6;else if(su==='mil'||su==='k')v*=1e3;else if(su==='%'){nums.push({v,p:true});continue;}else if(v<1000)v*=1e3;nums.push({v,p:false});}let ni=0;
if(lo.match(/vent|ingres|vend|factur/))if(ni<nums.length&&!nums[ni].p)S.rev=nums[ni++].v;
if(lo.match(/gast|cost|oper|pag/))if(ni<nums.length&&!nums[ni].p)S.cost=nums[ni++].v;
if(lo.match(/crédit|credit|préstam|prestam|pedir|deuda|financ/)){if(ni<nums.length&&!nums[ni].p)S.loan=nums[ni++].v;const rt=nums.find(n=>n.p);if(rt)S.loanRate=rt.v/100;const ym=lo.match(/(\d+)\s*año/);if(ym)S.loanYears=parseInt(ym[1]);}
if(lo.includes('resico'))S.tax='RESICO';else if(lo.match(/persona\s*moral|moral/))S.tax='PERSONA_MORAL';else if(lo.match(/persona\s*f[ií]sica|f[ií]sica/))S.tax='PERSONA_FISICA';
if(lo.match(/restaurante|comida|tacos|café/))S.industry='Restaurantes';else if(lo.match(/clínica|médic|hospital|salud|doctor/))S.industry='Salud';else if(lo.match(/agencia|marketing|software|tech|servicio|consult/))S.industry='Servicios y Tecnología';else if(lo.match(/ferreter|tienda|ropa|abarrot|comerci/))S.industry='Retail';else if(lo.match(/construc|inmobiliar/))S.industry='Construcción';else if(lo.match(/granja|agr[ií]cola|ganad|lecher/))S.industry='Agropecuario';else if(lo.match(/transport|logíst|flet/))S.industry='Transporte';
if(lo.match(/qué\s*pasa|escenario|simul/)&&S.rev!==null){const dn=lo.match(/(\d+)\s*%?\s*menos/);if(dn)S.rev*=(1-parseInt(dn[1])/100);const up=lo.match(/(\d+)\s*%?\s*más/);if(up)S.rev*=(1+parseInt(up[1])/100);}}

function calc(){
const R={
    ts:new Date().toISOString(),
    cf:{ebitda:null,tax:null,fcff:null},
    val:{wacc:null,ev:null,van:null,tir:null},
    debt:{pmt:null,dscr:null,interest:null},
    proj:{y1:null,y2:null,y3:null},
    amort:null,
    ratios:{grossMargin:null,netMargin:null,netProfit:null,roi:null,breakeven:null,breakevenMonths:null,interestCoverage:null,debtToIncome:null,leverage:null,payback:null,efficiency:null,contributionMargin:null,formalBreakeven:null}
};
if(S.rev===null||S.cost===null)return R;
// Basics
R.cf.ebitda=(S.rev-S.cost)*12;
R.ratios.grossMargin=(S.rev-S.cost)/S.rev*100;
R.ratios.efficiency=S.cost/S.rev*100;
// Break-even (monthly revenue to cover costs, assuming cost structure proportional)
const margin=1-(S.cost/S.rev);
if(margin>0)R.ratios.breakeven=S.cost/margin;
// Tax
if(S.tax){let t=.30;if(S.tax==='RESICO')t=.025;else if(S.tax==='PERSONA_FISICA')t=.35;
R.cf.tax=R.cf.ebitda>0?R.cf.ebitda*t:0;R.cf.fcff=R.cf.ebitda-R.cf.tax;
R.ratios.netMargin=R.cf.fcff/(S.rev*12)*100;
R.ratios.netProfit=R.cf.fcff;}
// Valuation
if(R.cf.fcff!==null&&S.industry){let rp=.06;
if(S.industry.includes('Restaurantes'))rp=.09;else if(S.industry.includes('Salud'))rp=.08;else if(S.industry.includes('Tecnología'))rp=.11;else if(S.industry.includes('Retail'))rp=.07;else if(S.industry.includes('Construcción'))rp=.10;else if(S.industry.includes('Agropecuario'))rp=.085;else if(S.industry.includes('Transporte'))rp=.09;
R.val.wacc=.06+rp;R.val.ev=R.cf.fcff>0?R.cf.fcff/R.val.wacc:0;
const g=.03;R.proj.y1=R.cf.fcff;R.proj.y2=R.cf.fcff*(1+g);R.proj.y3=R.cf.fcff*Math.pow(1+g,2);}
// Debt
if(S.loan>0&&R.cf.fcff!==null){const r=S.loanRate||.18,n=S.loanYears||3;
R.debt.pmt=(S.loan*r)/(1-Math.pow(1+r,-n));R.debt.dscr=R.cf.fcff/R.debt.pmt;
R.debt.interest=S.loan*(S.loanRate||.18);
R.amort=mkAmort(S.loan,r,n);
// New ratios requiring debt
R.ratios.roi=(R.cf.fcff-R.debt.pmt)/S.loan*100;
R.ratios.interestCoverage=R.debt.interest>0?R.cf.ebitda/R.debt.interest:null;
R.ratios.debtToIncome=R.debt.pmt/(S.rev*12)*100;
R.ratios.payback=R.cf.fcff>0?S.loan/R.cf.fcff:null;
R.ratios.breakevenMonths=R.cf.fcff>0?S.loan/((R.cf.fcff)/12):null;
if(R.val.ev&&R.val.ev>0)R.ratios.leverage=S.loan/R.val.ev*100;
// Update net profit after debt
R.ratios.netProfit=R.cf.fcff-R.debt.pmt;
}

// ===== SEGREGACIÓN DE COSTOS FIJOS VS VARIABLES & MARGEN DE CONTRIBUCIÓN =====
// Costos variables (mercancía/refacciones ~65% de costos) y fijos (renta, nómina, servicios ~35%)
const cvRatio = 0.65;
const variableCosts = S.cost * cvRatio;
const fixedCosts = S.cost * (1 - cvRatio);
const contributionMarginPct = S.rev > 0 ? ((S.rev - variableCosts) / S.rev) * 100 : 0;
const formalBreakevenRevenue = (contributionMarginPct > 0) ? (fixedCosts / (contributionMarginPct / 100)) : null;
R.ratios.contributionMargin = contributionMarginPct;
R.ratios.formalBreakeven = formalBreakevenRevenue;

// ===== CÁLCULO DE VAN (VALOR ACTUAL NETO) Y TIR (NEWTON-RAPHSON) =====
const I0 = (S.loan && S.loan > 0) ? S.loan : (S.cost * 3);
const cashFlows = [R.proj.y1, R.proj.y2, R.proj.y3].map(cf => Math.max(0, cf || 0));

if(R.val.wacc && cashFlows.length > 0){
    let npvValue = -I0;
    const k = R.val.wacc;
    for(let t = 0; t < cashFlows.length; t++){
        npvValue += cashFlows[t] / Math.pow(1 + k, t + 1);
    }
    R.val.van = npvValue;

    // TIR mediante método de Newton-Raphson
    function calculateIRR(initialInv, cfs, guess = 0.15){
        if(initialInv <= 0 || cfs.every(c => c <= 0)) return null;
        let r = guess;
        for(let iter = 0; iter < 100; iter++){
            let fVal = -initialInv;
            let fDeriv = 0;
            for(let t = 0; t < cfs.length; t++){
                const per = t + 1;
                const denom = Math.pow(1 + r, per);
                fVal += cfs[t] / denom;
                fDeriv -= (per * cfs[t]) / (denom * (1 + r));
            }
            if(Math.abs(fDeriv) < 1e-9) break;
            const nextR = r - (fVal / fDeriv);
            if(Math.abs(nextR - r) < 1e-6){
                return nextR * 100;
            }
            r = nextR;
        }
        return null;
    }
    R.val.tir = calculateIRR(I0, cashFlows);
}

return R;}
function mkAmort(p,r,n){const pmt=(p*r)/(1-Math.pow(1+r,-n));let b=p;const rows=[];for(let i=1;i<=n;i++){const int=b*r,cap=pmt-int;b-=cap;rows.push({y:i,pmt,int,cap,bal:Math.max(0,b)});}return{pmt,r,n,rows};}

function upDash(R){mSet('m-ebitda',R.cf.ebitda);mSet('m-ev',R.val.ev);
    // Actualizar métricas avanzadas VAN, TIR, Margen de Contribución y Punto de Equilibrio
    const vanEl = document.getElementById('m-van');
    if(vanEl && R.val.van !== null){
        vanEl.textContent = fmt(R.val.van);
        vanEl.className = 'text-xl font-bold mono ' + (R.val.van > 0 ? 'text-emerald-400' : 'text-rose-400');
    }
    const tirEl = document.getElementById('m-tir');
    if(tirEl && R.val.tir !== null){
        tirEl.textContent = R.val.tir.toFixed(1) + '%';
        tirEl.className = 'text-xl font-bold mono ' + (R.val.tir > 15 ? 'text-emerald-400' : R.val.tir > 8 ? 'text-amber-400' : 'text-rose-400');
    } else if(tirEl) {
        tirEl.textContent = '—';
    }
    const mcEl = document.getElementById('m-mc');
    if(mcEl && R.ratios.contributionMargin !== null){
        mcEl.textContent = R.ratios.contributionMargin.toFixed(1) + '%';
        mcEl.className = 'text-xl font-bold mono ' + (R.ratios.contributionMargin > 30 ? 'text-purple-400' : 'text-slate-300');
    }
    const peEl = document.getElementById('m-pe');
    if(peEl && R.ratios.formalBreakeven !== null){
        peEl.textContent = fmt(R.ratios.formalBreakeven);
    }if(S.rev&&S.cost){const mg=((S.rev-S.cost)/S.rev*100);const el=document.getElementById('m-margin');el.textContent=mg.toFixed(1)+'%';el.className='text-xl font-bold mono '+(mg>20?'text-emerald-400':mg>10?'text-amber-400':'text-rose-400');document.getElementById('donutC').textContent=mg.toFixed(0)+'%';donut.data.datasets[0].data=[S.cost,S.rev-S.cost];donut.data.datasets[0].backgroundColor=['#ef4444','#0ea5e9'];donut.update();}if(R.debt.dscr!==null&&S.loan>0){const pb=R.cf.fcff>0?S.loan/R.cf.fcff:99;const el=document.getElementById('m-payback');el.textContent=pb>0&&pb<50?pb.toFixed(1)+' años':'—';el.className='text-xl font-bold mono '+(pb<4?'text-emerald-400':pb<7?'text-amber-400':'text-rose-400');}if(R.proj.y1!==null){bars.data.datasets[0].data=[R.proj.y1,R.proj.y2,R.proj.y3];bars.data.datasets[1].data=R.debt.pmt?[R.debt.pmt,R.debt.pmt,R.debt.pmt]:[0,0,0];bars.update();}if(R.debt.dscr!==null){const cl=Math.min(Math.max(R.debt.dscr,0),3),pct=(cl/3)*100;document.getElementById('garc').style.strokeDasharray=pct+',100';document.getElementById('garc').style.stroke=R.debt.dscr>1.25?'#10b981':R.debt.dscr>=1?'#f59e0b':'#ef4444';document.getElementById('gVal').textContent=R.debt.dscr.toFixed(2);document.getElementById('gVal').className='text-2xl font-bold mono '+(R.debt.dscr>1.25?'text-emerald-400':R.debt.dscr>=1?'text-amber-400':'text-rose-400');document.getElementById('gLbl').textContent=R.debt.dscr>1.25?'Saludable':R.debt.dscr>=1?'Ajustado':'Riesgo Alto';document.getElementById('gLbl').className='mt-3 text-[10px] font-bold uppercase tracking-wider '+(R.debt.dscr>1.25?'text-emerald-400':R.debt.dscr>=1?'text-amber-400':'text-rose-400');}if(R.amort){let h=`<table class="w-full text-[12px]"><thead><tr class="text-left text-slate-400 border-b border-slate-700/60"><th class="py-2 px-3">Año</th><th class="py-2 px-3 text-right">Pago</th><th class="py-2 px-3 text-right">Intereses</th><th class="py-2 px-3 text-right">Capital</th><th class="py-2 px-3 text-right">Saldo</th></tr></thead><tbody>`;R.amort.rows.forEach(r=>{h+=`<tr class="border-b border-slate-800/40 hover:bg-slate-800/30"><td class="py-2 px-3 text-slate-300">${r.y}</td><td class="py-2 px-3 text-right mono">${fmt(r.pmt)}</td><td class="py-2 px-3 text-right mono text-rose-400">${fmt(r.int)}</td><td class="py-2 px-3 text-right mono text-sky-400">${fmt(r.cap)}</td><td class="py-2 px-3 text-right mono">${fmt(r.bal)}</td></tr>`;});h+='</tbody></table>';document.getElementById('amTbl').innerHTML=h;}}
// Razones panel update
let radarChart;
function initRadar(){if(radarChart)radarChart.destroy();radarChart=new Chart(document.getElementById('cRadar'),{type:'radar',data:{labels:['Margen Bruto','Margen Neto','Eficiencia','DSCR','ROI','Cobertura Int.'],datasets:[{label:'Tu Negocio',data:[0,0,0,0,0,0],backgroundColor:'rgba(14,165,233,.15)',borderColor:'rgba(14,165,233,.7)',pointBackgroundColor:'#0ea5e9',pointRadius:4,borderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{r:{beginAtZero:true,max:100,ticks:{display:false,stepSize:25},grid:{color:'rgba(51,65,85,.4)'},pointLabels:{color:'#94a3b8',font:{size:10}}}}}});}
initRadar();

// Render KaTeX formulas
function renderFormulas(){
    const formulas = {
        'f-gm':   '\\text{Margen Bruto} = \\frac{\\text{Ventas} - \\text{Costos}}{\\text{Ventas}} \\times 100',
        'f-nm':   '\\text{Margen Neto} = \\frac{\\text{FCFF}}{\\text{Ventas Anuales}} \\times 100',
        'f-np':   '\\text{Utilidad Neta} = \\text{FCFF} - \\text{Cuota Anual}',
        'f-roi':  '\\text{ROI} = \\frac{\\text{FCFF} - \\text{PMT}}{\\text{Inversión}} \\times 100',
        'f-be':   '\\text{P. Equilibrio} = \\frac{\\text{Costos Fijos}}{1 - \\dfrac{\\text{Costos Variables}}{\\text{Ventas}}}',
        'f-bem':  '\\text{Meses} = \\frac{\\text{Inversión}}{\\text{FCFF Mensual}}',
        'f-eff':  '\\text{Eficiencia} = \\frac{\\text{Costos Operativos}}{\\text{Ventas}} \\times 100',
        'f-ebitda':'\\text{EBITDA} = (\\text{Ventas}_{\\text{mes}} - \\text{Costos}_{\\text{mes}}) \\times 12',
        'f-ev':   'EV = \\frac{\\text{FCFF}}{\\text{WACC}}',
        'f-dscr': '\\text{DSCR} = \\frac{\\text{FCFF}}{\\text{Cuota Anual (PMT)}}',
        'f-icr':  '\\text{ICR} = \\frac{\\text{EBITDA}}{\\text{Intereses Anuales}}',
        'f-dti':  '\\text{D/I} = \\frac{\\text{PMT}}{\\text{Ventas Anuales}} \\times 100',
        'f-lev':  '\\text{Apalancamiento} = \\frac{\\text{Deuda Total}}{\\text{Valor Empresarial}} \\times 100',
        'f-pay':  '\\text{Payback} = \\frac{\\text{Inversión}}{\\text{FCFF Anual}}',
        'f-pmt':  '\\text{PMT} = \\frac{P \\cdot r}{1 - (1 + r)^{-n}}'
    };
    for(const [id,tex] of Object.entries(formulas)){
        const el=document.getElementById(id);
        if(el)try{katex.render(tex,el,{displayMode:false,throwOnError:false});}catch(e){}
    }
}
renderFormulas();

function upRatios(R){
    const ra=R.ratios;
    function rSet(id,v,sfx,good,bad){const el=document.getElementById(id);if(v===null||isNaN(v)){el.textContent='—';el.className='text-lg font-bold mono text-slate-600';return;}
    el.textContent=(sfx==='$'?fmt(v):v.toFixed(1)+sfx);el.className='text-lg font-bold mono '+(v>=good?'text-emerald-400':v>=bad?'text-amber-400':'text-rose-400');}
    rSet('r-gm',ra.grossMargin,'%',20,10);
    rSet('r-nm',ra.netMargin,'%',15,5);
    const npEl=document.getElementById('r-np');
    if(ra.netProfit!==null){npEl.textContent=fmt(ra.netProfit);npEl.className='text-lg font-bold mono '+(ra.netProfit>0?'text-emerald-400':'text-rose-400');}
    rSet('r-roi',ra.roi,'%',15,0);
    const beEl=document.getElementById('r-be');
    if(ra.breakeven!==null){beEl.textContent=fmt(ra.breakeven)+'/mes';beEl.className='text-lg font-bold mono text-sky-400';}
    rSet('r-bem',ra.breakevenMonths,' meses',999,0);
    rSet('r-dscr',R.debt.dscr,'x',1.25,1);
    rSet('r-icr',ra.interestCoverage,'x',3,1.5);
    rSet('r-dti',ra.debtToIncome,'%',999,30);
    const dtiEl=document.getElementById('r-dti');if(ra.debtToIncome!==null){dtiEl.className='text-lg font-bold mono '+(ra.debtToIncome<20?'text-emerald-400':ra.debtToIncome<35?'text-amber-400':'text-rose-400');}
    rSet('r-lev',ra.leverage,'%',999,50);
    const levEl=document.getElementById('r-lev');if(ra.leverage!==null){levEl.className='text-lg font-bold mono '+(ra.leverage<40?'text-emerald-400':ra.leverage<70?'text-amber-400':'text-rose-400');}
    rSet('r-pay',ra.payback,' años',999,0);
    const payEl=document.getElementById('r-pay');if(ra.payback!==null){payEl.className='text-lg font-bold mono '+(ra.payback<4?'text-emerald-400':ra.payback<7?'text-amber-400':'text-rose-400');}
    const effEl=document.getElementById('r-eff');if(ra.efficiency!==null){effEl.textContent=ra.efficiency.toFixed(1)+'%';effEl.className='text-lg font-bold mono '+(ra.efficiency<70?'text-emerald-400':ra.efficiency<85?'text-amber-400':'text-rose-400');}
    // Radar
    const norm=(v,max)=>v===null?0:Math.min(Math.max(v/max*100,0),100);
    radarChart.data.datasets[0].data=[norm(ra.grossMargin,50),norm(ra.netMargin,40),norm(100-ra.efficiency,60),norm(R.debt.dscr,3)*1,norm(ra.roi,50),norm(ra.interestCoverage,8)];
    radarChart.update();
    // Extra cards
    mSet('r-ebitda2',R.cf.ebitda);mSet('r-ev2',R.val.ev);
    if(R.debt.pmt!==null){const pmtEl=document.getElementById('r-pmt');pmtEl.textContent=fmt(R.debt.pmt);pmtEl.className='text-lg font-bold mono text-sky-400';}
}
function mSet(id,v){const el=document.getElementById(id);if(v!==null){el.textContent=fmt(v);el.className='text-xl font-bold mono text-emerald-400';}else{el.textContent='—';el.className='text-xl font-bold mono text-slate-600';}}
function upQ(){const fs=[{k:'rev',l:'Ventas'},{k:'cost',l:'Costos'},{k:'tax',l:'Fiscal'},{k:'industry',l:'Giro'}];let f=fs.filter(x=>S[x.k]!==null).length;const p=(f/4)*100;document.getElementById('qBar').style.width=p+'%';document.getElementById('qBar').className='h-full fill '+(p<50?'bg-rose-500':p<100?'bg-amber-400':'bg-emerald-500');document.getElementById('qTxt').textContent=p+'%';document.getElementById('qTxt').className='text-[11px] mono font-bold w-10 text-right '+(p<50?'text-rose-400':p<100?'text-amber-400':'text-emerald-400');document.getElementById('qDots').innerHTML=fs.map(x=>`<span class="w-2.5 h-2.5 rounded-full ${S[x.k]!==null?'bg-emerald-500':'bg-slate-700'}" title="${x.l}"></span>`).join('');}

function narrate(R){let h='',miss=[];if(R.cf.ebitda!==null){const mg=((S.rev-S.cost)/S.rev*100);h+=`Ventas: <b>${fmt(S.rev)}/mes</b> · Costos: <b>${fmt(S.cost)}/mes</b><br><b>EBITDA anual: ${fmt(R.cf.ebitda)}</b>`;h+=exp("EBITDA","Lo que te queda después de pagar costos del día a día, antes de impuestos y deudas.");if(mg<15)h+=`<div class="suggest text-amber-400"><i data-lucide="alert-triangle" class="w-4 h-4 mt-0.5 shrink-0"></i><div><b>Margen bajo (${mg.toFixed(1)}%).</b> De cada $100, solo quedan $${mg.toFixed(0)}.</div></div>`;else h+=`<div class="suggest text-emerald-400"><i data-lucide="trending-up" class="w-4 h-4 mt-0.5 shrink-0"></i><div><b>Buen margen (${mg.toFixed(1)}%).</b></div></div>`;}else{h+='⚠️ Necesito ventas y costos para calcular.<br>';}
if(R.val.ev!==null){h+=`Régimen: <b>${S.tax}</b> · Sector: <b>${S.industry}</b> · WACC: ${(R.val.wacc*100).toFixed(1)}%<br><div class="my-3 grid grid-cols-2 gap-2"><div class="bg-slate-800/40 rounded-xl p-3 text-center border border-slate-700/30"><div class="text-[9px] text-slate-500 uppercase font-bold">FCFF</div><div class="text-lg font-bold mono text-sky-400 mt-1">${fmt(R.cf.fcff)}</div></div><div class="bg-slate-800/40 rounded-xl p-3 text-center border border-slate-700/30"><div class="text-[9px] text-slate-500 uppercase font-bold">Valor Empresarial</div><div class="text-lg font-bold mono text-emerald-400 mt-1">${fmt(R.val.ev)}</div></div></div>`;h+=exp("Valor Empresarial","Cuánto vale tu negocio hoy, basado en el flujo libre de caja descontado por el riesgo de tu industria.");}else if(R.cf.ebitda!==null){h+=`<div class="p-3 bg-rose-500/8 border border-rose-500/15 rounded-xl text-[12px] text-rose-200 my-3"><i data-lucide="lock" class="inline w-3.5 h-3.5 text-rose-400"></i> <b>Bloqueado</b> — Falta régimen fiscal y giro.</div>`;}
if(R.debt.dscr!==null){const c=R.debt.dscr>1.25?'emerald':R.debt.dscr>=1?'amber':'rose';h+=`<div class="my-3 p-3 rounded-xl border border-${c}-500/25 bg-${c}-500/8"><b>Crédito ${fmt(S.loan)}</b> · Cuota: ${fmt(R.debt.pmt)}/año · DSCR: <b>${R.debt.dscr.toFixed(2)}</b> ${R.debt.dscr>1.25?'<span class="text-emerald-400">(Viable)</span>':R.debt.dscr>=1?'<span class="text-amber-400">(Ajustado)</span>':'<span class="text-rose-400">(Insuficiente)</span>'}</div>`;h+=exp("DSCR","Cuántas veces tu flujo cubre la cuota. >1.25 = bien. <1 = no alcanza.");if(R.debt.dscr<1)h+=`<div class="suggest text-rose-400"><i data-lucide="shield-alert" class="w-4 h-4 mt-0.5 shrink-0"></i><div><b>Urgente:</b> Flujo insuficiente. Pide menos, a más plazo, o busca socio.</div></div>`;}
// NEW: Additional Financial Ratios narrative
const ra=R.ratios;
if(ra.grossMargin!==null){
    h+=`<div class="mt-3 mb-1"><span class="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Razones Financieras Calculadas</span></div>`;
    h+=`<div class="my-2 grid grid-cols-3 gap-2">`;
    if(ra.breakeven!==null)h+=`<div class="bg-slate-800/40 rounded-lg p-2.5 text-center border border-slate-700/30"><div class="text-[8px] text-slate-500 uppercase font-bold">Punto de Equilibrio</div><div class="text-sm font-bold mono text-sky-400 mt-1">${fmt(ra.breakeven)}/mes</div></div>`;
    if(ra.netMargin!==null)h+=`<div class="bg-slate-800/40 rounded-lg p-2.5 text-center border border-slate-700/30"><div class="text-[8px] text-slate-500 uppercase font-bold">Margen Neto</div><div class="text-sm font-bold mono ${ra.netMargin>15?'text-emerald-400':'text-amber-400'} mt-1">${ra.netMargin.toFixed(1)}%</div></div>`;
    if(ra.roi!==null)h+=`<div class="bg-slate-800/40 rounded-lg p-2.5 text-center border border-slate-700/30"><div class="text-[8px] text-slate-500 uppercase font-bold">ROI</div><div class="text-sm font-bold mono ${ra.roi>0?'text-emerald-400':'text-rose-400'} mt-1">${ra.roi.toFixed(1)}%</div></div>`;
    if(ra.interestCoverage!==null)h+=`<div class="bg-slate-800/40 rounded-lg p-2.5 text-center border border-slate-700/30"><div class="text-[8px] text-slate-500 uppercase font-bold">Cobertura Int.</div><div class="text-sm font-bold mono ${ra.interestCoverage>3?'text-emerald-400':ra.interestCoverage>1.5?'text-amber-400':'text-rose-400'} mt-1">${ra.interestCoverage.toFixed(1)}x</div></div>`;
    if(ra.leverage!==null)h+=`<div class="bg-slate-800/40 rounded-lg p-2.5 text-center border border-slate-700/30"><div class="text-[8px] text-slate-500 uppercase font-bold">Apalancamiento</div><div class="text-sm font-bold mono ${ra.leverage<40?'text-emerald-400':ra.leverage<70?'text-amber-400':'text-rose-400'} mt-1">${ra.leverage.toFixed(1)}%</div></div>`;
    if(ra.efficiency!==null)h+=`<div class="bg-slate-800/40 rounded-lg p-2.5 text-center border border-slate-700/30"><div class="text-[8px] text-slate-500 uppercase font-bold">Eficiencia Op.</div><div class="text-sm font-bold mono ${ra.efficiency<70?'text-emerald-400':ra.efficiency<85?'text-amber-400':'text-rose-400'} mt-1">${ra.efficiency.toFixed(1)}%</div></div>`;
    h+=`</div>`;
    h+=exp("Punto de Equilibrio","Es el monto mínimo que necesitas vender al mes para que no pierdas dinero. Si vendes menos que esto, tu negocio está perdiendo. Si vendes más, ya hay ganancia.");
    if(ra.roi!==null)h+=exp("ROI (Retorno de Inversión)","Por cada peso que inviertes (o pides prestado), ¿cuánto te regresa al año? Un ROI del 15% significa que por cada $100 invertidos, ganas $15 extras después de pagar todo.");
    if(ra.interestCoverage!==null&&ra.interestCoverage<2)h+=`<div class="suggest text-amber-400"><i data-lucide="alert-triangle" class="w-4 h-4 mt-0.5 shrink-0"></i><div><b>Cobertura de intereses baja (${ra.interestCoverage.toFixed(1)}x):</b> Tu EBITDA apenas cubre los intereses del crédito. Lo ideal es que sea mayor a 3x para tener margen de seguridad.</div></div>`;
    h+=`<div class="text-[11px] text-slate-500 mt-1">Consulta todas las razones en la pestaña <b>"Razones"</b> del panel derecho.</div>`;
}
if(S.tax===null)miss.push('¿<b>Régimen fiscal</b>? (RESICO, Persona Moral, Física) <button onclick="triggerGemmaFiscalPrompt()" class="ml-1.5 px-2 py-0.5 rounded bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-[10px] font-bold border border-indigo-500/30 inline-flex items-center gap-1 cursor-pointer transition"><i data-lucide="sparkles" class="w-3 h-3 text-indigo-400"></i>Recomendar con Gemma 4</button>');if(S.industry===null)miss.push('¿<b>Giro del negocio</b>?');if(S.loan===null)miss.push('¿Buscas <b>crédito</b>?');
if(miss.length>0){h+=`<div class="mt-4 p-4 border border-sky-500/25 bg-sky-500/6 rounded-xl"><span class="text-sky-300 font-bold text-[10px] uppercase tracking-wider">Para continuar:</span><ul class="list-disc pl-4 mt-2 text-[12.5px] text-sky-100 space-y-1">${miss.map(q=>`<li>${q}</li>`).join('')}</ul></div>`;setTimeout(()=>{const hs=[];if(!S.tax&&!S.industry)hs.push({l:'Clínica + Persona Moral + 2.5M',t:'Tengo una clínica médica, tributo como persona moral y quiero un crédito de 2.5 millones.'});else if(!S.loan)hs.push({l:'Crédito 1M a 5 años',t:'Quiero un crédito de 1 millón a 5 años.'});if(hs.length)setHints(hs);},150);}else{h+=`<div class="mt-4 text-emerald-400 font-bold text-[13px] flex items-center gap-2"><i data-lucide="check-circle-2" class="w-5 h-5"></i>Perfil al 100%.</div>`;setTimeout(()=>setHints([{l:'¿Si vendo 20% menos?',t:'¿Qué pasa si mis ventas bajan un 20%?'},{l:'¿Si vendo 30% más?',t:'¿Qué pasa si mis ventas suben un 30%?'}]),150);}return h;}
function exp(t,d){return`<div class="explain"><span class="text-sky-400 font-semibold flex items-center gap-1.5 mb-0.5"><i data-lucide="book-open" class="w-3.5 h-3.5"></i>${t}</span>${d}</div>`;}
function advStep(){stepN++;for(let i=1;i<=4;i++){const el=document.getElementById('s'+i);if(!el)continue;const dot=el.querySelector('span');if(i<=stepN){el.classList.remove('text-slate-600');el.classList.add('text-sky-400');if(dot){dot.classList.remove('bg-slate-700','text-slate-400');dot.classList.add('bg-sky-500','text-white');}}}}
function saveAdv(R){let db=JSON.parse(localStorage.getItem('cfo_adv')||'{"sessions":[]}');db.sessions.push({ts:new Date().toISOString(),inputs:{...S},results:R});localStorage.setItem('cfo_adv',JSON.stringify(db));}
function exportAdvisorDB(){let db=JSON.parse(localStorage.getItem('cfo_adv')||'{"sessions":[]}');dl(db,'cfo_copilot_database.json');toast('db-toast');}



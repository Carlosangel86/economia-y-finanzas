// =====================================================================
// MOTOR CONTABLE, FINANCIERO Y PROYECCIONES (finance.js)
// CFO Copilot + Punto de Venta
// =====================================================================

Chart.defaults.color = '#475569';
Chart.defaults.font.family = 'Inter';

// --- 1. INICIALIZACIÓN DE GRÁFICAS FINANCIERAS ---
function initCharts(){
    donut=new Chart(document.getElementById('cDonut'),{type:'doughnut',data:{labels:['Costos','Ganancia'],datasets:[{data:[1,0],backgroundColor:['#1e293b','#0f172a'],borderWidth:0,borderRadius:5}]},options:{cutout:'74%',plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>c.label+': '+fmt(c.raw)}}},responsive:true,maintainAspectRatio:false}});
    bars=new Chart(document.getElementById('cBars'),{type:'bar',data:{labels:['Año 1','Año 2','Año 3'],datasets:[{label:'Flujo Libre',data:[0,0,0],backgroundColor:'rgba(14,165,233,.55)',borderRadius:8,borderSkipped:false},{label:'Deuda',data:[0,0,0],backgroundColor:'rgba(244,63,94,.4)',borderRadius:8,borderSkipped:false}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{font:{size:9},boxWidth:10}}},scales:{x:{grid:{display:false},border:{display:false}},y:{ticks:{callback:v=>fmtS(v)},grid:{color:'rgba(51,65,85,.4)'},border:{display:false}}}}});
}

function initRadar(){if(radarChart)radarChart.destroy();radarChart=new Chart(document.getElementById('cRadar'),{type:'radar',data:{labels:['Margen Bruto','Margen Neto','Eficiencia','DSCR','ROI','Cobertura Int.'],datasets:[{label:'Tu Negocio',data:[0,0,0,0,0,0],backgroundColor:'rgba(14,165,233,.15)',borderColor:'rgba(14,165,233,.7)',pointBackgroundColor:'#0ea5e9',pointRadius:4,borderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{r:{beginAtZero:true,max:100,ticks:{display:false,stepSize:25},grid:{color:'rgba(51,65,85,.4)'},pointLabels:{color:'#94a3b8',font:{size:10}}}}}});}

// --- 2. MOTOR DE CÁLCULO FINANCIERO, VAN, TIR Y PUNTO DE EQUILIBRIO ---
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

// --- 3. TABLA DE AMORTIZACIÓN DE DEUDA ---
function mkAmort(p,r,n){const pmt=(p*r)/(1-Math.pow(1+r,-n));let b=p;const rows=[];for(let i=1;i<=n;i++){const int=b*r,cap=pmt-int;b-=cap;rows.push({y:i,pmt,int,cap,bal:Math.max(0,b)});}return{pmt,r,n,rows};}

// --- 4. ACTUALIZACIÓN DEL DASHBOARD Y RAZONES FINANCIERAS ---
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

// --- 5. RENDERIZADO DE FÓRMULAS LATEX (KATEX) ---
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


// --- 6. ACTUALIZACIÓN DE INDICADORES Y RAZONES ---
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

// --- 7. NARRATIVA Y EXPLICACIONES DIDÁCTICAS ---
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

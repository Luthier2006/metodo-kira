const performanceMetrics = [
  ["concentration","Concentração"],["energy","Energia percebida"],
  ["learning","Facilidade de aprendizagem"],["execution","Execução de habilidades"],
  ["consistency","Consistência"]
];
const behaviorMetrics = [
  ["impulsivity","Impulsividade percebida"],["urges","Intensidade das vontades"],
  ["decisionControl","Controle das decisões"],["stability","Estabilidade emocional percebida"]
];
const $ = id => document.getElementById(id);
const todayISO = () => {
  const d = new Date(); d.setMinutes(d.getMinutes()-d.getTimezoneOffset());
  return d.toISOString().slice(0,10);
};
const fmtDate = iso => new Date(iso+"T12:00:00").toLocaleDateString("pt-BR");
let records = Storage.read();

function buildRanges(target, metrics, group) {
  $(target).innerHTML = metrics.map(([key,label]) => `
    <div class="range-item">
      <label for="${group}-${key}">${label}</label>
      <input id="${group}-${key}" type="range" min="0" max="10" step="1" value="5" data-group="${group}" data-key="${key}">
      <output class="range-number" id="out-${group}-${key}">5</output>
    </div>`).join("");
  $(target).querySelectorAll('input[type="range"]').forEach(input => {
    input.addEventListener("input", () => $(`out-${group}-${input.dataset.key}`).textContent = input.value);
  });
}
function resetForm(date=todayISO()) {
  $("dailyForm").reset();
  $("entryDate").value = date;
  [...performanceMetrics,...behaviorMetrics].forEach(([key],i) => {
    const group = i < performanceMetrics.length ? "performance" : "behavior";
    const input = $(`${group}-${key}`);
    input.value = 5; $(`out-${group}-${key}`).textContent = "5";
  });
  $("entryStatus").textContent = "NOVO REGISTRO";
  $("formMessage").textContent = "";
}
function loadDate(date) {
  const record = records.find(r=>r.date===date);
  resetForm(date);
  if (!record) return;
  performanceMetrics.forEach(([key]) => setRange("performance",key,record.performance[key]));
  behaviorMetrics.forEach(([key]) => setRange("behavior",key,record.behavior[key]));
  $("sleepHours").value = record.context?.sleepHours ?? "";
  $("stressLevel").value = record.context?.stressLevel ?? "";
  $("notes").value = record.notes || "";
  $("entryStatus").textContent = "EDITANDO REGISTRO";
}
function setRange(group,key,value) {
  const input = $(`${group}-${key}`); input.value = value;
  $(`out-${group}-${key}`).textContent = value;
}
function readForm() {
  const performance = {}, behavior = {};
  performanceMetrics.forEach(([key])=>performance[key]=Number($(`performance-${key}`).value));
  behaviorMetrics.forEach(([key])=>behavior[key]=Number($(`behavior-${key}`).value));
  const sleep = $("sleepHours").value, stress = $("stressLevel").value;
  return {date:$("entryDate").value, performance, behavior,
    context:{sleepHours:sleep===""?null:Number(sleep),stressLevel:stress===""?null:Number(stress)},
    notes:$("notes").value.trim(), updatedAt:new Date().toISOString()};
}
function render() {
  records = Storage.read();
  const summary = Statistics.summary(records);
  $("totalEntries").textContent = summary.total;
  $("performanceAverage").textContent = summary.performance===null?"—":summary.performance.toFixed(1)+"/10";
  $("impulseAverage").textContent = summary.impulsivity===null?"—":summary.impulsivity.toFixed(1)+"/10";
  $("streakCount").textContent = summary.streak;
  const prediction = Predictions.estimate(records);
  $("predictionValue").innerHTML = prediction.value===null?'—<small>/10</small>':`${prediction.value.toFixed(1)}<small>/10</small>`;
  $("predictionText").textContent = prediction.text;
  $("predictionBasis").textContent = prediction.basis;
  renderHistory(); drawChart();
}
function renderHistory() {
  const body = $("historyBody");
  if (!records.length) {
    body.innerHTML = '<tr><td colspan="6" class="empty-state">Nenhum registro ainda. Seu histórico aparecerá aqui.</td></tr>'; return;
  }
  body.innerHTML = [...records].reverse().map(r=>`
    <tr>
      <td>${fmtDate(r.date)}</td>
      <td><strong>${Statistics.round(Statistics.performanceScore(r)).toFixed(1)}/10</strong></td>
      <td>${Number(r.behavior.impulsivity).toFixed(0)}/10</td>
      <td>${r.context?.sleepHours==null?"—":r.context.sleepHours+" h"}</td>
      <td>${escapeHTML(r.notes||"—").slice(0,70)}</td>
      <td><button class="row-action" data-edit="${r.date}" type="button">Editar</button><button class="row-action" data-delete="${r.date}" type="button" aria-label="Apagar registro">×</button></td>
    </tr>`).join("");
  body.querySelectorAll("[data-edit]").forEach(btn=>btn.addEventListener("click",()=>{loadDate(btn.dataset.edit);window.scrollTo({top:0,behavior:"smooth"});}));
  body.querySelectorAll("[data-delete]").forEach(btn=>btn.addEventListener("click",()=>{
    if(confirm(`Apagar o registro de ${fmtDate(btn.dataset.delete)}?`)){Storage.remove(btn.dataset.delete);render();resetForm();}
  }));
}
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
}
function drawChart() {
  const canvas=$("trendChart"), ctx=canvas.getContext("2d");
  const rect=canvas.getBoundingClientRect(), dpr=window.devicePixelRatio||1;
  canvas.width=Math.max(300,rect.width)*dpr; canvas.height=190*dpr;
  ctx.scale(dpr,dpr);
  const w=canvas.width/dpr,h=190,pad={l:28,r:12,t:14,b:27};
  ctx.clearRect(0,0,w,h);
  ctx.font="9px Inter, sans-serif"; ctx.fillStyle="#858075"; ctx.strokeStyle="#292929"; ctx.lineWidth=1;
  for(let n=0;n<=10;n+=5){const y=pad.t+(10-n)/10*(h-pad.t-pad.b);ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(w-pad.r,y);ctx.stroke();ctx.fillText(n,y-4<9?9:y-4, y-4);}
  const data=Statistics.recent(records,7);
  const x=i=>data.length<2?(w+pad.l-pad.r)/2:pad.l+i/(data.length-1)*(w-pad.l-pad.r);
  const y=v=>pad.t+(10-v)/10*(h-pad.t-pad.b);
  const line=(values,color)=>{if(!values.length)return;ctx.beginPath();values.forEach((v,i)=>i?ctx.lineTo(x(i),y(v)):ctx.moveTo(x(i),y(v)));ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke();values.forEach((v,i)=>{ctx.beginPath();ctx.arc(x(i),y(v),3,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();});};
  line(data.map(Statistics.performanceScore),"#c6a45b");
  line(data.map(Statistics.behaviorScore),"#b76a62");
  ctx.fillStyle="#858075";ctx.textAlign="center";
  data.forEach((r,i)=>ctx.fillText(fmtDate(r.date).slice(0,5),x(i),h-7));
}
$("dailyForm").addEventListener("submit",event=>{
  event.preventDefault();
  if(!$("entryDate").value){$("formMessage").textContent="Escolha uma data.";return;}
  const record=readForm(); records=Storage.upsert(record); render();
  $("formMessage").textContent="Registro salvo neste dispositivo.";
  $("entryStatus").textContent="REGISTRO SALVO";
});
$("entryDate").addEventListener("change",e=>loadDate(e.target.value));
$("clearFormBtn").addEventListener("click",()=>resetForm($("entryDate").value||todayISO()));
$("exportBtn").addEventListener("click",Storage.exportJSON);
$("importBtn").addEventListener("click",()=>$("importFile").click());
$("importFile").addEventListener("change",async e=>{
  const file=e.target.files[0]; if(!file)return;
  try{records=await Storage.importJSON(file);render();$("formMessage").textContent="Backup importado e mesclado ao histórico."; }
  catch(err){alert("Não foi possível importar: "+err.message);}
  e.target.value="";
});
$("deleteAllBtn").addEventListener("click",()=>{
  if(confirm("Isso apagará todos os registros salvos neste navegador. Você exportou um backup, se quiser guardá-los?")){
    Storage.clear();render();resetForm();$("formMessage").textContent="Histórico apagado.";
  }
});
$("todayLabel").textContent=new Date().toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"long"});
buildRanges("performanceFields",performanceMetrics,"performance");
buildRanges("behaviorFields",behaviorMetrics,"behavior");
$("entryDate").value=todayISO();
loadDate(todayISO());
render();
window.addEventListener("resize",drawChart);

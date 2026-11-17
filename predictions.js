/* Projeção conservadora: média recente + tendência linear suavizada. */
const Predictions = (() => {
  function estimate(records) {
    const sample = Statistics.recent(records, 7);
    if (!sample.length) return {value:null, text:"Registre seus primeiros dias para começar a observar tendências.", basis:"Aguardando dados"};
    const scores = sample.map(Statistics.performanceScore).filter(Number.isFinite);
    const mean = Statistics.avg(scores);
    if (scores.length < 3) return {value:Statistics.round(mean), text:"Ainda há poucos registros. Esta é apenas a média inicial; não há base suficiente para estimar uma tendência.", basis:`${scores.length} de 3 registros mínimos`};
    const first = Statistics.avg(scores.slice(0, Math.ceil(scores.length/2)));
    const last = Statistics.avg(scores.slice(Math.floor(scores.length/2)));
    const trend = (last-first) * 0.25;
    const value = Math.max(0, Math.min(10, mean + trend));
    let direction = "relativamente estável";
    if (trend > .25) direction = "com leve tendência de alta";
    if (trend < -.25) direction = "com leve tendência de baixa";
    return {value:Statistics.round(value), text:`Seu desempenho recente está ${direction}. Use a estimativa como referência para planejar tarefas, não como garantia de como você estará amanhã.`, basis:`Média e tendência de ${scores.length} registros recentes`};
  }
  return {estimate};
})();

/* Médias e estatísticas descritivas; não fazem diagnóstico. */
const Statistics = (() => {
  const avg = values => values.length ? values.reduce((a,b)=>a+b,0)/values.length : null;
  const round = n => Math.round(n*10)/10;
  const performanceScore = r => avg(Object.values(r.performance).map(Number));
  const behaviorScore = r => Number(r.behavior.impulsivity);
  const recent = (records, count=7) => records.slice(-count);
  const summary = records => {
    const p = records.map(performanceScore).filter(Number.isFinite);
    const b = records.map(behaviorScore).filter(Number.isFinite);
    let streak = 0;
    const dates = new Set(records.map(r=>r.date));
    const cursor = new Date(); cursor.setHours(12,0,0,0);
    while (dates.has(cursor.toISOString().slice(0,10))) { streak++; cursor.setDate(cursor.getDate()-1); }
    return {total:records.length, performance:avg(p), impulsivity:avg(b), streak};
  };
  return {avg, round, performanceScore, behaviorScore, recent, summary};
})();

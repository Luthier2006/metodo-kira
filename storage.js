/* Armazenamento local + exportação/importação de backup. */
const Storage = (() => {
  const KEY = "metodoKira.records.v1";
  const read = () => {
    try {
      const value = JSON.parse(localStorage.getItem(KEY) || "[]");
      return Array.isArray(value) ? value : [];
    } catch { return []; }
  };
  const write = records => localStorage.setItem(KEY, JSON.stringify(records));
  const upsert = record => {
    const records = read();
    const index = records.findIndex(item => item.date === record.date);
    if (index >= 0) records[index] = record;
    else records.push(record);
    records.sort((a,b) => a.date.localeCompare(b.date));
    write(records);
    return records;
  };
  const remove = date => {
    const records = read().filter(item => item.date !== date);
    write(records);
    return records;
  };
  const clear = () => { localStorage.removeItem(KEY); };
  const exportJSON = () => {
    const payload = { app: "Metodo Kira MK-SAP", version: 1, exportedAt: new Date().toISOString(), records: read() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `metodo-kira-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click(); URL.revokeObjectURL(url);
  };
  const importJSON = async file => {
    const parsed = JSON.parse(await file.text());
    const incoming = Array.isArray(parsed) ? parsed : parsed.records;
    if (!Array.isArray(incoming)) throw new Error("O arquivo não contém uma lista válida de registros.");
    const valid = incoming.filter(r => r && /^\d{4}-\d{2}-\d{2}$/.test(r.date) && r.performance && r.behavior);
    if (!valid.length && incoming.length) throw new Error("Nenhum registro válido foi encontrado.");
    const merged = new Map(read().map(r => [r.date, r]));
    valid.forEach(r => merged.set(r.date, r));
    const records = [...merged.values()].sort((a,b) => a.date.localeCompare(b.date));
    write(records);
    return records;
  };
  return {read, upsert, remove, clear, exportJSON, importJSON};
})();

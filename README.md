# Método Kira — MK-SAP (versão 1.0)

Aplicação web estática para registrar indicadores pessoais de desempenho e comportamento, visualizar histórico e acompanhar tendências simples.

## Como executar
1. Extraia a pasta `metodo-kira`.
2. Abra `index.html` em um navegador moderno.
3. Para publicar, envie os arquivos ao GitHub e conecte o repositório ao Vercel.

Não é necessário instalar dependências nem executar um servidor para a versão inicial.

## Funcionalidades
- Registro diário por data (um registro por dia; salvar novamente edita aquele dia).
- Indicadores de desempenho e comportamento em escala de 0 a 10.
- Contexto opcional: horas de sono, estresse percebido e observações.
- Médias, sequência de dias e gráfico dos últimos sete registros.
- Estimativa exploratória de desempenho com base na média recente e numa tendência suavizada.
- Exportação e importação de backup JSON.
- Importação mescla registros por data; quando há a mesma data, o registro importado substitui o existente.

## Armazenamento híbrido — o que significa nesta versão
Os registros são guardados localmente no navegador (`localStorage`). O backup JSON permite transferir dados manualmente entre dispositivos. **Sincronização automática na nuvem ainda não está implementada**: ela exigiria um serviço de backend, autenticação e regras de segurança. Não coloque dados sensíveis em computadores compartilhados.

## Privacidade e limites
- Os dados ficam no navegador e podem ser apagados se os dados do site forem limpos.
- Exporte backups regularmente e guarde-os em local seguro.
- As notas são pessoais; evite registrar informações íntimas ou dados de terceiros.
- As pontuações são autoavaliações, não diagnósticos psicológicos.
- A projeção é uma estimativa descritiva, não prevê com certeza o futuro nem substitui aconselhamento profissional.

## Estrutura
- `index.html`: estrutura da aplicação.
- `css/style.css`: identidade visual responsiva.
- `js/storage.js`: persistência e backups.
- `js/statistics.js`: estatísticas descritivas.
- `js/predictions.js`: estimativa exploratória.
- `js/app.js`: interface, formulário e gráfico.

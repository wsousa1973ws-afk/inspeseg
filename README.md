<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Inspeções de Segurança — Subestação Elétrica</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"></script>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
/* ── RESET & VARS ───────────────────────────────────────── */
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0a0e1a;
  --surface:#111827;
  --surface2:#1a2235;
  --border:#1e2d45;
  --border2:#2a3f5f;
  --text:#e8edf5;
  --muted:#5a7494;
  --accent:#1e8fff;
  --accent2:#0d6edb;
  --green:#22c55e;
  --green-bg:rgba(34,197,94,.1);
  --red:#ef4444;
  --red-bg:rgba(239,68,68,.1);
  --yellow:#f59e0b;
  --yellow-bg:rgba(245,158,11,.1);
  --orange:#f97316;
  --r:8px;
  --r2:12px;
  --mono:'IBM Plex Mono',monospace;
  --sans:'IBM Plex Sans',sans-serif;
}
html{scroll-behavior:smooth}
body{font-family:var(--sans);background:var(--bg);color:var(--text);min-height:100vh;font-size:14px;line-height:1.5}

/* ── LAYOUT ─────────────────────────────────────────────── */
.app{display:flex;min-height:100vh}

/* Sidebar */
.sidebar{
  width:220px;min-width:220px;background:var(--surface);
  border-right:1px solid var(--border);
  display:flex;flex-direction:column;
  position:sticky;top:0;height:100vh;overflow-y:auto;
  z-index:50;
}
.sidebar-logo{
  padding:24px 20px 20px;
  border-bottom:1px solid var(--border);
}
.sidebar-logo .logo-icon{
  width:36px;height:36px;background:var(--accent);border-radius:8px;
  display:flex;align-items:center;justify-content:center;
  font-size:18px;margin-bottom:10px;
}
.sidebar-logo h2{font-size:12px;font-weight:600;color:var(--text);letter-spacing:.05em;text-transform:uppercase}
.sidebar-logo p{font-size:11px;color:var(--muted);margin-top:2px}

.nav{padding:12px 10px;flex:1}
.nav-item{
  display:flex;align-items:center;gap:10px;
  padding:9px 12px;border-radius:var(--r);cursor:pointer;
  font-size:13px;font-weight:500;color:var(--muted);
  transition:all .15s;margin-bottom:2px;user-select:none;
}
.nav-item:hover{background:var(--surface2);color:var(--text)}
.nav-item.active{background:rgba(30,143,255,.12);color:var(--accent)}
.nav-item .nav-icon{font-size:16px;min-width:20px;text-align:center}
.nav-section{font-size:10px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);padding:14px 12px 6px;opacity:.6}

.sidebar-footer{
  padding:12px 10px;border-top:1px solid var(--border);
}
.sync-btn{
  width:100%;padding:9px;border-radius:var(--r);
  background:var(--accent);color:#fff;border:none;
  font-family:var(--sans);font-size:12px;font-weight:600;
  cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;
  transition:all .15s;letter-spacing:.03em;
}
.sync-btn:hover{background:var(--accent2)}
.sync-btn.syncing{opacity:.7;cursor:not-allowed}
.sync-status{font-size:10px;color:var(--muted);text-align:center;margin-top:8px;font-family:var(--mono)}

/* Main */
.main{flex:1;overflow-y:auto;min-width:0}
.topbar{
  position:sticky;top:0;z-index:40;
  background:rgba(10,14,26,.92);backdrop-filter:blur(12px);
  border-bottom:1px solid var(--border);
  padding:14px 28px;display:flex;align-items:center;justify-content:space-between;
}
.topbar-title{font-size:15px;font-weight:600;color:var(--text)}
.topbar-sub{font-size:11px;color:var(--muted);font-family:var(--mono);margin-top:2px}
.topbar-right{display:flex;align-items:center;gap:10px}
.date-badge{
  font-family:var(--mono);font-size:11px;
  background:var(--surface2);border:1px solid var(--border2);
  padding:5px 12px;border-radius:20px;color:var(--muted);
}
.filter-select{
  background:var(--surface2);border:1px solid var(--border2);
  color:var(--text);font-family:var(--sans);font-size:12px;
  padding:5px 10px;border-radius:var(--r);cursor:pointer;outline:none;
}

.content{padding:24px 28px}

/* ── SECTIONS ───────────────────────────────────────────── */
.section{display:none}
.section.active{display:block}

/* ── CARDS ──────────────────────────────────────────────── */
.card{
  background:var(--surface);border:1px solid var(--border);
  border-radius:var(--r2);padding:20px;
}
.card-title{
  font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;
  color:var(--muted);margin-bottom:14px;display:flex;align-items:center;gap:6px;
}
.card-title::before{content:'';display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--accent)}

/* ── KPI GRID ───────────────────────────────────────────── */
.kpi-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin-bottom:20px}
.kpi{
  background:var(--surface);border:1px solid var(--border);
  border-radius:var(--r2);padding:18px 16px;position:relative;overflow:hidden;
}
.kpi::before{
  content:'';position:absolute;top:0;left:0;right:0;height:2px;
  background:var(--accent);opacity:.4;
}
.kpi.green::before{background:var(--green)}
.kpi.red::before{background:var(--red)}
.kpi.yellow::before{background:var(--yellow)}
.kpi-label{font-size:10px;color:var(--muted);font-weight:600;letter-spacing:.06em;text-transform:uppercase;margin-bottom:10px}
.kpi-value{font-size:32px;font-weight:700;line-height:1;font-family:var(--mono)}
.kpi-value.blue{color:var(--accent)}
.kpi-value.green{color:var(--green)}
.kpi-value.red{color:var(--red)}
.kpi-value.yellow{color:var(--yellow)}
.kpi-sub{font-size:10px;color:var(--muted);margin-top:6px;font-family:var(--mono)}

/* ── GRID LAYOUTS ───────────────────────────────────────── */
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}
.grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:16px}
.grid-13{display:grid;grid-template-columns:1.4fr 1fr;gap:16px;margin-bottom:16px}
.grid-31{display:grid;grid-template-columns:1fr 1.4fr;gap:16px;margin-bottom:16px}
.mb16{margin-bottom:16px}

/* ── CHARTS ─────────────────────────────────────────────── */
.chart-wrap{position:relative;height:240px}
.chart-wrap.sm{height:180px}
.chart-wrap.lg{height:300px}

/* ── TABLE ──────────────────────────────────────────────── */
.table-wrap{overflow-x:auto}
table{width:100%;border-collapse:collapse;font-size:12px}
thead th{
  text-align:left;padding:8px 12px;
  background:var(--surface2);color:var(--muted);
  font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
  border-bottom:1px solid var(--border);position:sticky;top:0;
}
tbody tr{border-bottom:1px solid var(--border)}
tbody tr:last-child{border-bottom:none}
tbody tr:hover{background:var(--surface2)}
tbody td{padding:9px 12px;color:var(--text);vertical-align:top}
.td-mono{font-family:var(--mono);font-size:11px;color:var(--muted)}

/* ── BADGES ─────────────────────────────────────────────── */
.badge{display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:600;padding:2px 8px;border-radius:20px;font-family:var(--mono);letter-spacing:.03em}
.badge.conf{background:var(--green-bg);color:var(--green);border:1px solid rgba(34,197,94,.2)}
.badge.nc{background:var(--red-bg);color:var(--red);border:1px solid rgba(239,68,68,.2)}
.badge.na{background:var(--surface2);color:var(--muted);border:1px solid var(--border2)}

/* ── NC CARDS ───────────────────────────────────────────── */
.nc-list{display:flex;flex-direction:column;gap:10px}
.nc-card{
  background:var(--surface2);border:1px solid var(--border2);
  border-left:3px solid var(--red);border-radius:var(--r2);
  padding:14px 16px;
}
.nc-card-head{display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:6px}
.nc-card-title{font-size:13px;font-weight:600;color:var(--text)}
.nc-card-meta{font-size:11px;color:var(--muted);margin-bottom:6px;font-family:var(--mono)}
.nc-card-obs{font-size:12px;color:rgba(232,237,245,.7);background:rgba(239,68,68,.05);padding:8px 10px;border-radius:6px;border:1px solid rgba(239,68,68,.1);margin-top:6px}

/* ── DONUT LABEL ────────────────────────────────────────── */
.donut-wrap{position:relative;height:200px;display:flex;align-items:center;justify-content:center}
.donut-center{position:absolute;text-align:center;pointer-events:none}
.donut-pct{font-size:28px;font-weight:700;font-family:var(--mono);color:var(--text)}
.donut-lbl{font-size:10px;color:var(--muted)}

/* ── BAR ITEMS ──────────────────────────────────────────── */
.bar-list{display:flex;flex-direction:column;gap:10px}
.bar-row{display:flex;align-items:center;gap:10px}
.bar-name{font-size:11px;color:var(--muted);min-width:120px;font-family:var(--mono)}
.bar-track{flex:1;height:14px;background:var(--surface2);border-radius:4px;overflow:hidden}
.bar-fill{height:100%;border-radius:4px;transition:width .8s cubic-bezier(.4,0,.2,1)}
.bar-pct{font-size:11px;font-family:var(--mono);min-width:34px;text-align:right}

/* ── TIMELINE ───────────────────────────────────────────── */
.tl{position:relative;padding-left:22px}
.tl::before{content:'';position:absolute;left:8px;top:6px;bottom:6px;width:1px;background:var(--border2)}
.tl-item{position:relative;padding:8px 0 8px 14px;border-bottom:1px solid rgba(30,45,69,.5)}
.tl-item:last-child{border-bottom:none}
.tl-dot{position:absolute;left:-15px;top:50%;transform:translateY(-50%);width:10px;height:10px;border-radius:50%;border:2px solid var(--bg)}
.tl-dot.conf{background:var(--green)}
.tl-dot.nc{background:var(--red)}
.tl-head{display:flex;justify-content:space-between;align-items:center;gap:8px}
.tl-area{font-size:12px;font-weight:600;color:var(--text)}
.tl-time{font-size:10px;font-family:var(--mono);color:var(--muted)}
.tl-detail{font-size:11px;color:var(--red);margin-top:3px}
.tl-ok{font-size:11px;color:var(--green);margin-top:3px}

/* ── LEGEND ─────────────────────────────────────────────── */
.legend{display:flex;gap:16px;flex-wrap:wrap;margin-top:10px}
.legend-item{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--muted)}
.legend-dot{width:8px;height:8px;border-radius:50%}

/* ── EMPTY / LOADING ────────────────────────────────────── */
.loading-state{
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  padding:60px;color:var(--muted);gap:12px;
}
.spinner{
  width:28px;height:28px;border:2px solid var(--border2);
  border-top-color:var(--accent);border-radius:50%;
  animation:spin .7s linear infinite;
}
@keyframes spin{to{transform:rotate(360deg)}}
.empty{text-align:center;padding:40px;color:var(--muted);font-size:13px}

/* ── SEARCH BAR ─────────────────────────────────────────── */
.search-row{display:flex;gap:10px;margin-bottom:14px;align-items:center;flex-wrap:wrap}
.search-input{
  flex:1;min-width:200px;
  background:var(--surface2);border:1px solid var(--border2);
  color:var(--text);font-family:var(--sans);font-size:12px;
  padding:7px 12px;border-radius:var(--r);outline:none;
}
.search-input::placeholder{color:var(--muted)}
.search-input:focus{border-color:var(--accent)}
.filter-pill{
  background:var(--surface2);border:1px solid var(--border2);
  color:var(--muted);font-size:11px;padding:5px 12px;border-radius:20px;
  cursor:pointer;font-family:var(--mono);transition:all .15s;
}
.filter-pill.active,.filter-pill:hover{border-color:var(--accent);color:var(--accent);background:rgba(30,143,255,.08)}

/* ── TOOLTIP ─────────────────────────────────────────────── */
.tip{position:relative;cursor:default}
.tip:hover::after{
  content:attr(data-tip);position:absolute;bottom:110%;left:50%;
  transform:translateX(-50%);background:#000;color:#fff;
  font-size:10px;padding:4px 8px;border-radius:4px;white-space:nowrap;z-index:99;
  pointer-events:none;
}

/* ── PRINT BTN ──────────────────────────────────────────── */
.print-btn{
  background:var(--surface2);border:1px solid var(--border2);
  color:var(--text);font-family:var(--sans);font-size:12px;
  padding:7px 14px;border-radius:var(--r);cursor:pointer;
  display:flex;align-items:center;gap:6px;transition:all .15s;
}
.print-btn:hover{border-color:var(--accent);color:var(--accent)}

/* ── SCROLLBAR ──────────────────────────────────────────── */
::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--border2);border-radius:4px}

/* ── RESPONSIVE ─────────────────────────────────────────── */
@media(max-width:900px){
  .sidebar{display:none}
  .kpi-grid{grid-template-columns:repeat(2,1fr)}
  .grid-2,.grid-3,.grid-13,.grid-31{grid-template-columns:1fr}
  .content{padding:16px}
}

/* ── MOBILE NAV ─────────────────────────────────────────── */
.mobile-nav{
  display:none;position:fixed;bottom:0;left:0;right:0;z-index:100;
  background:var(--surface);border-top:1px solid var(--border);
  padding:8px 0;
}
.mobile-nav .nav-row{display:flex;justify-content:space-around}
.mobile-nav .mnav{
  display:flex;flex-direction:column;align-items:center;gap:3px;
  font-size:10px;color:var(--muted);cursor:pointer;padding:4px 12px;
  transition:color .15s;
}
.mobile-nav .mnav.active,.mobile-nav .mnav:hover{color:var(--accent)}
@media(max-width:900px){.mobile-nav{display:block}.content{padding-bottom:72px}}
</style>
</head>
<body>

<div class="app">
  <!-- SIDEBAR -->
  <aside class="sidebar">
    <div class="sidebar-logo">
      <div class="logo-icon">⚡</div>
      <h2>InspeSeg</h2>
      <p>Subestação Elétrica</p>
    </div>
    <nav class="nav">
      <div class="nav-section">Menu</div>
      <div class="nav-item active" data-section="dashboard">
        <span class="nav-icon">📊</span> Dashboard
      </div>
      <div class="nav-item" data-section="inspecoes">
        <span class="nav-icon">📋</span> Inspeções
      </div>
      <div class="nav-item" data-section="nao-conformes">
        <span class="nav-icon">⚠️</span> Não Conformes
      </div>
      <div class="nav-item" data-section="evolucao">
        <span class="nav-icon">📈</span> Evolução
      </div>
      <div class="nav-section">Dados</div>
      <div class="nav-item" data-section="relatorios">
        <span class="nav-icon">📄</span> Relatório do Dia
      </div>
    </nav>
    <div class="sidebar-footer">
      <button class="sync-btn" id="syncBtn" onclick="syncData()">
        <span id="syncIcon">🔄</span> Sincronizar
      </button>
      <div class="sync-status" id="syncStatus">Clique para buscar dados</div>
    </div>
  </aside>

  <!-- MAIN -->
  <main class="main">
    <div class="topbar">
      <div>
        <div class="topbar-title" id="pageTitle">Dashboard</div>
        <div class="topbar-sub" id="pageSubtitle">Carregando dados…</div>
      </div>
      <div class="topbar-right">
        <div class="date-badge" id="dateDisplay">—</div>
        <select class="filter-select" id="dayFilter" onchange="applyDayFilter()">
          <option value="all">Todos os dias</option>
        </select>
      </div>
    </div>

    <div class="content">

      <!-- ── DASHBOARD ──────────────────────────────────── -->
      <div class="section active" id="sec-dashboard">
        <div class="kpi-grid" id="kpiGrid">
          <div class="loading-state" style="grid-column:1/-1"><div class="spinner"></div><span>Carregando…</span></div>
        </div>
        <div class="grid-13">
          <div class="card">
            <div class="card-title">Conformidade geral</div>
            <div class="donut-wrap">
              <canvas id="donutChart"></canvas>
              <div class="donut-center">
                <div class="donut-pct" id="donutPct">—</div>
                <div class="donut-lbl">conformidade</div>
              </div>
            </div>
            <div class="legend" id="donutLegend"></div>
          </div>
          <div class="card">
            <div class="card-title">Resultado por área</div>
            <div class="chart-wrap"><canvas id="areaChart"></canvas></div>
          </div>
        </div>
        <div class="grid-2">
          <div class="card">
            <div class="card-title">% Conformidade por item inspecionado</div>
            <div class="bar-list" id="itemBars"></div>
          </div>
          <div class="card">
            <div class="card-title">Inspeções por inspetor</div>
            <div class="chart-wrap sm"><canvas id="inspChart"></canvas></div>
          </div>
        </div>
      </div>

      <!-- ── INSPEÇÕES ──────────────────────────────────── -->
      <div class="section" id="sec-inspecoes">
        <div class="search-row" id="filterRow">
          <input class="search-input" id="searchInput" placeholder="Buscar por área, inspetor, atividade…" oninput="renderTable()">
          <span class="filter-pill active" data-status="all" onclick="setStatusFilter('all',this)">Todos</span>
          <span class="filter-pill" data-status="conf" onclick="setStatusFilter('conf',this)">✅ Conformes</span>
          <span class="filter-pill" data-status="nc" onclick="setStatusFilter('nc',this)">⚠️ Não Conformes</span>
        </div>
        <div class="card">
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Data</th><th>Hora</th><th>Rodada</th>
                  <th>Área</th><th>Status</th><th>Itens NC</th>
                  <th>Responsável</th><th>Inspetor</th><th>Atividade</th>
                </tr>
              </thead>
              <tbody id="tableBody">
                <tr><td colspan="10"><div class="loading-state"><div class="spinner"></div></div></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ── NÃO CONFORMES ──────────────────────────────── -->
      <div class="section" id="sec-nao-conformes">
        <div class="grid-31 mb16">
          <div class="card">
            <div class="card-title">Frequência de não conformidades</div>
            <div class="chart-wrap"><canvas id="ncFreqChart"></canvas></div>
          </div>
          <div class="card">
            <div class="card-title">Itens mais críticos</div>
            <div class="bar-list" id="ncBars"></div>
          </div>
        </div>
        <div class="card">
          <div class="card-title">Registro de não conformidades</div>
          <div class="nc-list" id="ncList">
            <div class="loading-state"><div class="spinner"></div></div>
          </div>
        </div>
      </div>

      <!-- ── EVOLUÇÃO ───────────────────────────────────── -->
      <div class="section" id="sec-evolucao">
        <div class="card mb16">
          <div class="card-title">Conformidade por item ao longo do tempo</div>
          <div class="chart-wrap lg"><canvas id="lineChart"></canvas></div>
        </div>
        <div class="grid-2">
          <div class="card">
            <div class="card-title">Conformidade por rodada de inspeção</div>
            <div class="chart-wrap"><canvas id="roundChart"></canvas></div>
          </div>
          <div class="card">
            <div class="card-title">Linha do tempo — últimas inspeções</div>
            <div class="tl" id="timeline"></div>
          </div>
        </div>
      </div>

      <!-- ── RELATÓRIO ──────────────────────────────────── -->
      <div class="section" id="sec-relatorios">
        <div id="reportContent"></div>
      </div>

    </div><!-- /content -->
  </main>
</div>

<!-- MOBILE NAV -->
<div class="mobile-nav">
  <div class="nav-row">
    <div class="mnav active" onclick="showSection('dashboard',this)"><span>📊</span>Dashboard</div>
    <div class="mnav" onclick="showSection('inspecoes',this)"><span>📋</span>Inspeções</div>
    <div class="mnav" onclick="showSection('nao-conformes',this)"><span>⚠️</span>NC</div>
    <div class="mnav" onclick="showSection('evolucao',this)"><span>📈</span>Evolução</div>
    <div class="mnav" onclick="showSection('relatorios',this)"><span>📄</span>Relatório</div>
  </div>
</div>

<script>
// ── CONFIG ───────────────────────────────────────────────
const SUPABASE_FN = 'https://hecwzhkielcgolgsrlvc.supabase.co/functions/v1/sheets-sync';

// ── STATE ────────────────────────────────────────────────
let ALL_DATA   = [];
let FILTERED   = [];
let statusFilter = 'all';
let dayFilter    = 'all';
let charts = {};

// ── CHART DEFAULTS ───────────────────────────────────────
Chart.defaults.color = '#5a7494';
Chart.defaults.font.family = "'IBM Plex Mono', monospace";
Chart.defaults.font.size = 11;


// ── NORMALIZAR VALOR ─────────────────────────────────────
function norm(v){
  v=(v||'').toLowerCase().trim();
  if(v.includes('não conforme')||v.includes('nao conforme')||v.includes('não-c')) return 'NC';
  if(v.includes('conforme')) return 'C';
  if(v.includes('não se aplica')||v.includes('nao se aplica')) return 'NA';
  return 'NA';
}

// ── MAPEAR LINHA CSV → OBJETO ─────────────────────────────
function mapRow(r, idx){
  const ncs = [];
  const obs_parts = [];

  const itemMap = {
    'APR':       r['APR'],
    'OS':        r['Ordem de Serviço'],
    'Check List':r['Check List Equipamentos e Ferramentas'],
    'Perm. Trab.':r['Permissão de Trabalho'],
    'PEX':       r['PEX'],
    'Capacete':  r['Capacete de Segurança com Jugular e Adesivos'],
    'Óculos':    r['Uso de óculos de segurnaça']||r['Uso de óculos de segurança'],
    'Botina':    r['Botina de segurança'],
    'Luvas':     r['Luvas corretas sendo usada'],
    'Uniforme FR':r['Uniforme FR em boas condições'],
    'Escadas':   r['Escadas em boas condições'],
    'Resíduos':  r['Área de Resíduos ']||r['Área de Resíduos'],
    'Limpeza':   r['Área está Limpa e Organizada'],
  };

  // Detectar NCs
  Object.entries(itemMap).forEach(([k,v])=>{ if(norm(v)==='NC') ncs.push(k); });

  // Coletar observações
  const obsFields = [
    r['APR - Observações ']||r['APR - Observações'],
    r['Ordem de Serviço - Observações ']||r['Ordem de Serviço - Observações'],
    r['Check List Equipamentos e Ferramentas - Observações encontradas'],
    r['Permissão de Trabalho - Observações Encontradas'],
    r['PEX  - Observações Encontradas']||r['PEX - Observações Encontradas'],
    r['Capacete de Segurança com Jugular e Adesivos  - Observações Encontradas'],
    r['Uso de óculos de segurança  - Observações Encontradas'],
    r['Luvas corretas sendo usada  - Observações Encontradas'],
    r['Área de Resíduos  - Observações Encontradas   ']||r['Área de Resíduos - Observações Encontradas'],
    r['Área está Limpa e Organizada - Observações'],
    r['Outros Itens inspecionados ']||r['Outros Itens inspecionados'],
    r['Relato dos Itens Não Conforme ']||r['Relato dos Itens Não Conforme'],
  ];
  obsFields.forEach(o=>{ if(o&&o.trim()) obs_parts.push(o.trim()); });

  // Extrair data
  const dataRaw = r['Data ']||r['Data']||'';
  const dataParts = dataRaw.split('/');
  const dataSort = dataParts.length===3 ? `${dataParts[2]}-${dataParts[1]}-${dataParts[0]}` : dataRaw;

  return {
    seq:       idx+1,
    carimbo:   r['Carimbo de data/hora']||'',
    data:      dataRaw.replace(/\s/g,''),
    dataSort,
    hora:      (r['Horário']||'').replace(':00','').substring(0,5),
    rodada:    r['Inspeção']||'',
    area:      r['Área Auditada']||'',
    responsavel: (r['Responsável da Atividade']||'').trim(),
    inspetor:  (r['Nome do Inspetor ']||r['Nome do Inspetor']||'').trim(),
    atividade: (r['Descrição da Atividade']||'').trim(),
    ncs,
    obs:       obs_parts.join(' · '),
    itens:     itemMap,
    status:    ncs.length===0 ? 'C' : 'NC',
  };
}

// ── SYNC ─────────────────────────────────────────────────
async function syncData(){
  const btn = document.getElementById('syncBtn');
  const icon = document.getElementById('syncIcon');
  const status = document.getElementById('syncStatus');
  btn.classList.add('syncing'); icon.textContent='⏳';
  status.textContent = 'Sincronizando planilha…';

  try {
    // 1. Dispara o sync na Edge Function (lê a planilha e salva no banco)
    await fetch(`${SUPABASE_FN}?action=sync`);

    // 2. Busca todos os registros já normalizados do banco
    status.textContent = 'Carregando dados…';
    const res = await fetch(`${SUPABASE_FN}?action=query&limit=2000`);
    if(!res.ok) throw new Error('Erro '+res.status);
    const json = await res.json();
    const rows = json.data || [];

    // 3. Mapeia o formato do banco → formato interno do dashboard
    ALL_DATA = rows.map((r, i) => mapRowFromDB(r, i));

    // Rebuild day filter
    buildDayFilter();
    applyDayFilter();

    const now = new Date().toLocaleString('pt-BR');
    status.textContent = `Atualizado: ${now}`;
    icon.textContent='✅';
    setTimeout(()=>{ icon.textContent='🔄'; btn.classList.remove('syncing'); },2000);
  } catch(e){
    status.textContent = 'Erro ao sincronizar';
    icon.textContent='❌';
    btn.classList.remove('syncing');
    setTimeout(()=>{ icon.textContent='🔄'; },3000);
    console.error(e);
  }
}

// ── MAPEAR REGISTRO DO BANCO → FORMATO DO DASHBOARD ──────
function mapRowFromDB(r, idx){
  // data_inspecao vem como "2026-05-25" → converte p/ "25/05/2026"
  const dataISO  = r.data_inspecao || '';
  const dataParts = dataISO.split('-');
  const data = dataParts.length === 3
    ? `${dataParts[2]}/${dataParts[1]}/${dataParts[0]}`
    : dataISO;
  const dataSort = dataISO; // já está em yyyy-mm-dd, ideal p/ ordenação

  // itens_nc vem como string "APR, OS" ou null
  const ncs = r.itens_nc ? r.itens_nc.split(',').map(s => s.trim()).filter(Boolean) : [];

  // status: banco grava "Conforme" ou "Nao Conforme"
  const statusRaw = (r.status || '').toLowerCase();
  const status = (statusRaw.includes('nao') || statusRaw.includes('não')) ? 'NC' : 'C';

  // Reconstruir itemMap a partir dos dados raw_data se disponível
  const raw = r.raw_data || {};
  const itemMap = {
    'APR':        raw['APR']                                  || (ncs.includes('APR')         ? 'Não Conforme' : 'Conforme'),
    'OS':         raw['Ordem de Serviço']                     || (ncs.includes('OS')          ? 'Não Conforme' : 'Conforme'),
    'Check List': raw['Check List Equipamentos e Ferramentas']|| (ncs.includes('Check List')  ? 'Não Conforme' : 'Conforme'),
    'Perm. Trab.':raw['Permissão de Trabalho']                || (ncs.includes('Perm. Trab.') ? 'Não Conforme' : 'Conforme'),
    'PEX':        raw['PEX']                                  || (ncs.includes('PEX')         ? 'Não Conforme' : 'Conforme'),
    'Capacete':   raw['Capacete de Segurança com Jugular e Adesivos'] || (ncs.includes('Capacete')  ? 'Não Conforme' : 'Conforme'),
    'Óculos':     raw['Uso de óculos de segurnaça']||raw['Uso de óculos de segurança'] || (ncs.includes('Oculos') ? 'Não Conforme' : 'Conforme'),
    'Botina':     raw['Botina de segurança']                  || (ncs.includes('Botina')      ? 'Não Conforme' : 'Conforme'),
    'Luvas':      raw['Luvas corretas sendo usada']           || (ncs.includes('Luvas')       ? 'Não Conforme' : 'Conforme'),
    'Uniforme FR':raw['Uniforme FR em boas condições']        || (ncs.includes('Uniforme FR') ? 'Não Conforme' : 'Conforme'),
    'Escadas':    raw['Escadas em boas condições']            || (ncs.includes('Escadas')     ? 'Não Conforme' : 'Conforme'),
    'Resíduos':   raw['Área de Resíduos ']||raw['Área de Resíduos'] || (ncs.includes('Residuos') ? 'Não Conforme' : 'Conforme'),
    'Limpeza':    raw['Área está Limpa e Organizada']         || (ncs.includes('Limpeza')     ? 'Não Conforme' : 'Conforme'),
  };

  return {
    seq:        idx + 1,
    carimbo:    r.carimbo || '',
    data,
    dataSort,
    hora:       (r.hora || '').replace(':00','').substring(0,5),
    rodada:     r.rodada || '',
    area:       r.area   || '',
    responsavel:(r.responsavel || '').trim(),
    inspetor:   (r.inspetor   || '').trim(),
    atividade:  (r.atividade  || '').trim(),
    ncs,
    obs:        r.observacoes || '',
    itens:      itemMap,
    status,
  };
}

// ── DAY FILTER ───────────────────────────────────────────
function buildDayFilter(){
  const sel = document.getElementById('dayFilter');
  // Usa dataSort (yyyy-mm-dd) para ordenação correta; exibe data (dd/mm/yyyy)
  const dayMap = {}; // dataSort → data display
  ALL_DATA.forEach(r => { dayMap[r.dataSort] = r.data; });
  const sortKeys = Object.keys(dayMap).sort();
  sel.innerHTML = '<option value="all">Todos os dias</option>';
  sortKeys.forEach(k => {
    const o = document.createElement('option');
    o.value = k; o.textContent = dayMap[k];
    if(k === sortKeys[sortKeys.length-1]) o.selected = true;
    sel.appendChild(o);
  });
  dayFilter = sortKeys[sortKeys.length-1] || 'all';
}

function applyDayFilter(){
  dayFilter = document.getElementById('dayFilter').value;
  FILTERED = dayFilter==='all' ? [...ALL_DATA] : ALL_DATA.filter(r=>r.dataSort===dayFilter);
  renderAll();
}

// ── STATUS FILTER ─────────────────────────────────────────
function setStatusFilter(s, el){
  statusFilter=s;
  document.querySelectorAll('[data-status]').forEach(e=>e.classList.remove('active'));
  el.classList.add('active');
  renderTable();
}

// ── RENDER ALL ────────────────────────────────────────────
function renderAll(){
  updateSubtitle();
  renderKPI();
  renderDonut();
  renderAreaChart();
  renderItemBars();
  renderInspChart();
  renderTable();
  renderNCSection();
  renderEvolution();
  renderReport();
}

function updateSubtitle(){
  const total = FILTERED.length;
  const days  = [...new Set(FILTERED.map(r=>r.data))].length;
  const label = dayFilter==='all' ? `${days} dias · ${total} inspeções` : `${dayFilter} · ${total} inspeções`;
  document.getElementById('pageSubtitle').textContent = label;
  document.getElementById('dateDisplay').textContent  = new Date().toLocaleDateString('pt-BR');
}

// ── KPI ───────────────────────────────────────────────────
function renderKPI(){
  const total    = FILTERED.length;
  const conf     = FILTERED.filter(r=>r.status==='C').length;
  const nc       = total-conf;
  const taxa     = total ? Math.round(conf/total*100) : 0;
  const inspetores = new Set(FILTERED.map(r=>r.inspetor).filter(Boolean)).size;

  document.getElementById('kpiGrid').innerHTML = `
    <div class="kpi"><div class="kpi-label">Total Inspeções</div><div class="kpi-value blue">${total}</div></div>
    <div class="kpi green"><div class="kpi-label">Conformes</div><div class="kpi-value green">${conf}</div><div class="kpi-sub">${taxa}% do total</div></div>
    <div class="kpi red"><div class="kpi-label">Não Conformes</div><div class="kpi-value red">${nc}</div></div>
    <div class="kpi yellow"><div class="kpi-label">Taxa Conformidade</div><div class="kpi-value yellow">${taxa}%</div></div>
    <div class="kpi"><div class="kpi-label">Inspetores</div><div class="kpi-value blue">${inspetores}</div></div>
  `;
}

// ── DONUT ─────────────────────────────────────────────────
function renderDonut(){
  const conf = FILTERED.filter(r=>r.status==='C').length;
  const nc   = FILTERED.filter(r=>r.status==='NC').length;
  const taxa = FILTERED.length ? Math.round(conf/FILTERED.length*100) : 0;
  document.getElementById('donutPct').textContent = taxa+'%';

  const data = nc>0 ? [conf,nc] : [conf];
  const bg   = nc>0 ? ['#22c55e','#ef4444'] : ['#22c55e'];
  const lbs  = nc>0 ? ['Conforme','Não Conforme'] : ['Conforme'];

  if(charts.donut) charts.donut.destroy();
  charts.donut = new Chart(document.getElementById('donutChart'),{
    type:'doughnut',
    data:{labels:lbs,datasets:[{data,backgroundColor:bg,borderColor:'#111827',borderWidth:3,hoverOffset:6}]},
    options:{responsive:true,maintainAspectRatio:false,cutout:'70%',
      plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>`${ctx.label}: ${ctx.parsed}`}}}}
  });

  document.getElementById('donutLegend').innerHTML = lbs.map((l,i)=>
    `<div class="legend-item"><div class="legend-dot" style="background:${bg[i]}"></div>${l} (${data[i]})</div>`
  ).join('');
}

// ── AREA CHART ────────────────────────────────────────────
function renderAreaChart(){
  const areas = [...new Set(FILTERED.map(r=>r.area))].sort();
  const conf  = areas.map(a=>FILTERED.filter(r=>r.area===a&&r.status==='C').length);
  const nc    = areas.map(a=>FILTERED.filter(r=>r.area===a&&r.status==='NC').length);
  const short = areas.map(a=>a.replace('Casa de Comando','Casa\nComando').replace('Módulo ',''));

  if(charts.area) charts.area.destroy();
  charts.area = new Chart(document.getElementById('areaChart'),{
    type:'bar',
    data:{labels:short,datasets:[
      {label:'Conforme',   data:conf,backgroundColor:'rgba(34,197,94,.7)', borderColor:'#22c55e',borderWidth:1,borderRadius:4},
      {label:'Não Conforme',data:nc, backgroundColor:'rgba(239,68,68,.7)',borderColor:'#ef4444',borderWidth:1,borderRadius:4},
    ]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{labels:{color:'#5a7494',boxWidth:10,boxHeight:10}}},
      scales:{
        x:{grid:{color:'#1e2d45'},ticks:{color:'#5a7494'}},
        y:{grid:{color:'#1e2d45'},ticks:{color:'#5a7494'},beginAtZero:true}
      }}
  });
}

// ── ITEM BARS ─────────────────────────────────────────────
function renderItemBars(){
  const items = ['APR','OS','Check List','PEX','Capacete','Óculos','Botina','Luvas','Uniforme FR','Escadas','Resíduos','Limpeza'];
  const bars  = items.map(k=>{
    const rows = FILTERED.filter(r=>r.itens[k]&&norm(r.itens[k])!=='NA');
    if(!rows.length) return null;
    const conf = rows.filter(r=>norm(r.itens[k])==='C').length;
    return {label:k, pct:Math.round(conf/rows.length*100), conf, total:rows.length};
  }).filter(Boolean).sort((a,b)=>a.pct-b.pct);

  document.getElementById('itemBars').innerHTML = bars.map(b=>{
    const color = b.pct>=80 ? '#22c55e' : b.pct>=50 ? '#f59e0b' : '#ef4444';
    return `<div class="bar-row">
      <span class="bar-name">${b.label}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${b.pct}%;background:${color}"></div></div>
      <span class="bar-pct" style="color:${color}">${b.pct}%</span>
    </div>`;
  }).join('');
}

// ── INSPETOR CHART ────────────────────────────────────────
function renderInspChart(){
  const ic = {};
  FILTERED.forEach(r=>{ if(r.inspetor) ic[r.inspetor]=(ic[r.inspetor]||0)+1; });
  const lbs=Object.keys(ic); const vs=lbs.map(k=>ic[k]);
  const pal=['#1e8fff','#22c55e','#f97316','#a855f7','#f59e0b'];

  if(charts.insp) charts.insp.destroy();
  charts.insp = new Chart(document.getElementById('inspChart'),{
    type:'doughnut',
    data:{labels:lbs,datasets:[{data:vs,backgroundColor:pal.slice(0,lbs.length),borderColor:'#111827',borderWidth:3}]},
    options:{responsive:true,maintainAspectRatio:false,cutout:'60%',
      plugins:{legend:{position:'right',labels:{color:'#5a7494',boxWidth:10,boxHeight:10,padding:10}}}}
  });
}

// ── TABLE ─────────────────────────────────────────────────
function renderTable(){
  const q = (document.getElementById('searchInput')?.value||'').toLowerCase();
  let rows = FILTERED;
  if(statusFilter==='conf') rows=rows.filter(r=>r.status==='C');
  if(statusFilter==='nc')   rows=rows.filter(r=>r.status==='NC');
  if(q) rows=rows.filter(r=>[r.area,r.inspetor,r.responsavel,r.atividade,r.rodada].join(' ').toLowerCase().includes(q));

  if(!rows.length){
    document.getElementById('tableBody').innerHTML='<tr><td colspan="10"><div class="empty">Nenhum registro encontrado</div></td></tr>';
    return;
  }
  document.getElementById('tableBody').innerHTML = rows.map(r=>`
    <tr>
      <td class="td-mono">${r.seq}</td>
      <td class="td-mono">${r.data}</td>
      <td class="td-mono">${r.hora}</td>
      <td class="td-mono" style="font-size:10px">${r.rodada}</td>
      <td>${r.area}</td>
      <td><span class="badge ${r.status==='C'?'conf':'nc'}">${r.status==='C'?'✓ Conforme':'⚠ NC'}</span></td>
      <td style="color:${r.ncs.length?'#ef4444':'#5a7494'};font-size:11px">${r.ncs.length?r.ncs.join(', '):'—'}</td>
      <td style="font-size:11px">${r.responsavel||'—'}</td>
      <td style="font-size:11px">${r.inspetor||'—'}</td>
      <td style="font-size:11px;max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${r.atividade}">${r.atividade||'—'}</td>
    </tr>
  `).join('');
}

// ── NC SECTION ────────────────────────────────────────────
function renderNCSection(){
  const ncRows = FILTERED.filter(r=>r.status==='NC');
  const nf = {};
  ncRows.forEach(r=>r.ncs.forEach(nc=>{nf[nc]=(nf[nc]||0)+1;}));

  // Freq chart
  const sorted = Object.entries(nf).sort((a,b)=>b[1]-a[1]);
  const lbs=sorted.map(e=>e[0]); const vs=sorted.map(e=>e[1]);
  const bc=vs.map(v=>v>=3?'rgba(239,68,68,.8)':v===2?'rgba(245,158,11,.8)':'rgba(30,143,255,.8)');

  if(charts.ncFreq) charts.ncFreq.destroy();
  if(lbs.length){
    charts.ncFreq = new Chart(document.getElementById('ncFreqChart'),{
      type:'bar',
      data:{labels:lbs,datasets:[{data:vs,backgroundColor:bc,borderRadius:4}]},
      options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,
        plugins:{legend:{display:false}},
        scales:{
          x:{grid:{color:'#1e2d45'},ticks:{color:'#5a7494'},beginAtZero:true},
          y:{grid:{color:'#1e2d45'},ticks:{color:'#5a7494'}}
        }}
    });
  } else {
    document.getElementById('ncFreqChart').parentElement.innerHTML='<div class="empty" style="height:240px;display:flex;align-items:center;justify-content:center">✅ Nenhuma NC no período</div>';
  }

  // NC bars
  document.getElementById('ncBars').innerHTML = sorted.slice(0,8).map(([k,v])=>{
    const maxV = sorted[0]?.[1]||1;
    const color = v>=3?'#ef4444':v===2?'#f59e0b':'#1e8fff';
    return `<div class="bar-row">
      <span class="bar-name">${k}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${Math.round(v/maxV*100)}%;background:${color}"></div></div>
      <span class="bar-pct" style="color:${color}">${v}x</span>
    </div>`;
  }).join('')||'<div class="empty">Nenhuma NC</div>';

  // NC list
  document.getElementById('ncList').innerHTML = ncRows.length
    ? ncRows.map(r=>`
      <div class="nc-card">
        <div class="nc-card-head">
          <span class="nc-card-title">${r.data} ${r.hora} — ${r.area}</span>
          <span class="badge nc">⚠ ${r.ncs.length} item${r.ncs.length>1?'s':''}</span>
        </div>
        <div class="nc-card-meta">${r.rodada} · Resp: ${r.responsavel||'—'} · Inspetor: ${r.inspetor||'—'}</div>
        <div style="font-size:12px;color:var(--red);margin-bottom:4px">Itens NC: ${r.ncs.join(', ')}</div>
        ${r.obs?`<div class="nc-card-obs">${r.obs}</div>`:''}
      </div>`).join('')
    : '<div class="empty">✅ Nenhuma não conformidade no período selecionado</div>';
}

// ── EVOLUTION ─────────────────────────────────────────────
function renderEvolution(){
  const days = [...new Set(ALL_DATA.map(r=>r.data))].sort();
  const items=['APR','OS','Check List','Capacete','Óculos','Luvas'];
  const pal=['#1e8fff','#22c55e','#f59e0b','#f97316','#a855f7','#ef4444'];

  // Line chart
  const datasets = items.map((item,i)=>({
    label:item,
    data:days.map(d=>{
      const rows=ALL_DATA.filter(r=>r.data===d&&r.itens[item]&&norm(r.itens[item])!=='NA');
      if(!rows.length) return null;
      return Math.round(rows.filter(r=>norm(r.itens[item])==='C').length/rows.length*100);
    }),
    borderColor:pal[i],backgroundColor:pal[i]+'22',
    borderWidth:2,pointRadius:4,tension:.35,spanGaps:true,
  }));

  if(charts.line) charts.line.destroy();
  charts.line = new Chart(document.getElementById('lineChart'),{
    type:'line',
    data:{labels:days,datasets},
    options:{responsive:true,maintainAspectRatio:false,
      interaction:{mode:'index',intersect:false},
      plugins:{legend:{labels:{color:'#5a7494',boxWidth:10,boxHeight:10,padding:12}}},
      scales:{
        x:{grid:{color:'#1e2d45'},ticks:{color:'#5a7494'}},
        y:{grid:{color:'#1e2d45'},ticks:{color:'#5a7494',callback:v=>v+'%'},min:0,max:100}
      }}
  });

  // Round chart
  const rounds = [...new Set(FILTERED.map(r=>r.rodada))].sort();
  const rConf=rounds.map(r=>FILTERED.filter(d=>d.rodada===r&&d.status==='C').length);
  const rNC  =rounds.map(r=>FILTERED.filter(d=>d.rodada===r&&d.status==='NC').length);

  if(charts.round) charts.round.destroy();
  charts.round = new Chart(document.getElementById('roundChart'),{
    type:'bar',
    data:{labels:rounds.map(r=>r.replace('Inspeção ','').replace(' - ','\n')),datasets:[
      {label:'Conforme',   data:rConf,backgroundColor:'rgba(34,197,94,.7)',borderColor:'#22c55e',borderWidth:1,borderRadius:4},
      {label:'Não Conforme',data:rNC,backgroundColor:'rgba(239,68,68,.7)',borderColor:'#ef4444',borderWidth:1,borderRadius:4},
    ]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{labels:{color:'#5a7494',boxWidth:10,boxHeight:10}}},
      scales:{
        x:{grid:{color:'#1e2d45'},ticks:{color:'#5a7494'}},
        y:{grid:{color:'#1e2d45'},ticks:{color:'#5a7494'},beginAtZero:true}
      }}
  });

  // Timeline
  const recent = FILTERED.slice(-15).reverse();
  document.getElementById('timeline').innerHTML = recent.map(r=>`
    <div class="tl-item">
      <span class="tl-dot ${r.status==='C'?'conf':'nc'}"></span>
      <div class="tl-head">
        <span class="tl-area">${r.area}</span>
        <span class="tl-time">${r.data} ${r.hora}</span>
      </div>
      <div class="tl-time" style="margin-top:2px">${r.rodada}</div>
      ${r.status==='NC'?`<div class="tl-detail">⚠ ${r.ncs.join(', ')}</div>`:`<div class="tl-ok">✓ Sem ocorrências</div>`}
    </div>`).join('');
}

// ── REPORT ────────────────────────────────────────────────
function renderReport(){
  const data = dayFilter==='all' ? FILTERED : FILTERED;
  const total   = data.length;
  const conf    = data.filter(r=>r.status==='C').length;
  const nc      = total-conf;
  const taxa    = total ? Math.round(conf/total*100) : 0;
  const ncRows  = data.filter(r=>r.status==='NC');
  const periodo = dayFilter==='all' ? 'Todo o período' : dayFilter;

  document.getElementById('reportContent').innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;flex-wrap:wrap;gap:12px">
      <div>
        <h2 style="font-size:18px;font-weight:700;margin-bottom:4px">Relatório Gerencial</h2>
        <div style="font-size:12px;color:var(--muted);font-family:var(--mono)">Período: ${periodo} · Emitido: ${new Date().toLocaleString('pt-BR')}</div>
      </div>
      <button class="print-btn" onclick="window.print()">🖨️ Imprimir</button>
    </div>

    <div class="kpi-grid" style="margin-bottom:20px">
      <div class="kpi"><div class="kpi-label">Total</div><div class="kpi-value blue">${total}</div></div>
      <div class="kpi green"><div class="kpi-label">Conformes</div><div class="kpi-value green">${conf}</div></div>
      <div class="kpi red"><div class="kpi-label">Não Conformes</div><div class="kpi-value red">${nc}</div></div>
      <div class="kpi yellow"><div class="kpi-label">Conformidade</div><div class="kpi-value yellow">${taxa}%</div></div>
      <div class="kpi"><div class="kpi-label">Áreas</div><div class="kpi-value blue">${new Set(data.map(r=>r.area)).size}</div></div>
    </div>

    <div class="card mb16">
      <div class="card-title">Registro detalhado</div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>#</th><th>Data</th><th>Hora</th><th>Rodada</th><th>Área</th><th>Status</th><th>Itens NC</th><th>Responsável</th><th>Inspetor</th></tr></thead>
          <tbody>${data.map(r=>`
            <tr>
              <td class="td-mono">${r.seq}</td>
              <td class="td-mono">${r.data}</td>
              <td class="td-mono">${r.hora}</td>
              <td class="td-mono" style="font-size:10px">${r.rodada}</td>
              <td>${r.area}</td>
              <td><span class="badge ${r.status==='C'?'conf':'nc'}">${r.status==='C'?'✓ Conforme':'⚠ NC'}</span></td>
              <td style="color:${r.ncs.length?'#ef4444':'#5a7494'};font-size:11px">${r.ncs.length?r.ncs.join(', '):'—'}</td>
              <td style="font-size:11px">${r.responsavel||'—'}</td>
              <td style="font-size:11px">${r.inspetor||'—'}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>

    ${ncRows.length?`
    <div class="card">
      <div class="card-title">Não conformidades registradas</div>
      <div class="nc-list">${ncRows.map(r=>`
        <div class="nc-card">
          <div class="nc-card-head">
            <span class="nc-card-title">${r.data} ${r.hora} — ${r.area}</span>
            <span class="badge nc">⚠ NC</span>
          </div>
          <div class="nc-card-meta">${r.rodada} · Resp: ${r.responsavel||'—'} · Inspetor: ${r.inspetor||'—'}</div>
          <div style="font-size:12px;color:var(--red);margin-bottom:4px">Itens NC: ${r.ncs.join(', ')}</div>
          ${r.obs?`<div class="nc-card-obs">${r.obs}</div>`:''}
        </div>`).join('')}
      </div>
    </div>`:''}
  `;
}

// ── NAV ───────────────────────────────────────────────────
const titles = {
  'dashboard':'Dashboard','inspecoes':'Registro de Inspeções',
  'nao-conformes':'Não Conformidades','evolucao':'Evolução Temporal',
  'relatorios':'Relatório do Dia'
};

function showSection(id, el){
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
  document.getElementById('sec-'+id)?.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.querySelector(`[data-section="${id}"]`)?.classList.add('active');
  document.querySelectorAll('.mnav').forEach(n=>n.classList.remove('active'));
  if(el) el.classList.add('active');
  document.getElementById('pageTitle').textContent = titles[id]||id;
}

document.querySelectorAll('.nav-item').forEach(item=>{
  item.addEventListener('click',()=>showSection(item.dataset.section, item));
});

// ── INIT ──────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', ()=>{ syncData(); });
</script>

<style>
@media print {
  .sidebar,.topbar,.mobile-nav,button,.sync-btn,.filter-select,
  .search-row,.filter-pill,.print-btn{display:none!important}
  .main{overflow:visible}
  .section{display:block!important}
  body{background:#fff;color:#000}
  .card{border:1px solid #ddd;background:#fff}
  .kpi{background:#f5f5f5;border:1px solid #ddd}
}
</style>
</body>
</html>

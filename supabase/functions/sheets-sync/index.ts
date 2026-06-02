import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SHEET_ID = '1FzD8VTGlqlDGz6OaabOdbukFmmzY5IuVdvDNQiGYfLs'
const GIDS_TO_TRY = ['1956786105', '0', '1', '2']

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
}

const FIELD_MAP: Record<string, string[]> = {
  carimbo:     ['Carimbo de data/hora'],
  data:        ['Data ', 'Data'],
  hora:        ['Horario', 'Hor\u00e1rio'],
  rodada:      ['Inspecao', 'Inspe\u00e7\u00e3o'],
  area:        ['Area Auditada', '\u00c1rea Auditada'],
  responsavel: ['Responsavel da Atividade', 'Respons\u00e1vel da Atividade'],
  inspetor:    ['Nome do Inspetor ', 'Nome do Inspetor'],
  atividade:   ['Descricao da Atividade', 'Descri\u00e7\u00e3o da Atividade'],
  apr:         ['APR'],
  os:          ['Ordem de Servico', 'Ordem de Servi\u00e7o'],
  checklist:   ['Check List Equipamentos e Ferramentas'],
  perm:        ['Permissao de Trabalho', 'Permiss\u00e3o de Trabalho'],
  pex:         ['PEX'],
  capacete:    ['Capacete de Seguranca com Jugular e Adesivos', 'Capacete de Seguran\u00e7a com Jugular e Adesivos'],
  oculos:      ['Uso de oculos de seguranca', 'Uso de \u00f3culos de segurna\u00e7a', 'Uso de \u00f3culos de seguran\u00e7a'],
  botina:      ['Botina de seguranca', 'Botina de seguran\u00e7a'],
  luvas:       ['Luvas corretas sendo usada'],
  uniforme:    ['Uniforme FR em boas condicoes', 'Uniforme FR em boas condi\u00e7\u00f5es'],
  escadas:     ['Escadas em boas condicoes', 'Escadas em boas condi\u00e7\u00f5es'],
  residuos:    ['Area de Residuos ', 'Area de Residuos', '\u00c1rea de Res\u00edduos ', '\u00c1rea de Res\u00edduos'],
  limpeza:     ['Area esta Limpa e Organizada', '\u00c1rea est\u00e1 Limpa e Organizada'],
}

const OBS_SUFFIXES = [
  ' - Observacoes ', ' - Observacoes', ' - Observa\u00e7\u00f5es ', ' - Observa\u00e7\u00f5es',
  ' - Observacoes Encontradas', ' - Observa\u00e7\u00f5es Encontradas',
  ' - Observacoes encontradas', ' - Observa\u00e7\u00f5es encontradas',
  '  - Observacoes Encontradas   ', '  - Observa\u00e7\u00f5es Encontradas   ',
  ' - Observacoes Encontradas   ', ' - Observa\u00e7\u00f5es Encontradas   ',
]

const EXTRA_OBS = [
  'Outros Itens inspecionados ', 'Outros Itens inspecionados',
  'Relato dos Itens Nao Conforme ', 'Relato dos Itens Nao Conforme',
  'Relato dos Itens N\u00e3o Conforme ', 'Relato dos Itens N\u00e3o Conforme',
]

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  const url    = new URL(req.url)
  const action = url.searchParams.get('action') ?? 'query'

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  try {
    if (action === 'sync')      return await handleSync(supabase)
    if (action === 'query')     return await handleQuery(supabase, url)
    if (action === 'resumo')    return await handleResumo(supabase, url)
    if (action === 'nc-freq')   return await handleNcFreq(supabase)
    if (action === 'sync-log')  return await handleSyncLog(supabase)
    if (action === 'debug-csv') return await handleDebugCSV()
    return json({ error: 'Acao desconhecida' }, 400)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return json({ error: msg }, 500)
  }
})

async function handleSync(supabase: ReturnType<typeof createClient>) {
  const googleCred = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON')
  let rows: Record<string, string>[] = []
  let gidUsed = 'n/a'
  let fetchMethod = 'csv'

  if (googleCred) {
    fetchMethod = 'api'
    rows = await fetchViaAPI(googleCred)
  } else {
    const result = await fetchViaCSVAutoGID()
    rows = result.rows
    gidUsed = result.gid
  }

  if (!rows.length) {
    return json({ synced: 0, message: 'Planilha vazia', gid_used: gidUsed, method: fetchMethod })
  }

  const sampleKeys = rows[0] ? Object.keys(rows[0]).slice(0, 8) : []
  const records = rows
    .map((r, i) => normalizeRowExact(r, i + 2))
    .filter(r => r.data_inspecao !== null)

  if (!records.length) {
    return json({
      synced: 0,
      message: 'Nenhuma linha com data valida',
      total_rows_lidas: rows.length,
      sample_headers: sampleKeys,
      gid_used: gidUsed,
      method: fetchMethod,
    })
  }

  const { error } = await supabase
    .from('inspecoes')
    .upsert(records, { onConflict: 'sheet_row' })

  if (error) throw error

  await supabase.from('sync_log').insert({
    rows_total:   rows.length,
    rows_new:     records.length,
    rows_updated: records.length,
    status:       'ok',
    error_msg:    `gid=${gidUsed} method=${fetchMethod} headers_sample=${sampleKeys.join('|')}`,
  })

  return json({
    synced:           records.length,
    total_rows_lidas: rows.length,
    gid_used:         gidUsed,
    method:           fetchMethod,
    sample_headers:   sampleKeys,
    timestamp:        new Date().toISOString(),
  })
}

async function fetchViaCSVAutoGID(): Promise<{ rows: Record<string, string>[]; gid: string }> {
  let best: Record<string, string>[] = []
  let bestGid = '0'

  for (const gid of GIDS_TO_TRY) {
    try {
      const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`
      const resp = await fetch(csvUrl, { redirect: 'follow' })
      if (!resp.ok) continue
      const text = await resp.text()
      if (text.trim().startsWith('<')) continue
      const parsed = parseCSVToRows(text)
      const hasKnownHeader = parsed.length > 0 && Object.keys(parsed[0]).some(k =>
        k.includes('rea Auditada') || k.includes('Inspetor') || k.includes('hor') || k.includes('Inspe')
      )
      if (hasKnownHeader && parsed.length > best.length) {
        best = parsed
        bestGid = gid
      }
    } catch { /* continua */ }
  }

  if (!best.length) {
    for (const gid of GIDS_TO_TRY) {
      try {
        const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`
        const resp = await fetch(csvUrl, { redirect: 'follow' })
        if (!resp.ok) continue
        const text = await resp.text()
        if (text.trim().startsWith('<')) continue
        const parsed = parseCSVToRows(text)
        if (parsed.length > best.length) { best = parsed; bestGid = gid }
      } catch { /* ignora */ }
    }
  }

  return { rows: best, gid: bestGid }
}

async function handleDebugCSV() {
  const result: Record<string, unknown>[] = []
  for (const gid of GIDS_TO_TRY) {
    try {
      const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`
      const resp = await fetch(csvUrl, { redirect: 'follow' })
      const text = await resp.text()
      const isHtml = text.trim().startsWith('<')
      if (isHtml) { result.push({ gid, status: 'html_error' }); continue }
      const parsed = parseCSVToRows(text)
      result.push({
        gid,
        rows: parsed.length,
        headers: parsed[0] ? Object.keys(parsed[0]) : [],
        first_row_sample: parsed[0] ?? null,
      })
    } catch (e) {
      result.push({ gid, error: String(e) })
    }
  }
  return json({ gids: result })
}

function parseCSVToRows(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []
  const headers = parseCSVLine(lines[0]).map(h => h.trim())
  return lines.slice(1)
    .map(line => {
      const vals = parseCSVLine(line)
      const obj: Record<string, string> = {}
      headers.forEach((h, i) => { obj[h] = (vals[i] ?? '').trim() })
      return obj
    })
    .filter(r => Object.values(r).some(v => v !== ''))
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let cur = '', inQ = false
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') { inQ = !inQ }
    else if (line[i] === ',' && !inQ) { result.push(cur); cur = '' }
    else { cur += line[i] }
  }
  result.push(cur)
  return result
}

function normalizeRowExact(obj: Record<string, string>, rowNum: number) {
  const get = (keys: string[]): string | null => {
    for (const k of keys) {
      if (obj[k] !== undefined && obj[k].trim() !== '') return obj[k].trim()
    }
    return null
  }

  const rawData  = get(FIELD_MAP.data) ?? get(FIELD_MAP.carimbo) ?? ''
  const dataInsp = parseDate(rawData)

  const normVal = (v: string | null): string => {
    if (!v) return 'NA'
    const l = v.toLowerCase().trim()
    if (l.includes('nao conforme') || l.includes('n\u00e3o conforme') || l.includes('nao-c') || l.includes('n\u00e3o-c')) return 'NC'
    if (l.includes('conforme')) return 'C'
    return 'NA'
  }

  const itensMap: Record<string, string | null> = {
    'APR':          get(FIELD_MAP.apr),
    'OS':           get(FIELD_MAP.os),
    'Check List':   get(FIELD_MAP.checklist),
    'Perm. Trab.':  get(FIELD_MAP.perm),
    'PEX':          get(FIELD_MAP.pex),
    'Capacete':     get(FIELD_MAP.capacete),
    'Oculos':       get(FIELD_MAP.oculos),
    'Botina':       get(FIELD_MAP.botina),
    'Luvas':        get(FIELD_MAP.luvas),
    'Uniforme FR':  get(FIELD_MAP.uniforme),
    'Escadas':      get(FIELD_MAP.escadas),
    'Residuos':     get(FIELD_MAP.residuos),
    'Limpeza':      get(FIELD_MAP.limpeza),
  }

  const ncs = Object.entries(itensMap)
    .filter(([, v]) => normVal(v) === 'NC')
    .map(([k]) => k)

  const obsParts: string[] = []
  for (const key of Object.keys(obj)) {
    for (const suf of OBS_SUFFIXES) {
      if (key.endsWith(suf) && obj[key] && obj[key].trim()) {
        obsParts.push(obj[key].trim())
        break
      }
    }
  }
  for (const field of EXTRA_OBS) {
    const v = obj[field]
    if (v && v.trim()) obsParts.push(v.trim())
  }

  const status = ncs.length === 0 ? 'Conforme' : 'Nao Conforme'

  return {
    sheet_row:     rowNum,
    data_inspecao: dataInsp,
    hora:          get(FIELD_MAP.hora),
    inspetor:      get(FIELD_MAP.inspetor),
    rodada:        get(FIELD_MAP.rodada),
    area:          get(FIELD_MAP.area),
    status,
    atividade:     get(FIELD_MAP.atividade),
    responsavel:   get(FIELD_MAP.responsavel),
    itens_nc:      ncs.length ? ncs.join(', ') : null,
    observacoes:   obsParts.length ? obsParts.join(' - ') : null,
    raw_data:      obj,
    synced_at:     new Date().toISOString(),
  }
}

function parseDate(s: string): string | null {
  if (!s) return null
  const tsMatch = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/)
  if (tsMatch) return `${tsMatch[3]}-${tsMatch[2].padStart(2,'0')}-${tsMatch[1].padStart(2,'0')}`
  const parts = s.split(/[\/\-.]/).map(p => p.trim())
  if (parts.length >= 3) {
    const [a, b, c] = parts
    if (a.length === 4) return `${a}-${b.padStart(2,'0')}-${c.padStart(2,'0')}`
    if (c.length === 4) return `${c}-${b.padStart(2,'0')}-${a.padStart(2,'0')}`
  }
  try { const d = new Date(s); return isNaN(d.getTime()) ? null : d.toISOString().slice(0,10) } catch { return null }
}

async function handleQuery(supabase: ReturnType<typeof createClient>, url: URL) {
  const dateFrom = url.searchParams.get('from')
  const dateTo   = url.searchParams.get('to')
  const area     = url.searchParams.get('area')
  const status   = url.searchParams.get('status')
  const limit    = parseInt(url.searchParams.get('limit') ?? '500')

  let q = supabase.from('inspecoes').select('*')
    .order('data_inspecao', { ascending: true })
    .order('hora',          { ascending: true })
    .limit(limit)

  if (dateFrom) q = q.gte('data_inspecao', dateFrom)
  if (dateTo)   q = q.lte('data_inspecao', dateTo)
  if (area)     q = q.ilike('area', `%${area}%`)
  if (status === 'conforme') q = q.ilike('status', 'Conforme')
  if (status === 'nc')       q = q.or('status.ilike.%Nao%,status.ilike.%N_o%')

  const { data, error } = await q
  if (error) throw error
  return json({ data, count: data?.length ?? 0 })
}

async function handleResumo(supabase: ReturnType<typeof createClient>, url: URL) {
  const dateFrom = url.searchParams.get('from')
  const dateTo   = url.searchParams.get('to')
  let q = supabase.from('vw_resumo_diario').select('*')
  if (dateFrom) q = q.gte('data_inspecao', dateFrom)
  if (dateTo)   q = q.lte('data_inspecao', dateTo)
  const { data, error } = await q
  if (error) throw error
  return json({ data })
}

async function handleNcFreq(supabase: ReturnType<typeof createClient>) {
  const { data, error } = await supabase.from('vw_nc_frequencia').select('*')
  if (error) throw error
  return json({ data })
}

async function handleSyncLog(supabase: ReturnType<typeof createClient>) {
  const { data, error } = await supabase
    .from('sync_log').select('*')
    .order('synced_at', { ascending: false }).limit(20)
  if (error) throw error
  return json({ data })
}

async function fetchViaAPI(credJson: string): Promise<Record<string, string>[]> {
  const cred = JSON.parse(credJson)
  const now   = Math.floor(Date.now() / 1000)
  const claim = { iss: cred.client_email, scope: 'https://www.googleapis.com/auth/spreadsheets.readonly', aud: 'https://oauth2.googleapis.com/token', exp: now + 3600, iat: now }
  const header  = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_')
  const payload = btoa(JSON.stringify(claim)).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_')
  const sigInput = `${header}.${payload}`
  const pemKey  = cred.private_key.replace(/-----[^-]+-----/g,'').replace(/\n/g,'')
  const keyData = Uint8Array.from(atob(pemKey), c => c.charCodeAt(0))
  const cryptoKey = await crypto.subtle.importKey('pkcs8', keyData, { name:'RSASSA-PKCS1-v1_5', hash:'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, new TextEncoder().encode(sigInput))
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_')
  const jwt = `${sigInput}.${sigB64}`
  const tokenResp = await fetch('https://oauth2.googleapis.com/token', { method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:`grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}` })
  const tokenData = await tokenResp.json()
  const token = tokenData.access_token
  if (!token) throw new Error('Falha token Google: ' + JSON.stringify(tokenData))
  const sheetResp = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/A:AZ?majorDimension=ROWS`, { headers:{ Authorization:`Bearer ${token}` } })
  const sheetData = await sheetResp.json()
  const rows: string[][] = sheetData.values ?? []
  if (rows.length < 2) return []
  const headers = rows[0].map((h: string) => h.trim())
  return rows.slice(1).map(row => {
    const obj: Record<string, string> = {}
    headers.forEach((h, i) => { obj[h] = row[i] ?? '' })
    return obj
  })
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: CORS })
}

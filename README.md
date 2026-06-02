# 1. Clone o repositório (se ainda não tiver local)
git clone https://github.com/wsousa1973ws-afk/inspeseg.git
cd inspeseg

# 2. Substitua o index.html pelo novo
#    (arraste o arquivo baixado "index.html" para a pasta inspeseg/)

# 3. Commit e push
git add index.html
git commit -m "fix: Supabase Edge Function - corrige sync da planilha Google Sheets"
git push origin main

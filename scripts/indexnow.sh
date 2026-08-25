#!/usr/bin/env bash
# After a deploy, read sitemap.xml and hand the whole URL list to IndexNow.
# Participating engines: Bing, Naver, Yandex, Seznam, Yep. One POST reaches all of them.
# The key file must be served at the site root to prove domain ownership.
set -euo pipefail
KEY=7cfa5af5103832ccd666a0a89c0d0300
HOST=nakchalsaju.com
echo "waiting for the Vercel deploy to finish"
sleep 150
curl -sS --max-time 60 --retry 3 --retry-delay 20 "https://$HOST/sitemap.xml" -o /tmp/sm.xml
grep -o "<loc>[^<]*</loc>" /tmp/sm.xml | sed -e "s|<loc>||" -e "s|</loc>||" > /tmp/urls.txt
COUNT=$(wc -l < /tmp/urls.txt)
echo "sitemap urls: $COUNT"
test "$COUNT" -gt 0
jq -R -s -c 'split("\n") | map(select(length > 0))' /tmp/urls.txt > /tmp/urls.json
jq -n --arg h "$HOST" --arg k "$KEY" --arg kl "https://$HOST/$KEY.txt" --slurpfile u /tmp/urls.json '{host: $h, key: $k, keyLocation: $kl, urlList: $u[0]}' > /tmp/body.json
CODE=$(curl -sS -o /tmp/resp.txt -w "%{http_code}" -X POST https://api.indexnow.org/IndexNow -H "Content-Type: application/json; charset=utf-8" --data @/tmp/body.json)
echo "IndexNow HTTP $CODE"
cat /tmp/resp.txt || true
echo
# 200 = accepted. 202 = accepted, key validation pending. Both are fine.
case "$CODE" in 200|202) exit 0 ;; *) exit 1 ;; esac

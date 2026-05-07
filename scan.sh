nano scan.sh

#!/bin/bash
cd ~/Documents/aistackscout

echo "=== 1. ENV-LIKE FILES ==="
find . -type f -name ".env*" -not -path "*/node_modules/*" -not -path "*/.git/*"

echo ""
echo "=== 2. FILES MENTIONING beehiiv ==="
grep -r -l -i beehiiv . --exclude-dir=node_modules --exclude-dir=.git 2>/dev/null

echo ""
echo "=== 3. FILES MENTIONING wordpress ==="
grep -r -l -i wordpress . --exclude-dir=node_modules --exclude-dir=.git 2>/dev/null

echo ""
echo "=== 4. FILES WITH API_KEY OR TOKEN OR SECRET ==="
grep -r -l -E "API_KEY|API_TOKEN|SECRET|PASSWORD|BEARER" . --exclude-dir=node_modules --exclude-dir=.git --exclude="*.example" 2>/dev/null

echo ""
echo "=== 5. ALL JSON FILES ==="
find . -name "*.json" -not -path "*/node_modules/*" -not -path "*/.git/*"

echo ""
echo "=== DONE ==="


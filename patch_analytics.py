import re

filepath = "frontend/src/app/(authenticated)/aurahq/analytics/page.tsx"
with open(filepath, 'r') as f:
    lines = f.readlines()

out = []
in_nav = False
for line in lines:
    if "<nav" in line and "REFINED NAV BAR" in line or "{/* --- REFINED NAV BAR --- */}" in line:
        in_nav = True
    if in_nav and "</nav>" in line:
        in_nav = False
        continue
    if not in_nav:
        out.append(line)

content = "".join(out)
content = re.sub(r'<div className="min-h-screen[^"]*">', r'<div className="space-y-6">', content)

with open(filepath, 'w') as f:
    f.write(content)

print("Patched analytics page.")

filepath = "frontend/src/app/(authenticated)/aurahq/analytics/page.tsx"
with open(filepath, 'r') as f:
    content = f.read()

content = content.replace("import Link from \\'next/link\\';", "import Link from 'next/link';")

with open(filepath, 'w') as f:
    f.write(content)

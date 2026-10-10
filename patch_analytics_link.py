import re

filepath = "frontend/src/app/(authenticated)/aurahq/analytics/page.tsx"
with open(filepath, 'r') as f:
    content = f.read()

# Add import
if "import LinkGenerator" not in content:
    content = re.sub(r'import Link from \'next/link\';', r'import Link from \'next/link\';\nimport LinkGenerator from "@/components/LinkGenerator";', content)

# Add LinkGenerator below <div className="space-y-6">
new_content = re.sub(
    r'<div className="space-y-6">\s*<div className="max-w-7xl mx-auto px-6 mt-12">',
    r'<div className="space-y-6">\n      <div className="max-w-7xl mx-auto px-6 mt-12 space-y-6">\n        <LinkGenerator />\n',
    content
)

with open(filepath, 'w') as f:
    f.write(new_content)

print("Patched analytics link generator.")

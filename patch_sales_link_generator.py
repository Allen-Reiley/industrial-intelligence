import re

filepath = "frontend/src/app/(authenticated)/aurahq/sales/page.tsx"
with open(filepath, 'r') as f:
    content = f.read()

# Replace the whole <section className="bg-white dark:bg-white/3 ... Generate Dynamic 24-Hour ... </section>
# Actually, I can use a regex to match the section.
new_content = re.sub(
    r'<section className="bg-white dark:bg-white/3 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 backdrop-blur-xl space-y-6">\s*<div className="flex items-center justify-between border-b.*?</form>\s*</section>',
    r'<LinkGenerator onSuccess={() => { mutateCheckouts(); mutateMetrics(); }} />',
    content,
    flags=re.DOTALL
)

# Also need to add import LinkGenerator from "@/components/LinkGenerator";
if "import LinkGenerator" not in new_content:
    new_content = re.sub(r'import Link from "next/link";', r'import Link from "next/link";\nimport LinkGenerator from "@/components/LinkGenerator";', new_content)

with open(filepath, 'w') as f:
    f.write(new_content)

print("Patched sales page with LinkGenerator.")

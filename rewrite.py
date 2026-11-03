import re
import os

files = [
    "frontend/src/app/(authenticated)/aurahq/sales/page.tsx",
    "frontend/src/app/(authenticated)/aurahq/analytics/page.tsx"
]

replacements = {
    r"bg-zinc-950": "bg-white dark:bg-gray-900",
    r"bg-zinc-900/50": "bg-white dark:bg-white/3",
    r"bg-zinc-900/40": "bg-white dark:bg-white/3",
    r"bg-zinc-900/30": "bg-white dark:bg-white/3",
    r"bg-zinc-900": "bg-gray-50 dark:bg-white/3",
    r"bg-zinc-850": "bg-gray-100 dark:bg-gray-800",
    r"bg-zinc-800/40": "bg-gray-50 dark:bg-white/3",
    r"bg-zinc-800": "bg-gray-100 dark:bg-gray-800",
    r"text-zinc-100": "text-gray-800 dark:text-white/90",
    r"text-zinc-200": "text-gray-700 dark:text-gray-300",
    r"text-zinc-300": "text-gray-600 dark:text-gray-400",
    r"text-zinc-400": "text-gray-500 dark:text-gray-400",
    r"text-zinc-500": "text-gray-400 dark:text-gray-500",
    r"text-zinc-600": "text-gray-400 dark:text-gray-500",
    r"border-zinc-900": "border-gray-200 dark:border-gray-800",
    r"border-zinc-850": "border-gray-200 dark:border-gray-800",
    r"border-zinc-800": "border-gray-200 dark:border-gray-800",
    r"border-zinc-700": "border-gray-300 dark:border-gray-700",
    r"bg-\[\#09090b\]/80": "bg-white/80 dark:bg-gray-900/80",
    r"bg-\[\#09090b\]": "bg-white dark:bg-gray-900",
    r"border-zinc-800/60": "border-gray-200 dark:border-gray-800",
}

for filepath in files:
    if not os.path.exists(filepath):
        continue
    with open(filepath, 'r') as f:
        content = f.read()
    
    for old, new in replacements.items():
        content = re.sub(old, new, content)
        
    with open(filepath, 'w') as f:
        f.write(content)

print("Rewrote classes.")

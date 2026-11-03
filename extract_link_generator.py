import re

filepath = "frontend/src/app/(authenticated)/aurahq/sales/page.tsx"
with open(filepath, "r") as f:
    content = f.read()

# Just extract the logic to see what it is
match = re.search(r'\{\/\* Dynamic Link Generator Form \*\/\}.*?(?=\{\/\* Live Attribution Feed)', content, re.DOTALL)
if match:
    print("Found Link Generator form.")

import re

with open("frontend/src/app/globals.css", "r") as f:
    css = f.read()

# Remove the dark custom-variant
css = re.sub(r"@custom-variant dark \(&:is\(\.dark \*\)\);\n?", "", css)

# Remove the dark mode block
css = re.sub(r"/\* Dark Mode Variables \*/\n\.dark\s*\{.*?\n\}\n", "", css, flags=re.DOTALL)

with open("frontend/src/app/globals.css", "w") as f:
    f.write(css)
print("Done")

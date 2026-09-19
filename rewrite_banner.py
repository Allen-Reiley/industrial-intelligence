import re

with open("tracker/src/banner/banner.js", "r") as f:
    content = f.read()

styles_block = re.search(r"style\.textContent = `(.*?)`;", content, re.DOTALL)
if not styles_block:
    print("Could not find style block")
    exit(1)

css = styles_block.group(1)

# Apply light mode replacements
replacements = [
    ("color-scheme: dark;", "color-scheme: light;"),
    ("background: rgba(10, 10, 10, 0.95);", "background: rgba(255, 255, 255, 0.95);"),
    ("border: 1px solid rgba(255, 255, 255, 0.08);", "border: 1px solid rgba(0, 0, 0, 0.08);"),
    ("color: #e2e8f0;", "color: #0f172a;"),
    ("color: #94a3b8;", "color: #475569;"),
    ("background: rgba(255, 255, 255, 0.08);", "background: rgba(0, 0, 0, 0.05);"),
    ("color: #f8fafc;", "color: #0f172a;"),
    ("background: rgba(15, 23, 42, 0.6);", "background: #f1f5f9;"),
    ("color: #cbd5e1;", "color: #475569;"),
    ("background: #020617;", "background: #f8fafc;"),
    ("border: 1px solid #1e293b;", "border: 1px solid #cbd5e1;"),
    ("background: #f8fafc;", "background: #0f172a;"),
    ("color: #020617;", "color: #f8fafc;"),
    ("background: #ffffff;", "background: #1e293b;"),
    ("color: #64748b;", "color: #64748b;"),
    ("border-bottom: 1px solid #1e293b;", "border-bottom: 1px solid #e2e8f0;"),
    ("background: rgba(0, 0, 0, 0.85);", "background: rgba(255, 255, 255, 0.85);"),
    ("background: #0a0a0a;", "background: #ffffff;")
]

# Specifically we want .aura-btn-primary.accent to stay green, but the rewrite above might mess it up.
# Let's just do targeted replacements.

css = css.replace("color-scheme: dark;", "color-scheme: light;")
css = css.replace("background: rgba(10, 10, 10, 0.95);", "background: rgba(255, 255, 255, 0.95);")
css = css.replace("border: 1px solid rgba(255, 255, 255, 0.08);", "border: 1px solid rgba(0, 0, 0, 0.08);")
css = css.replace("color: #e2e8f0;", "color: #0f172a;")
css = css.replace("color: #94a3b8;", "color: #475569;")
css = css.replace("background: rgba(255, 255, 255, 0.08);", "background: rgba(0, 0, 0, 0.05);")
css = css.replace("background: rgba(15, 23, 42, 0.6);", "background: #f1f5f9;")
css = css.replace("color: #cbd5e1;", "color: #475569;")

# Input box
css = css.replace("background: #020617;", "background: #f8fafc;")
css = css.replace("border: 1px solid #1e293b;", "border: 1px solid #cbd5e1;")
css = css.replace("color: #f8fafc;", "color: #0f172a;")

# Buttons (the logic above might conflict since we replaced #f8fafc)
# Let's just manually replace the button block
css = re.sub(
    r"\.aura-btn-primary \{\s*background: #f8fafc;\s*color: #020617;",
    ".aura-btn-primary {\\n                background: #0f172a;\\n                color: #f8fafc;",
    css
)
css = re.sub(
    r"\.aura-btn-primary:hover:not\(:disabled\) \{\s*background: #ffffff;",
    ".aura-btn-primary:hover:not(:disabled) {\\n                background: #1e293b;",
    css
)
css = re.sub(
    r"border-bottom: 1px solid #1e293b;",
    "border-bottom: 1px solid #e2e8f0;",
    css
)
css = re.sub(
    r"\.aura-modal-overlay \{\s*([\s\S]*?)background: rgba\(0, 0, 0, 0\.85\);",
    ".aura-modal-overlay {\\n\\1background: rgba(255, 255, 255, 0.85);",
    css
)
css = re.sub(
    r"\.aura-modal \{\s*background: #0a0a0a;",
    ".aura-modal {\\n                background: #ffffff;",
    css
)
css = re.sub(
    r"box-shadow: 0 25px 50px -12px rgba\(0, 0, 0, 0\.9\);",
    "box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);",
    css
)

new_content = content.replace(styles_block.group(1), css)

with open("tracker/src/banner/banner.js", "w") as f:
    f.write(new_content)

print("Done")

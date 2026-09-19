import re

with open("tracker/src/banner/banner.js", "r") as f:
    content = f.read()

replacement = """
            const rootStyle = window.getComputedStyle(document.documentElement);
            const varPrimary = rootStyle.getPropertyValue('--primary') || rootStyle.getPropertyValue('--color-brand');
            const varAccent = rootStyle.getPropertyValue('--accent');
            const varBg = rootStyle.getPropertyValue('--background');

            const getMostFreq = (dict) => Object.entries(dict).sort((a,b) => b[1]-a[1])[0]?.[0];
            const domBg = (isValid(varBg) ? varBg.trim() : null) || getMostFreq(colors.bg);
            const domAccent = (isValid(varPrimary) ? varPrimary.trim() : null) || (isValid(varAccent) ? varAccent.trim() : null) || getMostFreq(colors.accent);
"""

# Replace lines 161-169 with the correct logic
content = re.sub(r"            const rootStyle = window\.getComputedStyle\(document\.documentElement\);\n(?:.*\n){7}            const domAccent = getMostFreq\(colors\.accent\);", replacement.strip("\n"), content)

with open("tracker/src/banner/banner.js", "w") as f:
    f.write(content)

print("Fixed")

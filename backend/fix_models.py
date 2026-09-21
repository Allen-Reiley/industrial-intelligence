import os
import re

MODELS_DIR = "app/models"

for filename in os.listdir(MODELS_DIR):
    if not filename.endswith(".py"):
        continue
    filepath = os.path.join(MODELS_DIR, filename)
    with open(filepath, "r") as f:
        content = f.read()

    # Change import
    if "from uuid import UUID, uuid4" in content:
        content = content.replace("from uuid import UUID, uuid4", "from uuid import UUID\nfrom uuid6 import uuid7")
    elif "from uuid import uuid4, UUID" in content:
        content = content.replace("from uuid import uuid4, UUID", "from uuid import UUID\nfrom uuid6 import uuid7")
    
    # Change default_factory
    content = content.replace("default_factory=uuid4", "default_factory=uuid7")

    # Remove redundant index=True on primary keys
    content = re.sub(r'(id:\s*UUID\s*=\s*Field\([^)]*primary_key=True[^)]*?),\s*index=True([^)]*\))', r'\1\2', content)

    with open(filepath, "w") as f:
        f.write(content)

print("Done fixing models")

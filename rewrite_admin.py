with open("frontend/src/app/(authenticated)/aurahq/admin/page.tsx", "r") as f:
    original = f.read()

# I will write a new version.
# Let's save the original as backup just in case
with open("frontend/src/app/(authenticated)/aurahq/admin/page.tsx.bak", "w") as f:
    f.write(original)

import re

with open("frontend/src/app/(authenticated)/aurahq/layout.tsx", "r") as f:
    content = f.read()

new_logout = """  const handleLogout = async () => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      await fetch(`${apiBase}/api/v1/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
    
    // Clear local storage credentials
    document.cookie = "aurahq_auth=; path=/; max-age=0; SameSite=Lax; Secure";
    document.cookie = "admin_access_token=; path=/; max-age=0; SameSite=Lax; Secure";
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_refresh_token');
    router.push('/login');
  };"""

content = re.sub(
    r"  const handleLogout = \(\) => \{\n.*?router\.push\('/login'\);\n  \};",
    new_logout,
    content,
    flags=re.DOTALL
)

with open("frontend/src/app/(authenticated)/aurahq/layout.tsx", "w") as f:
    f.write(content)

print("Fixed layout.tsx")

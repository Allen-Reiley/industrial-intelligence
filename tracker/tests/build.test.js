const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

describe('Build Script Execution', () => {
  const trackerDir = path.resolve(__dirname, '..');
  const distDir = path.resolve(trackerDir, 'dist');
  const auraMin = path.resolve(distDir, 'aura.min.js');
  const bannerMin = path.resolve(distDir, 'banner.min.js');

  beforeAll(() => {
    // Ensure dist directory exists or clean it
    if (fs.existsSync(distDir)) {
      if (fs.existsSync(auraMin)) fs.unlinkSync(auraMin);
      if (fs.existsSync(bannerMin)) fs.unlinkSync(bannerMin);
    } else {
      fs.mkdirSync(distDir, { recursive: true });
    }
  });

  test('executes npm run build successfully and generates minified files', () => {
    // Run npm run build
    expect(() => {
      execSync('npm run build', { cwd: trackerDir, stdio: 'pipe' });
    }).not.toThrow();

    // Verify files are generated
    expect(fs.existsSync(auraMin)).toBe(true);
    expect(fs.existsSync(bannerMin)).toBe(true);

    // Verify files have non-zero size
    const auraStats = fs.statSync(auraMin);
    const bannerStats = fs.statSync(bannerMin);

    expect(auraStats.size).toBeGreaterThan(0);
    expect(bannerStats.size).toBeGreaterThan(0);
  });
});

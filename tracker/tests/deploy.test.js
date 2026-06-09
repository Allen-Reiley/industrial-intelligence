const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

describe('deploy.sh script', () => {
  const trackerDir = path.resolve(__dirname, '..');
  const deployScript = path.resolve(trackerDir, 'deploy.sh');

  test('exists and is executable', () => {
    expect(fs.existsSync(deployScript)).toBe(true);
    const stats = fs.statSync(deployScript);
    const isExecutable = !!(stats.mode & 0o111);
    expect(isExecutable).toBe(true);
  });

  test('contains required Cache-Control and Content-Type configurations', () => {
    const content = fs.readFileSync(deployScript, 'utf8');
    
    // Assert cache-control config
    expect(content).toContain('--cache-control "public, max-age=86400"');
    
    // Assert content-type config
    expect(content).toContain('--content-type "application/javascript"');
    
    // Assert it builds before copying
    expect(content).toContain('npm run build');
  });

  test('executes successfully when AWS CLI is mocked', () => {
    const tempBinDir = path.resolve(__dirname, 'temp-bin');
    if (!fs.existsSync(tempBinDir)) {
      fs.mkdirSync(tempBinDir);
    }
    
    const mockAws = path.resolve(tempBinDir, 'aws');
    fs.writeFileSync(mockAws, '#!/bin/sh\necho "Mock AWS called with: $@"\nexit 0', { mode: 0o755 });

    try {
      const output = execSync('./deploy.sh', {
        cwd: trackerDir,
        env: {
          ...process.env,
          PATH: `${tempBinDir}:${process.env.PATH}`,
          BUCKET_NAME: 'test-deploy-bucket'
        },
        encoding: 'utf8'
      });

      expect(output).toContain('Mock AWS called with: s3 cp dist/aura.min.js s3://test-deploy-bucket/aura.js');
      expect(output).toContain('Mock AWS called with: s3 cp dist/banner.min.js s3://test-deploy-bucket/banner.js');
      expect(output).toContain('Edge assets deployment completed successfully!');
    } finally {
      // Cleanup
      if (fs.existsSync(mockAws)) fs.unlinkSync(mockAws);
      if (fs.existsSync(tempBinDir)) fs.rmdirSync(tempBinDir);
    }
  });
});

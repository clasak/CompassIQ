const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(process.cwd(), 'db', 'migrations');
const migrations = [
  '001_init.sql',
  '002_rls.sql',
  '003_seed_metric_catalog.sql',
  '004_invites_and_org_admin.sql',
  '005_org_settings_and_roi.sql',
  '006_branding.sql',
  '007_ingestion.sql'
];

let allSQL = '';

migrations.forEach(migrationFile => {
  const filePath = path.join(migrationsDir, migrationFile);
  const sql = fs.readFileSync(filePath, 'utf-8');
  allSQL += `\n-- ============================================================\n`;
  allSQL += `-- ${migrationFile}\n`;
  allSQL += `-- ============================================================\n\n`;
  allSQL += sql + '\n\n';
});

const outputPath = path.join(process.cwd(), 'db', 'migrations_consolidated.sql');
fs.writeFileSync(outputPath, allSQL);

console.log(`✅ Consolidated SQL file created at ${outputPath}`);

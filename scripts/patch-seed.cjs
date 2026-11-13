const fs = require('fs');
let code = fs.readFileSync('scripts/seed-global-vacancies.cjs', 'utf8');
code = code.replace(
  'const { error } = await supabase.from(\'jobs\').insert([job]);',
  `const jobWithDesc = { ...job, description: job.job_summary || job.title };
      const { error } = await supabase.from('jobs').insert([jobWithDesc]);`
);
fs.writeFileSync('scripts/seed-global-vacancies.cjs', code, 'utf8');
console.log('Updated seed script with description!');

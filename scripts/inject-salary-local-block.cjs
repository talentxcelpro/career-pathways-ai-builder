const fs = require('fs');
const path = require('path');

const seoRenderPath = path.resolve('api/seo-render.ts');
let code = fs.readFileSync(seoRenderPath, 'utf8');

const targetSection = `      bodyContent = \`
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 class="text-xl font-bold text-white">\${escapeHtml(roleName)} compensation in \${escapeHtml(cityName)}</h2>
          <p class="text-slate-300 text-sm leading-relaxed">Review current verified job listings for compensation details supplied by employers.</p>
          <div class="pt-4 flex flex-wrap gap-3">
            <a href="/jobs" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl">Browse Live \${escapeHtml(roleName)} Jobs &rarr;</a>
            <a href="/resume/ats-check" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl">Free ATS Resume Scan &rarr;</a>
          </div>
        </section>
      \`;`;

const replacement = `      const localData = generateProgrammaticLocalDataBlock(roleName, cityName);
      bodyContent = \`
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 class="text-xl font-bold text-white">\${escapeHtml(roleName)} compensation benchmarks in \${escapeHtml(cityName)}</h2>
          <p class="text-slate-300 text-sm leading-relaxed">
            Review comprehensive compensation analytics, salary distributions, and market benchmarks for \${escapeHtml(roleName)} roles in \${escapeHtml(cityName)}. Data is compiled from verified employer requisitions, industry offerings, and verified candidate disclosures.
          </p>
          <div class="pt-2 flex flex-wrap gap-3">
            <a href="/jobs" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow transition">Browse Live \${escapeHtml(roleName)} Jobs &rarr;</a>
            <a href="/ats-check" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition">Free ATS Resume Scan &rarr;</a>
          </div>
          \${localData.htmlBlock}
        </section>
      \`;
      jsonLdSchema = [
        jsonLdSchema,
        localData.faqSchema
      ];`;

if (code.includes(targetSection)) {
  code = code.replace(targetSection, replacement);
  fs.writeFileSync(seoRenderPath, code, 'utf8');
  console.log('✓ Successfully injected localData into /salary/* route in api/seo-render.ts');
} else {
  console.log('Target section not found by exact string, checking with regex...');
  const regex = /bodyContent\s*=\s*`\s*<section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">\s*<h2 class="text-xl font-bold text-white">\$\{escapeHtml\(roleName\)\} compensation in \$\{escapeHtml\(cityName\)\}<\/h2>[\s\S]*?<\/section>\s*`;/;
  if (regex.test(code)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync(seoRenderPath, code, 'utf8');
    console.log('✓ Successfully injected localData using regex in api/seo-render.ts');
  } else {
    console.error('Failed to match salary section');
  }
}

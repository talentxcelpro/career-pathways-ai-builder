// scripts/add-jobmatch-modals.cjs
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'components', 'products', 'JobMatchProduct.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add Bookmark Button next to ExternalLink in each job card
const externalLinkBlock = `<div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E2E8F0]">
                        {job.external_url && (
                          <a 
                            href={job.external_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-xl bg-[#F4F7FC] border border-[#E2E8F0] text-[#64748B] hover:text-[#2563EB] hover:border-[#2563EB] transition-colors"
                            title="Original Source Notice"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}`;

const withBookmark = `<div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E2E8F0]">
                        <button
                          type="button"
                          onClick={(e) => toggleSaveJob(job.id, e)}
                          className={\`p-2.5 rounded-xl border transition-colors \${
                            savedJobIds.includes(job.id)
                              ? 'bg-amber-50 border-amber-300 text-amber-600'
                              : 'bg-[#F4F7FC] border-[#E2E8F0] text-[#64748B] hover:text-[#2563EB]'
                          }\`}
                          title={savedJobIds.includes(job.id) ? 'Saved' : 'Save vacancy'}
                        >
                          <Bookmark className={\`w-4 h-4 \${savedJobIds.includes(job.id) ? 'fill-amber-500' : ''}\`} />
                        </button>
                        {job.external_url && (
                          <a 
                            href={job.external_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-xl bg-[#F4F7FC] border border-[#E2E8F0] text-[#64748B] hover:text-[#2563EB] hover:border-[#2563EB] transition-colors"
                            title="Original Source Notice"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}`;

content = content.replace(externalLinkBlock, withBookmark);

// 2. Add Job Alert Modal before UpgradeModal
const alertModalCode = `
      {/* Daily Job Digest Alert Modal */}
      {isAlertModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <Badge className="bg-blue-50 text-[#2563EB] border-blue-200 text-[10px] font-bold mb-1">
                  100% Free Daily Digest
                </Badge>
                <h3 className="text-base font-bold text-[#111827]">Get Daily Verified Vacancies</h3>
              </div>
              <button onClick={() => setIsAlertModalOpen(false)} className="text-[#64748B] hover:text-[#111827] text-lg font-bold">×</button>
            </div>
            <p className="text-xs text-[#64748B]">
              Receive verified {activeCategory.toUpperCase()} vacancies curated every morning directly in your inbox. No spam, one-click unsubscribe anytime.
            </p>
            <form onSubmit={handleSubscribeAlert} className="space-y-3">
              <Input
                type="email"
                placeholder="Enter your email (e.g. rahul@gmail.com)..."
                value={alertEmail}
                onChange={(e) => setAlertEmail(e.target.value)}
                className="bg-[#F4F7FC] border-[#E2E8F0] text-xs font-medium"
                required
              />
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAlertModalOpen(false)} className="flex-1 text-xs border-[#E2E8F0]">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-gradient-to-r from-[#2563EB] to-[#7138E8] text-white text-xs font-bold">
                  Activate Alert
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
`;

content = content.replace('{/* Shared Global Product Footer */}', `${alertModalCode}\n      {/* Shared Global Product Footer */}`);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated JobMatchProduct.tsx with bookmarking and job alert modal');

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { COMPANY_HUB_INDEX_THRESHOLD, countLiveJobsForCompanyHub, toCompanyHubSlug } from '../companyHubAliases.js';
import { getPublicCompanyUrl } from '../canonicalUrls.js';

describe('Company hub live >= 10 gate & shared slugifier', () => {
  it('shares normalizeSlug between getPublicCompanyUrl and toCompanyHubSlug', () => {
    assert.equal(getPublicCompanyUrl('Tata Steel Ltd.'), 'https://talentxcel.in/company/' + toCompanyHubSlug('Tata Steel Ltd.'));
    assert.equal(toCompanyHubSlug('L&T Infotech'), 'lt-infotech');
  });

  it('counts alias matches for ntpc, hal, jindal-steel, l-and-t, bhel', () => {
    const jobs = [
      ...Array.from({ length: 12 }, () => ({ company_name: 'NTPC Limited' })),
      ...Array.from({ length: 6 }, () => ({ company_name: 'HAL Kanpur' })),
      ...Array.from({ length: 5 }, () => ({ company_name: 'HAL Ozar' })),
      ...Array.from({ length: 10 }, () => ({ company_name: 'Jindal Steel & Power' })),
      ...Array.from({ length: 15 }, () => ({ company_name: 'L&T Infotech' })),
      ...Array.from({ length: 10 }, () => ({ company_name: 'BHEL Bhopal' })),
      ...Array.from({ length: 5 }, () => ({ company_name: 'Zomato' })),
    ];
    assert.ok(countLiveJobsForCompanyHub('ntpc', jobs) >= COMPANY_HUB_INDEX_THRESHOLD);
    assert.ok(countLiveJobsForCompanyHub('hal', jobs) >= COMPANY_HUB_INDEX_THRESHOLD);
    assert.ok(countLiveJobsForCompanyHub('jindal-steel', jobs) >= COMPANY_HUB_INDEX_THRESHOLD);
    assert.ok(countLiveJobsForCompanyHub('l-and-t', jobs) >= COMPANY_HUB_INDEX_THRESHOLD);
    assert.ok(countLiveJobsForCompanyHub('bhel', jobs) >= COMPANY_HUB_INDEX_THRESHOLD);
    assert.ok(countLiveJobsForCompanyHub('zomato', jobs) < COMPANY_HUB_INDEX_THRESHOLD);
  });
});

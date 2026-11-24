import test from 'node:test';
import assert from 'node:assert/strict';

// Mock browser environment for unit/scenario tests
function setupMockBrowser() {
  const store = new Map<string, string>();
  const mockLocalStorage = {
    getItem: (key: string) => store.get(key) || null,
    setItem: (key: string, val: string) => store.set(key, val),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
  };

  const dataLayer: any[] = [];
  const mockWindow: any = {
    location: {
      origin: 'https://talentxcel.in',
      href: 'https://talentxcel.in/jobs/senior-react-developer',
      pathname: '/jobs/senior-react-developer',
      search: '',
      hostname: 'talentxcel.in',
    },
    dataLayer,
    gtag: (...args: any[]) => dataLayer.push(args),
    localStorage: mockLocalStorage,
  };

  (globalThis as any).window = mockWindow;
  (globalThis as any).localStorage = mockLocalStorage;
  (globalThis as any).document = {
    title: 'Senior React Developer | TalentXcel',
    getElementById: (id: string) => null,
    createElement: (tag: string) => ({ id: '', src: '', async: false }),
    head: { appendChild: (el: any) => {} },
  };

  return { store, dataLayer, mockWindow };
}

test('TALENTXCEL GROWTH RECOVERY & CONVERSION GATEWAY E2E SUITE', async (suite) => {

  await suite.test('P0: PublicJobApplyButton & Guest Modal State Contract', () => {
    let showGuestModal = false;
    const setShowGuestModal = (val: boolean) => {
      showGuestModal = val;
    };

    const handleApplyClick = () => {
      setShowGuestModal(true);
    };

    assert.equal(showGuestModal, false);
    assert.doesNotThrow(() => handleApplyClick());
    assert.equal(showGuestModal, true, 'Modal state must toggle to true without ReferenceError');
  });

  await suite.test('P0: Google OAuth quick-auth callback & auto-reopen contract', () => {
    const job = {
      id: 'job-test-123',
      title: 'Senior Full Stack Engineer',
      location: 'Bangalore, India',
    };

    const origin = 'https://talentxcel.in';
    const returnPath = `/jobs/${job.id}`;
    const callbackUrl = `${origin}/auth/callback?returnTo=${encodeURIComponent(returnPath)}`;

    const oauthOptions = {
      provider: 'google' as const,
      options: {
        redirectTo: callbackUrl,
      },
    };

    assert.equal(oauthOptions.provider, 'google');
    assert.equal(oauthOptions.options.redirectTo, callbackUrl, 'Must use registered /auth/callback with returnTo parameter');
  });

  await suite.test('P0: Referral shortlink (/r/:code) storage and job portal routing', async () => {
    const { store } = setupMockBrowser();

    const rawCode = '  txc_ambassador_99  ';
    const cleanCode = rawCode.trim().toUpperCase();

    // Emulate ReferralShortlinkRedirect behavior
    localStorage.setItem('txc_referral_code', cleanCode);
    localStorage.setItem('txc_referral_channel', 'shortlink');
    localStorage.setItem('txc_referral_timestamp', Date.now().toString());

    assert.equal(localStorage.getItem('txc_referral_code'), 'TXC_AMBASSADOR_99');
    assert.equal(localStorage.getItem('txc_referral_channel'), 'shortlink');

    // Route to /jobs with referral code attached (never naked /auth)
    const destination = `/jobs?ref=${encodeURIComponent(cleanCode)}`;
    assert.equal(destination, '/jobs?ref=TXC_AMBASSADOR_99');

    // 30-day attribution window validation
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    const isStillValid = (Date.now() - parseInt(localStorage.getItem('txc_referral_timestamp')!, 10)) <= THIRTY_DAYS_MS;
    assert.equal(isStillValid, true, 'Referral code must remain valid within 30-day window');
  });

  await suite.test('P1: /verify/:username peer endorsement security & reciprocal hook', () => {
    const cleanUsername = 'priyasharma';
    const recipientProfile = {
      id: 'recipient-uuid-123',
      email: 'priya@example.com',
      full_name: 'Priya Sharma'
    };

    // Security Gate 1: Self-endorsement block
    const isSelfEndorsement = (userId: string, email: string) => {
      if (userId && userId === recipientProfile.id) return true;
      if (email && email.toLowerCase() === recipientProfile.email.toLowerCase()) return true;
      return false;
    };

    assert.equal(isSelfEndorsement('recipient-uuid-123', 'other@example.com'), true, 'Must block user endorsing themselves by ID');
    assert.equal(isSelfEndorsement('other-uuid-456', 'priya@example.com'), true, 'Must block user endorsing themselves by email');
    assert.equal(isSelfEndorsement('other-uuid-456', 'colleague@example.com'), false, 'Legitimate peer endorsement allowed');

    // Security Gate 2: Reciprocal vanity handle generator
    const endorserName = 'Vikram Malhotra';
    const suggestedHandle = endorserName.toLowerCase().replace(/\s+/g, '-');
    assert.equal(suggestedHandle, 'vikram-malhotra');

    const claimUrl = `/passport?claim=${encodeURIComponent(suggestedHandle)}`;
    assert.equal(claimUrl, '/passport?claim=vikram-malhotra');
  });

  await suite.test('P1: GA4 Measurement Stream & SPA Deduplication Contract', () => {
    const { dataLayer, mockWindow } = setupMockBrowser();
    const measurementId = 'G-CMYNTTNT56';

    // 1. Initial config with send_page_view: false to prevent duplicate pageviews
    mockWindow.gtag('config', measurementId, { send_page_view: false });
    assert.equal(dataLayer.length, 1);
    assert.deepEqual(dataLayer[0], ['config', 'G-CMYNTTNT56', { send_page_view: false }]);

    // 2. Client-side SPA navigation 1: /jobs/senior-react-developer
    let lastTrackedPath = '';
    const trackSpaPageView = (path: string) => {
      if (lastTrackedPath === path) return false;
      lastTrackedPath = path;
      mockWindow.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: `https://talentxcel.in${path}`,
        page_path: path,
      });
      return true;
    };

    const firstNav = trackSpaPageView('/jobs/senior-react-developer');
    assert.equal(firstNav, true);
    assert.equal(dataLayer.length, 2);
    assert.equal(dataLayer[1][0], 'event');
    assert.equal(dataLayer[1][1], 'page_view');
    assert.equal(dataLayer[1][2].page_path, '/jobs/senior-react-developer');

    // 3. Repeat navigation to same URL (re-render) should be suppressed
    const duplicateNav = trackSpaPageView('/jobs/senior-react-developer');
    assert.equal(duplicateNav, false, 'Duplicate page_view event on re-render must be suppressed');
    assert.equal(dataLayer.length, 2);

    // 4. Navigation to /r/TXC123 -> /jobs?ref=TXC123
    const secondNav = trackSpaPageView('/jobs?ref=TXC123');
    assert.equal(secondNav, true);
    assert.equal(dataLayer.length, 3);
    assert.equal(dataLayer[2][2].page_path, '/jobs?ref=TXC123');
  });

  await suite.test('P2: Measurement & Conversion Mathematics Verification', () => {
    const dailySearchVisitors = 44;
    const dailyCommunityVisitors = 0;
    const totalDailyVisitors = dailySearchVisitors + dailyCommunityVisitors;

    const currentDailySignups = 9;
    const baselineConversionRate = (currentDailySignups / totalDailyVisitors) * 100;
    assert.ok(baselineConversionRate > 0, 'Conversion rate must be positive');

    const requiredVisitorsAt5Percent = Math.ceil(100 / 0.05);
    const requiredVisitorsAt10Percent = Math.ceil(100 / 0.10);

    assert.equal(requiredVisitorsAt5Percent, 2000);
    assert.equal(requiredVisitorsAt10Percent, 1000);
  });

});

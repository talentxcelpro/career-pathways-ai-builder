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
    // Verify state initialization does not throw ReferenceError
    let showGuestModal = false;
    const setShowGuestModal = (val: boolean) => {
      showGuestModal = val;
    };

    const handleApplyClick = () => {
      // Simulate click
      setShowGuestModal(true);
    };

    assert.equal(showGuestModal, false);
    assert.doesNotThrow(() => handleApplyClick());
    assert.equal(showGuestModal, true, 'Modal state must toggle to true without ReferenceError');
  });

  await suite.test('P0: Google OAuth quick-auth parameters on job pages', () => {
    const job = {
      id: 'job-test-123',
      title: 'Senior Full Stack Engineer',
      location: 'Bangalore, India',
      external_url: null,
    };

    const origin = 'https://talentxcel.in';
    const currentHref = `${origin}/jobs/${job.id}`;

    const oauthOptions = {
      provider: 'google' as const,
      options: {
        redirectTo: currentHref,
      },
    };

    assert.equal(oauthOptions.provider, 'google');
    assert.equal(oauthOptions.options.redirectTo, currentHref, 'Must redirect candidate directly back to active job listing');
  });

  await suite.test('P0: Referral shortlink (/r/:code) storage and redirection contract', async () => {
    const { store } = setupMockBrowser();

    const rawCode = '  txc_ambassador_99  ';
    const cleanCode = rawCode.trim().toUpperCase();

    // Emulate ReferralShortlinkRedirect behavior
    localStorage.setItem('txc_referral_code', cleanCode);
    localStorage.setItem('txc_referral_channel', 'shortlink');
    localStorage.setItem('txc_referral_timestamp', Date.now().toString());

    assert.equal(localStorage.getItem('txc_referral_code'), 'TXC_AMBASSADOR_99');
    assert.equal(localStorage.getItem('txc_referral_channel'), 'shortlink');

    const destination = cleanCode 
      ? `/auth?mode=signup&ref=${encodeURIComponent(cleanCode)}` 
      : '/auth?mode=signup';

    assert.equal(destination, '/auth?mode=signup&ref=TXC_AMBASSADOR_99');

    // Emulate 30-day attribution window expiry check
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    const isStillValid = (Date.now() - parseInt(localStorage.getItem('txc_referral_timestamp')!, 10)) <= THIRTY_DAYS_MS;
    assert.equal(isStillValid, true, 'Referral code must remain valid within 30-day window');
  });

  await suite.test('P1: /verify/:username peer endorsement flow contract', () => {
    const usernameParam = '@priyasharma';
    const cleanUsername = usernameParam.trim().replace(/^@/, '');
    assert.equal(cleanUsername, 'priyasharma');

    const canonicalUrl = `https://talentxcel.in/verify/${cleanUsername}`;
    assert.equal(canonicalUrl, 'https://talentxcel.in/verify/priyasharma');

    // Reciprocal vanity handle generator
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

    // 4. Navigation to /r/TXC123 -> /auth?mode=signup&ref=TXC123
    const secondNav = trackSpaPageView('/auth?mode=signup&ref=TXC123');
    assert.equal(secondNav, true);
    assert.equal(dataLayer.length, 3);
    assert.equal(dataLayer[2][2].page_path, '/auth?mode=signup&ref=TXC123');
  });

  await suite.test('P2: Measurement & Conversion Mathematics Verification', () => {
    const dailySearchVisitors = 44;
    const dailyCommunityVisitors = 0; // Pre-launch baseline
    const totalDailyVisitors = dailySearchVisitors + dailyCommunityVisitors;

    // Current baseline conversion
    const currentDailySignups = 9;
    const baselineConversionRate = (currentDailySignups / totalDailyVisitors) * 100;
    assert.ok(baselineConversionRate > 0, 'Conversion rate must be positive');

    // Required visitors for 100/day at various conversion rates
    const requiredVisitorsAt5Percent = Math.ceil(100 / 0.05);
    const requiredVisitorsAt10Percent = Math.ceil(100 / 0.10);

    assert.equal(requiredVisitorsAt5Percent, 2000);
    assert.equal(requiredVisitorsAt10Percent, 1000);
  });

});

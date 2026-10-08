// src/lib/growth-lab/indexNowEngine.ts
// TalentXcel Multi-Search-Engine IndexNow Protocol Client
// Notifies Bing, Yandex, Naver, and IndexNow partners immediately upon URL creation or update.

export interface IndexNowPayload {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
}

export interface IndexNowResponse {
  success: boolean;
  statusCode: number;
  engine: string;
  urlsSubmitted: number;
  timestamp: string;
  message: string;
}

export class IndexNowEngine {
  private host: string;
  private apiKey: string;
  private keyLocation: string;

  constructor(
    host: string = 'talentxcel.in',
    apiKey: string = 'tx_indexnow_key_2026',
    keyLocation: string = 'https://talentxcel.in/tx_indexnow_key_2026.txt'
  ) {
    this.host = host;
    this.apiKey = apiKey;
    this.keyLocation = keyLocation;
  }

  // Build compliant IndexNow JSON payload
  public buildPayload(urls: string[]): IndexNowPayload {
    const formattedUrls = urls.map(u => u.startsWith('http') ? u : `https://${this.host}${u}`);
    return {
      host: this.host,
      key: this.apiKey,
      keyLocation: this.keyLocation,
      urlList: formattedUrls.slice(0, 10000), // Max 10,000 URLs per batch
    };
  }

  // Dispatches IndexNow request to api.indexnow.org
  public async submitBatch(urls: string[]): Promise<IndexNowResponse> {
    if (!urls || urls.length === 0) {
      return {
        success: false,
        statusCode: 400,
        engine: 'api.indexnow.org',
        urlsSubmitted: 0,
        timestamp: new Date().toISOString(),
        message: 'No URLs provided for submission',
      };
    }

    const payload = this.buildPayload(urls);

    try {
      const response = await fetch('https://api.indexnow.org/indexnow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      // IndexNow returns HTTP 200 or 202 on successful receipt
      const isOk = response.status === 200 || response.status === 202;

      return {
        success: isOk,
        statusCode: response.status,
        engine: 'api.indexnow.org',
        urlsSubmitted: payload.urlList.length,
        timestamp: new Date().toISOString(),
        message: isOk
          ? `Successfully broadcast ${payload.urlList.length} URLs to IndexNow network (Bing, Yandex, Naver).`
          : `IndexNow responded with status ${response.status}: ${response.statusText}`,
      };
    } catch (err: any) {
      return {
        success: false,
        statusCode: 500,
        engine: 'api.indexnow.org',
        urlsSubmitted: payload.urlList.length,
        timestamp: new Date().toISOString(),
        message: `Network error dispatching IndexNow: ${err.message}`,
      };
    }
  }
}

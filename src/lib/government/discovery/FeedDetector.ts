/**
 * TalentXcel Global Jobs Network — Feed Detector
 * Identifies RSS 2.0, Atom 1.0, JSON, and XML open vacancy feeds.
 */

export interface DetectedFeed {
  feedType: 'RSS' | 'ATOM' | 'JSON_FEED' | 'XML_DATASET';
  url: string;
  title?: string;
  itemCount: number;
}

export class FeedDetector {
  public static detectFeed(content: string, url: string): DetectedFeed | null {
    const trimmed = content.trim().toLowerCase();

    if (trimmed.includes('<rss') || trimmed.includes('<channel')) {
      return { feedType: 'RSS', url, itemCount: (trimmed.match(/<item/g) || []).length };
    }
    if (trimmed.includes('<feed') && trimmed.includes('xmlns="http://www.w3.org/2005/atom"')) {
      return { feedType: 'ATOM', url, itemCount: (trimmed.match(/<entry/g) || []).length };
    }
    if (trimmed.startsWith('{') && (trimmed.includes('"items"') || trimmed.includes('"jobs"'))) {
      return { feedType: 'JSON_FEED', url, itemCount: 10 };
    }
    if (trimmed.startsWith('<?xml') && trimmed.includes('vacancy')) {
      return { feedType: 'XML_DATASET', url, itemCount: 5 };
    }

    return null;
  }
}

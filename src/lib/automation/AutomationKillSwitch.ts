/**
 * TalentXcel Global Jobs Network — Automation Kill Switch
 * Provides immediate operational override controls to pause or resume
 * ingestion, normalization, publishing, Google Indexing, or individual connectors.
 */

export interface KillSwitchStatus {
  globalPause: boolean;
  pauseIngestion: boolean;
  pauseNormalization: boolean;
  pausePublishing: boolean;
  pauseGoogleIndexing: boolean;
  pausedSources: string[];
  lastUpdated: string;
  updatedBy: string;
}

export class AutomationKillSwitch {
  private static status: KillSwitchStatus = {
    globalPause: false,
    pauseIngestion: false,
    pauseNormalization: false,
    pausePublishing: false,
    pauseGoogleIndexing: false,
    pausedSources: [],
    lastUpdated: new Date().toISOString(),
    updatedBy: 'system-init',
  };

  public static getStatus(): KillSwitchStatus {
    return { ...this.status, pausedSources: [...this.status.pausedSources] };
  }

  public static setGlobalPause(paused: boolean, actor = 'admin'): void {
    this.status.globalPause = paused;
    this.touch(actor);
  }

  public static setIngestionPause(paused: boolean, actor = 'admin'): void {
    this.status.pauseIngestion = paused;
    this.touch(actor);
  }

  public static setNormalizationPause(paused: boolean, actor = 'admin'): void {
    this.status.pauseNormalization = paused;
    this.touch(actor);
  }

  public static setPublishingPause(paused: boolean, actor = 'admin'): void {
    this.status.pausePublishing = paused;
    this.touch(actor);
  }

  public static setGoogleIndexingPause(paused: boolean, actor = 'admin'): void {
    this.status.pauseGoogleIndexing = paused;
    this.touch(actor);
  }

  public static pauseSource(sourceId: string, actor = 'admin'): void {
    if (!this.status.pausedSources.includes(sourceId)) {
      this.status.pausedSources.push(sourceId);
      this.touch(actor);
    }
  }

  public static resumeSource(sourceId: string, actor = 'admin'): void {
    this.status.pausedSources = this.status.pausedSources.filter((s) => s !== sourceId);
    this.touch(actor);
  }

  public static isIngestionAllowed(sourceId?: string): boolean {
    if (this.status.globalPause || this.status.pauseIngestion) return false;
    if (sourceId && this.status.pausedSources.includes(sourceId)) return false;
    return true;
  }

  public static isPublishingAllowed(sourceId?: string): boolean {
    if (this.status.globalPause || this.status.pausePublishing) return false;
    if (sourceId && this.status.pausedSources.includes(sourceId)) return false;
    return true;
  }

  public static isGoogleIndexingAllowed(): boolean {
    if (this.status.globalPause || this.status.pauseGoogleIndexing) return false;
    return true;
  }

  private static touch(actor: string): void {
    this.status.lastUpdated = new Date().toISOString();
    this.status.updatedBy = actor;
  }

  public static resetAll(): void {
    this.status = {
      globalPause: false,
      pauseIngestion: false,
      pauseNormalization: false,
      pausePublishing: false,
      pauseGoogleIndexing: false,
      pausedSources: [],
      lastUpdated: new Date().toISOString(),
      updatedBy: 'system-reset',
    };
  }
}

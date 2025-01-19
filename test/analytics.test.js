import { AnalyticsTracker } from '../src/models/analytics.js';
import { TaapError } from '../src/models/errors.js';

describe('AnalyticsTracker', () => {
  let analytics;
  const mockOrder = {
    id: 'ADS_123',
    serviceCode: 'S1'
  };
  const mockTweetId = 'tweet_456';

  beforeEach(() => {
    analytics = new AnalyticsTracker();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('recordPublish', () => {
    it('initializes analytics for new order', async () => {
      const stats = await analytics.recordPublish(mockOrder, mockTweetId);
      
      expect(stats.orderId).toBe(mockOrder.id);
      expect(stats.tweetId).toBe(mockTweetId);
      expect(stats.serviceType).toBe(mockOrder.serviceCode);
      expect(stats.metrics).toBeDefined();
    });

    it('throws error for invalid input', async () => {
      await expect(analytics.recordPublish(null, mockTweetId))
        .rejects.toThrow(TaapError);
    });
  });

  describe('updateMetrics', () => {
    beforeEach(async () => {
      await analytics.recordPublish(mockOrder, mockTweetId);
    });

    it('updates metrics for existing order', async () => {
      const newMetrics = {
        impressions: 100,
        engagementRate: 0.05,
        clickThroughRate: 0.02
      };

      const stats = await analytics.updateMetrics(mockOrder.id, newMetrics);
      expect(stats.metrics.impressions).toBe(newMetrics.impressions);
      expect(stats.metrics.engagementRate).toBe(newMetrics.engagementRate);
      expect(stats.updates).toHaveLength(1);
    });

    it('throws error for non-existent order', async () => {
      await expect(analytics.updateMetrics('invalid_id', {}))
        .rejects.toThrow(TaapError);
    });
  });

  describe('report generation', () => {
    beforeEach(async () => {
      await analytics.recordPublish(mockOrder, mockTweetId);
      await analytics.updateMetrics(mockOrder.id, {
        impressions: 100,
        engagementRate: 0.05,
        clickThroughRate: 0.02
      });
    });

    it('generates hourly report', async () => {
      const report = await analytics.generateHourlyReport();
      expect(report.metrics).toBeDefined();
      expect(report.activeOrders).toBe(1);
    });

    it('generates daily report', async () => {
      const report = await analytics.generateDailyReport();
      expect(report.metrics).toBeDefined();
      expect(report.totalOrders).toBe(1);
      expect(report.serviceTypeBreakdown).toBeDefined();
    });

    it('generates weekly report', async () => {
      const report = await analytics.generateWeeklyReport();
      expect(report.metrics).toBeDefined();
      expect(report.trends).toBeDefined();
      expect(report.trends.recommendations).toHaveLength(3);
    });
  });
});

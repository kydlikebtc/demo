import { TaapError } from './errors.js';

export class AnalyticsTracker {
  constructor() {
    this.metrics = new Map(); // Store metrics by orderId
    this.hourlyReports = new Map();
    this.dailyReports = new Map();
    this.weeklyReports = new Map();
  }

  async recordPublish(order, tweetId) {
    if (!order?.id || !tweetId) {
      throw new TaapError('E001', 'Invalid order or tweet ID for analytics');
    }

    const stats = {
      orderId: order.id,
      tweetId,
      serviceType: order.serviceCode,
      timestamp: new Date(),
      metrics: {
        impressions: 0,
        engagementRate: 0,
        clickThroughRate: 0,
        demographics: {
          regions: new Map(),
          ageGroups: new Map(),
          interests: new Map()
        }
      },
      updates: []
    };

    this.metrics.set(order.id, stats);
    await this._scheduleMetricUpdates(order.id);
    return stats;
  }

  async updateMetrics(orderId, metrics) {
    const stats = this.metrics.get(orderId);
    if (!stats) {
      throw new TaapError('E001', `Analytics not found for order: ${orderId}`);
    }

    // Update metrics
    Object.assign(stats.metrics, metrics);
    stats.updates.push({
      timestamp: new Date(),
      metrics: { ...metrics }
    });

    // Generate report tag
    const reportTag = `#ADS_${orderId}_stats`;
    console.log(`${reportTag}\n`, JSON.stringify(stats.metrics, null, 2));

    return stats;
  }

  async generateHourlyReport() {
    const now = new Date();
    const hourKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}`;
    
    const report = {
      timestamp: now,
      metrics: this._aggregateMetrics(),
      activeOrders: this.metrics.size
    };

    this.hourlyReports.set(hourKey, report);
    return report;
  }

  async generateDailyReport() {
    const now = new Date();
    const dayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
    
    const report = {
      timestamp: now,
      metrics: this._aggregateMetrics(),
      totalOrders: this.metrics.size,
      serviceTypeBreakdown: this._getServiceTypeBreakdown()
    };

    this.dailyReports.set(dayKey, report);
    return report;
  }

  async generateWeeklyReport() {
    const now = new Date();
    const weekKey = `${now.getFullYear()}-W${Math.ceil(now.getDate() / 7)}`;
    
    const report = {
      timestamp: now,
      metrics: this._aggregateMetrics(),
      totalOrders: this.metrics.size,
      serviceTypeBreakdown: this._getServiceTypeBreakdown(),
      trends: this._analyzeTrends()
    };

    this.weeklyReports.set(weekKey, report);
    return report;
  }

  // Private helper methods
  async _scheduleMetricUpdates(orderId) {
    // Mock scheduled updates
    const intervals = [
      1000,  // 1 second (simulating real-time)
      60000, // 1 minute (simulating hourly)
      300000 // 5 minutes (simulating daily)
    ];

    for (const interval of intervals) {
      setTimeout(async () => {
        try {
          await this.updateMetrics(orderId, {
            impressions: Math.floor(Math.random() * 1000),
            engagementRate: Math.random() * 0.1,
            clickThroughRate: Math.random() * 0.05
          });
        } catch (error) {
          console.error(`Failed to update metrics for ${orderId}:`, error);
        }
      }, interval);
    }
  }

  _aggregateMetrics() {
    const aggregate = {
      totalImpressions: 0,
      avgEngagementRate: 0,
      avgClickThroughRate: 0
    };

    let count = 0;
    for (const stats of this.metrics.values()) {
      aggregate.totalImpressions += stats.metrics.impressions;
      aggregate.avgEngagementRate += stats.metrics.engagementRate;
      aggregate.avgClickThroughRate += stats.metrics.clickThroughRate;
      count++;
    }

    if (count > 0) {
      aggregate.avgEngagementRate /= count;
      aggregate.avgClickThroughRate /= count;
    }

    return aggregate;
  }

  _getServiceTypeBreakdown() {
    const breakdown = {
      S1: 0,
      S2: 0,
      S3: 0
    };

    for (const stats of this.metrics.values()) {
      breakdown[stats.serviceType]++;
    }

    return breakdown;
  }

  _analyzeTrends() {
    // Mock trend analysis
    return {
      topPerforming: {
        serviceType: 'S1',
        avgEngagement: 0.08
      },
      growthRate: 0.15,
      recommendations: [
        'Increase content frequency',
        'Optimize posting times',
        'Expand hashtag usage'
      ]
    };
  }
}

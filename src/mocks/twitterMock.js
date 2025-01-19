// Mock Twitter API implementation
export class TwitterAPI {
  constructor() {
    this.tweets = new Map();
    this.rateLimit = {
      remaining: 100,
      resetTime: Date.now() + 3600000 // 1 hour window
    };
    this.userRateLimits = new Map(); // Track per-user rate limits
  }

  async postTweet(content, userAddress) {
    // Check global rate limits
    if (this.rateLimit.remaining <= 0) {
      if (Date.now() < this.rateLimit.resetTime) {
        throw new Error('Rate limit exceeded');
      }
      // Reset rate limit
      this.rateLimit.remaining = 100;
      this.rateLimit.resetTime = Date.now() + 3600000;
    }

    // Check user-specific rate limits
    if (userAddress) {
      const userLimit = this.userRateLimits.get(userAddress) || {
        remaining: 10,
        resetTime: Date.now() + 3600000
      };

      if (userLimit.remaining <= 0) {
        if (Date.now() < userLimit.resetTime) {
          throw new Error('User rate limit exceeded');
        }
        userLimit.remaining = 10;
        userLimit.resetTime = Date.now() + 3600000;
      }

      userLimit.remaining--;
      this.userRateLimits.set(userAddress, userLimit);
    }

    // Validate content
    if (!content || !content.text) {
      throw new Error('Invalid tweet content');
    }

    // Simulate network delay (< 30 minutes per SLA)
    await new Promise(resolve => setTimeout(resolve, 100));

    // Generate mock tweet ID
    const tweetId = `tweet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store tweet
    this.tweets.set(tweetId, {
      id: tweetId,
      text: content.text,
      media: content.media || [],
      created_at: new Date().toISOString(),
      engagement: {
        likes: 0,
        retweets: 0,
        replies: 0,
        impressions: 0
      }
    });

    // Decrease rate limit
    this.rateLimit.remaining--;

    return {
      id: tweetId,
      success: true
    };
  }

  async postThread(tweets) {
    if (!Array.isArray(tweets) || tweets.length === 0) {
      throw new Error('Invalid thread content');
    }

    const thread = [];
    let replyToId = null;

    for (const tweet of tweets) {
      const response = await this.postTweet({
        ...tweet,
        reply_to: replyToId
      });
      thread.push(response.id);
      replyToId = response.id;
    }

    return {
      thread_ids: thread,
      success: true
    };
  }

  async scheduleTweet(content, scheduledTime) {
    if (!scheduledTime || new Date(scheduledTime) <= new Date()) {
      throw new Error('Invalid scheduled time');
    }

    const response = await this.postTweet(content);
    return {
      ...response,
      scheduled_for: scheduledTime
    };
  }

  // Mock engagement tracking
  async updateEngagement(tweetId) {
    const tweet = this.tweets.get(tweetId);
    if (!tweet) return null;

    // Simulate random engagement (minimum 1% per SLA)
    tweet.engagement = {
      likes: Math.floor(Math.random() * 100) + 10,
      retweets: Math.floor(Math.random() * 50) + 5,
      replies: Math.floor(Math.random() * 20) + 2,
      impressions: Math.floor(Math.random() * 1000) + 100
    };

    return tweet.engagement;
  }
}

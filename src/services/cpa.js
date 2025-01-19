import { OrderStates, isValidTransition } from '../models/orderState.js';
import { TaapError } from '../models/errors.js';
import { ServiceTypes } from '../models/serviceTypes.js';

export class CPA {
  constructor() {
    this.contentCache = new Map(); // Store generated content
  }

  constructor(opa) {
    this.contentCache = new Map(); // Store generated content
    this.opa = opa; // Reference to OPA for state updates
  }

  async generateContent(order) {
    if (!order || !order.id) {
      throw new TaapError('E001', 'Invalid order object');
    }

    try {
      // Update state to CONTENT_GENERATION
      await this.opa.updateStatus(order.id, OrderStates.CONTENT_GENERATION);

      // Mock AI content generation based on service type
      const content = await this._mockGenerateContent(order);
      
      // Validate content against requirements
      this._validateContent(content);
      
      // Store generated content
      this.contentCache.set(order.id, content);
      
      // Move to CONTENT_REVIEW state
      await this.opa.updateStatus(order.id, OrderStates.CONTENT_REVIEW);
      
      return content;
    } catch (error) {
      throw new TaapError('E003', error.message);
    }
  }

  async reviewContent(order) {
    if (!order || !order.id) {
      throw new TaapError('E001', 'Invalid order object');
    }

    const content = this.contentCache.get(order.id);
    if (!content) {
      throw new TaapError('E003', 'Content not found for review');
    }

    try {
      // Mock content review process
      const reviewResult = await this._mockReviewContent(content);
      
      if (!reviewResult.passed) {
        throw new TaapError('E003', reviewResult.reason);
      }

      // Move to PUBLISHING state after successful review
      await this.opa.updateStatus(order.id, OrderStates.PUBLISHING);
      
      return true;
    } catch (error) {
      throw new TaapError('E003', error.message);
    }
  }

  async publishContent(order) {
    if (!order || !order.id) {
      throw new TaapError('E001', 'Invalid order object');
    }

    const content = this.contentCache.get(order.id);
    if (!content) {
      throw new TaapError('E004', 'Content not found for publishing');
    }

    try {
      // Mock Twitter API publishing
      await this._mockPublishToTwitter(content);
      
      // Move to COMPLETED state after successful publishing
      await this.opa.updateStatus(order.id, OrderStates.COMPLETED);
      
      return true;
    } catch (error) {
      throw new TaapError('E004', 'Publishing failed: ' + error.message);
    }
  }

  // Private helper methods
  _validateContent(content) {
    // Text length: 180-240 characters
    if (content.text.length < 180 || content.text.length > 240) {
      throw new Error('Text length must be between 180-240 characters');
    }

    // Hashtags: 2-5 per post
    const hashtags = content.text.match(/#\w+/g) || [];
    if (hashtags.length < 2 || hashtags.length > 5) {
      throw new Error('Must include 2-5 hashtags');
    }

    // Mentions: Maximum 2 per post
    const mentions = content.text.match(/@\w+/g) || [];
    if (mentions.length > 2) {
      throw new Error('Maximum 2 mentions allowed');
    }

    // Links: Maximum 1 per post
    const links = content.text.match(/https?:\/\/\S+/g) || [];
    if (links.length > 1) {
      throw new Error('Maximum 1 link allowed');
    }

    // Media attachments: Optional, max 4 images
    if (content.media && content.media.length > 4) {
      throw new Error('Maximum 4 media attachments allowed');
    }

    return true;
  }

  async _mockGenerateContent(order) {
    // Simulate AI generation time (< 15 minutes per SLA)
    await new Promise(resolve => setTimeout(resolve, 100)); // Mock delay

    const serviceType = ServiceTypes[order.serviceCode];
    let content;

    switch (order.serviceCode) {
      case 'S1':
        content = {
          text: `Exciting news! ${order.requirement} #adtech #promotion #innovation`,
          media: []
        };
        break;
      case 'S2':
        content = {
          posts: [
            { text: `Part 1: Introduction to ${order.requirement} #adtech #promotion`, media: [] },
            { text: `Part 2: Features of ${order.requirement} #innovation #technology`, media: [] },
            { text: `Part 3: Benefits of ${order.requirement} #business #growth`, media: [] }
          ]
        };
        break;
      case 'S3':
        content = {
          campaign: {
            posts: Array(5).fill(null).map((_, i) => ({
              text: `Campaign Day ${i + 1}: ${order.requirement} #adtech #promotion #campaign`,
              media: [],
              scheduledTime: new Date(Date.now() + (i * 24 * 60 * 60 * 1000))
            }))
          }
        };
        break;
      default:
        throw new Error('Invalid service type');
    }

    return content;
  }

  async _mockReviewContent(content) {
    // Simulate review time
    await new Promise(resolve => setTimeout(resolve, 100));

    // Mock content review - check for restricted content
    const restrictedTerms = [
      'adult', 'nsfw', 'hate', 'manipulation', 'fake'
    ];

    const contentText = Array.isArray(content.posts) 
      ? content.posts.map(p => p.text).join(' ')
      : content.text;

    for (const term of restrictedTerms) {
      if (contentText.toLowerCase().includes(term)) {
        return { passed: false, reason: `Content contains restricted term: ${term}` };
      }
    }

    return { passed: true };
  }

  async _mockPublishToTwitter(content) {
    // Simulate publishing time (< 30 minutes per SLA)
    await new Promise(resolve => setTimeout(resolve, 100));

    // Mock successful publishing
    return { success: true, tweetId: `mock_${Date.now()}` };
  }
}

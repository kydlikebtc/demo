import { 
  uploadContentToIPFS, 
  getContentFromIPFS, 
  contentExists,
  getTotalSize 
} from '../src/services/ipfsStorage.js';

describe('IPFS Storage', () => {
  const testContent = {
    text: 'Test content',
    media: ['image1.jpg', 'image2.jpg'],
    metadata: {
      author: 'test-user',
      timestamp: Date.now()
    }
  };

  it('uploads content and returns valid CID', async () => {
    const cid = await uploadContentToIPFS(testContent);
    expect(cid).toBeDefined();
    expect(typeof cid).toBe('string');
    expect(cid.length).toBe(46); // Standard CID length
  });

  it('retrieves stored content correctly', async () => {
    const cid = await uploadContentToIPFS(testContent);
    const retrieved = await getContentFromIPFS(cid);
    expect(retrieved).toEqual(testContent);
  });

  it('throws error for non-existent content', async () => {
    await expect(getContentFromIPFS('invalid-cid'))
      .rejects.toThrow('Content not found');
  });

  it('checks content existence correctly', async () => {
    const cid = await uploadContentToIPFS(testContent);
    expect(await contentExists(cid)).toBe(true);
    expect(await contentExists('invalid-cid')).toBe(false);
  });

  it('calculates total storage size', async () => {
    const cid1 = await uploadContentToIPFS(testContent);
    const cid2 = await uploadContentToIPFS({ text: 'Small content' });
    
    const totalSize = await getTotalSize();
    expect(totalSize).toBeGreaterThan(0);
    
    // Verify size is sum of both contents
    const content1Size = Buffer.from(JSON.stringify(testContent)).length;
    const content2Size = Buffer.from(JSON.stringify({ text: 'Small content' })).length;
    expect(totalSize).toBe(content1Size + content2Size);
  });
});

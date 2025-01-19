/**
 * Mock IPFS storage service
 * Simulates content storage and retrieval without actual IPFS implementation
 */

// Mock storage
const contentStore = new Map();

/**
 * Upload content to mock IPFS storage
 * @param {Object} content - Content to store
 * @returns {Promise<string>} - Content hash (CID)
 */
export async function uploadContentToIPFS(content) {
  // Generate mock CID using content hash
  const contentString = JSON.stringify(content);
  const mockCID = Buffer.from(contentString)
    .toString('base64')
    .substring(0, 46); // Typical CID length

  // Store content
  contentStore.set(mockCID, content);

  // Simulate network delay (100-500ms)
  await new Promise(resolve => 
    setTimeout(resolve, Math.random() * 400 + 100)
  );

  return mockCID;
}

/**
 * Retrieve content from mock IPFS storage
 * @param {string} cid - Content identifier
 * @returns {Promise<Object>} - Stored content
 */
export async function getContentFromIPFS(cid) {
  const content = contentStore.get(cid);
  if (!content) {
    throw new Error(`Content not found for CID: ${cid}`);
  }

  // Simulate network delay (100-500ms)
  await new Promise(resolve => 
    setTimeout(resolve, Math.random() * 400 + 100)
  );

  return content;
}

/**
 * Check if content exists in mock IPFS storage
 * @param {string} cid - Content identifier
 * @returns {Promise<boolean>} - True if content exists
 */
export async function contentExists(cid) {
  return contentStore.has(cid);
}

/**
 * Get total size of stored content
 * @returns {Promise<number>} - Total size in bytes
 */
export async function getTotalSize() {
  let totalSize = 0;
  for (const content of contentStore.values()) {
    totalSize += Buffer.from(JSON.stringify(content)).length;
  }
  return totalSize;
}

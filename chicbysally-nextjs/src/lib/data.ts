// Data fetching for reference images from ImageKit API
// Fetches from https://api.imagekit.io/v1/files?path:"/Reference/"

export interface ReferenceImage {
  id: string;
  url: string;
  title: string;
  // Removed category field as per requirements
  // Removed tags field as per requirements
}

// Fetch reference images from ImageKit API with pagination
export const getReferenceImages = async (page: number = 1, limit: number = 5): Promise<ReferenceImage[]> => {
  try {
    // Calculate skip for pagination
    const skip = (page - 1) * limit;
    
    // Construct API URL with pagination parameters
    const apiUrl = `https://api.imagekit.io/v1/files?path=/Reference/&skip=${skip}&limit=${limit}`;
    
    // Get API key from environment variables
    const apiKey = process.env.IMAGEKIT_API_KEY;
    
    if (!apiKey) {
      console.error('ImageKit API key not found in environment variables');
      return [];
    }
    
    // Create Basic Authentication header (username = API key, password = empty)
    const authHeader = 'Basic ' + Buffer.from(`${apiKey}:`).toString('base64');
    
    // Fetch from ImageKit API
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform API response to ReferenceImage format
    return data.map((item: any) => ({
      id: item.fileId,
      url: item.url,
      title: item.name || 'Reference Image'
    }));
  } catch (error) {
    console.error('Failed to fetch reference images from ImageKit API:', error);
    return [];
  }
};

// Fetch total count of reference images for pagination
export const getReferenceImagesCount = async (): Promise<number> => {
  try {
    // Get API key from environment variables
    const apiKey = process.env.IMAGEKIT_API_KEY;
    
    if (!apiKey) {
      console.error('ImageKit API key not found in environment variables');
      return 0;
    }
    
    // Create Basic Authentication header (username = API key, password = empty)
    const authHeader = 'Basic ' + Buffer.from(`${apiKey}:`).toString('base64');
    
    // Fetch from ImageKit API to get count
    const response = await fetch('https://api.imagekit.io/v1/files?path=/Reference/', {
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return data.length;
  } catch (error) {
    console.error('Failed to fetch reference images count from ImageKit API:', error);
    return 0;
  }
};

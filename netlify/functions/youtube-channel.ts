// netlify/functions/youtube-channel.ts
// Official YouTube Data API v3 Channel Logo & Subscriber Resolver
export const handler = async (event: any) => {
  const query = event.queryStringParameters?.handle || '';
  const apiKey = process.env.YOUTUBE_DATA_API_KEY;
  if (!query) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing channel handle or URL' }) };
  }
  if (!apiKey) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        fallback: true,
        message: 'YOUTUBE_DATA_API_KEY not set; using unavatar fallback.',
        logoUrl: `https://unavatar.io/youtube/${encodeURIComponent(query)}`
      })
    };
  }
  try {
    const cleanHandle = query.replace(/^@/, '');
    const apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&forHandle=@${encodeURIComponent(cleanHandle)}&key=${apiKey}`;
    const res = await fetch(apiUrl);
    const data = await res.json();
    const item = data?.items?.[0];
    if (!item) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Channel not found via YouTube API' }) };
    }
    return {
      statusCode: 200,
      body: JSON.stringify({
        title: item.snippet.title,
        logoUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
        subscriberCount: item.statistics?.subscriberCount
      })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to contact YouTube API' }) };
  }
};

import { verifyToken } from '../../_lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = verifyToken(req);
  if (!auth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) return res.status(500).json({ error: 'Groq API key not configured' });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    let response;
    try {
      response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
        model: 'moonshotai/kimi-k2-instruct-0905',
        messages: [
          {
            role: 'system',
            content: `You are a world-class blog writer for Red Dot Studio, a strategy-led design studio based in Bangalore, India. Write in a confident, professional, clear tone. Use Markdown formatting.

When given a topic, generate a complete blog post with:
1. A compelling title (on the first line, prefixed with TITLE: )
2. A brief excerpt/summary (on the second line, prefixed with EXCERPT: )
3. Suggested tags (on the third line, prefixed with TAGS: comma separated)
4. A suggested cover image search term (on the fourth line, prefixed with COVER: )
5. An SEO meta title (on the fifth line, prefixed with META_TITLE: )
6. An SEO meta description (on the sixth line, prefixed with META_DESC: )
7. Then a blank line followed by the full blog content in Markdown.

The content should be 600-1200 words, insightful, actionable, and relevant to design, branding, web development, or business growth. Use headers (##, ###), bold text, lists, and blockquotes for readability.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.6,
        max_completion_tokens: 4096,
        top_p: 1,
      }),
    });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const err = await response.json();
      console.error('Groq error:', err);
      return res.status(500).json({ error: 'AI generation failed' });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    // Parse the structured output
    const lines = text.split('\n');
    let title = '', excerpt = '', tags = '', cover = '', metaTitle = '', metaDesc = '', content = '';
    let contentStartIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('TITLE:')) { title = line.replace('TITLE:', '').trim(); }
      else if (line.startsWith('EXCERPT:')) { excerpt = line.replace('EXCERPT:', '').trim(); }
      else if (line.startsWith('TAGS:')) { tags = line.replace('TAGS:', '').trim(); }
      else if (line.startsWith('COVER:')) { cover = line.replace('COVER:', '').trim(); }
      else if (line.startsWith('META_TITLE:')) { metaTitle = line.replace('META_TITLE:', '').trim(); }
      else if (line.startsWith('META_DESC:')) { metaDesc = line.replace('META_DESC:', '').trim(); contentStartIndex = i + 1; }
      else if (title && !content && line === '') { contentStartIndex = i + 1; }
      else if (contentStartIndex > 0 && i >= contentStartIndex) { content += lines[i] + '\n'; }
    }

    if (!content.trim()) {
      content = text;
    }

    const coverImage = cover
      ? `https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop`
      : '';

    res.json({
      title: title || 'Untitled Post',
      excerpt,
      tags,
      cover_image: coverImage,
      meta_title: metaTitle || title,
      meta_description: metaDesc || excerpt,
      content: content.trim(),
    });
  } catch (err) {
    console.error('Groq generation error:', err);
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'AI generation timed out' });
    }
    res.status(500).json({ error: 'Failed to generate blog post' });
  }
}

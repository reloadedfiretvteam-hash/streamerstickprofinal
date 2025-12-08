import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export interface ContentGenerationRequest {
  topic: string;
  keywords?: string[];
  tone?: 'professional' | 'casual' | 'educational' | 'persuasive' | 'entertaining';
  length?: 'short' | 'medium' | 'long' | 'comprehensive';
  category?: string;
  targetAudience?: string;
  includeHeadings?: boolean;
  includeLists?: boolean;
  includeFAQ?: boolean;
  productContext?: string;
}

export interface GeneratedContent {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  category: string;
  faq?: { question: string; answer: string }[];
}

export interface ContentOutline {
  title: string;
  sections: { heading: string; keyPoints: string[] }[];
  estimatedWordCount: number;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 100);
}

function getLengthGuidance(length: string): { minWords: number; maxWords: number; sections: number } {
  switch (length) {
    case 'short':
      return { minWords: 400, maxWords: 600, sections: 3 };
    case 'medium':
      return { minWords: 800, maxWords: 1200, sections: 5 };
    case 'long':
      return { minWords: 1500, maxWords: 2000, sections: 7 };
    case 'comprehensive':
      return { minWords: 2500, maxWords: 4000, sections: 10 };
    default:
      return { minWords: 800, maxWords: 1200, sections: 5 };
  }
}

export async function generateContentOutline(request: ContentGenerationRequest): Promise<ContentOutline> {
  const lengthGuide = getLengthGuidance(request.length || 'medium');
  
  const systemPrompt = `You are an expert content strategist and SEO specialist. Generate a detailed content outline for a blog post.
Your response must be valid JSON with this exact structure:
{
  "title": "SEO-optimized title (50-60 characters)",
  "sections": [
    { "heading": "H2 section heading", "keyPoints": ["point 1", "point 2", "point 3"] }
  ],
  "estimatedWordCount": number
}`;

  const userPrompt = `Create a content outline for:
Topic: ${request.topic}
${request.keywords?.length ? `Target Keywords: ${request.keywords.join(', ')}` : ''}
Tone: ${request.tone || 'professional'}
Target Audience: ${request.targetAudience || 'general readers interested in streaming and entertainment'}
Category: ${request.category || 'general'}
${request.productContext ? `Product Context: ${request.productContext}` : ''}

Requirements:
- Create ${lengthGuide.sections} sections with H2 headings
- Target word count: ${lengthGuide.minWords}-${lengthGuide.maxWords} words
- Include SEO-friendly headings that incorporate keywords naturally
- Each section should have 3-5 key points to cover
${request.includeFAQ ? '- Include a FAQ section with 5 common questions' : ''}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4.1',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' }
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Failed to generate outline');
  }

  return JSON.parse(content);
}

export async function generateFullContent(request: ContentGenerationRequest): Promise<GeneratedContent> {
  const lengthGuide = getLengthGuidance(request.length || 'medium');
  
  const systemPrompt = `You are an expert content writer specializing in streaming, entertainment, and cord-cutting topics. Write engaging, SEO-optimized blog content.

Your response must be valid JSON with this exact structure:
{
  "title": "SEO-optimized title (50-60 characters)",
  "excerpt": "Compelling summary (150-160 characters)",
  "content": "Full HTML content with proper heading tags (h1, h2, h3), paragraphs, lists, bold text, etc.",
  "metaTitle": "SEO meta title (50-60 characters)",
  "metaDescription": "SEO meta description (150-160 characters)",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "category": "category name"${request.includeFAQ ? `,
  "faq": [
    { "question": "Question 1?", "answer": "Answer 1" },
    { "question": "Question 2?", "answer": "Answer 2" }
  ]` : ''}
}

Content Guidelines:
- Use proper HTML structure with h1 (only one), h2, h3 headings
- Include bullet points and numbered lists for scannability
- Add bold text for emphasis on key points
- Write in ${request.tone || 'professional'} tone
- Target ${lengthGuide.minWords}-${lengthGuide.maxWords} words
- Include internal linking opportunities (mark with [internal-link: topic])
- Optimize for featured snippets where appropriate
- Make content actionable and valuable`;

  const userPrompt = `Write a complete blog post about:
Topic: ${request.topic}
${request.keywords?.length ? `Target Keywords (use naturally throughout): ${request.keywords.join(', ')}` : ''}
Target Audience: ${request.targetAudience || 'cord-cutters and streaming enthusiasts'}
Category: ${request.category || 'streaming'}
${request.productContext ? `Product/Service Context: ${request.productContext}` : ''}

Content Requirements:
- ${lengthGuide.sections} main sections with H2 headings
- Minimum ${lengthGuide.minWords} words
- Include practical tips and actionable advice
${request.includeLists ? '- Use bullet points and numbered lists liberally' : ''}
${request.includeFAQ ? '- Include 5 FAQ items at the end' : ''}
- Write for SEO but prioritize reader value
- Include a strong introduction hook and clear conclusion with CTA`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4.1',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.8,
    max_tokens: 4000,
    response_format: { type: 'json_object' }
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Failed to generate content');
  }

  const parsed = JSON.parse(content);
  
  return {
    ...parsed,
    slug: generateSlug(parsed.title),
  };
}

export async function improveContent(
  existingContent: string,
  instructions: string
): Promise<{ content: string; changes: string[] }> {
  const systemPrompt = `You are an expert content editor. Improve the provided content based on the instructions.

Your response must be valid JSON:
{
  "content": "Improved HTML content",
  "changes": ["change 1 made", "change 2 made", "change 3 made"]
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4.1',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Existing Content:\n${existingContent}\n\nImprovement Instructions:\n${instructions}` }
    ],
    temperature: 0.7,
    max_tokens: 4000,
    response_format: { type: 'json_object' }
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Failed to improve content');
  }

  return JSON.parse(content);
}

export async function generateSEOSuggestions(
  title: string,
  content: string,
  currentKeywords: string[]
): Promise<{
  titleSuggestions: string[];
  keywordSuggestions: string[];
  metaDescriptionSuggestions: string[];
  contentImprovements: string[];
}> {
  const systemPrompt = `You are an SEO expert. Analyze the content and provide optimization suggestions.

Your response must be valid JSON:
{
  "titleSuggestions": ["alternative title 1", "alternative title 2", "alternative title 3"],
  "keywordSuggestions": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "metaDescriptionSuggestions": ["meta description option 1", "meta description option 2"],
  "contentImprovements": ["improvement 1", "improvement 2", "improvement 3", "improvement 4", "improvement 5"]
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4.1',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Title: ${title}\nCurrent Keywords: ${currentKeywords.join(', ')}\n\nContent (first 2000 chars):\n${content.substring(0, 2000)}` }
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' }
  });

  const result = response.choices[0]?.message?.content;
  if (!result) {
    throw new Error('Failed to generate SEO suggestions');
  }

  return JSON.parse(result);
}

export async function expandSection(
  sectionContent: string,
  context: string,
  targetWords: number = 300
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4.1',
    messages: [
      { 
        role: 'system', 
        content: `You are a content writer. Expand the given section to approximately ${targetWords} words while maintaining quality and relevance. Return only the expanded HTML content, no JSON wrapper.`
      },
      { role: 'user', content: `Context: ${context}\n\nSection to expand:\n${sectionContent}` }
    ],
    temperature: 0.8,
    max_tokens: 2000
  });

  return response.choices[0]?.message?.content || sectionContent;
}

export async function generateFAQ(
  topic: string,
  existingContent: string,
  count: number = 5
): Promise<{ question: string; answer: string }[]> {
  const systemPrompt = `Generate FAQ items for the given topic. Response must be valid JSON:
{
  "faq": [
    { "question": "Question 1?", "answer": "Detailed answer 1" }
  ]
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4.1',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Topic: ${topic}\n\nGenerate ${count} FAQ items. Base them on this content context:\n${existingContent.substring(0, 1500)}` }
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' }
  });

  const result = response.choices[0]?.message?.content;
  if (!result) {
    return [];
  }

  const parsed = JSON.parse(result);
  return parsed.faq || [];
}

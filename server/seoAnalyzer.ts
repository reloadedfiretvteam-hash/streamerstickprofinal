interface SeoAnalysisResult {
  headingScore: number;
  keywordDensityScore: number;
  contentLengthScore: number;
  metaScore: number;
  structureScore: number;
  overallSeoScore: number;
  wordCount: number;
  readTime: string;
  seoAnalysis: string;
}

interface SeoInput {
  title: string;
  content: string;
  excerpt: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  keywords?: string[] | null;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function countWords(text: string): number {
  const cleaned = stripHtml(text);
  return cleaned.split(/\s+/).filter(word => word.length > 0).length;
}

function calculateReadTime(wordCount: number): string {
  const wordsPerMinute = 200;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
}

function analyzeHeadingStructure(content: string): { score: number; feedback: string[] } {
  const feedback: string[] = [];
  let score = 0;

  const h1Matches = content.match(/<h1[^>]*>.*?<\/h1>/gi) || [];
  const h2Matches = content.match(/<h2[^>]*>.*?<\/h2>/gi) || [];
  const h3Matches = content.match(/<h3[^>]*>.*?<\/h3>/gi) || [];

  if (h1Matches.length === 1) {
    score += 25;
    feedback.push("✓ Single H1 tag found (good)");
  } else if (h1Matches.length === 0) {
    feedback.push("✗ No H1 tag found - add a main heading");
  } else {
    score += 10;
    feedback.push("⚠ Multiple H1 tags found - use only one");
  }

  if (h2Matches.length >= 2) {
    score += 35;
    feedback.push(`✓ ${h2Matches.length} H2 tags found (good structure)`);
  } else if (h2Matches.length === 1) {
    score += 20;
    feedback.push("⚠ Only 1 H2 tag - add more subheadings for better structure");
  } else {
    feedback.push("✗ No H2 tags - add subheadings to organize content");
  }

  if (h3Matches.length >= 1) {
    score += 20;
    feedback.push(`✓ ${h3Matches.length} H3 tags found`);
  }

  const totalHeadings = h1Matches.length + h2Matches.length + h3Matches.length;
  if (totalHeadings >= 4) {
    score += 20;
  } else if (totalHeadings >= 2) {
    score += 10;
  }

  return { score: Math.min(score, 100), feedback };
}

function analyzeKeywordDensity(content: string, title: string, keywords?: string[] | null): { score: number; feedback: string[] } {
  const feedback: string[] = [];
  let score = 0;

  const cleanContent = stripHtml(content).toLowerCase();
  const words = cleanContent.split(/\s+/).filter(w => w.length > 3);
  const totalWords = words.length;

  if (totalWords === 0) {
    return { score: 0, feedback: ["✗ No content to analyze"] };
  }

  const titleWords = title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  
  let titleKeywordsInContent = 0;
  for (const word of titleWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = cleanContent.match(regex) || [];
    if (matches.length > 0) {
      titleKeywordsInContent++;
    }
  }

  if (titleWords.length > 0) {
    const titleKeywordRatio = titleKeywordsInContent / titleWords.length;
    if (titleKeywordRatio >= 0.8) {
      score += 40;
      feedback.push("✓ Title keywords appear well in content");
    } else if (titleKeywordRatio >= 0.5) {
      score += 25;
      feedback.push("⚠ Some title keywords missing from content");
    } else {
      score += 10;
      feedback.push("✗ Title keywords rarely appear in content");
    }
  }

  if (keywords && keywords.length > 0) {
    let keywordsFound = 0;
    for (const keyword of keywords) {
      const keywordLower = keyword.toLowerCase();
      if (cleanContent.includes(keywordLower)) {
        keywordsFound++;
      }
    }
    
    const keywordRatio = keywordsFound / keywords.length;
    if (keywordRatio >= 0.7) {
      score += 40;
      feedback.push(`✓ ${keywordsFound}/${keywords.length} keywords found in content`);
    } else if (keywordRatio >= 0.4) {
      score += 25;
      feedback.push(`⚠ Only ${keywordsFound}/${keywords.length} keywords found`);
    } else {
      score += 10;
      feedback.push(`✗ Only ${keywordsFound}/${keywords.length} keywords found - add more`);
    }
  } else {
    score += 10;
    feedback.push("⚠ No keywords defined - add target keywords");
  }

  const wordFrequency: Record<string, number> = {};
  for (const word of words) {
    wordFrequency[word] = (wordFrequency[word] || 0) + 1;
  }

  const topWords = Object.entries(wordFrequency)
    .filter(([word]) => !['this', 'that', 'with', 'from', 'have', 'been', 'will', 'your', 'their', 'they', 'what', 'when', 'where', 'which', 'would', 'could', 'should', 'about', 'there', 'these', 'those', 'other', 'into', 'more', 'some', 'than', 'them', 'then', 'only', 'come', 'made', 'find', 'here', 'many', 'ways', 'make', 'like', 'just', 'over', 'such', 'also', 'back', 'after', 'most', 'very', 'even', 'well', 'much', 'each', 'because', 'does', 'long', 'still', 'while', 'before', 'between'].includes(word))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (topWords.length > 0) {
    const topKeywordDensity = (topWords[0][1] / totalWords) * 100;
    if (topKeywordDensity >= 1 && topKeywordDensity <= 3) {
      score += 20;
      feedback.push(`✓ Good keyword density (~${topKeywordDensity.toFixed(1)}%)`);
    } else if (topKeywordDensity > 3) {
      score += 10;
      feedback.push(`⚠ Keyword stuffing detected (${topKeywordDensity.toFixed(1)}%)`);
    } else {
      score += 10;
      feedback.push(`⚠ Low keyword density (${topKeywordDensity.toFixed(1)}%)`);
    }
  }

  return { score: Math.min(score, 100), feedback };
}

function analyzeContentLength(wordCount: number): { score: number; feedback: string[] } {
  const feedback: string[] = [];
  let score = 0;

  if (wordCount >= 2000) {
    score = 100;
    feedback.push(`✓ Excellent content length (${wordCount} words) - comprehensive coverage`);
  } else if (wordCount >= 1500) {
    score = 90;
    feedback.push(`✓ Great content length (${wordCount} words)`);
  } else if (wordCount >= 1000) {
    score = 75;
    feedback.push(`✓ Good content length (${wordCount} words)`);
  } else if (wordCount >= 600) {
    score = 55;
    feedback.push(`⚠ Moderate content length (${wordCount} words) - consider adding more`);
  } else if (wordCount >= 300) {
    score = 35;
    feedback.push(`⚠ Short content (${wordCount} words) - aim for 600+ words`);
  } else {
    score = 15;
    feedback.push(`✗ Very short content (${wordCount} words) - aim for 600+ words`);
  }

  return { score, feedback };
}

function analyzeMetaTags(input: SeoInput): { score: number; feedback: string[] } {
  const feedback: string[] = [];
  let score = 0;

  const metaTitle = input.metaTitle || input.title;
  if (metaTitle) {
    const titleLength = metaTitle.length;
    if (titleLength >= 50 && titleLength <= 60) {
      score += 30;
      feedback.push(`✓ Meta title length is optimal (${titleLength} chars)`);
    } else if (titleLength >= 40 && titleLength <= 70) {
      score += 20;
      feedback.push(`⚠ Meta title length is acceptable (${titleLength} chars) - aim for 50-60`);
    } else if (titleLength < 40) {
      score += 10;
      feedback.push(`✗ Meta title too short (${titleLength} chars) - aim for 50-60`);
    } else {
      score += 10;
      feedback.push(`✗ Meta title too long (${titleLength} chars) - will be truncated`);
    }
  } else {
    feedback.push("✗ No meta title - add one for better SEO");
  }

  const metaDesc = input.metaDescription || input.excerpt;
  if (metaDesc) {
    const descLength = metaDesc.length;
    if (descLength >= 150 && descLength <= 160) {
      score += 30;
      feedback.push(`✓ Meta description length is optimal (${descLength} chars)`);
    } else if (descLength >= 120 && descLength <= 180) {
      score += 20;
      feedback.push(`⚠ Meta description acceptable (${descLength} chars) - aim for 150-160`);
    } else if (descLength < 120) {
      score += 10;
      feedback.push(`✗ Meta description too short (${descLength} chars)`);
    } else {
      score += 10;
      feedback.push(`✗ Meta description too long (${descLength} chars) - will be truncated`);
    }
  } else {
    feedback.push("✗ No meta description - add one for better click-through rates");
  }

  if (input.keywords && input.keywords.length > 0) {
    if (input.keywords.length >= 3 && input.keywords.length <= 8) {
      score += 25;
      feedback.push(`✓ Good number of keywords (${input.keywords.length})`);
    } else if (input.keywords.length < 3) {
      score += 15;
      feedback.push(`⚠ Few keywords (${input.keywords.length}) - add more for targeting`);
    } else {
      score += 15;
      feedback.push(`⚠ Many keywords (${input.keywords.length}) - consider focusing`);
    }
  } else {
    feedback.push("✗ No keywords defined - add target keywords");
  }

  if (input.excerpt && input.excerpt.length >= 50) {
    score += 15;
    feedback.push("✓ Excerpt/summary provided");
  } else {
    feedback.push("⚠ Add a compelling excerpt for previews");
  }

  return { score: Math.min(score, 100), feedback };
}

function analyzeContentStructure(content: string): { score: number; feedback: string[] } {
  const feedback: string[] = [];
  let score = 0;

  const paragraphs = content.match(/<p[^>]*>.*?<\/p>/gi) || [];
  if (paragraphs.length >= 5) {
    score += 25;
    feedback.push(`✓ Good paragraph structure (${paragraphs.length} paragraphs)`);
  } else if (paragraphs.length >= 3) {
    score += 15;
    feedback.push(`⚠ Add more paragraphs (${paragraphs.length} found)`);
  } else {
    feedback.push("✗ Few paragraphs - break up content for readability");
  }

  const lists = content.match(/<(ul|ol)[^>]*>[\s\S]*?<\/(ul|ol)>/gi) || [];
  if (lists.length >= 2) {
    score += 25;
    feedback.push(`✓ Good use of lists (${lists.length} found)`);
  } else if (lists.length === 1) {
    score += 15;
    feedback.push("⚠ Consider adding more lists for scannability");
  } else {
    feedback.push("✗ No lists - add bullet points for key information");
  }

  const boldText = content.match(/<(strong|b)[^>]*>.*?<\/(strong|b)>/gi) || [];
  const italicText = content.match(/<(em|i)[^>]*>.*?<\/(em|i)>/gi) || [];
  if (boldText.length >= 3 || italicText.length >= 2) {
    score += 20;
    feedback.push("✓ Good text formatting (bold/italic)");
  } else if (boldText.length >= 1) {
    score += 10;
    feedback.push("⚠ Add more text emphasis for key points");
  } else {
    feedback.push("⚠ Consider adding bold/italic for emphasis");
  }

  const links = content.match(/<a[^>]*href[^>]*>.*?<\/a>/gi) || [];
  if (links.length >= 3) {
    score += 20;
    feedback.push(`✓ Good internal/external linking (${links.length} links)`);
  } else if (links.length >= 1) {
    score += 10;
    feedback.push(`⚠ Add more links (${links.length} found)`);
  } else {
    feedback.push("✗ No links - add internal/external links");
  }

  const images = content.match(/<img[^>]*>/gi) || [];
  if (images.length >= 2) {
    score += 10;
    feedback.push(`✓ Good use of images (${images.length} found)`);
  } else if (images.length === 1) {
    score += 5;
    feedback.push("⚠ Consider adding more images");
  }

  return { score: Math.min(score, 100), feedback };
}

export function analyzeSeo(input: SeoInput): SeoAnalysisResult {
  const wordCount = countWords(input.content);
  const readTime = calculateReadTime(wordCount);

  const headingAnalysis = analyzeHeadingStructure(input.content);
  const keywordAnalysis = analyzeKeywordDensity(input.content, input.title, input.keywords);
  const lengthAnalysis = analyzeContentLength(wordCount);
  const metaAnalysis = analyzeMetaTags(input);
  const structureAnalysis = analyzeContentStructure(input.content);

  const overallScore = Math.round(
    (headingAnalysis.score * 0.2) +
    (keywordAnalysis.score * 0.25) +
    (lengthAnalysis.score * 0.2) +
    (metaAnalysis.score * 0.2) +
    (structureAnalysis.score * 0.15)
  );

  const allFeedback = [
    "## Heading Structure",
    ...headingAnalysis.feedback,
    "",
    "## Keyword Usage",
    ...keywordAnalysis.feedback,
    "",
    "## Content Length",
    ...lengthAnalysis.feedback,
    "",
    "## Meta Tags",
    ...metaAnalysis.feedback,
    "",
    "## Content Structure",
    ...structureAnalysis.feedback,
  ];

  return {
    headingScore: headingAnalysis.score,
    keywordDensityScore: keywordAnalysis.score,
    contentLengthScore: lengthAnalysis.score,
    metaScore: metaAnalysis.score,
    structureScore: structureAnalysis.score,
    overallSeoScore: overallScore,
    wordCount,
    readTime,
    seoAnalysis: allFeedback.join("\n"),
  };
}

export function getSeoGrade(score: number): { grade: string; color: string } {
  if (score >= 90) return { grade: 'A+', color: 'green' };
  if (score >= 80) return { grade: 'A', color: 'green' };
  if (score >= 70) return { grade: 'B', color: 'lime' };
  if (score >= 60) return { grade: 'C', color: 'yellow' };
  if (score >= 50) return { grade: 'D', color: 'orange' };
  return { grade: 'F', color: 'red' };
}

# AEO Schema & Technical Practices (200+)

## FAQPage schema

1. Use @type FAQPage with mainEntity array.
2. Each item: Question (name) + Answer (text).
3. Keep answer text to 40–60 words.
4. Match schema text to visible FAQ content exactly (content parity).
5. Use one FAQPage per page (or one per major section).
6. Use full sentences in acceptedAnswer text.
7. Don’t use HTML in answer text; use plain text.
8. Use question mark in the question name.
9. 5–10 questions per FAQPage for rich results.
10. Validate with Google Rich Results Test.
11. Place script in head or before </body>.
12. Use application/ld+json.
13. Don’t duplicate the same FAQ across many pages (canonical).
14. Update schema when you update on-page FAQ.
15. Use the same order as on-page (question 1 = first FAQ).
16. Avoid empty or placeholder answers.
17. Use “text” not “html” in acceptedAnswer.
18. Ensure no hidden content (schema = what user sees).
19. Use UTF-8 encoding.
20. Escape special characters in JSON.

## HowTo schema

21. Use @type HowTo with step array.
22. Each step: @type HowToStep, position, name, text.
23. Add totalTime (e.g. PT10M) when relevant.
24. Use ISO 8601 for duration.
25. Step name = short action (e.g. “Install the app”).
26. Step text = 1–2 sentences.
27. Match step order to on-page list.
28. Add “name” and “description” at HowTo level.
29. Use 3–10 steps.
30. Add image to steps when available.
31. Validate with Rich Results Test.
32. Don’t use HowTo for non-procedural content.
33. Use same wording as on-page steps.
34. One HowTo per main task per page.
35. Use “number” or position for step order.
36. Optional: add tool or supply in steps.
37. Keep step text under 50 words.
38. Use imperative or present tense.
39. Ensure steps are actionable.
40. Add HowTo for “how to [action]” pages.

## BreadcrumbList schema

41. Use @type BreadcrumbList, itemListElement array.
42. Each item: ListItem, position, name, item (URL).
43. Use full absolute URLs in item.
44. First item = Home (position 1).
45. Last item = current page.
46. Match order to visible breadcrumbs.
47. Use 2–6 items typically.
48. Use consistent URL format (trailing slash or not).
49. Include in every page’s JSON-LD.
50. Validate with Rich Results Test.
51. Use same names as visible breadcrumb labels.
52. Don’t skip levels (Home → Category → Page).
53. Use https for all URLs.
54. Ensure no broken links in breadcrumb URLs.
55. Match breadcrumb to site hierarchy.
56. Use for location pages: Home → Country → Type → Location.
57. Use for pillars: Home → Pillar name.
58. Use for blog: Home → Blog → Post title.
59. Optional: add sameAs for social in Organization, not in Breadcrumb.
60. Keep names short (e.g. “IPTV” not “IPTV Services Guide”).

## Organization schema

61. Use @type Organization on every page (or reference from WebSite).
62. Include name, url, logo.
63. Add description (1–2 sentences).
64. Add sameAs for social profiles.
65. Add contactPoint (customer service, URL).
66. Use one Organization per brand.
67. Place in head or default layout.
68. Use absolute URL for logo.
69. Use https for url and logo.
70. Add foundingDate if relevant.
71. Add address if you have a physical location.
72. Use contactType “customer service.”
73. Add areaServed if you target regions.
74. Don’t duplicate Organization in every schema block; reference.
75. Validate with Schema.org validator.
76. Use same Organization on all pages.
77. Add KnowsAbout for expertise topics if desired.
78. Add slogan if you use one.
79. Use image for logo when logo is an image.
80. Keep JSON-LD in one script block per type when possible.

## WebSite schema

81. Use @type WebSite with url and name.
82. Add potentialAction SearchAction for sitelinks search box.
83. Use query-input required name=search_term_string.
84. Use target URL with {search_term_string} placeholder.
85. Add publisher (Organization).
86. Add description.
87. Place once per site (e.g. in default layout).
88. Validate with Rich Results Test.
89. Use same url as canonical.
90. Add inLanguage when you have multiple languages.
91. Optional: add alternateName.
92. Don’t duplicate WebSite on every page if you use a single default.
93. Use https for url.
94. Match name to brand.
95. Add lastReviewed or dateModified if you update it.
96. Use mainEntity for the primary topic of the site when relevant.
97. Add sameAs for main social profiles.
98. Keep SearchAction target URL correct (your search URL).
99. Use application/ld+json.
100. Ensure no conflict with Organization (publisher reference).

## Product / Service schema

101. Use Product for physical products (e.g. Fire Stick).
102. Use Service for services (e.g. IPTV subscription).
103. Include name, description, offers (Offer).
104. Use priceCurrency and availability.
105. Add brand (Brand, name).
106. Use url to product or shop page.
107. Add image when available.
108. Use aggregateRating only with real/reasonable data.
109. Use seller (Organization).
110. Add sku or identifier when you have one.
111. For Service: add serviceType, provider, areaServed.
112. Use offers.url for the purchase page.
113. Use availability InStock or OutOfStock.
114. Don’t use fake reviews or ratings.
115. Validate with Rich Results Test.
116. Use one Product/Service per offering when possible.
117. Add description that matches the page.
118. Use priceValidUntil for offers when relevant.
119. Add category when it helps (e.g. “Streaming device”).
120. Use same name as on-page product title.

## Article / WebPage schema

121. Use Article or WebPage for content pages.
122. Include headline, description, datePublished.
123. Add dateModified when you update.
124. Add author (Person or Organization).
125. Add publisher (Organization, logo).
126. Add image (main image URL).
127. Use mainEntityOfPage with @id = page URL.
128. For Article use articleSection or articleBody if needed.
129. Use same headline as H1.
130. Use same description as meta description when possible.
131. Use ISO 8601 for dates.
132. Add wordCount if you want (optional).
133. Don’t use Article for product pages (use Product).
134. Use WebPage for location/pillar pages when not Article.
135. Validate with Rich Results Test.
136. Use speakable when you add Speakable markup.
137. Add mainEntity for the primary Q&A or HowTo when relevant.
138. Use inLanguage.
139. Keep JSON-LD valid (no trailing commas, valid escape).
140. One primary type per page (Article or WebPage, not both for same content).

## Speakable schema

141. Use Speakable only for US English content (per Google).
142. Use cssSelector or xpath to point to answer blocks.
143. Use 2–3 speakable sections per page (20–30 sec each).
144. Use clear, single-sentence content in those sections.
145. Don’t mark captions or source text as speakable.
146. Match speakable to visible content exactly.
147. Use on definition or how-to answer paragraphs.
148. Add to Article or WebPage via speakable property.
149. Use array of SpeakableSpecification.
150. Validate structure with Schema.org validator.
151. Keep speakable blocks short (2–3 sentences).
152. Use for “what is,” “how to” answer paragraphs.
153. Ensure content reads well aloud.
154. Don’t use for lists (use paragraph blocks).
155. Test with Google Assistant when possible.

## Technical (performance & crawl)

156. Keep JSON-LD in a single script tag per type when possible.
157. Minify JSON-LD in production (no unnecessary whitespace).
158. Ensure no syntax errors (valid JSON).
159. Use UTF-8 for all pages.
160. Serve schema with the page (not via JS injection that runs too late).
161. Ensure LCP under 2.5s for pages targeting snippets.
162. Ensure INP under 200ms (interaction responsiveness).
163. Ensure CLS under 0.1 (no layout shift).
164. Use lazy load for below-fold images; don’t lazy load LCP image.
165. Use fetchpriority=high for LCP image.
166. Preconnect to critical origins (API, CDN).
167. Use canonical on every page.
168. Use meta robots index, follow for indexable pages.
169. Use max-snippet:-1, max-image-preview:large when you want full snippet.
170. Ensure mobile-friendly (responsive, no tiny text).
171. Use descriptive alt text for images in content.
172. Use heading hierarchy (one H1, then H2, H3).
173. Ensure internal links use descriptive anchor text.
174. Use sitemap and submit to GSC/Bing.
175. Use IndexNow for new/updated URLs.
176. Ensure 200 status for all indexable URLs.
177. Avoid redirect chains (one hop to final URL).
178. Use HTTPS everywhere.
179. Use stable URLs (no session IDs in canonical).
180. Ensure structured data appears in the initial HTML (SSR or inlined).

## Multi-schema pages

181. Use multiple schema types on one page when they describe different things (e.g. Organization + WebSite + FAQPage).
182. Don’t duplicate the same entity (e.g. same FAQ in two FAQPages).
183. Use @id and @graph when you have many types (optional).
184. Order schema blocks logically (Organization first, then WebSite, then page-specific).
185. Ensure no conflicting values (e.g. two different names for the same entity).
186. Validate the full page with Rich Results Test.
187. Use one script tag per type or one @graph with multiple types.
188. Keep total schema size reasonable (e.g. under 100KB).
189. Remove deprecated or invalid properties.
190. Use current schema.org version (no deprecated types).

## Snippet-specific technical

191. Ensure the paragraph you want as snippet is in a single block (no nested divs that split it).
192. Use a single p or div for the target paragraph.
193. Ensure the target list is in one ul or ol.
194. Ensure the target table has one thead and one tbody.
195. Use semantic HTML (article, section, h2, p).
196. Avoid hiding the snippet target with CSS (display:none).
197. Ensure snippet target is in the initial HTML (not loaded after JS).
198. Use same text in schema as in the DOM (content parity).
199. Ensure no duplicate H1.
200. Ensure snippet target is visible on mobile and desktop.

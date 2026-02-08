# Deliverable 11: Voice Search Query Map (10K entries)

## Structure

- **voice-query-map.csv** columns: `query`, `target_page`, `intent`
- **Intent:** commercial | howto | informational | comparison
- **Scale to 10K:** Generate from patterns:
  - "best IPTV [city]", "IPTV [city]", "jailbroken Fire Stick [city]" → `/l/{country}/iptv/{slug}` or `/l/{country}/jailbreak/{slug}`
  - "Hey Google, best IPTV near me" → `/` or geo page
  - "Alexa, jailbroken Fire Stick setup" → `/jailbroken-fire-sticks`
  - "how to [action] IPTV/Fire Stick" → pillar or how-to page

## Usage

- Map voice queries to target URLs for internal linking and content.
- Optimize target page P1 and FAQ for featured snippet (40–60 words, direct answer).
- Use in AEO checklist: answer-first, conversational language.

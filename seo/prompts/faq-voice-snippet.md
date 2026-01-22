# FAQ & Voice / Featured Snippet Prompt

For plan or device pages, generate FAQ blocks aimed at featured snippets and voice search.

## Prompt

```
For this [plan | device]: [name]

Output:
(1) A 40–50 word direct answer to the main user question, suitable for a featured snippet or voice answer.
(2) A bullet list of 5 key benefits.
(3) 5 FAQs with short answers (2–3 sentences each), focusing on:
    - IPTV legality, buffering, device compatibility, support, free trial.
    - Use "StreamStickPro", "Fire Stick", "live TV" where natural.

Format as JSON:
{
  "directAnswer": "...",
  "benefits": ["...", ...],
  "faqs": [{"q": "...", "a": "..."}, ...]
}
```

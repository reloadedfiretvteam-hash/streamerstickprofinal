/**
 * Automatically adds links to product keywords in blog content
 */
export function autoLinkBlogContent(htmlContent: string): string {
  const keywords = [
    { keyword: 'Fire Stick HD', url: '/#fire-stick-hd' },
    { keyword: 'Fire Stick 4K', url: '/#fire-stick-4k' },
    { keyword: 'Fire Stick 4K Max', url: '/#fire-stick-4k-max' },
    { keyword: 'IPTV subscription', url: '/#iptv' },
    { keyword: 'IPTV service', url: '/#iptv' },
    { keyword: 'streaming service', url: '/' },
  ];

  let linkedContent = htmlContent;

  keywords.forEach(({ keyword, url }) => {
    // Only link first occurrence to avoid over-linking
    const regex = new RegExp(`(>${keyword}<)`, 'i');
    linkedContent = linkedContent.replace(
      regex,
      `><a href="${url}" class="text-orange-500 hover:text-orange-400 font-semibold">${keyword}</a><`
    );
  });

  return linkedContent;
}

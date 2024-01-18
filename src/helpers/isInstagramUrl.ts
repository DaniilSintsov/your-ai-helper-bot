export function isInstagramUrl(str: string): boolean {
	const pattern = new RegExp(
		'^(?:(?:http|https)?://)?(?:www\\.)?(?:instagram\\.com|instagr\\.am)/([A-Za-z0-9-_]+)',
		'i'
	);
	return !!pattern.test(str);
}

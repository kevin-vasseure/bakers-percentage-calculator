import type { Ingredient } from '../stores/ingredientsStore';

export function encodeRecipeToHash(ingredients: Ingredient[]): string {
	// Format: name,flour_flag,value|name,flour_flag,value
	// flour_flag: 1=flour(value=amount), 0=other(value=percentage)
	const compactData = ingredients
		.map((ing) => {
			const name = ing.name.replace(/,/g, ';').replace(/\|/g, '/'); // Escape delimiters
			const flour = ing.isFlour ? '1' : '0';
			const value = ing.isFlour ? ing.amount.toString() : ing.percentage.toString();
			return `${name},${flour},${value}`;
		})
		.join('|');

	try {
		return btoa(compactData);
	} catch (e) {
		console.warn('Failed to encode recipe:', e);
		return '';
	}
}

export function decodeHashToRecipe(hash: string): Ingredient[] | null {
	if (!hash) return null;

	try {
		const compactData = atob(hash);
		const ingredients = compactData.split('|').map((item, index) => {
			const [name, flourFlag, value] = item.split(',');
			const isFlour = flourFlag === '1';
			const numValue = parseFloat(value) || 0;

			return {
				id: index + 1,
				name: name.replace(/;/g, ',').replace(/\//g, '|'), // Unescape delimiters
				isFlour,
				amount: isFlour ? numValue : 0, // Non-flour amounts calculated later
				percentage: isFlour ? 100 : numValue,
				isEditing: false
			};
		});

		// Recalculate amounts for non-flour ingredients
		const totalFlourWeight = ingredients
			.filter((ing) => ing.isFlour)
			.reduce((sum, ing) => sum + ing.amount, 0);

		if (totalFlourWeight > 0) {
			return ingredients.map((ing) => ({
				...ing,
				amount: ing.isFlour
					? ing.amount
					: Math.round((ing.percentage / 100) * totalFlourWeight * 100) / 100
			}));
		}

		return ingredients;
	} catch (e) {
		console.warn('Failed to decode recipe from hash:', e);
		return null;
	}
}

export function updateUrlHash(ingredients: Ingredient[]): void {
	if (typeof window === 'undefined') return;

	const hash = encodeRecipeToHash(ingredients);
	if (hash) {
		const newUrl = `${window.location.pathname}#${hash}`;
		window.history.replaceState(null, '', newUrl);
	}
}
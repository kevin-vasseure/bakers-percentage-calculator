import type { CurrentRecipe } from '../stores/currentRecipeStore';

export function encodeRecipeToHash(recipe: CurrentRecipe): string {
	// Format: name,flour_flag,value|name,flour_flag,value||notes
	// flour_flag: 1=flour(value=amount), 0=other(value=percentage)
	// Double || separates ingredients from notes
	const compactIngredients = recipe.ingredients
		.map((ing) => {
			const name = ing.name.replace(/,/g, ';').replace(/\|/g, '/'); // Escape delimiters
			const flour = ing.isFlour ? '1' : '0';
			const value = ing.isFlour ? ing.amount.toString() : ing.percentage.toString();
			return `${name},${flour},${value}`;
		})
		.join('|');

	// Escape notes - replace problematic characters
	const escapedNotes = recipe.notes.replace(/\|\|/g, '%%').replace(/\|/g, '/');

	const compactData = escapedNotes ? `${compactIngredients}||${escapedNotes}` : compactIngredients;

	try {
		return btoa(compactData);
	} catch (e) {
		console.warn('Failed to encode recipe:', e);
		return '';
	}
}

export function decodeHashToRecipe(hash: string): CurrentRecipe | null {
	if (!hash) return null;

	try {
		const compactData = atob(hash);
		const parts = compactData.split('||');
		const ingredientData = parts[0] || '';
		const notesData = parts[1] || '';

		// Parse ingredients
		const ingredients = ingredientData
			.split('|')
			.filter((item) => item.trim()) // Filter out empty items
			.map((item, index) => {
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

		const processedIngredients =
			totalFlourWeight > 0
				? ingredients.map((ing) => ({
						...ing,
						amount: ing.isFlour
							? ing.amount
							: Math.round((ing.percentage / 100) * totalFlourWeight * 100) / 100
					}))
				: ingredients;

		// Unescape notes
		const notes = notesData.replace(/%%/g, '||').replace(/\//g, '|');

		return {
			title: '',
			description: '',
			notes,
			ingredients: processedIngredients
		};
	} catch (e) {
		console.warn('Failed to decode recipe from hash:', e);
		return null;
	}
}

export function updateUrlHash(recipe: CurrentRecipe): void {
	if (typeof window === 'undefined') return;

	const hash = encodeRecipeToHash(recipe);
	if (hash) {
		const newUrl = `${window.location.pathname}#${hash}`;
		window.history.replaceState(null, '', newUrl);
	}
}

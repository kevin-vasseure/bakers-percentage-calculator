import { writable } from 'svelte/store';

export interface Ingredient {
	id: number;
	name: string;
	isFlour: boolean;
	amount: number;
	percentage: number;
}

const defaultIngredients: Ingredient[] = [
	{ id: 1, name: 'Bread Flour', isFlour: true, amount: 1000, percentage: 100 },
	{ id: 2, name: 'Water', isFlour: false, amount: 700, percentage: 70 },
	{ id: 3, name: 'Salt', isFlour: false, amount: 20, percentage: 2 },
	{ id: 4, name: 'Yeast', isFlour: false, amount: 1, percentage: 0.1 }
];

function createIngredientsStore() {
	const { subscribe, set, update } = writable<Ingredient[]>(defaultIngredients);

	let nextId = 5;

	return {
		subscribe,
		set,

		add: () => {
			update((ingredients) => [
				...ingredients,
				{
					id: nextId++,
					name: 'New Ingredient',
					isFlour: false,
					amount: 0,
					percentage: 0
				}
			]);
		},

		remove: (id: number) => {
			update((ingredients) => {
				const filtered = ingredients.filter((ing) => ing.id !== id);

				// If we removed the last flour, make sure we have at least one flour
				if (!filtered.some((ing) => ing.isFlour) && filtered.length > 0) {
					const updated = filtered.map((ing, index) =>
						index === 0 ? { ...ing, isFlour: true } : ing
					);
					updateAmounts(updated);
					return updated;
				}

				return filtered;
			});
		},

		toggleFlour: (id: number) => {
			update((ingredients) => {
				const updated = ingredients.map((ing) =>
					ing.id === id ? { ...ing, isFlour: !ing.isFlour } : ing
				);
				updateAmounts(updated);
				return updated;
			});
		},

		updateAmount: (id: number, amount: number) => {
			update((ingredients) => {
				const updated = ingredients.map((ing) => (ing.id === id ? { ...ing, amount } : ing));
				const updatedIngredient = updated.find((ing) => ing.id === id);

				if (updatedIngredient?.isFlour) {
					updateAmounts(updated);
				} else {
					updatePercentages(updated);
				}

				return updated;
			});
		},

		updatePercentage: (id: number, percentage: number) => {
			update((ingredients) => {
				const updated = ingredients.map((ing) => (ing.id === id ? { ...ing, percentage } : ing));
				updateAmounts(updated);
				return updated;
			});
		},

		updateName: (id: number, name: string) => {
			update((ingredients) => ingredients.map((ing) => (ing.id === id ? { ...ing, name } : ing)));
		},

		reorder: (draggedId: number, targetId: number) => {
			update((ingredients) => {
				const draggedIndex = ingredients.findIndex((ing) => ing.id === draggedId);
				const targetIndex = ingredients.findIndex((ing) => ing.id === targetId);

				if (draggedIndex === -1 || targetIndex === -1) return ingredients;

				const newIngredients = [...ingredients];
				const [draggedItem] = newIngredients.splice(draggedIndex, 1);
				newIngredients.splice(targetIndex, 0, draggedItem);

				return newIngredients;
			});
		},

		getNextId: () => nextId,

		setNextId: (id: number) => {
			nextId = id;
		}
	};
}

function updateAmounts(ingredients: Ingredient[]): void {
	const totalFlour = ingredients
		.filter((ing) => ing.isFlour)
		.reduce((sum, ing) => sum + ing.amount, 0);

	if (totalFlour === 0) return;

	ingredients.forEach((ing) => {
		if (!ing.isFlour) {
			ing.amount = Math.round((ing.percentage / 100) * totalFlour * 100) / 100;
		}
	});
}

function updatePercentages(ingredients: Ingredient[]): void {
	const totalFlourWeight = ingredients
		.filter((ing) => ing.isFlour)
		.reduce((sum, ing) => sum + ing.amount, 0);

	if (totalFlourWeight === 0) return;

	ingredients.forEach((ing) => {
		if (!ing.isFlour) {
			ing.percentage = Math.round((ing.amount / totalFlourWeight) * 100 * 100) / 100;
		}
	});
}

export const ingredientsStore = createIngredientsStore();

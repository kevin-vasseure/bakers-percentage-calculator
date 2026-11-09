import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { currentRecipeStore } from './currentRecipeStore';

const setup = () =>
	currentRecipeStore.setIngredients([
		{ id: 1, name: 'T65', isFlour: true, amount: 700, percentage: 100 },
		{ id: 2, name: 'Seigle', isFlour: true, amount: 300, percentage: 100 },
		{ id: 3, name: 'Eau', isFlour: false, amount: 650, percentage: 65 },
		{ id: 4, name: 'Sel', isFlour: false, amount: 20, percentage: 2 }
	]);

const byId = (id: number) => get(currentRecipeStore).ingredients.find((i) => i.id === id)!;

describe('removeIngredient', () => {
	beforeEach(() => {
		currentRecipeStore.reset();
		setup();
	});

	it('recalculates non-flour amounts when one of several flours is removed', () => {
		currentRecipeStore.removeIngredient(2);
		expect(byId(3).amount).toBeCloseTo(455); // 65% of 700
		expect(byId(4).amount).toBeCloseTo(14); // 2% of 700
		expect(byId(3).percentage).toBe(65);
	});

	it('leaves others untouched when a non-flour is removed', () => {
		currentRecipeStore.removeIngredient(4);
		expect(byId(3).amount).toBe(650);
		expect(byId(1).amount).toBe(700);
	});

	it('promotes the first remaining ingredient when the last flour is removed', () => {
		currentRecipeStore.removeIngredient(2);
		currentRecipeStore.removeIngredient(1);
		expect(byId(3).isFlour).toBe(true);
		expect(byId(3).amount).toBeCloseTo(455);
		expect(byId(4).percentage).toBeCloseTo((14 / 455) * 100);
	});
});

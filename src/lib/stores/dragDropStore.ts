import { writable } from 'svelte/store';

export interface DragDropState {
	draggedId: number | null;
	dragOverId: number | null;
}

function createDragDropStore() {
	const { subscribe, set, update } = writable<DragDropState>({
		draggedId: null,
		dragOverId: null
	});

	return {
		subscribe,
		
		startDrag: (id: number) => {
			update(state => ({ ...state, draggedId: id }));
		},

		setDragOver: (id: number) => {
			update(state => ({ ...state, dragOverId: id }));
		},

		clearDragOver: () => {
			update(state => ({ ...state, dragOverId: null }));
		},

		endDrag: () => {
			set({ draggedId: null, dragOverId: null });
		},

		reset: () => {
			set({ draggedId: null, dragOverId: null });
		}
	};
}

export const dragDropStore = createDragDropStore();
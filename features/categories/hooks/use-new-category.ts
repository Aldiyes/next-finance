import { create } from "zustand";

type NewCategoryStore = {
	isOpen: boolean;
	onOpen: () => void;
	onClose: () => void;
};

export const useNewCategory = create<NewCategoryStore>((set) => ({
	isOpen: false,
	onOpen: () => set({ isOpen: true }),
	onClose: () => set({ isOpen: false }),
}));

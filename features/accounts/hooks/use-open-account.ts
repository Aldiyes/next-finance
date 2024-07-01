import { create } from "zustand";

type OpenAccountStore = {
	id?: string;
	isOpen: boolean;
	onOpen: (id: string) => void;
	onClose: () => void;
};

export const useOpenAccount = create<OpenAccountStore>((set) => ({
	id: undefined,
	isOpen: false,
	onOpen: (id: string) => set({ isOpen: true, id }),
	onClose: () => set({ isOpen: false, id: undefined }),
}));

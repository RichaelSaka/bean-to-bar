import { writable } from "svelte/store";

// Global store for the currently selected chocolate bar from the intro screen.
// Other sections (like the company reveal) can subscribe to this to know
// which bar the user picked.
export const selectedChocolateId = writable(null);

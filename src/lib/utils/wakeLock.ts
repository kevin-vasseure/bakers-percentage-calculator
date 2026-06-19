import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const PREF_KEY = 'bakers-keep-awake';

// User preference: should the screen be kept awake? Persisted across sessions.
function createKeepAwakeStore() {
	const initial = browser && localStorage.getItem(PREF_KEY) === '1';
	const { subscribe, set } = writable<boolean>(initial);

	return {
		subscribe,
		set: (value: boolean) => {
			if (browser) localStorage.setItem(PREF_KEY, value ? '1' : '0');
			set(value);
		}
	};
}

export const keepAwake = createKeepAwakeStore();

// Minimal structural typing so we don't depend on lib.dom's WakeLock types
type WakeLockSentinelLike = {
	release: () => Promise<void>;
	addEventListener: (type: 'release', listener: () => void) => void;
};

type NavigatorWithWakeLock = Navigator & {
	wakeLock?: {
		request: (type: 'screen') => Promise<WakeLockSentinelLike>;
	};
};

let sentinel: WakeLockSentinelLike | null = null;

export function isSupported(): boolean {
	return browser && 'wakeLock' in navigator;
}

/**
 * Ask the device to keep the screen awake. Safe to call repeatedly — it no-ops
 * if a lock is already held or the API is unavailable. The request can be
 * rejected by the browser (page hidden, low battery, …); failures are ignored.
 */
export async function requestWakeLock(): Promise<void> {
	if (!isSupported() || sentinel) return;

	try {
		const nav = navigator as NavigatorWithWakeLock;
		sentinel = (await nav.wakeLock!.request('screen')) ?? null;
		// The OS releases the lock automatically when the page is hidden;
		// clear our reference so we can re-acquire it later.
		sentinel?.addEventListener('release', () => {
			sentinel = null;
		});
	} catch {
		sentinel = null;
	}
}

export async function releaseWakeLock(): Promise<void> {
	if (!sentinel) return;
	try {
		await sentinel.release();
	} catch {
		// ignore
	}
	sentinel = null;
}

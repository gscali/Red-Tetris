import { type Writable, writable } from 'svelte/store';

export let pseudo: Writable<string | null> = localStorageStore('pseudo', null);

export type Player = {
  id: string;
  name: string;
  score: number;
  map: string[][];
  specter: string[][];
  queue: string[];
  gameOver: boolean;
  hold: string;
  lostAt: number | undefined;
};

export function localStorageStore<T>(key: string, initialValue: T): Writable<T> {
  if (typeof window === 'undefined') return writable<T>(initialValue);
  const json = localStorage.getItem(key);
  const initial = json ? JSON.parse(json) : initialValue;

  const store = writable<T>(initial);

  store.subscribe((value) => {
    localStorage.setItem(key, JSON.stringify(value));
  });

  return store;
}

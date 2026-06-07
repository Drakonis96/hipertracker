import { randomUUID } from 'node:crypto';

export const newId = () => randomUUID();
export const now = () => Date.now();

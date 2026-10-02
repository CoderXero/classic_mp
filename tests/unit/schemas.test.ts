import { describe, expect, it } from 'vitest'; import { mediaSourceSchema, speedSchema } from '../../src/shared/schemas.js';
describe('request schemas', () => { it('rejects file URLs', () => expect(mediaSourceSchema.safeParse({ type: 'file', url: 'file:///tmp/a' }).success).toBe(false)); it('bounds playback speed', () => expect(speedSchema.safeParse({ speed: 5 }).success).toBe(false)); });

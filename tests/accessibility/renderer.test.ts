import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
const source = readFileSync('src/renderer/main.tsx', 'utf8');
describe('renderer accessibility contract', () => { it('keeps primary transport controls named for assistive technology', () => { for (const label of ['Play or pause', 'Stop', 'Mute', 'Volume', 'Speed', 'Fullscreen', 'Seek']) expect(source).toContain(`aria-label="${label}"`); }); it('uses native labels for settings controls', () => { expect(source).toContain('<label>Theme'); expect(source).toContain('select value={theme}'); }); });

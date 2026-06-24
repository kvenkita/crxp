import { describe, it, expect } from 'vitest';
import { schemeColors, buildStepExpression, legendClasses, formatValue } from './colorScale.js';

describe('schemeColors', () => {
	it('returns n hex colors', () => {
		const c = schemeColors('YlGnBu', 5);
		expect(c.length).toBe(5);
		c.forEach((x) => expect(x).toMatch(/^#[0-9a-f]{6}$/i));
	});
	it('falls back for unknown scheme', () => {
		expect(schemeColors('nope', 3).length).toBe(3);
	});
});

describe('buildStepExpression', () => {
	it('produces a valid step expression on feature-state v', () => {
		const expr = buildStepExpression([10, 20, 30, 40], ['#a', '#b', '#c', '#d', '#e']);
		expect(expr[0]).toBe('step');
		expect(expr[1]).toEqual(['coalesce', ['feature-state', 'v'], 0]);
		expect(expr[2]).toBe('#a'); // base color
		// then break/color pairs
		expect(expr[3]).toBe(10);
		expect(expr[4]).toBe('#b');
		expect(expr[expr.length - 1]).toBe('#e');
	});
});

describe('formatValue', () => {
	it('formats percent / dollar / number', () => {
		expect(formatValue(12.345, 'percent', 1)).toBe('12.3%');
		expect(formatValue(52000, 'dollar')).toBe('$52,000');
		expect(formatValue(1234.5, 'number', 0)).toBe('1,235');
		expect(formatValue(null, 'percent')).toBe('—');
	});
});

describe('legendClasses', () => {
	it('builds labelled classes with bounds', () => {
		const colors = ['#a', '#b', '#c'];
		const cls = legendClasses([20, 40], colors, { format: 'percent', decimals: 0, min: 0, max: 100 });
		expect(cls.length).toBe(3);
		expect(cls[0].label).toBe('< 20%');
		expect(cls[1].label).toBe('20% – 40%');
		expect(cls[2].label).toBe('40%+');
		expect(cls[0].color).toBe('#a');
	});
});

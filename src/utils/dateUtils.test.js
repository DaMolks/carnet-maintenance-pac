import { getTodayISOFormat } from './dateUtils';

describe('getTodayISOFormat', () => {
  const RealDate = Date;
  beforeAll(() => {
    class MockDate extends RealDate {
      constructor(...args) {
        if (args.length) {
          super(...args);
          return;
        }
        super('2023-01-01T00:30:00Z');
      }
      getFullYear() { return 2022; }
      getMonth() { return 11; } // December (0-indexed)
      getDate() { return 31; }
    }
    global.Date = MockDate;
  });
  afterAll(() => {
    global.Date = RealDate;
  });

  it('returns the local date in ISO format', () => {
    expect(getTodayISOFormat()).toBe('2022-12-31');
  });
});

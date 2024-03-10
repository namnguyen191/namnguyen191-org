import { delay } from './time';
vi.useFakeTimers();

describe('utils', () => {
  describe('delay', () => {
    test('delay for 2 second', () => {
      const doSomething = vi.fn();

      delay(2000, doSomething);

      vi.advanceTimersByTime(1000);

      expect(doSomething).not.toHaveBeenCalled();

      vi.advanceTimersByTime(2000);

      expect(doSomething).toHaveBeenCalled();
    });
  });
});

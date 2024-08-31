import { removeEmptyKeys } from './object-manipulation';

describe('removeEmptyKeys', () => {
  it('should work remove empty keys', () => {
    let testObj = {
      field1: 'Hi',
      field2: undefined,
      field3: {
        field4: null,
        field5: true,
      },
    };
    const expectedObj = {
      field1: 'Hi',
      field3: {
        field5: true,
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    testObj = removeEmptyKeys(testObj) as any;

    expect(testObj).toEqual(expectedObj);
  });
});

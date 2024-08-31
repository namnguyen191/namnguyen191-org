import { ObjectType } from '@namnguyen191/types-helper';
import { isNil, isPlainObject, omitBy } from 'lodash-es';

// Go through an object recursively and remove all key that has "null" or "undefined" value
export const removeEmptyKeys = (obj: ObjectType): ObjectType => {
  obj = omitBy(obj, isNil);
  for (const [key, val] of Object.entries(obj)) {
    if (isPlainObject(val)) {
      obj[key] = removeEmptyKeys(val);
    }
  }
  return obj;
};

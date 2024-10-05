export const parentContains = (params: {
  ele: HTMLElement;
  attrName: string;
  attrValue: string;
}): boolean => {
  const { ele, attrName, attrValue } = params;
  let parent: HTMLElement | null = ele.parentElement;
  while (parent) {
    if (parent.getAttribute(attrName) === attrValue) {
      return true;
    }
    parent = parent.parentElement;
  }

  return false;
};

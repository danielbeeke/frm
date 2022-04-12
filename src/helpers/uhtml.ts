import umap from 'umap';
import {render as $render, html as $html, svg as $svg} from 'uhtml';

/**
 * This code makes uhtml async resolve LDflex paths. It calls the toString on line 27.
 */

const {isArray} = Array;

const sync = (values, i) => {
  const resolved: Array<any> = [];

  for (const {length} = values; i < length; i++) {
    const itemToResolve = isArray(values[i]) ? sync(values[i], 0) : values[i]
    // console.log(itemToResolve)
    resolved.push(itemToResolve);
  }
  return Promise.all(resolved);
};

/**
 * Returns a template literal tag abe to resolve, recursively, any possible
 * asynchronous interpolation.
 * @param {function} tag a template literal tag.
 * @returns {function} a template literal tag that resolves interpolations
 *                     before passing these to the initial template literal.
 */
const asyncTag = tag => {
  function invoke(template, values) {
    /** @ts-ignore */
    return tag.apply(this, [template].concat(values));
  }
  return function (template) {
    const args = [...arguments]
    for (let [index, argument] of args.entries()) {
      args[index] = argument?.proxy ? argument.toString() : argument
    }

    /** @ts-ignore */
    return sync(args, 1).then(invoke.bind(this, template));
  };
};

const {defineProperties} = Object;

const tag = original => {
  const wrap = umap(new WeakMap);
  return defineProperties(
    asyncTag(original),
    {
      for: {
        value(ref, id) {
          const tag = original.for(ref, id);
          return wrap.get(tag) || wrap.set(tag, asyncTag(tag));
        }
      },
      node: {
        value: asyncTag(original.node)
      }
    }
  );
};

export const html: any = tag($html);
export const svg = tag($svg);

export const render = (where, what) => {
  const hole = typeof what === 'function' ? what() : what;
  return Promise.resolve(hole).then(what => $render(where, what));
};


/**
 * This file is a combination of uhtml index.js and the async.js.
 * We needed to unpack LDflex proxies before they were rendered.
 * There might be a cleaner way to achieve this. Maybe via a LDflex handler.
 */
import asyncTag from 'async-tag';
import {render, Hole} from 'uhtml/esm/async';
import umap from 'umap';
import {createCache, unroll} from 'uhtml/esm/rabbit';

const processValues = (values) => {
  for (const [index, value] of values.entries())
    if (value?.proxy) values[index] = value?.value
}

const {create, defineProperties} = Object;

const originalTag = type => {
  const keyed = umap(new WeakMap);
  const fixed = cache => (template, ...values) => {
    processValues(values)
    return unroll(cache, { type, template, values})
  }
  return defineProperties(
    (template, ...values) => {
      processValues(values)
      return new Hole(type, template, values)
    },
    {
      for: {
        value(ref, id) {
          const memo = keyed.get(ref) || keyed.set(ref, create(null));
          return memo[id] || (memo[id] = fixed(createCache()));
        }
      },
      node: {
        value: (template, ...values) => unroll(createCache(), {type, template, values}).valueOf()
      }
    }
  );
};

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

const html = tag(originalTag('html'))
const svg = tag(originalTag('svg'))

export { html, svg, Hole, render }
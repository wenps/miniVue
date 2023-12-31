import { readonly } from "../reactive";

describe('readonly', () => {
  it('happy path', () => {
    // readonly和reactive差不多，但是readonly不支持set
    const original = { foo: 1, bar: { baz: 2 } };
    const wrapped = readonly(original);
    expect(wrapped).not.toBe(original);
    expect(wrapped.foo).toBe(1);
  })

  it('warn', () => {
    console.warn = jest.fn()
    const user = readonly({ age: 11 });
    user.age = 11
    expect(console.warn).toBeCalled
  })
})

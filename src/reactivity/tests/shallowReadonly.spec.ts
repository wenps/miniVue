import { isReadonly } from "../is";
import { shallowReadonly } from "../reactive";


describe("shallowReadonly", () => {
  test("should not make non-reactive properties reactive", () => {
    const props = shallowReadonly({ n: { foo: 1 } });
    expect(isReadonly(props)).toBe(true);
    expect(isReadonly(props.n)).toBe(false);
  });

  it("should call console.warn when set", () => {
    console.warn = jest.fn();
    
    const user = shallowReadonly({
      age: 10,
      n: { foo: 1 }
    });

    user.age = 11;
    user.n.foo = 12
    expect(console.warn).toHaveBeenCalled();
    expect(user.n.foo).toBe(12);
  });
})

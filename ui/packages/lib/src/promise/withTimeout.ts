type Resolver = () => void;

export function withTimeout<T>(cb: (resolver: Resolver) => T, ms: number): Promise<T> {
  return new Promise<T>((resolve) => {
    const id = setTimeout(() => resolve(result), ms);

    const result = cb(() => {
      clearTimeout(id);
      setTimeout(() => resolve(result), 0);
    });
  });
}

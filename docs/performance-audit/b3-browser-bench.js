/* Served as a static script: every request uses the actual emitted worker assets. */
window.b3 = {
  async run(phase, host, languages) {
    const manifest = await fetch("./manifest.json").then((r) => r.json());
    const worker = new Worker(manifest[phase][host].chat, { type: "module" });
    let next = 0;
    const pending = new Map();
    worker.onmessage = ({ data }) => pending.get(data.id)?.(data);
    const errors = [];
    worker.onerror = (event) => errors.push(event.message);
    const request = (code, language) =>
      new Promise((resolve, reject) => {
        const id = ++next;
        const timer = setTimeout(() => {
          pending.delete(id);
          reject(Error(`Timeout: ${language}`));
        }, 15000);
        pending.set(id, (data) => {
          clearTimeout(timer);
          pending.delete(id);
          resolve(data);
        });
        worker.postMessage({ id, code, language });
      });
    const digest = async (text) =>
      Array.from(
        new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text))),
        (n) => n.toString(16).padStart(2, "0"),
      ).join("");
    try {
      const start = performance.now();
      const warm = await request("const warm = true;", "typescript");
      const firstMs = performance.now() - start;
      if (!warm.html?.includes("<span"))
        throw Error(`Worker did not highlight: ${JSON.stringify(warm)} ${errors}`);
      if (languages) {
        const results = [];
        for (const language of languages) {
          const response = await request(
            'const answer = 42; // comment\nprint("<safe>&value");',
            language,
          );
          if (response.error) throw Error(`${language}: ${response.error}`);
          results.push({
            language,
            digest: await digest(response.html),
            bytes: new TextEncoder().encode(response.html).length,
            highlighted: response.html.includes("<span"),
          });
        }
        return { phase, host, firstMs, results, errors };
      }
      const started = performance.now();
      let firstResultMs;
      const responses = await Promise.all(
        Array.from({ length: 32 }, (_, i) =>
          request(
            Array.from(
              { length: 16 },
              (_, line) => `export const value${i}_${line}: number = ${line};`,
            ).join("\n"),
            "typescript",
          ).then((response) => {
            firstResultMs ??= performance.now() - started;
            return response.html;
          }),
        ),
      );
      const totalMs = performance.now() - started;
      const html = responses.join("\n");
      return {
        phase,
        host,
        firstMs,
        firstResultMs,
        totalMs,
        digest: await digest(html),
        bytes: new TextEncoder().encode(html).length,
        errors,
      };
    } finally {
      worker.terminate();
    }
  },
};

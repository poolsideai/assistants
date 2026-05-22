__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

describe("getUrlContents", () => {
  let fetchMock: Mock<typeof fetch>;
  let exampleUrl = "https://example.com";

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  const mockSystem: any = {
    telemetry: {
      reportError: vi.fn(),
    },
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return parsed HTML content when fetch is successful", async () => {
    const mockHtmlContent = "<html><body><h1>Example</h1></body></html>";
    const response = new Response(mockHtmlContent, {
      headers: { "Content-Type": "text/html" },
      status: 200,
    });

    fetchMock.mockResolvedValue(response);

    const result = await getUrlContents(mockSystem, exampleUrl);
    expect(result.content).toContain("Example");
  });

  it("falls back to content for non-HTML plaintext", async () => {
    const contentReturned = '{"hello":"there"}';
    const response = new Response(contentReturned, {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

    fetchMock.mockResolvedValue(response);

    const result = await getUrlContents(mockSystem, exampleUrl);
    expect(result.content).equals(contentReturned);
  });

  it("should throw an error when fetch fails with an HTTP error", async () => {
    const response = new Response(null, { status: 404, statusText: "Not Found" });
    fetchMock.mockResolvedValue(response);

    await expect(getUrlContents(mockSystem, exampleUrl)).rejects.toThrow(
__POOL_SYNTHETIC_IMPORT_BASELINE__
    );
  });

  it("should throw an error when response body is empty", async () => {
    const response = new Response(null, { status: 200 });
    fetchMock.mockResolvedValue(response);

    await expect(getUrlContents(mockSystem, exampleUrl)).rejects.toThrow(
__POOL_SYNTHETIC_IMPORT_BASELINE__
    );
  });

  it("should throw an error for binary MIME types", async () => {
    const mockContent = "fake-binary-content";
    const response = new Response(mockContent, {
      headers: { "Content-Type": "application/octet-stream" },
      status: 200,
    });

    fetchMock.mockResolvedValue(response);

    await expect(getUrlContents(mockSystem, exampleUrl)).rejects.toThrow(
__POOL_SYNTHETIC_IMPORT_BASELINE__
    );
  });

  it("should throw a timeout error if request takes too long", async () => {
    vi.useFakeTimers();

    // never resolves
    fetchMock.mockImplementation((url, { signal = null } = {}) => {
      if (!signal) throw Error("missing signal");
      return new Promise((_, reject) => {
        const onabort = () => reject(new Error("Timeout awaiting response"));
        if (signal.aborted) {
          onabort();
        } else {
          signal.addEventListener("abort", onabort);
        }
      });
    });

    const requestPromise = getUrlContents(mockSystem, exampleUrl);
    vi.advanceTimersByTime(25_000);
    await expect(requestPromise).rejects.toThrow("Timeout awaiting response");
  });
});

describe("_isBinaryMime", () => {
  const testCases = [
    { input: "application/x-executable", expected: true },
    {
      input:
        "application/vnd.openxmlformats-officedocument.presentationml.presentation; charset=utf-8",
      expected: true,
    },
    { input: "application/pdf", expected: true },
    { input: "application/octet-stream", expected: true },
    { input: "application/zip", expected: true },
    { input: "image/png", expected: true },
    { input: "video/mp4", expected: true },
    { input: "image/jpeg", expected: true },
    // non-binary
    { input: "application/xhtml+xml", expected: false },
    { input: "text/plain", expected: false },
    { input: ";charset=utf-8;text/html;", expected: false },
    { input: "application/json", expected: false },
    { input: "text/html; charset=utf-8", expected: false },
  ];

  testCases.forEach(({ input, expected }) => {
    it(`returns ${expected} for mime type '${input}'`, () => {
      expect(_isBinaryMime(input)).toBe(expected);
    });
  });
});

describe("_treatAsHTML", () => {
  it("treats explicit text/html types as html", () => {
    expect(_treatAsHTML("text/html", "haha")).toBe(true);
    expect(_treatAsHTML("application/xhtml+xml", "haha")).toBe(true);
  });
  it("does not get confused by charsets", () => {
    expect(_treatAsHTML("application/xhtml+xml; charset=utf-8", "")).toBe(true);
  });
  it("does not consider non-HTML plaintext as HTML", () => {
    expect(_treatAsHTML("application/javascript", "")).toBe(false);
    expect(_treatAsHTML("application/xml", "<yo></yo>")).toBe(false);
  });
  it("handles weird content-types formats", () => {
    expect(_treatAsHTML(";*;text/html;", "ok")).toBe(true);
  });
  it("if content-type is missing, sniffs content to find html", () => {
    expect(_treatAsHTML("", "<html>")).toBe(true);
    expect(_treatAsHTML("", "\n\n\n\n<!doctype html>")).toBe(true);
  });
  it("doesn't sniff when content-type is present", () => {
    expect(_treatAsHTML("text/markdown", "<html> is the top-most element")).toBe(false);
  });
});

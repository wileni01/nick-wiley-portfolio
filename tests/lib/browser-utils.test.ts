import assert from "node:assert/strict";
import test from "node:test";

import {
  classifyExternalOpenResult,
  openExternalUrl,
  openExternalUrls,
} from "../../lib/external-link";
import { copyTextToClipboard } from "../../lib/clipboard";
import { sanitizeFileToken, triggerDownload } from "../../lib/download";

type GlobalKey = "window" | "document";

function withGlobalValue<T>(
  key: GlobalKey,
  value: unknown,
  run: () => T | Promise<T>
): T | Promise<T> {
  const previous = (globalThis as Record<string, unknown>)[key];
  const hadOwn = Object.prototype.hasOwnProperty.call(globalThis, key);
  const restore = () => {
    if (hadOwn) {
      Object.defineProperty(globalThis, key, {
        configurable: true,
        writable: true,
        value: previous,
      });
    } else {
      delete (globalThis as Record<string, unknown>)[key];
    }
  };
  Object.defineProperty(globalThis, key, {
    configurable: true,
    writable: true,
    value,
  });
  try {
    const result = run();
    if (result instanceof Promise) {
      return result.finally(restore);
    }
    restore();
    return result;
  } catch (error) {
    restore();
    throw error;
  }
}

test("sanitizeFileToken normalizes unsafe tokens and falls back", () => {
  assert.equal(sanitizeFileToken(" ACME / Team ", "fallback"), "acme-team");
  assert.equal(sanitizeFileToken("___", "fallback"), "fallback");
  assert.equal(sanitizeFileToken(null, "fallback"), "fallback");
});

test("external-link helpers normalize URLs and classify open outcomes", () => {
  const openedUrls: string[] = [];
  const mockWindow = {
    location: { origin: "https://portfolio.example" },
    open: (url: string) => {
      openedUrls.push(url);
      return {};
    },
  };

  withGlobalValue("window", mockWindow, () => {
    assert.equal(openExternalUrl("/contact"), true);
    assert.equal(
      openedUrls[0],
      "https://portfolio.example/contact"
    );
    assert.equal(openExternalUrl("javascript:alert(1)"), false);

    const result = openExternalUrls(["/resume", "javascript:alert(1)", "https://example.com"]);
    assert.deepEqual(result, {
      attempted: 3,
      opened: 2,
      openedIndexes: [0, 2],
    });
  });

  assert.equal(classifyExternalOpenResult({ attempted: 3, opened: 3 }), "opened");
  assert.equal(classifyExternalOpenResult({ attempted: 3, opened: 1 }), "partial");
  assert.equal(classifyExternalOpenResult({ attempted: 3, opened: 0 }), "error");
});

test("triggerDownload sanitizes filenames and revokes object URLs", () => {
  const createdLinks: Array<{ href: string; download: string; clicked: boolean }> = [];
  const revokedUrls: string[] = [];
  const appended: unknown[] = [];

  const originalCreateObjectURL = (URL as typeof URL & {
    createObjectURL?: (blob: Blob) => string;
  }).createObjectURL;
  const originalRevokeObjectURL = (URL as typeof URL & {
    revokeObjectURL?: (url: string) => void;
  }).revokeObjectURL;

  (URL as typeof URL & { createObjectURL: (blob: Blob) => string }).createObjectURL = (
    _blob: Blob
  ) => "blob:mock-download";
  (URL as typeof URL & { revokeObjectURL: (url: string) => void }).revokeObjectURL = (
    url: string
  ) => {
    revokedUrls.push(url);
  };

  const mockDocument = {
    body: {
      appendChild: (node: unknown) => {
        appended.push(node);
      },
    },
    createElement: (tag: string) => {
      assert.equal(tag, "a");
      const link = {
        href: "",
        download: "",
        style: { display: "" },
        click: () => {
          const last = createdLinks[createdLinks.length - 1];
          if (last) last.clicked = true;
        },
        remove: () => undefined,
      };
      createdLinks.push({ href: "", download: "", clicked: false });
      Object.defineProperty(link, "href", {
        get: () => createdLinks[createdLinks.length - 1]?.href ?? "",
        set: (value: string) => {
          const last = createdLinks[createdLinks.length - 1];
          if (last) last.href = value;
        },
      });
      Object.defineProperty(link, "download", {
        get: () => createdLinks[createdLinks.length - 1]?.download ?? "",
        set: (value: string) => {
          const last = createdLinks[createdLinks.length - 1];
          if (last) last.download = value;
        },
      });
      return link;
    },
  };

  const mockWindow = {
    setTimeout: (callback: () => void) => {
      callback();
      return 1;
    },
  };

  try {
    withGlobalValue("window", mockWindow, () =>
      withGlobalValue("document", mockDocument, () => {
        const longUnsafeFilename = `${" report ".repeat(40)}<>:"/\\|?*\u0000.txt`;
        const didDownload = triggerDownload({
          content: "hello",
          mimeType: "text/plain",
          filename: longUnsafeFilename,
        });
        assert.equal(didDownload, true);
      })
    );
  } finally {
    if (originalCreateObjectURL) {
      (URL as typeof URL & { createObjectURL: (blob: Blob) => string }).createObjectURL =
        originalCreateObjectURL;
    } else {
      delete (URL as typeof URL & { createObjectURL?: unknown }).createObjectURL;
    }
    if (originalRevokeObjectURL) {
      (URL as typeof URL & { revokeObjectURL: (url: string) => void }).revokeObjectURL =
        originalRevokeObjectURL;
    } else {
      delete (URL as typeof URL & { revokeObjectURL?: unknown }).revokeObjectURL;
    }
  }

  assert.equal(createdLinks.length, 1);
  assert.equal(createdLinks[0]?.href, "blob:mock-download");
  assert.ok((createdLinks[0]?.download.length ?? 0) > 0);
  assert.ok((createdLinks[0]?.download.length ?? 0) <= 140);
  assert.equal(/[<>:"/\\|?*\u0000-\u001F]/.test(createdLinks[0]?.download ?? ""), false);
  assert.equal(createdLinks[0]?.clicked, true);
  assert.equal(appended.length, 1);
  assert.deepEqual(revokedUrls, ["blob:mock-download"]);
});

test("triggerDownload returns false on browser API failures", () => {
  const originalCreateObjectURL = (URL as typeof URL & {
    createObjectURL?: (blob: Blob) => string;
  }).createObjectURL;
  (URL as typeof URL & { createObjectURL: (blob: Blob) => string }).createObjectURL = () => {
    throw new Error("broken");
  };
  try {
    withGlobalValue("window", { setTimeout: (_callback: () => void) => 1 }, () =>
      withGlobalValue(
        "document",
        { body: {}, createElement: () => ({ style: {}, click() {}, remove() {} }) },
        () => {
          assert.equal(
            triggerDownload({
              content: "hello",
              mimeType: "text/plain",
              filename: "file.txt",
            }),
            false
          );
        }
      )
    );
  } finally {
    if (originalCreateObjectURL) {
      (URL as typeof URL & { createObjectURL: (blob: Blob) => string }).createObjectURL =
        originalCreateObjectURL;
    } else {
      delete (URL as typeof URL & { createObjectURL?: unknown }).createObjectURL;
    }
  }
});

test("clipboard helper uses navigator clipboard when available", async () => {
  const writes: string[] = [];
  const mockWindow = {
    navigator: {
      clipboard: {
        writeText: async (value: string) => {
          writes.push(value);
        },
      },
    },
  };
  const result = await withGlobalValue("window", mockWindow, async () =>
    copyTextToClipboard("hello")
  );
  assert.equal(result, true);
  assert.deepEqual(writes, ["hello"]);
});

test("clipboard helper falls back to execCommand path when clipboard API fails", async () => {
  const appendedNodes: unknown[] = [];
  let removed = false;
  let focused = false;
  let selected = false;
  const mockTextArea = {
    value: "",
    style: {} as Record<string, string>,
    setAttribute: () => undefined,
    focus: () => {
      focused = true;
    },
    select: () => {
      selected = true;
    },
    parentNode: {
      removeChild: () => {
        removed = true;
      },
    },
  };
  const mockDocument = {
    body: {
      appendChild: (node: unknown) => {
        appendedNodes.push(node);
      },
    },
    createElement: (tag: string) => {
      assert.equal(tag, "textarea");
      return mockTextArea;
    },
    execCommand: (command: string) => {
      assert.equal(command, "copy");
      return true;
    },
  };
  const mockWindow = {
    navigator: {
      clipboard: {
        writeText: async () => {
          throw new Error("not-allowed");
        },
      },
    },
  };

  const result = await withGlobalValue("window", mockWindow, async () =>
    withGlobalValue("document", mockDocument, async () => copyTextToClipboard("copy me"))
  );

  assert.equal(result, true);
  assert.equal(appendedNodes.length, 1);
  assert.equal(mockTextArea.value, "copy me");
  assert.equal(focused, true);
  assert.equal(selected, true);
  assert.equal(removed, true);
});

test("clipboard helper returns false when no browser APIs available", async () => {
  const result = await withGlobalValue("window", { navigator: {} }, async () =>
    withGlobalValue("document", undefined, async () => copyTextToClipboard("nope"))
  );
  assert.equal(result, false);
});

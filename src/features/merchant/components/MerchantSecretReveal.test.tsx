import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useState } from "react";
import { it, expect, vi } from "vitest";
import { MerchantSecretReveal } from "./MerchantSecretReveal";
it("copies only on request and clears reveal on dismissal without storage", async () => {
  const storage = vi.spyOn(Storage.prototype, "setItem");
  const copy = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: copy },
  });
  function Harness() {
    const [secret, setSecret] = useState<string | null>("test-only-secret");
    return (
      secret && (
        <MerchantSecretReveal secret={secret} onClose={() => setSecret(null)} />
      )
    );
  }
  render(<Harness />);
  expect(copy).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Copy API key" }));
  await waitFor(() => expect(copy).toHaveBeenCalledWith("test-only-secret"));
  fireEvent.click(screen.getByRole("button", { name: "I have saved my key" }));
  expect(
    screen.queryByDisplayValue("test-only-secret"),
  ).not.toBeInTheDocument();
  expect(storage).not.toHaveBeenCalled();
  storage.mockRestore();
});

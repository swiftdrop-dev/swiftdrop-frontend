import { useState } from "react";
import { MerchantDialog } from "./MerchantDialog";
export function MerchantSecretReveal({
  secret,
  onClose,
}: {
  secret: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
    } catch {
      setFailed(true);
    }
  }
  return (
    <MerchantDialog title="Save your API key now" onClose={onClose}>
      <p>
        This key is shown once. Store it securely for your server integration.
        It will not be available after closing.
      </p>
      <label className="merchant-field">
        One-time API key
        <input
          className="form-input merchant-secret"
          readOnly
          value={secret}
          spellCheck={false}
          autoComplete="off"
        />
      </label>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => void copy()}
      >
        Copy API key
      </button>
      <p role="status">
        {copied
          ? "Copied. Your clipboard now contains a secret; clear it after saving."
          : failed
            ? "Clipboard access failed. Select and copy the key manually."
            : ""}
      </p>
      <button type="button" className="btn btn-secondary" onClick={onClose}>
        I have saved my key
      </button>
    </MerchantDialog>
  );
}

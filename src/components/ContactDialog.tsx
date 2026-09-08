import { useState, type FormEvent } from "react";
import { CheckCircle2, Mail, Phone, X } from "lucide-react";
import { uiCopy } from "../data/uiCopy";
import type { Language } from "../types";
export function ContactDialog({
  language,
  open,
  onClose,
}: {
  language: Language;
  open: boolean;
  onClose: () => void;
}) {
  const [done, setDone] = useState(false);
  if (!open) return null;
  const u = uiCopy[language];
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setDone(true);
  };
  const close = () => {
    onClose();
    setTimeout(() => setDone(false), 200);
  };
  return (
    <div
      className="dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <section
        className="contact-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-title"
      >
        <button className="dialog-close" onClick={close} aria-label={u.close}>
          <X />
        </button>
        <div className="dialog-scroll">
          {done ? (
            <div className="contact-done">
              <CheckCircle2 />
              <h2>{u.messageReceived}</h2>
              <p>{u.messageText}</p>
              <button className="button primary" onClick={close}>
                {u.done}
              </button>
            </div>
          ) : (
            <>
              <p className="eyebrow">{u.helpLabel}</p>
              <h2 id="contact-title">{u.contactTitle}</h2>
              <div className="contact-links">
                <a href="tel:+995555000000">
                  <Phone /> +995 555 00 00 00
                </a>
                <a href="mailto:hello@primelabs.ge">
                  <Mail /> hello@primelabs.ge
                </a>
              </div>
              <form onSubmit={submit}>
                <label>
                  {u.fullName}
                  <input required autoComplete="name" />
                </label>
                <label>
                  {u.phone}
                  <input
                    required
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </label>
                <label>
                  {u.howHelp}
                  <textarea required rows={4} />
                </label>
                <button className="button primary" type="submit">
                  {u.send}
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

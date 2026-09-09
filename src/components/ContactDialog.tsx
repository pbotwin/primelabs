import { useState, type FormEvent } from "react";
import { CheckCircle2, Clock3, Mail, MapPin, Phone, X } from "lucide-react";
import { STORE } from "../config/store";
import { uiCopy } from "../data/uiCopy";
import { useModalDialog } from "../hooks/useModalDialog";
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
  const dialogRef = useModalDialog(open, onClose);
  if (!open) return null;
  const u = uiCopy[language];
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const message = [
      "PrimeLabs contact request",
      `Name: ${data.get("name")}`,
      `Phone: ${data.get("phone")}`,
      `Message: ${data.get("message")}`,
    ].join("\n");
    window.open(
      `https://wa.me/${STORE.whatsappNumber}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
    setDone(true);
  };
  const close = () => {
    onClose();
    setDone(false);
  };
  return (
    <div
      className="dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <section
        ref={dialogRef}
        className="contact-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-title"
        tabIndex={-1}
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
                <a href={STORE.phoneHref}>
                  <Phone /> {STORE.phoneDisplay}
                </a>
                <a href={`mailto:${STORE.email}`}>
                  <Mail /> {STORE.email}
                </a>
                <a href={STORE.mapUrl} target="_blank" rel="noreferrer">
                  <MapPin />
                  {language === "ka"
                    ? "თბილისი, მერაბ კოსტავას ქუჩა 72"
                    : "72 Merab Kostava Street, Tbilisi"}
                </a>
                <div className="contact-hours">
                  <Clock3 />
                  <span>
                    <b>
                      {language === "ka" ? "სამუშაო საათები" : "Working hours"}
                    </b>
                    {language === "ka"
                      ? "ყოველდღე, 11:00–20:45"
                      : "Daily, 11:00–20:45"}
                  </span>
                </div>
              </div>
              <form onSubmit={submit}>
                <label>
                  {u.fullName}
                  <input name="name" required autoComplete="name" />
                </label>
                <label>
                  {u.phone}
                  <input
                    required
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </label>
                <label>
                  {u.howHelp}
                  <textarea name="message" required rows={4} />
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

import { useState, type FormEvent } from "react";
import { CheckCircle2, Mail, X } from "lucide-react";
import { STORE } from "../config/store";
import type { Language } from "../types";
import { useModalDialog } from "../hooks/useModalDialog";

const content = {
  ka: {
    label: "PRIMELABS სიახლეები",
    title: "მიიღე შეთავაზებები პირველმა",
    text: "გამოიწერე ახალი პროდუქტების, ფასდაკლებებისა და სპეციალური შეთავაზებების შესახებ ინფორმაცია.",
    email: "ელ. ფოსტის მისამართი",
    placeholder: "name@example.com",
    submit: "გამოწერის მოთხოვნა",
    consent:
      "გამოწერით ეთანხმები PrimeLabs-ის სიახლეების მიღებას. გამოწერის გაუქმება ნებისმიერ დროს შეგიძლია.",
    success: "მოთხოვნა მომზადებულია",
    successText: "გამოწერის დასასრულებლად გააგზავნე გახსნილი ელფოსტა.",
    done: "დასრულება",
    close: "დახურვა",
  },
  en: {
    label: "PRIMELABS NEWS",
    title: "Get offers before everyone else",
    text: "Subscribe for new products, price drops, and limited PrimeLabs offers.",
    email: "Email address",
    placeholder: "name@example.com",
    submit: "Request subscription",
    consent:
      "By subscribing, you agree to receive PrimeLabs news. You can unsubscribe at any time.",
    success: "Your request is ready",
    successText: "Send the opened email to complete your subscription.",
    done: "Done",
    close: "Close",
  },
};

export function NewsletterDialog({
  language,
  open,
  onClose,
}: {
  language: Language;
  open: boolean;
  onClose: () => void;
}) {
  const [subscribed, setSubscribed] = useState(false);
  const dialogRef = useModalDialog(open, onClose);
  if (!open) return null;
  const text = content[language];
  const close = () => {
    onClose();
    setSubscribed(false);
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "");
    const subject = encodeURIComponent("PrimeLabs newsletter subscription");
    const body = encodeURIComponent(
      `Please subscribe ${email} to PrimeLabs news.`,
    );
    window.open(
      `mailto:${STORE.email}?subject=${subject}&body=${body}`,
      "_blank",
      "noopener,noreferrer",
    );
    setSubscribed(true);
  };
  return (
    <div
      className="dialog-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && close()}
    >
      <section
        ref={dialogRef}
        className="newsletter-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="newsletter-title"
        tabIndex={-1}
      >
        <button
          className="dialog-close"
          onClick={close}
          aria-label={text.close}
        >
          <X />
        </button>
        {subscribed ? (
          <div className="newsletter-success">
            <CheckCircle2 />
            <h2>{text.success}</h2>
            <p>{text.successText}</p>
            <button className="button primary" onClick={close}>
              {text.done}
            </button>
          </div>
        ) : (
          <div className="newsletter-content">
            <img className="newsletter-logo" src="./logo.svg" alt="PrimeLabs" />
            <span className="newsletter-icon">
              <Mail />
            </span>
            <p className="eyebrow">{text.label}</p>
            <h2 id="newsletter-title">{text.title}</h2>
            <p>{text.text}</p>
            <form onSubmit={submit}>
              <label htmlFor="newsletter-email">{text.email}</label>
              <div>
                <input
                  id="newsletter-email"
                  name="email"
                  required
                  type="email"
                  autoComplete="email"
                  placeholder={text.placeholder}
                />
                <button className="button primary" type="submit">
                  {text.submit}
                </button>
              </div>
            </form>
            <small>{text.consent}</small>
          </div>
        )}
      </section>
    </div>
  );
}

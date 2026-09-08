import { useState, type FormEvent } from "react";
import { CheckCircle2, Mail, X } from "lucide-react";
import type { Language } from "../types";

const content = {
  ka: {
    label: "PRIMELABS სიახლეები",
    title: "მიიღე შეთავაზებები პირველმა",
    text: "გამოიწერე ახალი პროდუქტების, ფასდაკლებებისა და სპეციალური შეთავაზებების შესახებ ინფორმაცია.",
    email: "ელ. ფოსტის მისამართი",
    placeholder: "name@example.com",
    submit: "გამოწერა",
    consent:
      "გამოწერით ეთანხმები PrimeLabs-ის სიახლეების მიღებას. გამოწერის გაუქმება ნებისმიერ დროს შეგიძლია.",
    success: "გამოწერა დასრულებულია",
    successText: "შემდეგ შეთავაზებას პირდაპირ ელ. ფოსტაზე მიიღებ.",
    done: "დასრულება",
    close: "დახურვა",
  },
  en: {
    label: "PRIMELABS NEWS",
    title: "Get offers before everyone else",
    text: "Subscribe for new products, price drops, and limited PrimeLabs offers.",
    email: "Email address",
    placeholder: "name@example.com",
    submit: "Subscribe",
    consent:
      "By subscribing, you agree to receive PrimeLabs news. You can unsubscribe at any time.",
    success: "You are subscribed",
    successText: "The next offer will arrive directly in your inbox.",
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
  if (!open) return null;
  const text = content[language];
  const close = () => {
    onClose();
    setTimeout(() => setSubscribed(false), 200);
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSubscribed(true);
  };
  return (
    <div
      className="dialog-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && close()}
    >
      <section
        className="newsletter-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="newsletter-title"
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

/*
  Default legal copy for the public /legal/[slug] pages. These render when there
  is no admin-authored Policy row for the matching key, so the pages are never
  empty. Once staff edit the document under Admin → Settings → Legal, that
  version takes over. `key` maps a URL slug to the Policy.key used in admin.

  NOTE: this is solid, product-specific boilerplate written to be launch-ready,
  but it is a template — have it reviewed by a lawyer before going live.
*/

export type LegalSection = { heading: string; body: string[] };
export type LegalDoc = {
  slug: string;
  key: string; // Policy.key in the admin
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
};

const OPERATOR = "Break It Thru";
const OPERATOR_NAME = "Yash Goyal";
const LOCATION = "Gurgaon, Haryana, India";
// Interim address until the breakitthru.com mailbox is live (then switch to
// support@breakitthru.com / privacy@breakitthru.com).
const SUPPORT = "breakitthru@gmail.com";
const GRIEVANCE = "breakitthru@gmail.com";

export const LEGAL_DOCS: Record<string, LegalDoc> = {
  terms: {
    slug: "terms",
    key: "terms",
    title: "Terms of Use",
    updated: "2026",
    intro: `These terms govern your use of ${OPERATOR} (the "Service"), a self-guided 60-day programme for getting through a breakup. By creating an account or using the Service, you agree to these terms.`,
    sections: [
      {
        heading: "1. What Break It Thru is — and is not",
        body: [
          "Break It Thru is a structured, clinician-authored self-help programme. It offers daily tasks, reflections, and educational content designed to support emotional recovery after a relationship ends.",
          "It is not therapy, counselling, medical care, or a crisis service, and it does not create a doctor-patient or therapist-client relationship. It is not a substitute for professional help. If you are struggling with your mental health, please consult a qualified professional.",
        ],
      },
      {
        heading: "2. Emergencies",
        body: [
          "The Service is not built for emergencies. If you are in crisis or thinking about harming yourself, contact your local emergency number or one of the helplines listed in the app immediately. The SOS feature offers grounding tools and helpline numbers but cannot provide emergency intervention.",
        ],
      },
      {
        heading: "3. Eligibility and accounts",
        body: [
          "You must be at least 18 years old to use the Service. You are responsible for keeping your login details secure and for all activity under your account. Tell us promptly if you believe your account has been compromised.",
        ],
      },
      {
        heading: "4. Free trial and payment",
        body: [
          "The first four days of the programme are free and do not require a card. To continue past the free trial, you make a one-time payment for full access to the 60-day programme.",
          "Payments are processed by a third-party payment gateway. We do not store your full card details. Prices are shown in Indian Rupees and include applicable taxes unless stated otherwise.",
        ],
      },
      {
        heading: "5. Points and rewards",
        body: [
          "You may earn points for completing tasks and reflections. Points have no cash value, cannot be transferred or withdrawn, and may be changed or discontinued. Any rewards are subject to availability and to the terms shown at the time of redemption.",
        ],
      },
      {
        heading: "6. Acceptable use",
        body: [
          "You agree not to misuse the Service, including by attempting to access other members' data, disrupting the Service, reverse-engineering it, or using it for any unlawful purpose.",
        ],
      },
      {
        heading: "7. Your content",
        body: [
          "Reflections and notes you write remain yours. We treat them as private and do not sell them or use them for advertising. See our Privacy Policy for how your data is handled.",
        ],
      },
      {
        heading: "8. Intellectual property",
        body: [
          "The programme content, design, and software are owned by the operator and protected by law. You get a personal, non-transferable licence to use them for your own recovery. You may not copy, redistribute, or resell the content.",
        ],
      },
      {
        heading: "9. Disclaimers and liability",
        body: [
          "The Service is provided on an \"as is\" basis. We do not guarantee any particular outcome. To the fullest extent permitted by law, the operator is not liable for indirect or consequential losses, and our total liability is limited to the amount you paid for the Service.",
        ],
      },
      {
        heading: "10. Termination",
        body: [
          "You may stop using the Service and request deletion of your account at any time. We may suspend or end access if these terms are breached.",
        ],
      },
      {
        heading: "11. Changes and governing law",
        body: [
          "We may update these terms; material changes will be notified in the app. These terms are governed by the laws of India, and the courts of Haryana have exclusive jurisdiction.",
        ],
      },
      {
        heading: "12. Contact",
        body: [`Questions about these terms? Write to ${SUPPORT}. Operated by ${OPERATOR_NAME} from ${LOCATION}.`],
      },
    ],
  },

  privacy: {
    slug: "privacy",
    key: "privacy",
    title: "Privacy Policy",
    updated: "2026",
    intro: `This policy explains what ${OPERATOR} collects, why, and the choices you have. We follow India's Digital Personal Data Protection Act, 2023 (DPDP).`,
    sections: [
      {
        heading: "1. Who we are",
        body: [`${OPERATOR}, operated by ${OPERATOR_NAME} from ${LOCATION}, is the data fiduciary responsible for your personal data under this policy.`],
      },
      {
        heading: "2. What we collect",
        body: [
          "Account details: your name or display name, email, and password (stored only as a secure hash).",
          "Programme data: your onboarding answers, daily task progress, reflections, and mood check-ins.",
          "Usage data: basic technical information such as device and app interactions, used to keep the Service working.",
          "Payment data: handled by our payment gateway. We receive a record that a payment succeeded or failed, not your full card number.",
        ],
      },
      {
        heading: "3. How we use your data",
        body: [
          "To provide and personalise the programme, track your progress and streak, run points and rewards, keep the Service secure, and respond to support requests.",
          "We do not sell your personal data, and we do not use your private reflections for advertising or to train advertising models.",
        ],
      },
      {
        heading: "4. Your reflections are private",
        body: [
          "Your reflections, notes, and chat content are treated as sensitive. Staff administering the Service can see whether you have written entries and your progress, but do not read the contents of your reflections in the normal course of running the Service.",
        ],
      },
      {
        heading: "5. Legal basis and consent",
        body: [
          "We process your data based on the consent you give when you sign up and use the Service, and to perform our agreement with you. You can withdraw consent by deleting your account, which stops further processing.",
        ],
      },
      {
        heading: "6. Sharing",
        body: [
          "We share data only with service providers that help us run the Service — such as cloud hosting, our database provider, and the payment gateway — under agreements that require them to protect it. We may disclose data if required by law.",
        ],
      },
      {
        heading: "7. Cookies",
        body: [
          "We use essential cookies to keep you signed in. Optional analytics cookies are off by default and are only set if you opt in via Cookie Preferences.",
        ],
      },
      {
        heading: "8. Retention",
        body: [
          "We keep your data while your account is active. When you delete your account, we anonymise or erase your personal data and reflections. We may retain limited records, such as payment and tax records, where the law requires it.",
        ],
      },
      {
        heading: "9. Your rights",
        body: [
          "Under the DPDP Act you can ask to access, correct, or erase your personal data, and to withdraw consent. You can delete your account and data from within the app, or contact us to exercise these rights.",
        ],
      },
      {
        heading: "10. Security",
        body: [
          "We use reasonable technical and organisational measures to protect your data, including encryption in transit and hashed passwords. No system is perfectly secure, but we work to keep your data safe.",
        ],
      },
      {
        heading: "11. Children",
        body: ["The Service is for adults (18+) and is not directed at children."],
      },
      {
        heading: "12. Grievances and contact",
        body: [
          `For privacy questions or to exercise your rights, contact our Grievance Officer at ${GRIEVANCE}. For general help, write to ${SUPPORT}.`,
        ],
      },
    ],
  },

  refund: {
    slug: "refund",
    key: "refunds",
    title: "Refund Policy",
    updated: "2026",
    intro: `This policy explains refunds for the one-time purchase of ${OPERATOR}.`,
    sections: [
      {
        heading: "1. Try before you pay",
        body: [
          "The first four days of the programme are completely free and do not require a card. This lets you experience the programme before deciding to buy, which is the best way to know if it is right for you.",
        ],
      },
      {
        heading: "2. One-time purchase",
        body: [
          "Access to the full 60-day programme is a single one-time payment. There is no recurring subscription and nothing to cancel.",
        ],
      },
      {
        heading: "3. Refund window",
        body: [
          "If you are not satisfied, you may request a refund within 7 days of your purchase, provided you have not completed a substantial portion of the programme. We review each request fairly and in good faith.",
        ],
      },
      {
        heading: "4. How to request a refund",
        body: [
          `Email ${SUPPORT} from the address on your account with your order details and a short note. We aim to respond within 3 business days.`,
        ],
      },
      {
        heading: "5. Processing",
        body: [
          "Approved refunds are returned to your original payment method through our payment gateway. Depending on your bank, it may take 5 to 10 business days for the amount to appear.",
        ],
      },
      {
        heading: "6. Contact",
        body: [`Questions about refunds? Write to ${SUPPORT}.`],
      },
    ],
  },
};

export const SUPPORT_EMAIL = SUPPORT;

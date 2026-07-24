export interface MockScenario {
  keywords: string[];
  label: string;
  sampleMessage: string;
  toolName: string;
  input: Record<string, unknown>;
}

export const mockScenarios: MockScenario[] = [
  {
    keywords: ["form", "identity", "verify", "passport", "ยืนยันตัวตน"],
    label: "Verify my identity",
    sampleMessage: "I need to verify my identity",
    toolName: "request_form",
    input: {
      purpose: "Required to proceed with your Anmeldung filing",
      fields: [
        { name: "full_name", label: "Full legal name", type: "string", required: true },
        {
          name: "passport_number",
          label: "Passport number",
          type: "string",
          required: true,
          placeholder: "e.g. C01X00T47",
          validation: { pattern: "[A-Z0-9]{6,9}", minLength: 6, maxLength: 9 },
        },
        { name: "dob", label: "Date of birth", type: "date", required: true, validation: { max: "2010-01-01" } },
        { name: "passport_scan", label: "Passport photo page", type: "file", required: true },
      ],
    },
  },
  {
    keywords: ["support", "contact support", "help request"],
    label: "Contact support",
    sampleMessage: "I need to contact support",
    toolName: "request_form",
    input: {
      purpose: "So our support team can follow up with you",
      fields: [
        { name: "full_name", label: "Your name", type: "string", required: true, placeholder: "Jane Doe" },
        {
          name: "email",
          label: "Email address",
          type: "email",
          required: true,
          placeholder: "you@example.com",
          validation: { pattern: "[^@\\s]+@[^@\\s]+\\.[^@\\s]+" },
        },
        {
          name: "category",
          label: "Category",
          type: "select",
          required: true,
          options: ["Billing", "Technical", "Account", "Other"],
        },
        {
          name: "priority",
          label: "Priority (1-5)",
          type: "number",
          required: true,
          validation: { min: 1, max: 5 },
        },
        {
          name: "message",
          label: "Describe your issue",
          type: "textarea",
          required: true,
          placeholder: "What's going on?",
          validation: { minLength: 10, maxLength: 500 },
        },
        { name: "subscribe", label: "Send me product updates", type: "checkbox", required: false },
      ],
    },
  },
  {
    keywords: ["dashboard", "metrics", "chart", "แดชบอร์ด"],
    label: "Show a dashboard",
    sampleMessage: "Show me a dashboard",
    toolName: "request_dashboard",
    input: {
      title: "Relocation Applications - Last 30 Days",
      widgets: [
        { kind: "stat_card", title: "Total Applications", data: [{ value: 128 }] },
        {
          kind: "line_chart",
          title: "Applications per Week",
          data: [{ week: "W1", count: 20 }, { week: "W2", count: 34 }, { week: "W3", count: 41 }, { week: "W4", count: 33 }],
        },
        {
          kind: "bar_chart",
          title: "By Visa Type",
          data: [{ type: "Work", count: 61 }, { type: "Student", count: 40 }, { type: "Family", count: 27 }],
        },
      ],
    },
  },
  {
    keywords: ["clarifying", "clarify"],
    label: "Ask me a question",
    sampleMessage: "Ask me a clarifying question",
    toolName: "ask_question",
    input: {
      question: "Would you like a one-time or a multi-entry visa?",
      question_type: "buttons",
      options: [
        { label: "One-time", value: "one_time" },
        { label: "Multi-entry", value: "multi_entry" },
      ],
      allow_free_text: true,
    },
  },
  {
    keywords: ["longer preference", "radio"],
    label: "Ask a longer question",
    sampleMessage: "Ask me a longer preference question",
    toolName: "ask_question",
    input: {
      question: "Which appointment reminder would you prefer?",
      question_type: "radio",
      options: [
        { label: "Email me 3 days before my Anmeldung appointment", value: "email_3d" },
        { label: "Text me the morning of my Anmeldung appointment", value: "sms_morning" },
        { label: "Don't send me any reminders — I'll check the portal myself", value: "none" },
      ],
      allow_free_text: true,
    },
  },
  {
    keywords: ["pick multiple", "checkboxes"],
    label: "Ask a multi-select question",
    sampleMessage: "Ask me a question where I can pick multiple answers",
    toolName: "ask_question",
    input: {
      question: "Which documents have you already prepared?",
      question_type: "checkboxes",
      options: [
        { label: "Passport", value: "passport" },
        { label: "Proof of address", value: "address_proof" },
        { label: "Rental contract", value: "rental_contract" },
        { label: "Health insurance confirmation", value: "health_insurance" },
      ],
      allow_free_text: true,
    },
  },
  {
    keywords: ["table", "list", "slots"],
    label: "Show a table",
    sampleMessage: "Show me a table of appointment slots",
    toolName: "request_table",
    input: {
      title: "Available Anmeldung Appointment Slots",
      columns: [
        { key: "date", label: "Date" },
        { key: "time", label: "Time" },
        { key: "office", label: "Office" },
      ],
      rows: [
        { date: "2026-08-03", time: "09:00", office: "Mitte" },
        { date: "2026-08-04", time: "11:30", office: "Kreuzberg" },
        { date: "2026-08-05", time: "14:00", office: "Mitte" },
      ],
    },
  },
];

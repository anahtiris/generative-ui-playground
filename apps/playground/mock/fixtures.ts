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
      form_type: "identity_verification",
      purpose: "Required to proceed with your Anmeldung filing",
      fields: [
        { name: "full_name", label: "Full legal name", type: "string", required: true },
        { name: "passport_number", label: "Passport number", type: "string", required: true },
        { name: "dob", label: "Date of birth", type: "date", required: true },
        { name: "passport_scan", label: "Passport photo page", type: "file", required: true },
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
    keywords: ["blackboard", "diagram", "teach", "explain", "how does", "สอน", "อธิบาย"],
    label: "Explain a process",
    sampleMessage: "Explain how this works",
    toolName: "request_diagram",
    input: {
      title: "How the Anmeldung Process Works",
      diagram_type: "flow",
      nodes: [
        { id: "a", label: "Arrive in Germany" },
        { id: "b", label: "Find registered address" },
        { id: "c", label: "Book Anmeldung appointment" },
        { id: "d", label: "Receive Meldebescheinigung" },
      ],
      edges: [
        { from: "a", to: "b" },
        { from: "b", to: "c" },
        { from: "c", to: "d", label: "within 14 days" },
      ],
    },
  },
  {
    keywords: ["question", "ask me", "clarify"],
    label: "Ask me a question",
    sampleMessage: "Ask me a clarifying question",
    toolName: "ask_question",
    input: {
      question: "Would you like a one-time or a multi-entry visa?",
      question_type: "multiple_choice",
      options: [
        { label: "One-time", value: "one_time" },
        { label: "Multi-entry", value: "multi_entry" },
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

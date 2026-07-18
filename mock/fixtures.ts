export interface MockScenario {
  keywords: string[];
  toolName: string;
  input: Record<string, unknown>;
}

export const mockScenarios: MockScenario[] = [
  {
    keywords: ["form", "identity", "verify", "passport", "ยืนยันตัวตน"],
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
    toolName: "request_dashboard",
    input: {
      title: "Relocation Applications — Last 30 Days",
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
];

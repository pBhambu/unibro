export type College = {
  id: string;
  name: string;
  city?: string;
  state?: string;
  category?: "Reach" | "Target" | "Safety";
  percent?: number;
  website?: string;
};

export type CollegeQuestion = {
  id: string;
  label: string;
  type: "text" | "textarea";
  required?: boolean;
};

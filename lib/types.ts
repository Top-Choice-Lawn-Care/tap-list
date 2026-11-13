export type TapEntry = { date: string; note: string };
export type TapData = { [submissionName: string]: TapEntry[] };

export type Difficulty = "white" | "blue" | "purple" | "brown" | "black";

export type Submission = {
  name: string;
  category: string;
  difficulty: Difficulty;
};

export type Tab = "taplist" | "gameplan" | "timer";

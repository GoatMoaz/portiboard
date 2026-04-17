export type UsesItem = {
  id: string;
  name: string;
  reason: string;
  iconPath: string;
};

export const usesItems: UsesItem[] = [
  {
    id: "typescript",
    name: "TypeScript",
    reason: "Safer refactors and clearer contracts across server and client boundaries.",
    iconPath: "typescript/typescript-original.svg",
  },
  {
    id: "nextjs",
    name: "Next.js",
    reason:
      "App Router, streaming, and server components let me ship full-stack quickly.",
    iconPath: "nextjs/nextjs-original.svg",
  },
  {
    id: "react",
    name: "React",
    reason: "Composable UI architecture with excellent ecosystem depth.",
    iconPath: "react/react-original.svg",
  },
  {
    id: "tailwind",
    name: "Tailwind CSS",
    reason: "Design systems stay consistent while I iterate on ideas quickly.",
    iconPath: "tailwindcss/tailwindcss-original.svg",
  },
  {
    id: "node",
    name: "Node.js",
    reason: "Unified JavaScript stack for APIs, tooling, and build automation.",
    iconPath: "nodejs/nodejs-original.svg",
  },
  {
    id: "docker",
    name: "Docker",
    reason: "Reproducible environments and painless deployment parity.",
    iconPath: "docker/docker-original.svg",
  },
  {
    id: "mongodb",
    name: "MongoDB",
    reason: "Flexible document-based storage for dynamic data models.",
    iconPath: "mongodb/mongodb-original.svg",
  },
  {
    id: "redux",
    name: "Redux",
    reason: "Predictable state management for complex applications.",
    iconPath: "redux/redux-original.svg",
  },
];

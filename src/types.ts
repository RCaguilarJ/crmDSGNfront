export interface SavedProject {
  id: string;
  name: string;
  description: string;
  figmaNode?: string;
  tailwindClasses?: string;
  componentCode?: string;
  createdAt: string;
}

export interface User {
  username: string;
  projectsCount: number;
  role?: string;
}

export interface FigmaNodeInfo {
  id: string;
  name: string;
  type: string;
  color?: string;
  spacing?: string;
  borderRadius?: string;
  shadow?: string;
  fontSize?: string;
}

export interface PlaygroundConfig {
  paddingX: string;
  paddingY: string;
  bgColor: string;
  textColor: string;
  borderRadius: string;
  shadow: string;
  borderWidth: string;
  borderColor: string;
  hasIcon: boolean;
  isAnimated: boolean;
  fontSize: string;
}

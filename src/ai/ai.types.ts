export type AiLandmarkPoint = {
  x: number;
  y: number;
  z?: number;
  index?: number;
};

export type AiAnalyzeFaceRequest = {
  requestId?: string;
  landmarks: {
    points: AiLandmarkPoint[];
    meta?: {
      source?: string;
      version?: string;
      imageWidth?: number;
      imageHeight?: number;
    };
  };
};

export type AiRecommendationItem = {
  key?: string;
  title: string;
  description?: string;
  score?: number;
};

export type AiAnalyzeFaceResponse = {
  faceShape: string;
  recommendations: {
    category: string;
    items: AiRecommendationItem[];
  };
};

import { FaceShape } from '../common/enums';

/** Landmarks payload sent to FastAPI (API.md §4.2). */
export type AiLandmarkPoint = {
  x: number;
  y: number;
  z?: number;
  index?: number;
};

export type AiFaceScanMeta = {
  source?: string;
  version?: string;
};

export type AiLandmarksPayload = {
  points: AiLandmarkPoint[];
  meta?: AiFaceScanMeta;
};

export type AiAnalyzeFaceRequest = {
  requestId?: string;
  landmarks: AiLandmarksPayload;
};

export type AiRecommendationItem = {
  key?: string;
  title: string;
  description?: string;
  score?: number;
  metadata?: Record<string, unknown>;
};

export type AiAnalyzeFaceSuccess = {
  faceShape: FaceShape;
  recommendations: {
    category: string;
    items: AiRecommendationItem[];
  };
};

export type AiErrorBody = {
  error?: {
    code?: string;
    message?: string;
  };
};

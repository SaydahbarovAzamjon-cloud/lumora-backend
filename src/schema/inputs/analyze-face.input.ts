import { Field, Float, InputType, Int } from '@nestjs/graphql';

/**
 * One MediaPipe landmark point (API.md §3.5 / §4.2).
 * Exact field contract remains OPEN-004 — keep aligned with frontend/AI.
 */
@InputType({ description: 'Single normalized MediaPipe landmark point.' })
export class LandmarkPointInput {
  @Field(() => Float)
  x!: number;

  @Field(() => Float)
  y!: number;

  @Field(() => Float, { nullable: true })
  z?: number;

  @Field(() => Int, { nullable: true })
  index?: number;
}

@InputType({ description: 'Optional scan metadata from the client.' })
export class FaceScanMetaInput {
  @Field(() => String, { nullable: true })
  source?: string;

  @Field(() => String, { nullable: true })
  version?: string;
}

@InputType({ description: 'Landmarks-only analyze payload (ADR-011).' })
export class FaceLandmarkInput {
  @Field(() => [LandmarkPointInput])
  points!: LandmarkPointInput[];

  @Field(() => FaceScanMetaInput, { nullable: true })
  meta?: FaceScanMetaInput;
}

@InputType({ description: 'Input for analyzeFace mutation.' })
export class AnalyzeFaceInput {
  @Field(() => FaceLandmarkInput)
  landmarks!: FaceLandmarkInput;
}

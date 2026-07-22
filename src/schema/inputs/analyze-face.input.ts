import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { MAX_LANDMARK_POINTS } from '../../face-analyses/analyze-face.errors';

/**
 * One MediaPipe landmark point (API.md §3.5 / §4.2).
 * Exact field contract remains OPEN-004 — keep aligned with frontend/AI.
 */
@InputType({ description: 'Single normalized MediaPipe landmark point.' })
export class LandmarkPointInput {
  @Field(() => Float)
  @IsNumber()
  x!: number;

  @Field(() => Float)
  @IsNumber()
  y!: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  z?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10_000)
  index?: number;
}

@InputType({ description: 'Optional scan metadata from the client.' })
export class FaceScanMetaInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  source?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  version?: string;
}

@InputType({ description: 'Landmarks-only analyze payload (ADR-011).' })
export class FaceLandmarkInput {
  @Field(() => [LandmarkPointInput])
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_LANDMARK_POINTS)
  @ValidateNested({ each: true })
  @Type(() => LandmarkPointInput)
  points!: LandmarkPointInput[];

  @Field(() => FaceScanMetaInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => FaceScanMetaInput)
  meta?: FaceScanMetaInput;
}

@InputType({ description: 'Input for analyzeFace mutation.' })
export class AnalyzeFaceInput {
  @Field(() => FaceLandmarkInput)
  @ValidateNested()
  @Type(() => FaceLandmarkInput)
  landmarks!: FaceLandmarkInput;
}

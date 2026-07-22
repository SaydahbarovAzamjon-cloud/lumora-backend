import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

@InputType()
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
  @IsInt()
  @Min(0)
  index?: number;
}

@InputType()
export class FaceScanMetaInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  source?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  version?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  imageWidth?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  imageHeight?: number;
}

@InputType()
export class FaceLandmarkInput {
  @Field(() => [LandmarkPointInput])
  @IsArray()
  @ArrayMinSize(3)
  @ValidateNested({ each: true })
  @Type(() => LandmarkPointInput)
  points!: LandmarkPointInput[];

  @Field(() => FaceScanMetaInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => FaceScanMetaInput)
  meta?: FaceScanMetaInput;
}

@InputType()
export class AnalyzeFaceInput {
  @Field(() => FaceLandmarkInput)
  @ValidateNested()
  @Type(() => FaceLandmarkInput)
  landmarks!: FaceLandmarkInput;
}

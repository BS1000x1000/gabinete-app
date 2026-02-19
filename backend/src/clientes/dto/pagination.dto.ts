import { IsOptional, IsInt, Min, Max } from "class-validator";
import { async } from "rxjs";
import { clienteInclude } from "../clientes.types";

// src/clientes/dto/pagination.dto.ts
export class PaginationDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
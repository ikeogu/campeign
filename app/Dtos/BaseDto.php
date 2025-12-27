<?php

namespace App\Dtos;

/** @phpstan-consistent-constructor */
readonly class BaseDto
{
  // @phpstan-ignore-next-line
  public function __construct(...$args) {}

  /**
   * Get the request array representation of the data
   */
  public static function fromArray(array $data)
  {
    return new static(...$data);
  }
}
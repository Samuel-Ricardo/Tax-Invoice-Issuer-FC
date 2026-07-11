export interface Specification<T> {
  isSatisfiedBy(cadidate: T): boolean;
  and(other: Specification<T>, cadidate: T): boolean;
  or(other: Specification<T>, cadidate: T): boolean;
  not(cadidate: T): boolean;
}

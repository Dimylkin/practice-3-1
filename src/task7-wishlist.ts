import type { Book } from './task1-types';
import type { BookCatalog } from './task6-classes';

/** Stores references to favourite books without owning catalog data. */
export class Wishlist {
  private favoriteIds: string[];

  constructor(favoriteIds: string[] = []) {
    this.favoriteIds = [...new Set(favoriteIds)];
  }

  toggle(id: string): void {
    this.favoriteIds = this.has(id)
      ? this.favoriteIds.filter((favoriteId) => favoriteId !== id)
      : [...this.favoriteIds, id];
  }

  has(id: string): boolean {
    return this.favoriteIds.includes(id);
  }

  getFavorites(catalog: BookCatalog): Book[] {
    return catalog.getBooks().filter((book) => this.has(book.id));
  }

  getFavoriteIds(): string[] {
    return [...this.favoriteIds];
  }

  get count(): number {
    return this.favoriteIds.length;
  }
}

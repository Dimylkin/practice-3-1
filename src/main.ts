import './styles.css';
import { Book } from './task1-types';
import { applyFilters, filterByAuthor, filterByMinYear } from './task3-filters';
import { createBookFromForm } from './task4-integration';
import { BookCatalog } from './task6-classes';
import { Wishlist } from './task7-wishlist';

const initialBooks: Book[] = [
  { id: '1', title: 'TypeScript Guide', authors: ['John Doe'], year: 2024 },
  { id: '2', title: 'JavaScript Basics', authors: ['Jane Smith'], year: 2022 },
];
const catalogStorageKey = 'catalog';
const catalogVersionStorageKey = 'catalog-version';
const catalogVersion = '1';
const wishlistStorageKey = 'wishlist';

let catalog = new BookCatalog('main', initialBooks);
let wishlist = new Wishlist();

type StoredCatalog = { id: string; books: Book[] };

function isStoredCatalog(value: unknown): value is StoredCatalog {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<StoredCatalog>;
  return typeof candidate.id === 'string' && Array.isArray(candidate.books);
}

function restoreCatalog(): void {
  const savedCatalog = localStorage.getItem(catalogStorageKey);
  if (!savedCatalog) return;

  try {
    const parsed: unknown = JSON.parse(savedCatalog);
    if (!isStoredCatalog(parsed)) return;

    // Empty catalogs from before this version have no marker and may be stale.
    // A current marker means an empty catalog was deliberately saved by this UI.
    if (parsed.books.length === 0 && localStorage.getItem(catalogVersionStorageKey) !== catalogVersion) return;

    catalog = new BookCatalog(parsed.id, parsed.books);
    localStorage.setItem(catalogVersionStorageKey, catalogVersion);
  } catch {
    // Invalid browser storage should not prevent the seed catalog from rendering.
  }
}

function restoreWishlist(): void {
  const savedWishlist = localStorage.getItem(wishlistStorageKey);
  if (!savedWishlist) return;

  try {
    const parsed: unknown = JSON.parse(savedWishlist);
    if (Array.isArray(parsed) && parsed.every((id) => typeof id === 'string')) wishlist = new Wishlist(parsed);
  } catch {
    // Invalid browser storage is equivalent to an empty wishlist.
  }
}

restoreCatalog();
restoreWishlist();

function saveCatalog(): void {
  localStorage.setItem(catalogStorageKey, JSON.stringify(catalog));
  localStorage.setItem(catalogVersionStorageKey, catalogVersion);
}

function saveWishlist(): void {
  localStorage.setItem(wishlistStorageKey, JSON.stringify(wishlist.getFavoriteIds()));
}

const bookList = document.querySelector('#bookList') as HTMLDivElement;
const form = document.querySelector('#bookForm') as HTMLFormElement;
const filterBtn = document.querySelector('#applyFilters') as HTMLButtonElement;
const authorInput = document.querySelector('#filterAuthor') as HTMLInputElement;
const yearInput = document.querySelector('#filterYear') as HTMLInputElement;
const errorMessage = document.querySelector('#errorMessage') as HTMLDivElement;
const searchInput = document.querySelector('#searchInput') as HTMLInputElement;
const sortBySelect = document.querySelector('#sortBy') as HTMLSelectElement;
const wishlistContainer = document.querySelector('#wishlistContainer') as HTMLDivElement;

function createBookCard(book: Book): HTMLDivElement {
  const card = document.createElement('div');
  card.className = 'book-card';

  const titleEl = document.createElement('h3');
  titleEl.textContent = `${book.title} — ${book.authors.join(', ')}${book.year ? `, ${book.year}` : ''}`;
  card.append(titleEl);

  if (book.rating !== undefined) {
    const ratingEl = document.createElement('p');
    ratingEl.textContent = `Рейтинг: ${book.rating}`;
    card.append(ratingEl);
  }

  const favoriteBtn = document.createElement('button');
  favoriteBtn.textContent = wishlist.has(book.id) ? '❤️ В избранном' : '🤍 В избранное';
  favoriteBtn.addEventListener('click', () => {
    wishlist.toggle(book.id);
    saveWishlist();
    renderBooks(catalog.getBooks());
    renderWishlist();
  });
  card.append(favoriteBtn);

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Удалить';
  deleteBtn.addEventListener('click', () => {
    catalog.removeBook(book.id);
    saveCatalog();
    renderBooks(catalog.getBooks());
    renderWishlist();
  });
  card.append(deleteBtn);

  return card;
}

function renderBooks(books: Book[]): void {
  bookList.innerHTML = '';
  if (books.length === 0) {
    bookList.textContent = 'Книги не найдены. Попробуйте изменить фильтры.';
    return;
  }

  books.forEach((book) => bookList.append(createBookCard(book)));
}

function renderWishlist(): void {
  wishlistContainer.innerHTML = '';
  const favoriteBooks = wishlist.getFavorites(catalog);
  if (favoriteBooks.length === 0) {
    wishlistContainer.textContent = 'Пока ничего не добавлено';
    return;
  }

  favoriteBooks.forEach((book) => wishlistContainer.append(createBookCard(book)));
}

renderBooks(catalog.getBooks());
renderWishlist();

form.addEventListener('submit', (event) => {
  event.preventDefault();
  errorMessage.textContent = '';
  try {
    const newBook = createBookFromForm(new FormData(form));
    catalog.addBook(newBook);
    saveCatalog();
    form.reset();
    renderBooks(catalog.getBooks());
    renderWishlist();
  } catch (error) {
    if (error instanceof Error) errorMessage.textContent = error.message;
  }
});

function refreshList(): void {
  const filters: ((book: Book) => boolean)[] = [];
  if (authorInput.value.trim()) filters.push(filterByAuthor(authorInput.value.trim()));
  if (yearInput.value) filters.push(filterByMinYear(parseInt(yearInput.value, 10)));

  const filteredBooks = applyFilters(catalog.getBooks(), filters);
  const searchedBooks = catalog.searchByTitle(searchInput.value.trim());
  const sortedBooks = catalog.sortBy(sortBySelect.value as 'year' | 'rating');
  renderBooks(sortedBooks.filter((book) => filteredBooks.includes(book) && searchedBooks.includes(book)));
}

filterBtn.addEventListener('click', refreshList);
searchInput.addEventListener('input', refreshList);
sortBySelect.addEventListener('change', refreshList);

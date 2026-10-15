import './styles.css';
import { Book } from './task1-types';
import { applyFilters, filterByAuthor, filterByMinYear } from './task3-filters';
import { createBookFromForm } from './task4-integration';
import { BookCatalog } from './task6-classes';

let catalog = new BookCatalog('main', [
  { id: '1', title: 'TypeScript Guide', authors: ['John Doe'], year: 2024 },
  { id: '2', title: 'JavaScript Basics', authors: ['Jane Smith'], year: 2022 },
]);


// восстановление из localStorage

const saved = localStorage.getItem('catalog');
if (saved) {
  const parsed = JSON.parse(saved) as { id: string; books: Book[] };
  catalog = new BookCatalog(parsed.id, parsed.books);
}


// сохранение В localStorage
function saveCatalog() {
  localStorage.setItem('catalog', JSON.stringify(catalog));
}

// DOM-элементы
const bookList = document.querySelector('#bookList') as HTMLDivElement;
const form = document.querySelector('#bookForm') as HTMLFormElement;
const filterBtn = document.querySelector('#applyFilters') as HTMLButtonElement;
const authorInput = document.querySelector('#filterAuthor') as HTMLInputElement;
const yearInput = document.querySelector('#filterYear') as HTMLInputElement;
const errorMessage = document.querySelector('#errorMessage') as HTMLDivElement;
const searchInput = document.querySelector('#searchInput') as HTMLInputElement;
const sortBySelect = document.querySelector('#sortBy') as HTMLSelectElement;

// отрисовка
function renderBooks(books: Book[]) {
  bookList.innerHTML = '';

  if (books.length === 0) {
    bookList.textContent = 'Книги не найдены. Попробуйте изменить фильтры.';
    return;
  }

  books.forEach(book => {
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

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Удалить';
    deleteBtn.addEventListener('click', () => {

      catalog.removeBook(book.id);
      saveCatalog();
      renderBooks(catalog.getBooks());
    });
    card.append(deleteBtn);

    bookList.append(card);
  });
}

renderBooks(catalog.getBooks());

// обработчик формы
form.addEventListener('submit', (e) => {
  e.preventDefault();
  errorMessage.textContent = '';
  try {
    const formData = new FormData(form);
    const newBook = createBookFromForm(formData);

    catalog.addBook(newBook);

    saveCatalog();
    form.reset();

    renderBooks(catalog.getBooks());
  } catch (error) {
    if (error instanceof Error) {
      errorMessage.textContent = error.message;
    }
  }
});

// фильтры и сортировка
function refreshList() {
  const filters: ((book: Book) => boolean)[] = [];

  if (authorInput.value.trim()) filters.push(filterByAuthor(authorInput.value.trim()));
  if (yearInput.value) filters.push(filterByMinYear(parseInt(yearInput.value, 10)));
  const allBooks = catalog.getBooks();
  const filteredBooks = applyFilters(allBooks, filters);
  const searchedBooks = catalog.searchByTitle(searchInput.value.trim());
  const sortedBooks = catalog.sortBy(sortBySelect.value as 'year' | 'rating');

  const booksToShow = sortedBooks.filter(
    (book) => filteredBooks.includes(book) && searchedBooks.includes(book)
  );

  renderBooks(booksToShow);
}

filterBtn.addEventListener('click', refreshList);
searchInput.addEventListener('input', refreshList);
sortBySelect.addEventListener('change', refreshList);

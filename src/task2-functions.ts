// Задание 2: Функции работы с каталогом
// Управление данными без мутации исходных объектов (иммутабельность)

//импортирт типов Book и Catalog из файла task1-types.ts
import type { Book, Catalog } from './task1-types';

/** @deprecated пока не используется, задел на фичу "Функциональный каталог" */
export function addBook(catalog: Catalog, book: Book): Catalog {
  return {
    ...catalog,
    [book.id]: book,
  };
}

// удаление книги из каталога по id

/** @deprecated пока не используется, задел на фичу "Функциональный каталог" */
export function removeBook(catalog: Catalog, id: string): Catalog {
  const { [id]: _, ...rest } = catalog;
  return rest;
}

/** @deprecated пока не используется, задел на фичу "Просмотр книги" */
export function getBook(catalog: Catalog, id: string): Book | undefined {
  return catalog[id];
}

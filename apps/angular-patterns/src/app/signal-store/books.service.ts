import { Injectable } from '@angular/core';

export type Book = {
  id: number;
  title: string;
  author: {
    id: number;
  };
  shortDescription: string;
  price: number;
  isBestSeller: boolean;
};

const mockBooks: Book[] = [
  {
    id: 1,
    title: 'The Silent Echo',
    author: {
      id: 101,
    },
    price: 19.99,
    isBestSeller: true,
    shortDescription:
      'A thrilling mystery that unfolds in a small coastal town, where secrets run deep.',
  },
  {
    id: 2,
    title: 'Journey to the Edge',
    author: { id: 102 },
    price: 14.99,
    isBestSeller: false,
    shortDescription:
      'An epic adventure across uncharted territories, full of danger and discovery.',
  },
  {
    id: 3,
    title: 'Whispers of the Past',
    author: { id: 103 },
    price: 24.99,
    isBestSeller: true,
    shortDescription:
      'A historical novel that explores the intertwined fates of two families over generations.',
  },
  {
    id: 4,
    title: 'Digital Shadows',
    author: { id: 104 },
    price: 9.99,
    isBestSeller: false,
    shortDescription:
      'In a world dominated by technology, a lone hacker discovers a conspiracy that could change everything.',
  },
  {
    id: 5,
    title: 'Echoes of Time',
    author: { id: 105 },
    price: 17.49,
    isBestSeller: true,
    shortDescription:
      'A sci-fi adventure that blurs the line between reality and illusion as time itself is manipulated.',
  },
  {
    id: 6,
    title: 'The Forgotten Garden',
    author: { id: 106 },
    price: 12.99,
    isBestSeller: false,
    shortDescription:
      'A heartwarming tale of love, loss, and rediscovery set in a secluded countryside estate.',
  },
  {
    id: 7,
    title: 'Beneath the Surface',
    author: { id: 107 },
    price: 18.99,
    isBestSeller: true,
    shortDescription:
      'A psychological thriller that uncovers the dark secrets of a seemingly perfect suburban family.',
  },
  {
    id: 8,
    title: 'Winds of Change',
    author: { id: 108 },
    price: 16.75,
    isBestSeller: false,
    shortDescription:
      'A political drama that follows the rise and fall of a charismatic leader in a divided nation.',
  },
  {
    id: 9,
    title: 'The Lost Chronicles',
    author: { id: 109 },
    price: 20.0,
    isBestSeller: true,
    shortDescription:
      'An ancient manuscript leads a young archaeologist on a journey to uncover a lost civilization.',
  },
  {
    id: 10,
    title: 'Midnight Sun',
    author: { id: 110 },
    price: 22.5,
    isBestSeller: false,
    shortDescription:
      'A lyrical novel about love, hope, and survival in the cold wilderness of the Arctic.',
  },
];

@Injectable({
  providedIn: 'root',
})
export class BooksService {
  loadAllBooks(): Promise<Book[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockBooks);
      }, 5000);
    });
  }
}

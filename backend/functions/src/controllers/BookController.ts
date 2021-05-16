import { Router, Request, Response, NextFunction } from 'express';
import { Book } from '../models/entities/Book';
import { db } from '../utils/admin';
import ControllerBase from '../interfaces/ControllerBase';
import { Http404Error } from '../utils/errors/HttpErrors';
import validationMiddleware from '../middleware/validationMiddleware';
import { formatCaps } from '../helpers/formatCaps';

class BookController implements ControllerBase {
  public path = '/books';
  public router = Router();

  public constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(this.path, this.getBooks);
    this.router.get(`${this.path}/:id`, this.getById);
    this.router.post(this.path, validationMiddleware<Book>(Book), this.addBook);
  }

  private getBooks = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const snapshot = await db.collection('books').get();
      let books: Book[] = [];
      snapshot.forEach((doc): void => {
        const b = {
          id: doc.id,
          authors: doc.data().authors,
          title: doc.data().title
        };
        books.push(b);
      });
      return res.send(books);
    } catch (error) {
      return next(error);
    }
  };

  private getById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const snapshot = await db.doc(`${this.path}/${req.params.id}`).get();
      if (!snapshot.exists) return next(new Http404Error('Book Id not found'));
      let book = snapshot.data() as Book;
      book.id = snapshot.id;
      return res.send(book);
    } catch (error) {
      return next(new Http404Error(error));
    }
  };

  private addBook = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const newBook: Book = {
      authors: req.body.authors.map((name: string): string => {
        return formatCaps(name);
      }),
      title: formatCaps(req.body.title)
    };

    try {
      const doc = await db.collection('books').add(newBook);
      newBook.id = doc.id;
      return res.send(newBook);
    } catch (error) {
      return next(error);
    }
  };
}

export default BookController;

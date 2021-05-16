import ControllerBase from '../interfaces/ControllerBase';
import MemberController from './MemberController';
import BookController from './BookController';
import AutheticationController from "./AuthenticationController"

const Controllers: ControllerBase[] = [
    new MemberController(),
    new BookController(),
    new AutheticationController()
];

export { ControllerBase, Controllers };

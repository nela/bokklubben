
import { Router} from 'express'

interface ControllerBase {
    path?: string;
    router: Router;
}

export default ControllerBase;

import { getUsers, getUserById, createUser, replaceUser, updateUser, deleteUser } from '../controllers/rest.controller.js'
import { Router } from 'express';
import { validateCreateUser, validatePutUser, validatePatchUser } from '../middleware/validation.middleware.js';

const router = Router();


router
    .route("/users")
    .get(getUsers)
    .post(validateCreateUser, createUser)


router
    .route("/users/:id")
    .get(getUserById)
    .put(validatePutUser, replaceUser)
    .patch(validatePatchUser, updateUser)
    .delete(deleteUser)



export default router
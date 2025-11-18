const { Router } = require('express');



const router = Router();

router.get('/health', (req, res) => {
  res.status(200).send({ status: 'ok' });
});

// Demo simple route
// router.get('/health', healthController.getHealth);

// Demo grouped routes for users
// router.group('/users', (userRouter) => {
//     userRouter.post('/', usersController.createUser);
//     userRouter.get('/:id', usersController.getUserById);
//     userRouter.put('/:id', usersController.updateUser);
//     userRouter.delete('/:id', usersController.deleteUser);
// });

module.exports = router;

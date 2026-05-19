const express= require('express');
const router=express.Router();
const vocabSetController=require('../controllers/vocabSet.controller');
const {verifyToken}=require('../middlewares/auth.middleware');

router.post('/',verifyToken,vocabSetController.createSet);
router.get('/',verifyToken,vocabSetController.getSets);
router.put('/:id', verifyToken, vocabSetController.updateSet);
router.delete('/:id', verifyToken, vocabSetController.deleteSet);
module.exports=router;
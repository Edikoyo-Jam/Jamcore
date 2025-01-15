import express from "express"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient();
var router = express.Router();

router.get('/', async function(req, res) {
    const { id } = req.query;

    if (!id || isNaN(parseInt(id as string))) {
        res.status(400);
        res.send();
        return
    }

    let idnumber = parseInt(id as string);

    const post = await prisma.post.findUnique({
        where: {
            id: idnumber
        }
    })

    res.send(post);
});

export default router;
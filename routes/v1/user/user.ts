import express from "express"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient();
var router = express.Router();

router.get('/', async function(req, res) {
    const { id, slug } = req.query;

    if ((!id || isNaN(parseInt(id as string))) && !slug) {
        res.status(400);
        res.send();
        return
    }

    if (id && !isNaN(parseInt(id as string))) {
        let idnumber = parseInt(id as string);

        const user = await prisma.user.findUnique({
            where: {
                id: idnumber
            }
        })

        res.send(user);
    } else {
        const user = await prisma.user.findUnique({
            where: {
                slug: slug as string
            }
        })

        res.send(user);
    }    
});

export default router;
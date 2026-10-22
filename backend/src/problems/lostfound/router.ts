import express from "express";
import { validateBody } from "../../middleware";
import { createReport, createReportSchema, editItem, editItemDTOSchema, getAllReports, getItem, resolve, resolveDTOSchema, search, searchSchema } from "./controller";
import z from "zod";

const router = express.Router();

router.post("/", validateBody(createReportSchema), async (req, res) => {
    const report = await createReport(req.body);
    res.status(201).json(report);
});

router.get("/", async (req, res) => {
    const reports = await getAllReports();
    // no pagination W
    res.status(200).json(reports);
});

router.patch("/", validateBody(editItemDTOSchema), async (req, res) => {
    const results = await editItem(req.body);

    
    if (!results) {
        res.status(404).json({
            error: "not found",
            message: `Report with id ${req.body.id} wasn't found for ${req.body.username}`
        })
        return;
    }
    res.status(200).json(results);
})

router.get("/search", async (req, res) => {
    const parseResults = searchSchema.safeParse(req.query);
    if (!parseResults.success) {
        res.status(400).json(
            {
                error: "malformed query parameters",
                message: parseResults.error.issues
            }
        )
        return;
    }


    const data = await search(parseResults.data);
    res.status(200).json(data);
});

router.get("/:id", async (req, res) => {
    const paramParse = z.uuid().safeParse(req.params.id);
    if (!paramParse.success) {
        res.status(400).json({
            error: "malformed path parameters, make sure its valid UUID",
            message: paramParse.error.issues
        })
        return;
    }

    const data = await getItem({ id: req.params.id });

    if (!data) {
        res.status(404).json({
            error: "not found",
            message: `Report with id ${req.params.id} wasn't found`
        })
        return;
    }

    res.status(200).json(data);  
})

router.patch("/resolve", validateBody(resolveDTOSchema), async (req, res) => {
    const resolved = await resolve(req.body);
    if (resolved.length != 2) {
        res.status(500).json({
            error: "internal server error",
            message: "Resolution didn't update exactly 2 records"
        })
        return;
    };

    res.status(200).json(resolved);
})


export { router };
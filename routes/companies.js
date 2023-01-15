
const express = require("express");
const ExpressError = require("../expressError")
const db = require("../db");

let router = new express.Router();

//get all companies from DB
router.get("/", async function (req, res, next) {
    try {
        const result = await db.query(
            "SELECT * FROM companies"
        );

        return res.json({ "companies": result.rows });
    }

    catch (err) {
        return next(err);
    }
});

//create a new companie
router.post("/", async function (req, res, next) {
    try {
        let { code, name, description } = req.body;

        const result = await db.query(
            `INSERT INTO companies (code, name, description) 
             VALUES ($1, $2, $3) 
             RETURNING code, name, description`,
            [code, name, description]);

        return res.status(201).json({ "company": result.rows[0] });
    }

    catch (err) {
        return next(err);
    }
});

//edit a current company
router.post("/:code", async function (req, res, next) {
    try {
        let code = req.params.code
        let { name, description } = req.body;



        const result = await db.query(
            `UPDATE companies SET name=$1, description=$2
            WHERE code = $3
            RETURNING code, name, description`,
            [name, description, code]);

        if (result.rows.length === 0) {
            throw new ExpressError(`Company cannot be found: ${code}`, 404)
        } else {
            return res.json({ "company": result.rows[0] });
        }

    }
    catch (err) {
        return next(err);
    }
});


router.delete("/:code", async function (req, res, next) {
    try {
        let code = req.params.code;

        const result = await db.query(
            `DELETE FROM companies
             WHERE code=$1
             RETURNING code`,
            [code]);

        if (result.rows.length == 0) {
            throw new ExpressError(`Company cannot be found: ${code}`, 404)
        } else {
            return res.json({ "status": "deleted" });
        }
    }

    catch (err) {
        return next(err);
    }
});




module.exports = router;
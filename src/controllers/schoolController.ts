import { Request, Response } from "express";
import pool from "../config/db";
import { calculateDistance } from "../utils/distance";

export const addSchool = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, address, latitude, longitude } = req.body;

        if (!name || !address || isNaN(latitude) || isNaN(longitude)) {
            res.status(400).json({ error: "Invalid input data" });
            return;
        }

        const [result] = await pool.query(
            "INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)",
            [name, address, latitude, longitude]
        );

        res.status(201).json({
            message: "School added successfully",
            schoolId: (result as any).insertId,
        });
    } catch (error) {
        res.status(500).json({ error: "Database error", details: error });
    }
};

export const listSchools = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const userLat = parseFloat(req.query.latitude as string);
        const userLon = parseFloat(req.query.longitude as string);

        if (isNaN(userLat) || isNaN(userLon)) {
            res.status(400).json({ error: "Invalid latitude or longitude" });
            return;
        }

        const [rows] = await pool.query("SELECT * FROM schools");
        const schools = (rows as any[]).map((school) => ({
            ...school,
            distance: calculateDistance(
                userLat,
                userLon,
                school.latitude,
                school.longitude
            ),
        }));

        schools.sort((a, b) => a.distance - b.distance);
        res.status(200).json(schools);
    } catch (error) {
        res.status(500).json({ error: "Database error", details: error });
    }
};

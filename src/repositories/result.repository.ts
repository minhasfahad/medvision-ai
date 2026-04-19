import { Part } from "@google/generative-ai";
import Result, { IResult } from "../models/scanresult.model";

export const saveScanResult = async (data: Partial<IResult>) => {
    try {
        const newresult = new Result(data);
        return await newresult.save();
    } catch (error) {
        throw new Error("Failed to save the Results" + error)
    }
};

export const getAllScanResults = async () => {
    try {
        // Fetches all scan results from the database
        return await Result.find();
    } catch (error) {
        // TypeScript-safe error handling
        if (error instanceof Error) {
            throw new Error("Failed to get the Results: " + error.message);
        }
        // Fallback if the error somehow isn't a standard Error object
        throw new Error("Failed to get the Results: " + String(error));
    }
};
import Result, { IResult } from "../models/scanresult.model";

export const saveScanResult = async (data: Partial<IResult>) => {
    try {
        const newresult = new Result(data);
        return await newresult.save();
    } catch (error) {
        throw new Error("Failed to save the Results" + error)
    }
};

// --- THIS IS THE UPDATED FUNCTION ---
export const getScanResults = async (userId: string | null = null) => {
    try {
        // If a userId is provided (Patient requesting their history)
        if (userId) {
            // Find only this user's scans, and sort by newest first
            return await Result.find({ user: userId }).sort({ createdAt: -1 });
        }
        
        // If NO userId is provided (Doctor requesting all history)
        return await Result.find().sort({ createdAt: -1 });
        
    } catch (error) {
        if (error instanceof Error) {
            throw new Error("Failed to get the Results: " + error.message);
        }
        throw new Error("Failed to get the Results: " + String(error));
    }
};

export const updateScanComment = async (scanId: string, comment: string) => {
    try {
        const updatedResult = await Result.findByIdAndUpdate(
            scanId,
            { comment },
            { new: true }
        );
        return updatedResult;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error("Failed to update comment: " + error.message);
        }
        throw new Error("Failed to update comment: " + String(error));
    }
};
import { Part } from "@google/generative-ai";
import Result, { IResult } from "../models/scanresult.model";

export const SaveScanResult = async (data: Partial<IResult>)=>{
    try {
        const newresult = new Result(data);
        return await newresult.save();
    } catch (error) {
        throw new Error("Failed to save the Results" + error)
    }
};
import express from "express";
import request from "supertest";
import path from "path";
import fs from "fs";
import { serve } from "../src";

describe("serve middleware", () => {
    const validDir = path.join(__dirname, "test-static");
    const invalidDir = path.join(__dirname, "non-existent-dir");

    beforeAll(() => {
        // Create test directory and a test file
        if (!fs.existsSync(validDir)) {
            fs.mkdirSync(validDir);
        }
        fs.writeFileSync(path.join(validDir, "hello.txt"), "Hello world!");
    });

    afterAll(() => {
        // Cleanup test files and directory
        try {
            fs.unlinkSync(path.join(validDir, "hello.txt"));
            fs.rmdirSync(validDir);
        } catch {}
    });

    test("throws if directory does not exist", () => {
        expect(() => serve(invalidDir)).toThrow(/not a valid directory/);
    });

    test("throws if path is not a directory", () => {
        const filePath = path.join(validDir, "hello.txt");
        expect(() => serve(filePath)).toThrow(/not a valid directory/);
    });

    test("returns a middleware function if directory is valid", () => {
        const middleware = serve(validDir);
        expect(typeof middleware).toBe("function");
    });

    test("serves static files", async () => {
        const app = express();
        app.use("/static", serve(validDir));

        const res = await request(app).get("/static/hello.txt");

        expect(res.status).toBe(200);
        expect(res.text).toBe("Hello world!");
        expect(res.headers["content-type"]).toMatch(/text/);
    });

    test("returns 404 for non-existing file", async () => {
        const app = express();
        app.use("/static", serve(validDir));

        const res = await request(app).get("/static/missing.txt");

        expect(res.status).toBe(404);
    });
});

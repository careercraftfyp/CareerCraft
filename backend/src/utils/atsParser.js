import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Determine contact info, sections, and score using the Python resume analyzer module.
 * Runs as an async process to avoid blocking the Express main thread.
 * Rejects the promise if Python fails, ensuring no silent fallbacks.
 */
export function parseResume(text, pdfBuffer) {
    return new Promise((resolve, reject) => {
        if (!pdfBuffer) {
            reject(new Error("No PDF buffer provided to parseResume. Cannot run Python parser."));
            return;
        }

        // Generate a unique temporary file path in the same directory
        const tempFileName = `temp_${Date.now()}_${Math.round(Math.random() * 10000)}.pdf`;
        const tempFilePath = path.join(__dirname, tempFileName);

        try {
            fs.writeFileSync(tempFilePath, pdfBuffer);
        } catch (writeErr) {
            console.error("Failed to write temporary PDF file:", writeErr);
            reject(new Error(`Failed to write temporary PDF: ${writeErr.message}`));
            return;
        }

        const pythonScriptPath = path.join(__dirname, 'resume_analyzer.py');
        const pythonProcess = spawn('python', [pythonScriptPath, tempFilePath]);

        let outputData = '';
        let errorData = '';

        pythonProcess.stdout.on('data', (data) => {
            outputData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorData += data.toString();
        });

        pythonProcess.on('close', (code) => {
            // Clean up the temporary file
            try {
                if (fs.existsSync(tempFilePath)) {
                    fs.unlinkSync(tempFilePath);
                }
            } catch (unlinkErr) {
                console.error("Failed to delete temporary PDF file:", unlinkErr);
            }

            if (code !== 0) {
                console.error(`Python resume parser exited with code ${code}. Error: ${errorData}`);
                reject(new Error(`Python resume parser exited with code ${code}: ${errorData.trim()}`));
                return;
            }

            try {
                const parsed = JSON.parse(outputData.trim());
                if (parsed.error) {
                    console.error("Python parser returned error:", parsed.error);
                    reject(new Error(`Python parser error: ${parsed.error}`));
                } else {
                    // Mark the source clearly
                    parsed.parser_source = "python";
                    resolve(parsed);
                }
            } catch (e) {
                console.error("Failed to parse Python resume parser output:", e);
                reject(new Error(`Failed to parse Python output: ${e.message}`));
            }
        });

        pythonProcess.on('error', (err) => {
            console.error('Failed to spawn Python resume parser process:', err);
            // Clean up the temporary file
            try {
                if (fs.existsSync(tempFilePath)) {
                    fs.unlinkSync(tempFilePath);
                }
            } catch (unlinkErr) {
                console.error("Failed to delete temporary PDF file:", unlinkErr);
            }
            reject(new Error(`Failed to spawn Python process: ${err.message}`));
        });
    });
}



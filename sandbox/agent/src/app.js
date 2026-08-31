import express from "express";
import morgan from "morgan";
import fs from "fs";
import path from "path";
import { Server } from "socket.io";
import http from "http";
import pty from "node-pty";
import os from "os";



const app = express();
const httpServer = http.createServer(app);

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Universal CORS Middleware for HTTP REST requests
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});

const WORKING_DIR = "/workspace";

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Hello from sandbox agent",
    status: "success",
  });
});

// Serve static workspace files directly
app.use("/workspace", express.static(WORKING_DIR));
app.use("/raw", express.static(WORKING_DIR));
app.use(express.static(WORKING_DIR));

// Dedicated endpoint to stream/send raw file with correct MIME type
app.get("/raw-file", (req, res) => {
  const file = req.query.file;
  if (!file) {
    return res.status(400).json({ status: "error", message: "No file specified" });
  }
  const cleanPath = file.replace(/^\/+/, "");
  const filePath = path.join(WORKING_DIR, cleanPath);
  if (!filePath.startsWith(WORKING_DIR)) {
    return res.status(403).json({ status: "error", message: "Access denied" });
  }
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ status: "error", message: "File not found" });
  }
  res.sendFile(filePath);
});



const shell =   process.env.SHELL || "bash";

const ptyProcess = pty.spawn(shell, [], {
  name: "xterm-color",
  cols: 80,
  rows: 30,
  cwd: WORKING_DIR,
  env: process.env,
});


ptyProcess.onData((data)=>{
  io.emit("terminal-output", data);
});

ptyProcess.onExit(({exitCode,signal})=>{
  console.log(`PTY process exited with code: ${exitCode}, signal: ${signal}`);
  
})


io.on("connection", (socket) => {
  console.log("Client connected : ", socket.id);


  socket.on("terminal-input", (data)=>{
    ptyProcess.write(data);
  })

  socket.on("disconnect", () => {
    console.log("Client disconnected : ", socket.id);
  });
});

app.get("/list-files", async (req, res) => {
  const listFiles = async (dir, baseDir) => {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, "/");
      if (
        entry.isDirectory() &&
        ["node_modules", ".git", "dist", ".cache"].includes(entry.name)
      ) {
        continue;
      }

      if (entry.isDirectory()) {
        files.push(...(await listFiles(fullPath, baseDir)));
      } else {
        files.push(relativePath);
      }
    }

    return files;
  };

  try {
    const files = await listFiles(WORKING_DIR, WORKING_DIR);
    return res.status(200).json({
      message: "Files listed successfully",
      files,
      status: "success",
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error listing files: ${error.message}`,
      status: "error",
    });
  }
});

app.get("/read-files", async (req, res) => {
  const files = req.query.files;

  if (!files) {
    return res.status(400).json({
      status: "error",
      message: "No files specified in query parameter",
    });
  }

  const fileList = files.split(",");

  const results = await Promise.all(
    fileList.map(async (file) => {
      const cleanFile = file.replace(/\\/g, "/").replace(/^\/+/, "");
      let targetPath = path.join(WORKING_DIR, cleanFile);

      // Fallback search in public or src if not found directly
      if (!fs.existsSync(targetPath)) {
        const candidates = [
          path.join(WORKING_DIR, "public", cleanFile),
          path.join(WORKING_DIR, "src", cleanFile),
          path.join(WORKING_DIR, "src/assets", cleanFile),
        ];
        for (const cand of candidates) {
          if (fs.existsSync(cand)) {
            targetPath = cand;
            break;
          }
        }
      }

      const relativeKey = "/" + cleanFile;
      const ext = path.extname(cleanFile).toLowerCase();

      try {
        const imageExts = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".bmp", ".avif", ".tiff", ".tif", ".jfif"];
        if (imageExts.includes(ext)) {
          const mimeTypes = {
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".gif": "image/gif",
            ".webp": "image/webp",
            ".ico": "image/x-icon",
            ".bmp": "image/bmp",
            ".avif": "image/avif",
            ".tiff": "image/tiff",
            ".tif": "image/tiff",
            ".jfif": "image/jpeg",
          };
          const buffer = await fs.promises.readFile(targetPath);
          const mime = mimeTypes[ext] || "application/octet-stream";
          return {
            [relativeKey]: `data:${mime};base64,${buffer.toString("base64")}`,
          };
        } else {
          const content = await fs.promises.readFile(targetPath, "utf-8");
          return {
            [relativeKey]: content,
          };
        }
      } catch (err) {
        return {
          [relativeKey]: `Error reading file : ${err.message}`,
        };
      }
    }),
  );

  res.status(200).json({
    message: "File contents",
    files: results,
  });
});

app.patch("/update-files", async (req, res) => {
  const updates = req.body.updates;

  if (!updates || !Array.isArray(updates)) {
    return res.status(400).json({
      message:
        "Invalid request body. Expected a JSON object with an 'updates' property containing an array of file updates.",
      status: "error",
    });
  }

  const results = await Promise.all(
    updates.map(async (update) => {
      const { file, content } = update;

      const filePath = path.join(WORKING_DIR, file);
      try {
        await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
        await fs.promises.writeFile(filePath, content, "utf-8");
        return {
          [filePath.replace(WORKING_DIR, "")]: "File updated successfully",
        };
      } catch (err) {
        return {
          [filePath.replace(WORKING_DIR, "")]:
            `Error updating file : ${err.message}`,
        };
      }
    }),
  );

  res.status(200).json({
    message: "File update results",
    results,
  });
});

app.post("/create-files", async (req, res) => {
  const files = req.body.files;

  if (!files || !Array.isArray(files)) {
    return res.status(400).json({
      message:
        "Invalid request body. Expected a JSON object with a 'files' property containing an array of file objects, each with 'file' and 'content' properties.",
      status: "error",
    });
  }

  const results = await Promise.all(
    files.map(async (fileObj) => {
      const { file, content } = fileObj;
      const filePath = path.join(WORKING_DIR, file);
      try {
        await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
        await fs.promises.writeFile(filePath, content || "", "utf-8");
        return {
          [filePath.replace(WORKING_DIR, "")]: "File created successfully",
        };
      } catch (err) {
        return {
          [filePath.replace(WORKING_DIR, "")]:
            `Error creating file: ${err.message}`,
        };
      }
    }),
  );

  res.status(200).json({
    message: "File create results",
    results,
  });
});

app.post("/create-folder", async (req, res) => {
  const folders =
    req.body.folders || (req.body.folder ? [req.body.folder] : null);

  if (!folders || !Array.isArray(folders)) {
    return res.status(400).json({
      message:
        "Invalid request body. Expected 'folder' string or 'folders' array.",
      status: "error",
    });
  }

  const results = await Promise.all(
    folders.map(async (folderPath) => {
      const fullPath = path.join(WORKING_DIR, folderPath);
      try {
        await fs.promises.mkdir(fullPath, { recursive: true });
        return {
          [fullPath.replace(WORKING_DIR, "")]: "Folder created successfully",
        };
      } catch (err) {
        return {
          [fullPath.replace(WORKING_DIR, "")]:
            `Error creating folder: ${err.message}`,
        };
      }
    }),
  );

  res.status(200).json({
    message: "Folder create results",
    results,
  });
});

app.delete("/delete", async (req, res) => {
  // Support both Query Parameters (?file=... or ?files=...) and JSON Body ({file: ...}, {paths: [...]})
  const queryTargets =
    req.query.paths ||
    req.query.files ||
    req.query.folders ||
    (req.query.path
      ? [req.query.path]
      : req.query.file
        ? [req.query.file]
        : req.query.folder
          ? [req.query.folder]
          : null);

  const queryList =
    typeof queryTargets === "string" ? queryTargets.split(",") : queryTargets;

  const bodyTargets =
    req.body.paths ||
    req.body.files ||
    req.body.folders ||
    (req.body.path
      ? [req.body.path]
      : req.body.file
        ? [req.body.file]
        : req.body.folder
          ? [req.body.folder]
          : null);

  const rawTargets = queryList || bodyTargets;

  if (!rawTargets || !Array.isArray(rawTargets) || rawTargets.length === 0) {
    return res.status(400).json({
      message:
        "Invalid request. Provide 'path', 'file', 'folder' (string) or 'paths', 'files', 'folders' (array or comma-separated query).",
      status: "error",
    });
  }

  const results = await Promise.all(
    rawTargets.map(async (targetItem) => {
      const cleanRelativePath = String(targetItem).trim().replace(/^[/\\]+/, "");
      const fullPath = path.resolve(WORKING_DIR, cleanRelativePath);

      // Prevent deleting root /workspace or escaping outside workspace
      if (
        fullPath === path.resolve(WORKING_DIR) ||
        !fullPath.startsWith(path.resolve(WORKING_DIR))
      ) {
        return {
          [targetItem]: "Error: Cannot delete root workspace or paths outside workspace",
        };
      }

      try {
        await fs.promises.rm(fullPath, { recursive: true, force: true });
        return {
          [`/${cleanRelativePath}`]: "Deleted successfully",
        };
      } catch (err) {
        return {
          [`/${cleanRelativePath}`]: `Error deleting: ${err.message}`,
        };
      }
    }),
  );

  res.status(200).json({
    message: "Delete results",
    results,
  });
});

export default httpServer;
